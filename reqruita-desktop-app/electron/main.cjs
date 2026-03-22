const { app, BrowserWindow, session, desktopCapturer, ipcMain, globalShortcut, shell, protocol, net } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { exec } = require("child_process");

// Set the application name BEFORE app is ready to ensure correct userData path
app.name = "Reqruita";

// Helps screen share during dev on http://localhost
app.commandLine.appendSwitch("enable-usermedia-screen-capturing");
app.commandLine.appendSwitch("allow-http-screen-capture");

// Must register the scheme BEFORE app is ready
protocol.registerSchemesAsPrivileged([
    { scheme: 'reqruita-local', privileges: { secure: true, standard: true, supportFetchAPI: true, bypassCSP: true } }
]);

let win;
let workspaceWin;
let feedbackWin;
let isMeetingActive = false;
let isClosingConfirmed = false;
let isExplorerKilled = false;

function restoreExplorer() {
    if (isExplorerKilled && process.platform === "win32") {
        exec("explorer.exe");
        isExplorerKilled = false;
    }
}

function createWindow() {
    win = new BrowserWindow({
        width: 1100,
        height: 700,
        title: "Reqruita",
        titleBarStyle: "hidden",
        titleBarOverlay: {
            color: "#4b2fb6",
            symbolColor: "#ffffff",
            height: 32,
        },
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, "preload.cjs"),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    win.loadURL("http://localhost:5173");
    
    win.on("close", (e) => {
        if (isMeetingActive && !isClosingConfirmed) {
            e.preventDefault();
            win.webContents.send("rq:request-close");
        }
    });

    win.on("closed", () => {
        win = null;
    });
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

                // Share the main interviewee Electron window so the interviewer
                // sees exactly what the interviewee sees (Google, Files, etc.)
                console.log(`Available sources: ${sources.map((s) => s.name).join(", ")}`);

                const source =
                    sources.find((src) => src.name === "Reqruita-Workspace-Source") ||
                    sources.find((src) => src.name === "reqruita-desktop-app") ||
                    sources.find((src) => src.name?.toLowerCase().includes("reqruita")) ||
                    sources.find((src) => src.id?.startsWith("screen:")) || // entire screen as fallback
                    sources[0];

                if (!source) return callback({}); // deny cleanly

                console.log(`Sharing source: ${source.name} (${source.id})`);
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
        isMeetingActive = true;
        isClosingConfirmed = false;

        // Most "locked" Electron can do:
        win.setKiosk(true);
        win.setFullScreen(true);

        // Keep it focused on top (optional but helpful)
        win.setAlwaysOnTop(true, "screen-saver");

        // Reduce escape routes inside the app
        win.setResizable(false);
        win.setMinimizable(false);

        // --- EXTREME KIOSK LOCKDOWN ---
        if (process.platform === "win32") {
            exec("taskkill /f /im explorer.exe", (err) => {
                if (!err) isExplorerKilled = true;
            });
        }

        // Block the Windows Key by immediately stealing focus back if the Start Menu opens
        win.on('blur', forceFocus);

        // Block typical escape combinations
        try {
            globalShortcut.register('CommandOrControl+Shift+Esc', () => {}); // Task manager
            globalShortcut.register('CommandOrControl+Esc', () => {}); // Start menu alternate
            globalShortcut.register('Alt+Esc', () => {}); 
            globalShortcut.register('Alt+Tab', () => {}); 
            globalShortcut.register('Alt+Space', () => {}); 
        } catch (err) {
            console.error("Failed to register some block shortcuts", err);
        }
    });

    // Helper to aggressively steal focus back and dismiss Start Menu
    function forceFocus() {
        if (isMeetingActive && win && !win.isDestroyed() && win.isKiosk()) {
            win.focus();
            win.setAlwaysOnTop(true, "screen-saver");
            // If the start menu is stubbornly open, sometimes a small delay helps to re-assert Z-index
            setTimeout(() => {
                if (win && !win.isDestroyed() && win.isKiosk()) {
                    win.focus();
                }
            }, 50);
        }
    }

    ipcMain.handle("rq:enter-interviewer-mode", () => {
        if (!win) return;
        isMeetingActive = true;
        isClosingConfirmed = false;
        win.setKiosk(false);
        win.setFullScreen(false);
        win.setResizable(true);
        win.setMinimizable(true);
        win.setMaximizable(true);
        win.maximize();
        // Allow the interviewer to toggle fullscreen manually if they want
        win.setFullScreenable(true);

        // Update title bar overlay for gray glass look
        win.setTitleBarOverlay({
            color: "#f8fafc", // Very light gray (slate-50)
            symbolColor: "#475569", // Slate-600
            height: 32,
        });
    });

    ipcMain.handle("rq:exit-interview-mode", () => {
        if (!win) return;
        isMeetingActive = false;

        restoreExplorer();

        win.setAlwaysOnTop(false);
        win.setKiosk(false);
        win.setFullScreen(false);

        win.setResizable(true);
        win.setMinimizable(true);

        // Restore purple title bar overlay
        win.setTitleBarOverlay({
            color: "#4b2fb6",
            symbolColor: "#ffffff",
            height: 32,
        });

        // Release the extreme kiosk lockdown
        win.removeListener('blur', forceFocus);
        globalShortcut.unregister('CommandOrControl+Shift+Esc');
        globalShortcut.unregister('CommandOrControl+Esc');
        globalShortcut.unregister('Alt+Esc');
        globalShortcut.unregister('Alt+Tab');
        globalShortcut.unregister('Alt+Space');
    });

    ipcMain.on("rq:confirm-close", () => {
        isClosingConfirmed = true;
        if (win && !win.isDestroyed()) win.close();
    });

    ipcMain.handle("rq:open-feedback", (event, payload) => {
        // Mark as confirmed so main window can close without question
        isClosingConfirmed = true;
        isMeetingActive = false;

        const role = typeof payload === "string" ? payload : (payload?.role || "");
        const meetingId = typeof payload === "object" ? (payload?.meetingId || "") : "";
        const candidateId = typeof payload === "object" ? (payload?.candidateId || "") : "";

        feedbackWin = new BrowserWindow({
            width: 500,
            height: 650,
            title: "Interview Feedback",
            resizable: false,
            frame: false, // Frameless for "pop up" look
            transparent: true,
            webPreferences: {
                preload: path.join(__dirname, "preload.cjs"),
                contextIsolation: true,
            },
        });

        // Load the feedback view
        const feedbackParams = new URLSearchParams({
            view: "feedback",
            role,
            meetingId,
            candidateId,
        });
        feedbackWin.loadURL(`http://localhost:5173/?${feedbackParams.toString()}`);
        
        // Show when ready to avoid flicker
        feedbackWin.once('ready-to-show', () => {
            feedbackWin.show();
            if (win && !win.isDestroyed()) {
                win.hide(); // Hide immediately
                win.setSize(1, 1); // User's suggestion (shrink to 1px)
                win.close(); 
            }
            win = null;
        });

        feedbackWin.on("closed", () => {
            feedbackWin = null;
        });
    });
}

/**
 * Workspace management (Detached Google/Files)
 */
function setupWorkspaceIPC() {
    ipcMain.handle("rq:open-workspace", (_event, panel) => {
        const panelParam = panel ? `&panel=${panel}` : "";

        if (workspaceWin) {
            // Navigate to requested panel and re-focus
            workspaceWin.loadURL(`http://localhost:5173?view=workspace${panelParam}`);
            workspaceWin.focus();
            return;
        }

        workspaceWin = new BrowserWindow({
            width: 1000,
            height: 750,
            title: "Reqruita-Workspace-Source",
            titleBarStyle: "hidden",
            titleBarOverlay: {
                color: "rgba(255, 255, 255, 0)", // Transparent overlay
                symbolColor: "#1e293b",
                height: 32,
            },
            webPreferences: {
                preload: path.join(__dirname, "preload.cjs"),
                contextIsolation: true,
                nodeIntegration: false,
            },
        });

        // Load same URL but with a flag so App.jsx renders only MeetingWorkspace
        workspaceWin.loadURL(`http://localhost:5173?view=workspace${panelParam}`);

        workspaceWin.on("closed", () => {
            workspaceWin = null;
        });
    });

    ipcMain.handle("rq:close-workspace", () => {
        if (workspaceWin) {
            workspaceWin.close();
            workspaceWin = null;
        }
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
        restoreExplorer();
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
    setupWorkspaceIPC();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

app.on("will-quit", () => {
    globalShortcut.unregisterAll();
    restoreExplorer();
});
