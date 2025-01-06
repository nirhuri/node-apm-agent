import fs from "fs";
import path from "path";
import express from "express";
import pidusage from "pidusage";
import sqlite3 from "sqlite3";
import psList from "ps-list";

const dashboardHtml = fs.readFileSync(path.resolve("index.html"), "utf8");
const processViewHtml = fs.readFileSync(path.resolve("process.html"), "utf8");

const dbClass = sqlite3.verbose();
let db;
let app;

/**
 * Initialize the database
 */
function initializeDatabase(dbPath = "./process_history.db") {
  db = new dbClass.Database(dbPath);
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS process_stats (
        timestamp INTEGER,
        app_name TEXT,
        pid INTEGER,
        memory_usage INTEGER,
        cpu_usage REAL,
        uptime INTEGER
      )
    `);
  });
}

function deleteDatabaseFile(dbPath = "./process_history.db") {
  if (fs.existsSync(dbPath)) {
    try {
      fs.unlinkSync(dbPath);
    } catch (err) {
      console.error("Failed to delete database file:", err);
    }
  }
}

/**
 * Save process stats to the database
 */
function saveProcessStats(appName, pid, memoryUsage, cpuUsage, uptime) {
  const timestamp = Date.now();
  db.run(
    `INSERT INTO process_stats (timestamp, app_name, pid, memory_usage, cpu_usage, uptime)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [timestamp, appName, pid, memoryUsage, cpuUsage, uptime]
  );
}

/**
 * Monitor a specific process
 */
async function monitorProcess(pid, appName) {
  try {
    const stats = await pidusage(pid);
    saveProcessStats(
      appName,
      pid,
      stats.memory,
      stats.cpu,
      stats.elapsed / 1000 // uptime in seconds
    );
  } catch (err) {
    console.error(`Error monitoring process PID ${pid}:`, err);
  }
}

/**
 * Monitor an array of processes
 */
async function monitorProcesses(processes) {
  for (const { appName, pid } of processes) {
    await monitorProcess(pid, appName);
  }
}

/**
 * API setup
 */
function setupApi() {
  app.get("/", (req, res) => {
    res.send(dashboardHtml);
  });

  app.get("/api/processes", (req, res) => {
    db.all(
      `
        SELECT app_name, pid, MAX(timestamp) AS latest_timestamp, memory_usage, cpu_usage, uptime
        FROM process_stats
        GROUP BY app_name, pid
        ORDER BY latest_timestamp DESC;
      `,
      [],
      (err, rows) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(rows);
      }
    );
  });

  app.delete("/api/processes", (req, res) => {
    db.run("DELETE FROM process_stats", (err) => {
      if (err) {
        console.error("Error clearing database:", err.message);
        return res.status(500).json({ error: "Failed to clear database" });
      }
      res.status(200).json({ message: "Database cleared successfully" });
    });
  });

  app.get("/api/processes/:pid", (req, res) => {
    const pid = parseInt(req.params.pid, 10);

    db.get(
      "SELECT app_name, pid, memory_usage, cpu_usage, uptime FROM process_stats WHERE pid = ?",
      [pid],
      (err, row) => {
        if (err) {
          return res.status(500).send("Error retrieving process data");
        }

        if (!row) {
          return res.status(404).send("Process not found");
        }

        const htmlWithData = processViewHtml
          .replace(
            "{{processData}}",
            JSON.stringify(row)
              .replace(/</g, "\\u003c")
              .replace(/>/g, "\\u003e")
              .replace(/"/g, "&quot;")
          )
          .replace("{{pid}}", pid);

        res.send(htmlWithData);
      }
    );
  });
}

/**
 * Start the server
 */
function startServer({ port = 3000 }) {
  app = express();
  setupApi();
  app.listen(port, () => {
    console.log(`Dashboard running at http://localhost:${port}`);
  });
}

async function findNodeProcesses(appName) {
  console.log(appName);
  const processes = await psList();
  return processes
    .filter((proc) => {
      if (proc.name !== "node") return false;
      if (appName && !proc.cmd.includes(appName)) return false;
      return true;
    })
    .map((proc) => ({
      pid: proc.pid,
      appName: proc.cmd.split(" ")[0],
    }));
}

/**
 * Start monitoring specific processes
 */
export async function startAgent({
  dbPath = "./process_history.db",
  port = 3000,
  interval = 60000,
  appName,
} = {}) {
  const processes = await findNodeProcesses(appName);
  if (processes.length === 0) {
    console.error("Processes not found.");
  }

  initializeDatabase(dbPath);
  // Monitor the specified processes periodically
  setInterval(() => monitorProcesses(processes), interval);
  startServer({ port });
}

export async function stopAgent() {
  deleteDatabaseFile();
}
