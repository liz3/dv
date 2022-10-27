const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("__NATIVE_DV__", {
  read_files: (files) => {
    return ipcRenderer.invoke("read_files", files);
  },
  get_files: () => {
    return ipcRenderer.invoke("get_files");
  },
  delete_file: (id) => {
    return ipcRenderer.invoke("delete_file", id);
  },
  get_content: (id) => {
    return ipcRenderer.invoke("get_content", id);
  },
  update_model: (id, model) => {
    return ipcRenderer.invoke("update_model", id, model);
  },
});
