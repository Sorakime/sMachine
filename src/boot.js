const {app, BrowserWindow, dialog, ipcMain} = require('electron');
const fs = require('fs');
let win;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'sMachine',
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInSubFrames: true,
      webviewTag: true,
      sandbox: false,
      preload: `${__dirname}/preload/boot.js`
    }
  });

  win.loadFile(`${__dirname}/uefi/boot.html`);

  win.on('closed', () => {
    app.quit();
  });


  function boot(from) {
    fs.readFile(`${from}/sysinfo`, 'utf-8', (e, d) => {
      if (e) {
        win.webContents.executeJavaScript(`
          document.getElementById('button').innerHTML = 'Booting Error: Invalid format.<br>Press Ctrl(cmd) + R to restart'
        `);
        return;
      } else {
        const OS = require(`${from}${JSON.parse(d).boot}`);
        new OS();
        win.loadFile(`${__dirname}/uefi/booting.html`).then(() => {
          win.webContents.send('updateOsName', JSON.parse(d).name);
        });
      }
    });
  }

  ipcMain.handle('chooseBootup', () => {
    dialog.showOpenDialog({
      title: 'Where you want to boot from',
      message: 'Choose a directory',
      properties: ['openDirectory']
    }).then((e) => {
      if (e.canceled) return;
      boot(e.filePaths[0]);
    });
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (win === null) createWindow();
});
