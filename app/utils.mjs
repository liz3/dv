import fs from "fs";
import { app } from "electron";
import path from "path";

export const load_existing_model = (p) => {
  const save_path = path.join(app.getPath("userData"), "saves.json");
  const current_state = fs.existsSync(save_path)
    ? JSON.parse(fs.readFileSync(save_path, "utf-8"))
    : {};
  return current_state[p];
};
export const save_model_data = (p, model) => {
  const save_path = path.join(app.getPath("userData"), "saves.json");
  const current_state = fs.existsSync(save_path)
    ? JSON.parse(fs.readFileSync(save_path, "utf-8"))
    : {};
  current_state[p] = model;
  fs.writeFileSync(save_path, JSON.stringify(current_state));
};
