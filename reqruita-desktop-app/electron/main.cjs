// electron/main.cjs
const { app, BrowserWindow, session, desktopCapturer, ipcMain, globalShortcut, shell, protocol, net } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");

// Helps screen share during dev on http://localhost
app.commandLine.appendSwitch("enable-usermedia-screen-capturing");
app.commandLine.appendSwitch("allow-http-screen-capture");

// Must register the scheme BEFORE app is ready
protocol.registerSchemesAsPrivileged([
    { scheme: 'reqruita-local', privileges: { secure: true, standard: true, supportFetchAPI: true, bypassCSP: true } }
]);

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
        // Temporarily suspend always-on-top so the launched app can surface
        const wasOnTop = win?.isAlwaysOnTop() ?? false;
        if (wasOnTop) win.setAlwaysOnTop(false);

        const err = await shell.openPath(filePath);

        // Restore after a short delay (gives the OS time to raise the new window)
        setTimeout(() => {
            if (wasOnTop && win && !win.isDestroyed()) {
                win.setAlwaysOnTop(true, "screen-saver");
            }
        }, 2000);

        return err || null; // empty string = success
    });

    ipcMain.handle("fs:readFileBase64", (_event, filePath) => {
        const ext = path.extname(filePath).toLowerCase().replace(".", "");
        const mimeMap = {
            jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
            gif: "image/gif", bmp: "image/bmp", webp: "image/webp",
            svg: "image/svg+xml", ico: "image/x-icon",
            pdf: "application/pdf",
        };
        const mime = mimeMap[ext] || "application/octet-stream";
        const data = fs.readFileSync(filePath);
        return `data:${mime};base64,${data.toString("base64")}`;
    });

    ipcMain.handle("fs:readFileText", (_event, filePath) => {
        const MAX_BYTES = 512 * 1024; // 512 KB safety limit
        const stat = fs.statSync(filePath);
        if (stat.size > MAX_BYTES) {
            throw new Error(
                `File is too large to preview (${(stat.size / 1024).toFixed(0)} KB). Maximum is 512 KB.`
            );
        }
        return fs.readFileSync(filePath, "utf8");
    });

    ipcMain.handle("fs:getPathSep", () => path.sep);
}

app.whenReady().then(() => {
    // Serve local files (PDFs) via reqruita-local:///path/to/file
    protocol.handle('reqruita-local', (request) => {
        const url = new URL(request.url);
        // pathname on Windows looks like /C:/path/file.pdf – strip the leading slash
        const filePath = decodeURIComponent(url.pathname.replace(/^\//, ''));
        return net.fetch('file:///' + filePath);
    });

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
