const { app, BrowserWindow } = require('electron');
const { spawn, exec } = require('child_process');
const axios = require('axios')
const path = require('path');

let backendProcess;
const isDev = !app.isPackaged;

async function createWindow() {
    let win = new BrowserWindow({
        title: 'AI Assistant',
        width: 1280,
        height: 720,
        icon: isDev 
            ? path.join(process.resourcesPath, '..', 'assets', 'ai-logo.png')
            : path.join(process.resourcesPath, 'assets', 'ai-logo.png'),
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    win.setMenu(null);

    const backendExe = isDev
        ? path.join(__dirname, '..', 'backend', 'dist', 'ai_assistant.exe')
        : path.join(process.resourcesPath, 'backend', 'ai_assistant.exe');

    const { dialog } = require('electron');

    backendProcess = spawn(backendExe, [], {
        cwd: isDev 
            ? path.join(__dirname, '..', 'backend')
            : path.join(process.resourcesPath, 'backend'),
        shell: false
    });

    backendProcess.stdout.on('data', data => console.log('[BACKEND]', data.toString()));
    backendProcess.stderr.on('data', data => console.error('[BACKEND ERROR]', data.toString()));

    const ready = await waitForBackendReady();

    if (ready) {
        win.loadFile(isDev
            ? path.join(__dirname, '..', 'frontend', 'build', 'index.html')
            : path.join(app.getAppPath(), 'frontend', 'build', 'index.html')
        );
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

    exec(`taskkill /IM ai_assistant.exe /F`, (err, stdout, stderr) => {
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