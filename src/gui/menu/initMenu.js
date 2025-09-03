// static/initMenu.js
import { MenuBar } from "./MenuBar.js";

async function loadJSON(url){ const r = await fetch(url); if(!r.ok) throw new Error(url); return r.json(); }

export async function initMenu(configUrl = "./static/menu.config.json") {
  const cfg = await loadJSON(configUrl);
  const menu = new MenuBar(document.getElementById("menubar"));
  menu.renderFromConfig(cfg);

  // Optional hotkeys for now:
  const key = e => (e.ctrlKey||e.metaKey ? "Ctrl+" : "") + (e.key.length===1 ? e.key.toUpperCase() : e.key);
  const map = { "Ctrl+Z":"edit.undo", "Ctrl+Y":"edit.redo", "Ctrl+A":"edit.selectAll", "Delete":"edit.delete", "Ctrl+R":"view.recenter" };
  document.addEventListener("keydown", e => {
    const id = map[key(e)];
    if (id){ e.preventDefault(); document.dispatchEvent(new CustomEvent("ui:action",{ detail:{ id } })); }
  });

  return menu; // so you can enable/disable items later: menu.update("edit.copy",{disabled:false})
}
