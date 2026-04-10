const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    API_URL: 'http://localhost:3000',


    // Realiza login e ponte com o processo Main
    realizarLogin: (dados) => ipcRenderer.invoke('realizar-login', dados)
});