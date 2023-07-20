/* eslint-disable quotes */
/* eslint-disable @typescript-eslint/no-var-requires */

const {app, BrowserWindow, protocol, ipcMain, dialog, Tray, Menu, shell,
  nativeTheme} = require("electron");
const os = require("os");
const fs = require("fs");
const path = require("path");
require("v8-compile-cache");
const uuid4 = require("uuid4");
const osu = require("node-os-utils");
const {spawn} = require("child_process");

const sessionID = uuid4();
const cpu = osu.cpu;
const mem = osu.mem;
let platformName = process.platform;
const userHomeDir = os.homedir();
let appPath = app.getAppPath();
if (platformName === "win32") {
  appPath = path.dirname(app.getPath("exe"));
}
else if (appPath.endsWith("app.asar")) {
  appPath = path.dirname(app.getPath("exe"));
  appPath = path.join(appPath, "..");
}

process.env.ETHUB_SESSION_ID = sessionID;
process.env.REZ_CONFIG_FILE = "/transfer/hub/.config/software/rez/rezconfig.py";
let appQuitting = false;
let tray = null;
let splash = null;
let window = null;
const isDev = process.env.NODE_ENV === "dev";
const public = path.join(__dirname, "..", isDev ? "public" : "build");

const iconPaths = {
  "win32": "media/desktop_icon/win/icon.ico",
  "darwin": "media/desktop_icon/mac/icon.icns",
  "linux": "media/desktop_icon/linux/icon.png"
};

const wsData = {};
wsData.hostname = osu.os.hostname();
wsData.ip = osu.os.ip();

const fileHandler = (req, callback) => {
  let requestedPath = req.url.substr(6);
  let allowed = path.resolve(requestedPath).startsWith("/transfer/hub/");
  if (!allowed) {
    callback({error: -10});
    return;
  }
  callback({
    path: requestedPath
  });
};

const commandBuilder = (
  _cmd,
  args,
  options={shell: false, persist: false, title: ""}
) => {
  const cmd = [`konsole --nofork --workdir ${userHomeDir}`];
  if (options.title) cmd.push(`-p tabtitle="${options.title}"`);
  const hold_cmd = options.persist && options.shell ? ";bash" : "";
  cmd.push(`-e bash -c '${_cmd}${args.join(" ")}${hold_cmd}'`);
  return cmd.join(" ");
};

function createWindow (show=true) {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    show: show,
    icon: path.join(__dirname, iconPaths[platformName]),
    backgroundColor: "#141414",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      preload: path.join(__dirname, "preload.js"),
      enableBlinkFeatures: "CSSGridTemplatePropertyInterpolation"
    }
  });

  nativeTheme.themeSource = "dark";

  if (isDev) {
    console.log("Loading development environment...");
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools();
  } else {
    win.removeMenu();
    win.loadFile("build/index.html");
  }

  win.on("close", e => {
    if (!appQuitting) {
      e.preventDefault();
      win.hide();
    }
  });

  ipcMain.handle("store_data", async (e, filename, data) => {
    const filepath = path.join(os.homedir(), ".ethub", filename);
    fs.promises.writeFile(filepath, data, (err) => {
      if (err) throw err;
      else return true;
    });
  });

  ipcMain.handle("load_data", async (e, filename) => {
    const filepath = path.join(os.homedir(), ".ethub", filename);
    fs.promises.readFile(filepath, (err) => {
      if (err) throw err;
      return true;
    });
  });

  ipcMain.handle("open_url", async (e, url) => {
    shell.openExternal(url);
  });

  ipcMain.handle("get_version", () => {
    return app.getVersion();
  });

  ipcMain.handle("check_path", async (e, filepath) => {
    let valid = true;
    try {
      await fs.promises.access(filepath);
    } catch (err) {
      valid = false;
    }
    return valid;
  });

  ipcMain.handle("dir_input", async (e, properties=[]) => {
    const settings = {properties: ["openDirectory", ...properties]};
    return await dialog.showOpenDialog(win, settings);
  });

  ipcMain.handle("file_input", async (e, properties=[]) => {
    const settings = {properties: ["openFile", ...properties]};
    return await dialog.showOpenDialog(win, settings);
  });

  ipcMain.handle("get_env", (e, env_name) => {
    return process.env[env_name];
  });

  ipcMain.handle("uuid", () => {
    return uuid4();
  });

  ipcMain.on("ondragstart", (event, filePath) => {
    event.sender.startDrag({
      file: path.join(__dirname, filePath),
      // icon: iconName,
    });
  });

  ipcMain.handle("set_env", (e, env_name, env_value) => {
    process.env[env_name] = env_value;
  });

  ipcMain.handle("set_envs", (e, data) => {
    for (const [env_name, env_value] of Object.entries(data)) {
      process.env[env_name] = env_value;
    }
  });

  ipcMain.handle(
    "launch_dcc",
    async (e, _cmd, args, options={shell: false, persist: false}) => {
      const cmd = commandBuilder(_cmd, args, options);
      console.log("Running", `"${cmd}"`);
      if (options.env) console.log("With env", options.env);
      const dccEnv = {...process.env, ...(options.env || {})};
      const proc = spawn(cmd, {shell: true, detached: true, env: dccEnv});
      if (proc) {
        proc.unref();
        return true;
      }
    }
  );

  return win;
}

function createSplash () {
  const win = new BrowserWindow({
    width: 600,
    height: 350,
    transparent: true,
    frame: false,
    backgroundColor: "#141414",
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js")
    },
    icon: path.join(__dirname, iconPaths[platformName])
  });
  win.loadFile(`${public}/splash.html`);
  return win;
}

const gotTheLock = app.requestSingleInstanceLock(sessionID);

if (!gotTheLock) app.quit();
else {
  app.on("second-instance", () => {
    if (window) {
      if (window.isMinimized()) window.restore();
      window.show();
      window.focus();
    }
  });
}

app.whenReady().then(async () => {
  splash = createSplash();
  window = createWindow(false);
  window.once("ready-to-show", () => {
    splash.destroy();
    window.show();
    window.maximize();
  });

  protocol.registerFileProtocol(
    "hub",
    fileHandler,
  );

  setInterval(() => {
    const cpuAvg = cpu.usage();
    const memUsed = mem.used();
    Promise.all([cpuAvg, memUsed]).then(data => {
      wsData.cpuAvg = data[0];
      wsData.memUsed = data[1];
      window.webContents.send("workstationData", {data: wsData});
    });
  }, 2000);

  if (tray === null) tray = new Tray(
    path.join(__dirname, iconPaths[platformName])
  );
  const contextMenu = Menu.buildFromTemplate([
    { label: "Show", click: () => window.show() },
    { label: "Exit", click: () => app.quit() },
  ]);
  tray.setToolTip("Hub");
  tray.setContextMenu(contextMenu);
  tray.on("click", () => window.show());
  tray.on("double-click", () => window.show());
});

app.on("before-quit", () => {
  appQuitting = true;
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    window = createWindow();
  }
});
