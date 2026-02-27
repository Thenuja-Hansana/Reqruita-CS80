// src/components/FileExplorer.jsx
import React, { useCallback, useEffect, useState } from "react";

/* ─── helper: format file size ─────────────────────────── */
function fmtSize(bytes) {
    if (bytes == null) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

/* ─── helper: icon by extension ───────────────────────── */
function FileIcon({ isDir, ext }) {
    if (isDir) {
        return (
            <svg className="fe-icon fe-icon-dir" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
        );
    }

    const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".webp", ".ico"];
    const videoExts = [".mp4", ".mov", ".avi", ".mkv", ".webm", ".flv"];
    const audioExts = [".mp3", ".wav", ".flac", ".aac", ".ogg", ".m4a"];
    const codeExts = [".js", ".jsx", ".ts", ".tsx", ".py", ".java", ".c", ".cpp", ".cs", ".go", ".rs", ".html", ".css", ".json", ".xml", ".yaml", ".yml", ".sh", ".bat", ".ps1"];
    const docExts = [".pdf", ".doc", ".docx", ".txt", ".md", ".rtf", ".odt", ".xlsx", ".xls", ".pptx", ".ppt"];

    if (imageExts.includes(ext)) {
        return (
            <svg className="fe-icon fe-icon-img" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
            </svg>
        );
    }
    if (videoExts.includes(ext)) {
        return (
            <svg className="fe-icon fe-icon-video" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
        );
    }
    if (audioExts.includes(ext)) {
        return (
            <svg className="fe-icon fe-icon-audio" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
            </svg>
        );
    }
    if (codeExts.includes(ext)) {
        return (
            <svg className="fe-icon fe-icon-code" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
            </svg>
        );
    }
    if (docExts.includes(ext)) {
        return (
            <svg className="fe-icon fe-icon-doc" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
            </svg>
        );
    }

    // generic file
    return (
        <svg className="fe-icon fe-icon-file" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
            <polyline points="13 2 13 9 20 9" />
        </svg>
    );
}

/* ─── breadcrumbs helper ──────────────────────────────── */
function buildBreadcrumbs(fullPath, sep) {
    const parts = fullPath.split(sep).filter(Boolean);
    const crumbs = [];

    if (sep === "\\") {
        // Windows: first part is like "C:" → root is "C:\"
        parts.forEach((part, i) => {
            const path = (i === 0 ? part + sep : crumbs[i - 1].path + sep + part);
            crumbs.push({ label: part || sep, path });
        });
    } else {
        // Unix: root is "/"
        crumbs.push({ label: "/", path: "/" });
        parts.forEach((part, i) => {
            const path = crumbs[crumbs.length - 1].path.replace(/\/$/, "") + "/" + part;
            crumbs.push({ label: part, path });
        });
    }
    return crumbs;
}

/* ─── main component ──────────────────────────────────── */
export default function FileExplorer({ onClose }) {
    const [pathStack, setPathStack] = useState([]); // stack of visited paths
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [sep, setSep] = useState("\\");
    const [openingFile, setOpeningFile] = useState(null); // file currently being opened

    const currentPath = pathStack[pathStack.length - 1] || "";

    const isElectron = typeof window !== "undefined" && typeof window.reqruita?.readDir === "function";

    const loadDir = useCallback(async (dirPath) => {
        if (!isElectron) {
            setError("File Explorer requires the Reqruita desktop app.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError("");
        try {
            const result = await window.reqruita.readDir(dirPath);
            setEntries(result);
        } catch (e) {
            setError(`Cannot open folder: ${e?.message || e}`);
            setEntries([]);
        } finally {
            setLoading(false);
        }
    }, [isElectron]);

    // Init: get home dir + path separator
    useEffect(() => {
        if (!isElectron) {
            setError("File Explorer requires the Reqruita desktop app.");
            setLoading(false);
            return;
        }
        (async () => {
            try {
                const [home, pathSep] = await Promise.all([
                    window.reqruita.getHomeDir(),
                    window.reqruita.getPathSep(),
                ]);
                setSep(pathSep);
                setPathStack([home]);
            } catch (e) {
                setError("Could not load home directory.");
                setLoading(false);
            }
        })();
    }, [isElectron]);

    // Load directory whenever pathStack changes
    useEffect(() => {
        if (currentPath) loadDir(currentPath);
    }, [currentPath, loadDir]);

    function navigateTo(dirPath) {
        setPathStack((s) => [...s, dirPath]);
    }

    function goBack() {
        setPathStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
    }

    function goHome() {
        setPathStack((s) => (s.length > 0 ? [s[0]] : s));
    }

    async function handleEntryClick(entry) {
        if (entry.isDir) {
            navigateTo(entry.path);
        } else {
            setOpeningFile(entry.name);
            try {
                await window.reqruita.openFile(entry.path);
            } catch (e) {
                setError(`Could not open file: ${e?.message || e}`);
            } finally {
                setTimeout(() => setOpeningFile(null), 1500);
            }
        }
    }

    const crumbs = currentPath ? buildBreadcrumbs(currentPath, sep) : [];

    return (
        <div className="fe-shell">
            {/* Top bar */}
            <div className="fe-bar">
                {/* Back */}
                <button
                    className="fe-nav-btn"
                    onClick={goBack}
                    disabled={pathStack.length <= 1}
                    title="Go back"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>

                {/* Home */}
                <button
                    className="fe-nav-btn"
                    onClick={goHome}
                    disabled={pathStack.length <= 1}
                    title="Go home"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                </button>

                {/* Breadcrumbs */}
                <div className="fe-breadcrumb">
                    {crumbs.map((crumb, i) => (
                        <React.Fragment key={crumb.path}>
                            {i > 0 && <span className="fe-bc-sep">›</span>}
                            <button
                                className={`fe-bc-part ${i === crumbs.length - 1 ? "fe-bc-active" : ""}`}
                                onClick={() => {
                                    if (i < crumbs.length - 1) {
                                        setPathStack((s) => [...s, crumb.path]);
                                    }
                                }}
                            >
                                {crumb.label}
                            </button>
                        </React.Fragment>
                    ))}
                </div>

                {/* File count badge */}
                {!loading && !error && (
                    <span className="fe-count">{entries.length} items</span>
                )}

                {/* Close */}
                <button className="jm-google-close" onClick={onClose} title="Close File Explorer">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>

            {/* Content */}
            <div className="fe-body">
                {loading && (
                    <div className="fe-state">
                        <div className="fe-spinner" />
                        <span>Loading…</span>
                    </div>
                )}

                {!loading && error && (
                    <div className="fe-state fe-state-err">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                {!loading && !error && entries.length === 0 && (
                    <div className="fe-state">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                        </svg>
                        <span>This folder is empty</span>
                    </div>
                )}

                {!loading && !error && entries.length > 0 && (
                    <div className="fe-list">
                        {entries.map((entry) => (
                            <button
                                key={entry.path}
                                className={`fe-entry ${entry.isDir ? "fe-entry-dir" : "fe-entry-file"} ${openingFile === entry.name ? "fe-entry-opening" : ""}`}
                                onClick={() => handleEntryClick(entry)}
                                title={entry.isDir ? `Open folder: ${entry.name}` : `Open file: ${entry.name}`}
                            >
                                <FileIcon isDir={entry.isDir} ext={entry.ext} />
                                <span className="fe-entry-name">{entry.name}</span>
                                {!entry.isDir && entry.size != null && (
                                    <span className="fe-entry-size">{fmtSize(entry.size)}</span>
                                )}
                                {entry.isDir && (
                                    <svg className="fe-entry-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
