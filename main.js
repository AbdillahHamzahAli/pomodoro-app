const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "hidden",
    webPreferences: {
      // Use preload for secure, controlled exposure to renderer
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.loadFile("src/index.html");

  // Emit window state to renderer for syncing maximize/restore icon
  const sendState = () => {
    win.webContents.send("window-state", {
      isMaximized: win.isMaximized(),
      isMinimized: win.isMinimized(),
      isFullScreen: win.isFullScreen?.() || false,
    });
  };
  win.on("maximize", sendState);
  win.on("unmaximize", sendState);
  win.on("enter-full-screen", sendState);
  win.on("leave-full-screen", sendState);
}

app.whenReady().then(() => {
  createWindow();
  // macOS re-open behavior
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// IPC: Open native file dialog and return image as data URL
ipcMain.handle("choose-background", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: "Choose Background Image",
    properties: ["openFile"],
    filters: [
      { name: "Images", extensions: ["png", "jpg", "jpeg", "gif", "webp", "bmp"] },
    ],
  });
  if (canceled || !filePaths || !filePaths[0]) return null;
  const filePath = filePaths[0];
  try {
    const buf = await fs.promises.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase().replace(".", "");
    const mime =
      ext === "jpg" || ext === "jpeg"
        ? "image/jpeg"
        : ext === "png"
        ? "image/png"
        : ext === "gif"
        ? "image/gif"
        : ext === "webp"
        ? "image/webp"
        : ext === "bmp"
        ? "image/bmp"
        : "application/octet-stream";
    const base64 = buf.toString("base64");
    return `data:${mime};base64,${base64}`;
  } catch (e) {
    console.error("Failed to read image:", e);
    return null;
  }
});

// IPC: Window controls
ipcMain.handle("window-controls", (event, action) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return null;
  switch (action) {
    case "minimize":
      win.minimize();
      return true;
    case "toggleMaximize":
      if (win.isMaximized()) win.unmaximize();
      else win.maximize();
      return win.isMaximized();
    case "close":
      win.close();
      return true;
    case "state":
      return {
        isMaximized: win.isMaximized(),
        isMinimized: win.isMinimized(),
        isFullScreen: win.isFullScreen?.() || false,
      };
    default:
      return null;
  }
});
