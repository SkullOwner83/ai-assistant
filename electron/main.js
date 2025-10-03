const { app, BrowserWindow } = require('electron');
const { spawn, exec } = require('child_process');
const waitPort = require('wait-port');
const path = require('path');

let backendProcess;

function createWindow() {
    let win = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    //win.setMenu(null)

    const backendExe = path.join(__dirname, '..', 'backend', 'dist', 'ai_assistant.exe');

    backendProcess = spawn(`"${backendExe}"`, [], {
        cwd: path.join(__dirname, '..', 'backend'),
        shell: true
    });

    backendProcess.stdout.on('data', data => console.log('[BACKEND]', data.toString()));
    backendProcess.stderr.on('data', data => console.error('[BACKEND ERROR]', data.toString()));

    waitPort({ host: '127.0.0.1', port: 8000, timeout: 10000 })
        .then((open) => {
            if (open) {
                win.loadFile(path.join(__dirname, '../frontend/build/index.html'));
            } else {
                console.error("El backend no levantó el puerto 8000");
            }
        });

    win.on('closed', () => cleanupBackend());
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