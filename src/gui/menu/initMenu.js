// static/initMenu.js
import { MenuBar } from "./MenuBar.js";

async function loadJSON(url){ const r = await fetch(url); if(!r.ok) throw new Error(url); return r.json(); }

export async function initMenu(configUrl = "./static/menu.config.json") {
  const cfg = await loadJSON(configUrl);
  const menu = new MenuBar(document.getElementById("menubar"));
  menu.renderFromConfig(cfg);

  // Note: Keyboard shortcuts are handled by GUIAdapter.bindShortcuts()
  // to avoid double-binding. The menu only handles click events.

  return menu; // so you can enable/disable items later: menu.update("edit.copy",{disabled:false})
}
