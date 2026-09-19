const { execSync } = require('child_process');
const path = require('path');

/**
 * Hardened port cleanup utility for InstaJobs backend development.
 * Inspects process command line and process hierarchy to verify that any listening
 * process on port 5000 belongs to THIS EXACT project directory before terminating.
 *
 * FAILS SAFE: If process metadata cannot be read or does not match this project's path,
 * it refuses to terminate the process.
 */
function freePort(port = 5000) {
  const targetPort = process.env.PORT || port;
  const projectServerJs = path.resolve(__dirname, '..', 'server.js');
  const projectDir = path.resolve(__dirname, '..');

  const normProjectServerJs = normalizePath(projectServerJs);
  const normProjectDir = normalizePath(projectDir);

  try {
    if (process.platform === 'win32') {
      const output = execSync('netstat -ano -p tcp', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
      const lines = output.split('\n');
      const pids = new Set();

      for (const line of lines) {
        if (line.includes(`:${targetPort}`) && line.includes('LISTENING')) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && pid !== '0' && pid !== `${process.pid}`) {
            pids.add(pid);
          }
        }
      }

      for (const pid of pids) {
        const isMatched = checkProcessLineage(pid, normProjectServerJs, normProjectDir);

        if (isMatched) {
          console.log(`[free-port] Port ${targetPort} is occupied by stale InstaJobs server for this project (PID ${pid}). Cleaning up...`);
          try {
            execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
            console.log(`[free-port] Successfully released port ${targetPort} (PID ${pid}).`);
          } catch (killErr) {
            // Process may have already exited
          }
        } else {
          console.warn(`[free-port] WARNING: Could not safely identify the process using port ${targetPort} as this project's backend. Refusing to terminate it.`);
        }
      }
    } else {
      // Unix / macOS fallback
      try {
        const lsof = execSync(`lsof -i :${targetPort} -sTCP:LISTEN -t`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
        const pids = lsof.trim().split('\n').filter(Boolean);
        for (const pid of pids) {
          if (pid !== `${process.pid}`) {
            execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
          }
        }
      } catch (err) {}
    }
  } catch (err) {
    // Port check finished cleanly
  }
}

function normalizePath(p) {
  if (!p) return '';
  return p.replace(/["']/g, '').replace(/\\/g, '/').toLowerCase();
}

function checkProcessLineage(targetPid, normProjectServerJs, normProjectDir) {
  let currPid = targetPid;
  let depth = 0;

  while (currPid && currPid > 0 && depth < 4) {
    const info = getWindowsProcessInfo(currPid);
    if (!info || !info.name) break;

    const isNodeExec = info.name.toLowerCase().includes('node');
    const normCmd = normalizePath(info.commandLine);

    if (isNodeExec && (normCmd.includes(normProjectServerJs) || normCmd.includes(normProjectDir))) {
      return true;
    }

    currPid = info.parentProcessId;
    depth++;
  }

  return false;
}

function getWindowsProcessInfo(pid) {
  try {
    const cmd = `powershell -NoProfile -Command "$proc = Get-CimInstance Win32_Process -Filter 'ProcessId = ${pid}'; if ($proc) { [PSCustomObject]@{ Name = $proc.Name; CommandLine = $proc.CommandLine; ParentProcessId = $proc.ParentProcessId } | ConvertTo-Json }"`;
    const rawJson = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    if (rawJson && rawJson.trim()) {
      const parsed = JSON.parse(rawJson);
      return {
        name: parsed.Name || '',
        commandLine: parsed.CommandLine || '',
        parentProcessId: parsed.ParentProcessId || 0
      };
    }
  } catch (err) {}
  return null;
}

freePort(5000);
