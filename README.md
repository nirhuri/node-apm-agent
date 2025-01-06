# Node.js Monitoring Agent

A lightweight Node.js monitoring agent with a built-in dashboard to monitor memory usage, CPU usage, and uptime for Node.js processes.

## Features

- Monitors all Node.js processes on the system.
- Tracks memory, CPU, and uptime for each process.
- Automatically logs stats into an SQLite database.
- Includes a built-in dashboard for real-time data visualization.
- Configurable through CLI options.

---

## Installation

Install the package globally using NPM:

```bash
npm install -g node-apm-agent
```

---

## Usage

Run the agent directly from the CLI:

```bash
node-apm-agent start
```

### Options

| Option              | Alias | Description                          | Default                |
| ------------------- | ----- | ------------------------------------ | ---------------------- |
| `--port <number>`   | `-p`  | Port to run the dashboard on         | `3000`                 |
| `--interval <ms>`   | `-i`  | Interval between monitoring (in ms)  | `10000`                |
| `--app-name <name>` | `-n`  | Filter processes by application name | Monitors all processes |

---

### Examples

#### Run with default settings:

```bash
node-apm-agent start
```

#### Specify a custom port and monitoring interval:

```bash
node-apm-agent start --port 4000 --interval 5000
```

#### Monitor processes for a specific application:

```bash
node-apm-agent start --app-name "my-app"
```

---

## Dashboard

The agent includes a built-in dashboard accessible via your browser.

Once the agent is running, visit:

```
http://localhost:<port>
```

Replace `<port>` with the port specified (default is `3000`).

---

## Stopping the Agent

To stop the agent, press `Ctrl+C`. The SQLite database will not retain historical data.

#### Or

```bash
node-apm-agent stop
```

---

## Contributing

We welcome contributions! Feel free to:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Submit a pull request.

For major changes, please open an issue first to discuss what you would like to change.

---

## License

This project is licensed under the **[MIT License](LICENSE)**.

---

## Support

If you encounter any issues or have questions, please open an issue on **[GitHub](https://github.com/nirhuri/node-apm-agent/issues)**.

---

## Tips

1. Include a badge for NPM downloads, version, and license:

   ![npm](https://img.shields.io/npm/v/node-apm-agent)
   ![license](https://img.shields.io/npm/l/node-apm-agent)
   ![downloads](https://img.shields.io/npm/dm/node-apm-agent)
