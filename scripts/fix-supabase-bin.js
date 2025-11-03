const fs = require("fs");
const path = require("path");

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeShim(binDir) {
  const isWin = process.platform === "win32";
  const shimName = "supabase";
  const shimPath = path.join(binDir, isWin ? shimName + ".cmd" : shimName);

  if (fs.existsSync(shimPath)) {
    console.log("supabase shim already present, skipping shim creation.");
    return;
  }

  try {
    if (isWin) {
      const cmdContents = [
        "@echo off",
        "rem Supabase shim created by postinstall. If you need the full CLI, install it globally.",
        "echo Supabase shim no-op. Install the Supabase CLI for full functionality.",
        "exit /b 0"
      ].join("\r\n");
      fs.writeFileSync(shimPath, cmdContents, { mode: 0o755 });
      console.log("Wrote supabase .cmd shim to", shimPath);
    } else {
      const shContents = [
        "#!/usr/bin/env bash",
        "echo Supabase shim no-op. Install the Supabase CLI for full functionality.",
        "exit 0"
      ].join("\n");
      fs.writeFileSync(shimPath, shContents, { mode: 0o755 });
      console.log("Wrote supabase shim to", shimPath);
    }
  } catch (err) {
    console.error("Failed to write supabase shim", err);
    process.exitCode = 0;
  }
}

function main() {
  const projectRoot = process.cwd();
  const binDir = path.join(projectRoot, "node_modules", ".bin");
  ensureDirSync(binDir);
  writeShim(binDir);
}

main();
