// Kills any process listening on PORT before nodemon starts (Windows + Unix)
const { execSync } = require('child_process');
const PORT = process.env.PORT || 5000;

try {
  if (process.platform === 'win32') {
    const out = execSync(`netstat -ano | findstr :${PORT}`, { encoding: 'utf8' });
    const pids = [...new Set(
      out.trim().split('\n')
        .map(l => l.trim().split(/\s+/).slice(-1)[0])
        .filter(p => p && p !== '0')
    )];
    pids.forEach(pid => {
      try { execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' }); } catch (_) {}
    });
    if (pids.length) console.log(`Killed PID(s) ${pids.join(', ')} on port ${PORT}`);
  } else {
    execSync(`lsof -ti tcp:${PORT} | xargs kill -9`, { stdio: 'ignore' });
  }
} catch (_) {
  // port was already free — nothing to do
}
