class DataState {
  constructor() {
    this.eventListeners = {};
    this.react_listeners = [];
    this.state = {
      files: { v: {} },
      activeFile: { v: null },
    };
    window.__NATIVE_DV__.get_files().then((files) => {
      for (const e of Object.values(files)) {
        e.mode = e.nodes ? "nodes" : "hex";
      }
      this.emit("files", files);
    });
  }
  emit(k, v) {
    this.state[k] = { v };
    if (!this.eventListeners[k]) return;
    for (const e of this.eventListeners[k]) {
      e(v);
    }
  }
  async get_file_content(id) {
    return window.__NATIVE_DV__.get_content(id);
  }
  async register_files(raw) {
    const files = [];
    for (const file of raw) {
      files.push({
        path: file.path,
        type: file.type,
        size: file.size,
        name: file.name,
      });
    }
    const res = await window.__NATIVE_DV__.read_files(files);
    const f = this.get("files");
    for (const e of res) {
      e.mode = e.nodes ? "nodes" : "hex";
      f[e.id] = e;
    }
    this.emit("files", f);
    if (!this.get("activeFile")) {
      const k = Object.keys(f)[0];
      console.log(k, f);
      this.set_active_file(f[k]);
    }
  }
  register(k, cb) {
    if (!this.eventListeners[k]) this.eventListeners[k] = [];
    this.eventListeners[k].push(cb);
  }
  get(name) {
    return this.state[name]?.v;
  }
  getComplete(name) {
    return this.state[name];
  }
  setMode(mode) {
    const file = this.get("activeFile");
    file.mode = mode;
    this.emit("activeFile", file);
  }
  toggle_editor_visible(mode) {
    const file = this.get("activeFile");
    file.editorVisible = !file.editorVisible;
    this.emit("activeFile", file);
  }
  set_active_file(file) {
    if (this.get("activeFile") === file) return;
    if (file.editorVisible === undefined) file.editorVisible = true;
    this.emit("activeFile", file);
  }
  async delete_file(file) {
    console.log("deleting", file);
    if (file === this.get("activeFile")) {
      this.emit("activeFile", null);
    }
    await window.__NATIVE_DV__.delete_file(file.id);
    const f = this.get("files");
    delete f[file.id];
    this.emit("files", f);
  }

  unregister(k, cb) {
    if (!this.eventListeners[k]) return;
    this.eventListeners[k] = this.eventListeners[k].filter((e) => e !== cb);
  }
  async update_model(file, model) {
    const { id } = file;
    const result = await window.__NATIVE_DV__.update_model(id, model);
    const activeFile = this.get("activeFile");
    if (result) {
      if (file === activeFile && !file.nodes) file.mode = "nodes";
      file.model_str = result.model_str;
      file.nodes = result.nodes;
      this.emit("files", this.get("files"));
      if (file === activeFile) this.emit("activeFile", activeFile);
    }
  }
  createReactBusListener(name) {
    const listener = (cb) => {
      this.react_listeners.push({
        cb,
        listener,
      });
      this.register(name, cb);
    };
    return [
      listener,
      () => {
        const entry = this.react_listeners.find((e) => e.listener === listener);
        this.react_listeners = this.react_listeners.filter((e) => e !== entry);
        this.unregister(name, entry.cb);
      },
    ];
  }
}
const i = new DataState();
window.__state = i;
export default i;
