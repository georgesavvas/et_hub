import { BrowserWindow, app, dialog, ipcMain, nativeTheme, shell } from 'electron'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'

import fs from "fs";
import icon from '../../resources/icon_dark.png?asset'
import { join } from 'path'
import os from "os";
import osu from "node-os-utils";
import path from "path";
import uuid4 from "uuid4";

nativeTheme.themeSource = "dark";
const sessionID = uuid4();
const cpu = osu.cpu;
const mem = osu.mem;
const userHomeDir = os.homedir();

process.env.ETHUB_SESSION_ID = sessionID;
process.env.REZ_CONFIG_FILE = "/transfer/hub/.config/software/rez/rezconfig.py";

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

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    show: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      webSecurity: !is.dev,
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  if (is.dev) mainWindow.webContents.openDevTools();
  else mainWindow.removeMenu();

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  ipcMain.handle("dir_input", async (e, properties=[]) => {
    const settings = {properties: ["openDirectory", ...properties]};
    return await dialog.showOpenDialog(mainWindow, settings);
  });

  ipcMain.handle("file_input", async (e, properties=[]) => {
    const settings = {properties: ["openFile", ...properties]};
    return await dialog.showOpenDialog(mainWindow, settings);
  });
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.ethub')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})



ipcMain.handle("store_data", async (_, filename, data) => {
  const filepath = path.join(os.homedir(), ".ethub", filename);
  fs.promises.writeFile(filepath, data, (err) => {
    if (err) throw err;
    else return true;
  });
});

ipcMain.handle("load_data", async (_, filename) => {
  const filepath = path.join(os.homedir(), ".ethub", filename);
  fs.promises.readFile(filepath, (err) => {
    if (err) throw err;
    return true;
  });
});

ipcMain.handle("open_url", async (_, url) => {
  shell.openExternal(url);
});

ipcMain.handle("get_version", () => {
  return app.getVersion();
});

ipcMain.handle("check_path", async (_, filepath) => {
  let valid = true;
  try {
    await fs.promises.access(filepath);
  } catch (err) {
    valid = false;
  }
  return valid;
});

ipcMain.handle("get_env", (e, env_name) => {
  return process.env[env_name];
});

ipcMain.handle("uuid", () => {
  return uuid4();
});

// ipcMain.on("ondragstart", (event, filePath) => {
//   event.sender.startDrag({
//     file: join(__dirname, filePath),
//   });
// });

ipcMain.handle("set_env", (e, env_name, env_value) => {
  process.env[env_name] = env_value;
});

ipcMain.handle("set_envs", (e, data) => {
  for (const [env_name, env_value] of Object.entries(data)) {
    process.env[env_name] = env_value;
  }
});

// ipcMain.handle(
//   "launch_dcc",
//   async (e, _cmd, args, options={shell: false, persist: false}) => {
//     const cmd = commandBuilder(_cmd, args, options);
//     console.log("Running", `"${cmd}"`);
//     if (options.env) console.log("With env", options.env);
//     const dccEnv = {...process.env, ...(options.env || {})};
//     const proc = spawn(cmd, {shell: true, detached: true, env: dccEnv});
//     if (proc) {
//       proc.unref();
//       return true;
//     }
//   }
// );

ipcMain.handle("restart", () => {
  app.relaunch();
  app.exit();
});
