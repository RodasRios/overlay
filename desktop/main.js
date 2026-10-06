const { app, BrowserWindow, globalShortcut, ipcMain, screen, Tray, Menu } = require("electron");
const fs = require("fs");
const http = require("http");
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

const DEFAULT_SHOW = ["rank", "rating", "wins", "losses", "winrate"];

// The overlay web app is served locally from the build output (so new options work without hosting it).
const webDir = app.isPackaged ? path.join(process.resourcesPath, "web") : path.join(__dirname, "..", "dist");
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json", ".webmanifest": "application/manifest+json" };
let localBase;

function startServer() {
  if (!fs.existsSync(path.join(webDir, "index.html"))) return Promise.resolve(null);
  const server = http.createServer((req, res) => {
    const file = path.join(webDir, path.normalize(decodeURIComponent(req.url.split("?")[0])));
    const target = file.startsWith(webDir) && fs.existsSync(file) && fs.statSync(file).isFile() ? file : path.join(webDir, "index.html");
    res.writeHead(200, { "Content-Type": MIME[path.extname(target)] || "application/octet-stream" });
    fs.createReadStream(target).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(`http://127.0.0.1:${server.address().port}`)));
}

const overlayUrl = ({ profileId, theme = "floating", show = DEFAULT_SHOW }) => {
  const q = new URLSearchParams({ theme, includeAlts: "true" });
  if (localBase) q.set("show", show.join(","));
  return `${localBase || BASE_URL}/profile/${profileId}/bar?${q}`;
};

function openSetup() {
  if (setup) return setup.focus();
  setup = new BrowserWindow({
    width: 420,
    height: 430,
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

app.whenReady().then(async () => {
  localBase = await startServer();
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
