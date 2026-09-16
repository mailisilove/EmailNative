const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
  showNotification: (title, body) => {
    ipcRenderer.send('app:show-notification', { title, body });
  },
  onMenuTrigger: (callback) => {
    ipcRenderer.on('menu:trigger', (event, action) => callback(action));
  }
});
