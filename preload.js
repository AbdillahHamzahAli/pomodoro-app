const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  title: "Pomodoro Timer",
  isElectron: true,
  chooseBackground: () => ipcRenderer.invoke("choose-background"),
  windowControls: {
    minimize: () => ipcRenderer.invoke("window-controls", "minimize"),
    toggleMaximize: () => ipcRenderer.invoke("window-controls", "toggleMaximize"),
    close: () => ipcRenderer.invoke("window-controls", "close"),
    getState: () => ipcRenderer.invoke("window-controls", "state"),
    onState: (callback) => {
      const listener = (_event, state) => callback(state);
      ipcRenderer.on("window-state", listener);
      return () => ipcRenderer.removeListener("window-state", listener);
    },
  },
});
