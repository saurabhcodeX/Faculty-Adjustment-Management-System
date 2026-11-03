const { app, BrowserWindow, dialog } = require('electron');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const PORT = 4000;
const SERVER_URL = `http://127.0.0.1:${PORT}`;

let backendProcess = null;
let mainWindow = null;
let isQuitting = false;

function getPaths() {
  const root = app.isPackaged ? process.resourcesPath : app.getAppPath();

  return {
    backendDir: app.isPackaged
      ? path.join(root, 'backend')
      : path.join(root, 'backend'),
    serverFile: app.isPackaged
      ? path.join(root, 'backend', 'src', 'server.js')
      : path.join(root, 'backend', 'src', 'server.js'),
    frontendDist: path.join(root, 'frontend', 'dist'),
    initialDatabase: app.isPackaged
      ? path.join(root, 'initial-data', 'fams.db')
      : path.join(root, 'backend', 'data', 'fams.db')
  };
}

function prepareDatabase(initialDatabase) {
  const userData = app.getPath('userData');
  fs.mkdirSync(userData, { recursive: true });

  const databasePath = path.join(userData, 'fams.db');

  if (!fs.existsSync(databasePath)) {
    if (!fs.existsSync(initialDatabase)) {
      throw new Error('Initial FAMS database was not found.');
    }

    fs.copyFileSync(initialDatabase, databasePath);
  }

  return databasePath;
}

function startBackend(paths, databasePath) {
  const env = {
    ...process.env,
    ELECTRON_RUN_AS_NODE: '1',
    NODE_ENV: 'production',
    PORT: String(PORT),
    HOST: '127.0.0.1',
    DB_PATH: databasePath,
    FRONTEND_DIST: paths.frontendDist,
    DEMO_MODE: 'false',
    COOKIE_SECURE: 'false',
    COOKIE_SAMESITE: 'lax',
    CORS_ORIGINS: ''
  };

  backendProcess = spawn(
    process.execPath,
    [paths.serverFile],
    {
      cwd: paths.backendDir,
      env,
      stdio: 'inherit',
      windowsHide: true
    }
  );

  backendProcess.on('error', error => {
    console.error('Backend error:', error);
  });

  backendProcess.on('exit', (code, signal) => {
    console.log('Backend stopped:', code, signal);

    if (!isQuitting) {
      dialog.showErrorBox(
        'FAMS Backend',
        'The backend stopped unexpectedly. Please restart FAMS.'
      );
      app.quit();
    }
  });
}

async function waitForBackend() {
  const deadline = Date.now() + 30000;

  while (Date.now() < deadline) {
    if (backendProcess && backendProcess.exitCode !== null) {
      throw new Error('Backend process exited during startup.');
    }

    try {
      const response = await fetch(`${SERVER_URL}/health`);
      if (response.ok) return;
    } catch {
      // Wait for backend startup.
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  throw new Error('Backend did not start within 30 seconds.');
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 950,
    minHeight: 650,
    show: false,
    title: 'Faculty Adjustment Management System',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  await mainWindow.loadURL(SERVER_URL);
  mainWindow.show();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  try {
    const paths = getPaths();

    if (!fs.existsSync(paths.serverFile)) {
      throw new Error('Backend server.js was not found.');
    }

    if (!fs.existsSync(paths.frontendDist)) {
      throw new Error('Frontend build not found. Build frontend first.');
    }

    const databasePath = prepareDatabase(paths.initialDatabase);

    startBackend(paths, databasePath);
    await waitForBackend();
    await createWindow();
  } catch (error) {
    console.error(error);
    dialog.showErrorBox('FAMS Startup Error', error.message);
    app.quit();
  }
});

app.on('before-quit', () => {
  isQuitting = true;

  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill();
  }
});

app.on('window-all-closed', () => {
  app.quit();
});
