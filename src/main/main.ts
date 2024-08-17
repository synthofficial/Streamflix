/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, ipcRenderer } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

autoUpdater.allowDowngrade = true;
autoUpdater.autoDownload = false;

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (process.env.NODE_ENV === 'development') {
  const devConfigPath = path.join(__dirname, '../../dev-app-update.yml');
  autoUpdater.updateConfigPath = devConfigPath;
  autoUpdater.forceDevUpdateConfig = true;
} else {
  autoUpdater.updateConfigPath = path.join(__dirname, '../../electron-builder.yml');
}

autoUpdater.logger = log;

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.ico'),
    autoHideMenuBar: true,
    titleBarStyle: "hidden",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }

    // Check for updates after window is loaded
    autoUpdater.checkForUpdates();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });
};

ipcMain.on('minimize', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
})

ipcMain.on('maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
})

ipcMain.on('close', () => {
  if (mainWindow) {
    mainWindow.close();
  }
})

autoUpdater.on('checking-for-update', () => {
  log.info('Checking for update...')
})

autoUpdater.on('update-available', (info) => {
  if(!mainWindow) return;
  mainWindow?.webContents.send('update-available', info)
})
autoUpdater.on('update-downloaded', (info) => {
  autoUpdater.quitAndInstall();
});
autoUpdater.on('download-progress', (info) => {
  if(!mainWindow) return;
  mainWindow?.webContents.send('downloading', info)
})
ipcMain.on("download-update", async () => {
  await autoUpdater.downloadUpdate();
})

autoUpdater.on('update-not-available', (info) => {
  log.info('Update not available.', info)
})

autoUpdater.on('error', (err) => {
  log.error('Error in auto-updater. ', err)
})


/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  console.log(`Certificate error: ${error}`);
  event.preventDefault();
  callback(true);
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
