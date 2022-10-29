import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import * as url from "url";
import transformBuffer from "./core/Transformer.mjs";
import fs from "fs";
import * as utils from "./utils.mjs";
const state = {
  counter: 0,
  entries: {},
};
const ipcHandlers = async (window) => {
  ipcMain.handle("get_files", async (ev) => {
    return state.entries;
  });
  ipcMain.handle("read_files", async (ev, files) => {
    const entries = [];
    for (const file of files) {
      const id = state.counter++;
      const entry = {
        nodes: null,
        id,
        model: null,
        file,
      };
      const existing_model = utils.load_existing_model(file.path);
      if (existing_model) {
        const file_content = fs.readFileSync(file.path);
        entry.model_str = existing_model;
        const evaluated_model = (0, eval)(existing_model);
        const result = transformBuffer(file_content, evaluated_model);
        if (result) entry.nodes = result;
      }
      entries.push(entry);
      state.entries[id] = entry;
    }
    return entries;
  });
  ipcMain.handle("update_model", async (ev, id, model) => {
    if (!state.entries[id]) return null;
    const entry = state.entries[id];
    utils.save_model_data(entry.file.path, model);
    const evaluated_model = (0, eval)(model);
    const file_content = fs.readFileSync(entry.file.path);
    const res = transformBuffer(file_content, evaluated_model);
    if (!res) return null;
    entry.model_str = model;
    entry.nodes = res;
    return entry;
  });
  ipcMain.handle("get_content", (ev, id) => {
    if (!state.entries[id]) return null;
    const entry = state.entries[id];
    const file_content = fs.readFileSync(entry.file.path);
    return file_content;
  });
  ipcMain.handle("delete_file", async (ev, id) => {
    if (state.entries[id]) {
      delete state.entries[id];
    }
  });
};

const main = async (__dirname) => {
  await app.whenReady();
  app.setName("dv");

  const window = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  ipcHandlers(window);
  if (process.env.NODE_ENV === "development")
    window.loadURL("http://localhost:3000");
  else window.loadFile(path.join(__dirname, "..", "build", "index.html"));
};

export default function (__dirname) {
  main(__dirname);
}
