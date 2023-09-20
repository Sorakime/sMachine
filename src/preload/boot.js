const {webFrame, ipcRenderer, contextBridge} = require('electron');

ipcRenderer.once('updateOsName', (_, d) => {
  webFrame.executeJavaScript(`
    updateOsName('${d}');
  `);
})

contextBridge.exposeInMainWorld('node', {
  chooseBootup: () => {
    ipcRenderer.invoke('chooseBootup');
  }
});
