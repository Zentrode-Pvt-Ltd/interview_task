import { spawn } from 'node:child_process';

const grouped = process.platform !== 'win32';
const children = ['@inventory/api', '@inventory/web'].map((workspace) =>
  spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev', '--workspace', workspace], {
    stdio: 'inherit', detached: grouped,
  }),
);
let stopping = false;
function stop(code) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    try {
      if (grouped && child.pid) process.kill(-child.pid, 'SIGTERM');
      else child.kill('SIGTERM');
    } catch (error) {
      if (error.code !== 'ESRCH') console.error(error);
    }
  }
  process.exitCode = code;
}
for (const child of children) {
  child.on('error', (error) => { console.error(error); stop(1); });
  child.on('exit', (code) => stop(code ?? 1));
}
process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
