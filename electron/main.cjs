const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

// Configure logging
log.transports.file.level = "info";
autoUpdater.logger = log;
log.info('App starting...');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

let mainWindow;

const createWindow = () => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        icon: path.join(__dirname, '../public/icons/icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs'),
        },
        titleBarStyle: 'default',
        backgroundColor: '#0a0a0f',
        show: false,
    });

    // Remove menu bar
    Menu.setApplicationMenu(null);

    // Load the app
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
    // Set App User Model ID for Windows Notifications
    if (process.platform === 'win32') {
        app.setAppUserModelId('com.primalnote.app');
    }

    createWindow();

    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Update logic
autoUpdater.on('update-available', () => {
    log.info('Update available.');
});

autoUpdater.on('update-downloaded', (info) => {
    log.info('Update downloaded');
    dialog.showMessageBox({
        type: 'info',
        title: 'อัพเดทพร้อมใช้งาน',
        message: `เวอร์ชันใหม่ (${info.version}) พร้อมที่จะติดตั้งแล้วครับ ต้องการเริ่มใหม่เพื่ออัพเดทเลยไหมครับ?`,
        buttons: ['เริ่มใหม่ตอนนี้', 'ไว้ทีหลัง']
    }).then((result) => {
        if (result.response === 0) {
            autoUpdater.quitAndInstall();
        }
    });
});

autoUpdater.on('error', (err) => {
    log.error('Error in auto-updater: ' + err);
});

app.on('ready', () => {
    if (process.env.NODE_ENV !== 'development') {
        autoUpdater.checkForUpdatesAndNotify();
    }
});
