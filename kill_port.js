const { exec } = require('child_process');

exec('netstat -ano', (err, stdout, stderr) => {
  if (err) {
    console.error('Error running netstat:', err);
    return;
  }
  const lines = stdout.split('\n');
  let killed = false;
  lines.forEach(line => {
    if (line.includes(':3000') && line.includes('LISTENING')) {
      const parts = line.trim().split(/\s+/);
      if (parts.length > 4) {
        const pid = parts[parts.length - 1];
        console.log(`Found process on port 3000: PID ${pid}`);
        exec(`taskkill /F /PID ${pid}`, (killErr) => {
          if (killErr) {
            console.error(`Failed to kill process ${pid}:`, killErr.message);
          } else {
            console.log(`Successfully killed process ${pid}`);
          }
        });
        killed = true;
      }
    }
  });
  if (!killed) {
    console.log('No active listening process found on port 3000.');
  }
});
