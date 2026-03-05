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
    exitInterviewMode: () => ipcRenderer.invoke("rq:exit-interview-mode"),

    // File Explorer – browse local file system and open files
    getHomeDir: () => ipcRenderer.invoke("fs:getHomeDir"),
    readDir: (dirPath) => ipcRenderer.invoke("fs:readDir", dirPath),
    openFile: (filePath) => ipcRenderer.invoke("shell:openPath", filePath),
    getPathSep: () => ipcRenderer.invoke("fs:getPathSep"),
    readFileBase64: (filePath) => ipcRenderer.invoke("fs:readFileBase64", filePath),
});
