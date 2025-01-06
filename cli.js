#!/usr/bin/env node

import { program } from "commander";
import { startAgent, stopAgent } from "./index.js";

process.on("exit", () => {
  stopAgent();
});

process.on("SIGINT", () => {
  stopAgent();
  console.log("Caught interrupt signal (SIGINT).");
  process.exit();
});

process.on("SIGTERM", () => {
  stopAgent();
  console.log("Caught termination signal (SIGTERM).");
  process.exit();
});

program
  .name("node-apm-agent")
  .description("APM agent for monitoring processes")
  .version("1.0.0");

program
  .command("start")
  .description("Start monitoring")
  .option("-p, --port <port>", "Port to run the dashboard on", 3000)
  .option("-i, --interval <ms>", "Interval between monitoring in ms", 10000)
  .option("-n, --app-name <name>", "Name of the application", "")
  .action((options) => {
    startAgent(options);
  });

program
  .command("stop")
  .description("Stop node-apm-agent")
  .action(() => {
    stopAgent();
    console.log("node-apm-agent stopped.");
  });

program.parse(process.argv);
