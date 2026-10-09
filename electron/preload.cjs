const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("desktop", {
  open: () => ipcRenderer.invoke("file:open"),
  openComp: () => ipcRenderer.invoke("comp:open"),
  save: (bytes, name, type) =>
    ipcRenderer.invoke("file:save", { bytes, name, type }),
  recover: () => ipcRenderer.invoke("recovery:read"),
  autosave: (bytes) => ipcRenderer.invoke("recovery:write", bytes),
  dirty: (value) => ipcRenderer.send("document:dirty", value),
  closeReply: (allow) => ipcRenderer.send("document:closeReply", allow),
  onClose: (callback) => ipcRenderer.on("document:close", () => callback()),
});
