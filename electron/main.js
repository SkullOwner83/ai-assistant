const { app, BrowserWindow } = require('electron');
const { spawn, exec } = require('child_process');
const axios = require('axios')
const waitPort = require('wait-port');
const path = require('path');

let backendProcess;

async function createWindow() {
    let win = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    win.setMenu(null)

    const backendExe = path.join(__dirname, '..', 'backend', 'dist', 'ai_assistant.exe');

    backendProcess = spawn(`"${backendExe}"`, [], {
        cwd: path.join(__dirname, '..', 'backend'),
        shell: true
    });

    backendProcess.stdout.on('data', data => console.log('[BACKEND]', data.toString()));
    backendProcess.stderr.on('data', data => console.error('[BACKEND ERROR]', data.toString()));

    const ready = await waitForBackendReady();

    if (ready) {
        win.loadFile(path.join(__dirname, '../frontend/build/index.html'));
    } else {
        console.error("El backend no respondio a tiempo.");
    }

    win.on('closed', () => cleanupBackend());
}

async function waitForBackendReady(maxRetries = 50) {
    for(let i = 0; i < maxRetries; i++) {
        console.log(`Loading... ${i}`);

        try {
            const response = await axios.get('http://127.0.0.1:8000/health');
            if (response.status === 200) return true;
        } catch (_) {}
        
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return false;
}

function cleanupBackend() {
    if (backendProcess) { 
        backendProcess.kill();
        backendProcess = null;
    }

    exec('taskkill /IM ai_assistant.exe /F', (err, stdout, stderr) => {
        if (err) console.error(err);
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', ()=> {
    cleanupBackend();
    if (process.platform !== 'darwin') app.quit();
})

process.on('exit', cleanupBackend);
process.on('SIGINT', () => { cleanupBackend(); process.exit(); });
process.on('SIGTERM', () => { cleanupBackend(); process.exit(); });