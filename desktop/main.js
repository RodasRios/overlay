const { app, BrowserWindow, globalShortcut, ipcMain, screen, Tray, Menu } = require("electron");
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://overlay.aoe4world.com";
const configPath = path.join(app.getPath("userData"), "config.json");

const loadConfig = () => {
  try {
    return JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch {
    return {};
  }
};
const saveConfig = (cfg) => fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2));

let overlay, setup, tray;

const toggleOverlay = () => {
  if (!overlay) return;
  overlay.isVisible() ? overlay.hide() : overlay.showInactive();
};

const overlayUrl = ({ profileId, theme = "floating" }) =>
  `${BASE_URL}/profile/${profileId}/bar?theme=${theme}&includeAlts=true`;

function openSetup() {
  if (setup) return setup.focus();
  setup = new BrowserWindow({
    width: 420,
    height: 300,
    resizable: false,
    autoHideMenuBar: true,
    title: "AoE4 Overlay",
    webPreferences: { preload: path.join(__dirname, "preload.js") },
  });
  setup.loadFile("setup.html");
  setup.on("closed", () => {
    setup = null;
    if (!overlay) app.quit();
  });
}

function openOverlay(cfg) {
  const { workArea } = screen.getPrimaryDisplay();
  if (overlay) overlay.close();
  overlay = new BrowserWindow({
    x: workArea.x,
    y: workArea.y,
    width: workArea.width,
    height: workArea.height,
    transparent: true,
    frame: false,
    hasShadow: false,
    skipTaskbar: true,
    focusable: false,
    resizable: false,
    webPreferences: { backgroundThrottling: false },
  });
  // Stay above borderless/windowed fullscreen games and let clicks pass through to the game.
  overlay.setAlwaysOnTop(true, "screen-saver");
  overlay.setIgnoreMouseEvents(true);
  overlay.loadURL(overlayUrl(cfg));
  overlay.on("closed", () => (overlay = null));
}

app.whenReady().then(() => {
  const cfg = loadConfig();
  cfg.profileId ? openOverlay(cfg) : openSetup();

  tray = new Tray(path.join(__dirname, "icon.png"));
  tray.setToolTip("AoE4 Overlay");
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: "Show/Hide overlay (Ctrl+Shift+O)", click: toggleOverlay },
      { label: "Settings (Ctrl+Shift+P)", click: openSetup },
      { label: "Quit (Ctrl+Shift+Q)", click: () => app.quit() },
    ])
  );

  globalShortcut.register("CommandOrControl+Shift+O", toggleOverlay);
  globalShortcut.register("CommandOrControl+Shift+P", openSetup);
  globalShortcut.register("CommandOrControl+Shift+Q", () => app.quit());
});

ipcMain.on("save-config", (_e, cfg) => {
  saveConfig(cfg);
  if (setup) setup.close();
  openOverlay(cfg);
});
ipcMain.handle("get-config", () => loadConfig());

app.on("window-all-closed", () => {});
app.on("will-quit", () => globalShortcut.unregisterAll());
