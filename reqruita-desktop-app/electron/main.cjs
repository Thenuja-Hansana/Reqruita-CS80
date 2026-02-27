// electron/main.cjs
const { app, BrowserWindow, session, desktopCapturer, ipcMain, globalShortcut, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");

// Helps screen share during dev on http://localhost
app.commandLine.appendSwitch("enable-usermedia-screen-capturing");
app.commandLine.appendSwitch("allow-http-screen-capture");

let win;

function createWindow() {
    win = new BrowserWindow({
        width: 1100,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, "preload.cjs"),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    win.loadURL("http://localhost:5173");
}

/**
 * Screen share handler (keeps your current working behavior)
 */
function setupDisplayMediaHandler() {
    const sess = session.defaultSession;

    sess.setDisplayMediaRequestHandler(
        async (request, callback) => {
            try {
                const sources = await desktopCapturer.getSources({
                    types: ["screen", "window"],
                });

                // Prefer capturing OUR Electron app window so the interviewer
                // sees only the app content (Google iframe), not the full desktop.
                const winTitle = win?.getTitle() || "";
                const source =
                    sources.find((src) => winTitle && src.name === winTitle) ||
                    sources.find((src) => src.id?.toLowerCase().startsWith("window:")) ||
                    sources[0];
                if (!source) return callback({}); // deny cleanly

                callback({ video: source, audio: false });
            } catch (err) {
                console.error("Display media request failed:", err);
                callback({}); // deny cleanly
            }
        },
        { useSystemPicker: false }
    );
}

/**
 * Interview mode (full screen + kiosk-ish lock) via IPC
 * NOTE: This locks the app window, not the entire OS (Windows secure keys can't be blocked).
 */
function setupInterviewModeIPC() {
    ipcMain.handle("rq:enter-interview-mode", () => {
        if (!win) return;

        // Most "locked" Electron can do:
        win.setKiosk(true);
        win.setFullScreen(true);

        // Keep it focused on top (optional but helpful)
        win.setAlwaysOnTop(true, "screen-saver");

        // Reduce escape routes inside the app
        win.setResizable(false);
        win.setMinimizable(false);

        // If you want to prevent closing the window via X (optional):
        // win.setClosable(false);
    });

    ipcMain.handle("rq:exit-interview-mode", () => {
        if (!win) return;

        win.setAlwaysOnTop(false);
        win.setKiosk(false);
        win.setFullScreen(false);

        win.setResizable(true);
        win.setMinimizable(true);

        // If you used setClosable(false) above:
        // win.setClosable(true);
    });
}

/**
 * Dev safety: emergency unlock shortcut so you never get stuck in kiosk mode.
 * Ctrl+Shift+U -> exit interview mode
 */
function setupEmergencyUnlockShortcut() {
    globalShortcut.register("Control+Shift+U", () => {
        if (!win) return;
        win.setAlwaysOnTop(false);
        win.setKiosk(false);
        win.setFullScreen(false);
        win.setResizable(true);
        win.setMinimizable(true);
        // win.setClosable(true);
    });
}

/**
 * File Explorer IPC – lets the renderer browse the local file system
 * and open files with the default OS application.
 */
function setupFileExplorerIPC() {
    ipcMain.handle("fs:getHomeDir", () => os.homedir());

    ipcMain.handle("fs:readDir", (_event, dirPath) => {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        return entries
            .filter((e) => !e.name.startsWith(".")) // hide dot-files
            .map((e) => {
                const fullPath = path.join(dirPath, e.name);
                let size = null;
                try {
                    if (!e.isDirectory()) {
                        size = fs.statSync(fullPath).size;
                    }
                } catch { /* ignore stat errors */ }
                return {
                    name: e.name,
                    isDir: e.isDirectory(),
                    path: fullPath,
                    ext: e.isDirectory() ? "" : path.extname(e.name).toLowerCase(),
                    size,
                };
            })
            .sort((a, b) => {
                if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
                return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
            });
    });

    ipcMain.handle("shell:openPath", async (_event, filePath) => {
        const err = await shell.openPath(filePath);
        return err || null; // empty string = success
    });

    ipcMain.handle("fs:getPathSep", () => path.sep);
}

app.whenReady().then(() => {
    setupDisplayMediaHandler();
    createWindow();
    setupInterviewModeIPC();
    setupFileExplorerIPC();
    setupEmergencyUnlockShortcut();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

app.on("will-quit", () => {
    globalShortcut.unregisterAll();
});
