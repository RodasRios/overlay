const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("overlayApi", {
  getConfig: () => ipcRenderer.invoke("get-config"),
  save: (cfg) => ipcRenderer.send("save-config", cfg),
});
