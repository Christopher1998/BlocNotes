import { app, shell, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import fs from 'fs';
import icon from '../../resources/icon.png?asset';

const notesFilePath = join(app.getPath('userData'), 'notes.json');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 680,
    height: 540,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    icon: join(__dirname, '../../resources/icon.png'), // Ruta correcta para el icono
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  });

  mainWindow.setAlwaysOnTop(true, "screen");

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

// Función para guardar las notas en el archivo
function saveNotes(notes) {
  fs.writeFileSync(notesFilePath, JSON.stringify(notes));
}

// Función para cargar las notas desde el archivo
function loadNotes() {
  try {
    const notesData = fs.readFileSync(notesFilePath);
    return JSON.parse(notesData);
  } catch (error) {
    return [];
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron');

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  const loadedNotes = loadNotes();
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('notes-loaded', loadedNotes);
  });

  ipcMain.on("close-window", () => {
    const currentWindow = BrowserWindow.getFocusedWindow();
    if (currentWindow) {
      app.quit();
    }
  });

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  mainWindow.webContents.send('get-notes');
});

ipcMain.on('notes-data', (event, notes) => {
  saveNotes(notes);
});
