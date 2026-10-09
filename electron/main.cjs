const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");
let win,
  dirty = false,
  allowClose = false;
const MAX = 512 * 1024 * 1024;
if (process.env.COMPOSITOR_TEST === "1")
  app.setPath(
    "userData",
    path.join(app.getPath("temp"), "compositor-win-test-" + process.pid),
  );
function checkedBytes(value) {
  const b = Buffer.from(value);
  if (!b.length || b.length > MAX) throw Error("文件为空或超过 512 MB");
  return b;
}
async function atomicWrite(target, bytes) {
  const temp = target + "." + Date.now() + ".tmp";
  try {
    await fs.writeFile(temp, bytes);
    await fs.rename(temp, target);
  } finally {
    await fs.rm(temp, { force: true }).catch(() => {});
  }
}
app.whenReady().then(() => {
  win = new BrowserWindow({
    icon: path.join(__dirname, "icon.png"),
    width: 1480,
    height: 940,
    minWidth: 1000,
    minHeight: 680,
    title: "Compositor 中文版",
    backgroundColor: "#232323",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  win.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith("file://")) event.preventDefault();
  });
  win.on("close", (event) => {
    if (dirty && !allowClose) {
      event.preventDefault();
      win.webContents.send("document:close");
    }
  });
  win.loadFile(
    path.join(__dirname, "../dist/index.html"),
    process.env.COMPOSITOR_TEST === "1" ? { query: { test: "1" } } : {},
  );
});
ipcMain.on("document:dirty", (_, value) => {
  dirty = !!value;
});
ipcMain.on("document:closeReply", (_, value) => {
  if (value) {
    allowClose = true;
    win.close();
  }
});
ipcMain.handle("file:open", async () => {
  const result = await dialog.showOpenDialog(win, {
    title: "打开图片、PSD 或中文项目",
    properties: ["openFile", "multiSelections"],
    filters: [
      {
        name: "图像与项目",
        extensions: ["png", "jpg", "jpeg", "webp", "bmp", "psd", "cwin"],
      },
    ],
  });
  if (result.canceled) return null;
  return Promise.all(
    result.filePaths.map(async (file) => {
      const stat = await fs.stat(file);
      if (stat.size > MAX) throw Error("文件超过 512 MB");
      return {
        name: path.basename(file),
        bytes: new Uint8Array(await fs.readFile(file)),
      };
    }),
  );
});
ipcMain.handle("comp:open", async () => {
  const result = await dialog.showOpenDialog(win, {
    title: "选择原版 Compositor .comp 项目文件夹",
    properties: ["openDirectory"],
  });
  if (result.canceled) return null;
  const dir = result.filePaths[0],
    manifestPath = path.join(dir, "manifest.json");
  if ((await fs.stat(manifestPath)).size > 4 * 1024 * 1024)
    throw Error("项目清单超过 4 MB");
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  if (!Array.isArray(manifest.layers) || manifest.layers.length > 100)
    throw Error("图层清单无效");
  const assets = {};
  let total = 0;
  for (const layer of manifest.layers) {
    if (typeof layer.id !== "string" || !/^[a-fA-F0-9-]{36}$/.test(layer.id))
      throw Error("图层 ID 无效");
    for (const key of ["imageFile", "maskFile"])
      if (layer[key]) {
        const expected =
          layer.id + (key === "maskFile" ? ".mask" : "") + ".png";
        if (layer[key] !== expected) throw Error("图层资源路径不安全");
        const file = path.join(dir, "images", expected),
          stat = await fs.stat(file);
        total += stat.size;
        if (stat.size > MAX || total > MAX) throw Error("图片资源超过 512 MB");
        assets[expected] = new Uint8Array(await fs.readFile(file));
      }
  }
  return { name: path.basename(dir).replace(/\.comp$/i, ""), manifest, assets };
});
ipcMain.handle("file:save", async (_, request) => {
  const types = { cwin: ["cwin"], png: ["png"], jpg: ["jpg"], psd: ["psd"] };
  if (!types[request.type]) throw Error("不支持的格式");
  const bytes = checkedBytes(request.bytes);
  const result = await dialog.showSaveDialog(win, {
    title: "保存文件",
    defaultPath: path.basename(request.name),
    filters: [
      { name: request.type.toUpperCase(), extensions: types[request.type] },
    ],
  });
  if (result.canceled) return null;
  await atomicWrite(result.filePath, bytes);
  return result.filePath;
});
ipcMain.handle("recovery:write", async (_, bytes) => {
  await atomicWrite(
    path.join(app.getPath("userData"), "recovery.cwin"),
    checkedBytes(bytes),
  );
  return true;
});
ipcMain.handle("recovery:read", async () => {
  try {
    return new Uint8Array(
      await fs.readFile(path.join(app.getPath("userData"), "recovery.cwin")),
    );
  } catch {
    return null;
  }
});
app.on("window-all-closed", () => app.quit());
