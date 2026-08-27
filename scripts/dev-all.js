const { spawn } = require("child_process");

const procs = [
  spawn("npx", ["convex", "dev"], { shell: true, stdio: "inherit" }),
  spawn("npx", ["next", "dev"], { shell: true, stdio: "inherit" }),
];

function shutdown() {
  for (const p of procs) {
    if (p.pid && !p.killed) {
      try {
        if (process.platform === "win32") {
          spawn("taskkill", ["/pid", String(p.pid), "/T", "/F"], {
            stdio: "ignore",
            shell: true,
          });
        } else {
          p.kill("SIGTERM");
        }
      } catch {}
    }
  }
}

process.on("SIGINT", () => {
  shutdown();
  process.exit(0);
});

for (const p of procs) {
  p.on("exit", (code) => {
    if (code !== null && code !== 0) {
      shutdown();
      process.exit(code);
    }
  });
}
