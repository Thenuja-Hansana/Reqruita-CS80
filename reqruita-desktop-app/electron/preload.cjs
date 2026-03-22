// electron/preload.cjs
const { contextBridge, ipcRenderer } = require("electron");

/**
 * Expose a safe API to the renderer.
 * You can add more functions here later (events, logs, etc.)
 */
contextBridge.exposeInMainWorld("reqruita", {
    // Keep your existing ping
    ping: () => ipcRenderer.invoke("app:ping"),

    // Interview mode (fullscreen/kiosk lock)
    enterInterviewMode: () => ipcRenderer.invoke("rq:enter-interview-mode"),
    enterInterviewerMode: () => ipcRenderer.invoke("rq:enter-interviewer-mode"),
    exitInterviewMode: () => ipcRenderer.invoke("rq:exit-interview-mode"),

    // File Explorer – browse local file system and open files
    getHomeDir: () => ipcRenderer.invoke("fs:getHomeDir"),
    readDir: (dirPath) => ipcRenderer.invoke("fs:readDir", dirPath),
    openFile: (filePath) => ipcRenderer.invoke("shell:openPath", filePath),
    getPathSep: () => ipcRenderer.invoke("fs:getPathSep"),
    readFileBase64: (filePath) => ipcRenderer.invoke("fs:readFileBase64", filePath),
    readFileText: (filePath) => ipcRenderer.invoke("fs:readFileText", filePath),
    // Build a reqruita-local:// URL for a local file path (no IPC needed)
    getPDFUrl: (filePath) => {
        const normalized = filePath.replace(/\\/g, '/');
        return `reqruita-local:///${normalized}`;
    },

    // Workspace window management
    openWorkspace: (panel) => ipcRenderer.invoke("rq:open-workspace", panel),
    closeWorkspace: () => ipcRenderer.invoke("rq:close-workspace"),

    // Window close interception
    onCloseRequest: (callback) => {
        const subscription = (_event) => callback();
        ipcRenderer.on("rq:request-close", subscription);
        return () => ipcRenderer.removeListener("rq:request-close", subscription);
    },
    confirmClose: () => ipcRenderer.send("rq:confirm-close"),
    openFeedback: (payload) => ipcRenderer.invoke("rq:open-feedback", payload),
});
