// electron/main.cjs
const { app, BrowserWindow, session, desktopCapturer, ipcMain, globalShortcut } = require("electron");
const path = require("path");

// Screen share during dev on http://localhost
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

// Screen share handler 
function setupDisplayMediaHandler() {
    const sess = session.defaultSession;

    sess.setDisplayMediaRequestHandler(
        async (request, callback) => {
            try {
                const sources = await desktopCapturer.getSources({
                    types: ["screen", "window"],
                });

                const source = sources[0]; // MVP: auto-pick first source
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

//Interview mode (full screen + kiosk-ish lock) via IPC
// This locks the app window, not the entire OS 

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

//Dev safety: emergency unlock shortcut so you never get stuck in kiosk mode.
//Ctrl+Shift+U -> exit interview mode

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

app.whenReady().then(() => {
    setupDisplayMediaHandler();
    createWindow();
    setupInterviewModeIPC();
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
