import { contextBridge, ipcRenderer } from 'electron'

import { electronAPI } from '@electron-toolkit/preload'

contextBridge.exposeInMainWorld("isElectron", {get: () => true});

const api = {
  startDrag: fileName => {
    ipcRenderer.send("ondragstart", fileName);
  },
  storeData: async (filename, data) => {
    return await ipcRenderer.invoke("store_data", filename, data);
  },
  loadData: async (filename) => {
    return await ipcRenderer.invoke("load_data", filename);
  },
  checkPath: (filepath) => {
    return ipcRenderer.invoke("check_path", filepath);
  },
  fileInput: async properties => {
    return await ipcRenderer.invoke("file_input", properties);
  },
  dirInput: async properties => {
    return await ipcRenderer.invoke("dir_input", properties);
  },
  launch_dcc: async (cmd, args, options) => {
    return await ipcRenderer.invoke("launch_dcc", cmd, args, options);
  },
};

const services = {
  client_progress: callback => {
    ipcRenderer.on("client_progress", callback);
    return () => ipcRenderer.removeListener("client_progress", callback);
  },
  update_available: callback => {
    ipcRenderer.on("update_available", callback);
    return () => ipcRenderer.removeListener("update_available", callback);
  },
  onResourceUsage: callback => {
    // ipcRenderer.removeAllListeners("resource_usage");
    ipcRenderer.on("resource_usage", callback);
    return () => ipcRenderer.removeListener("resource_usage", callback);
  },
  get_env: env_name => {
    return ipcRenderer.invoke("get_env", env_name);
  },
  onWorkstationData: callback => {
    ipcRenderer.on("workstationData", callback);
    return () => ipcRenderer.removeListener("workstationData", callback);
  },
  get_version: () => {
    return ipcRenderer.invoke("get_version");
  },
  restart: () => {
    return ipcRenderer.invoke("restart");
  },
  uuid: () => {
    return ipcRenderer.invoke("uuid");
  },
  open_url: url => {
    return ipcRenderer.invoke("open_url", url);
  },
  set_env: (env_name, env_value) => {
    ipcRenderer.invoke("set_env", env_name, env_value);
  },
  set_envs: data => {
    ipcRenderer.invoke("set_envs", data);
  },
  get_port: () => {
    return ipcRenderer.invoke("get_port");
  }
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('services', services)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
