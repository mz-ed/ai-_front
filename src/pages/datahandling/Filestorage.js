/**
 * fileStorage.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Persistent file storage using IndexedDB.
 * IndexedDB is used instead of localStorage because:
 *   - localStorage cannot store binary data (File/Blob objects)
 *   - IndexedDB supports files up to gigabytes; localStorage caps at ~5 MB
 *
 * Public API:
 *   saveFiles(files)          → Promise<StoredFile[]>
 *   loadFiles()               → Promise<StoredFile[]>
 *   deleteFile(id)            → Promise<void>
 *   clearAllFiles()           → Promise<void>
 *
 * StoredFile shape:
 *   { id, name, size, type, lastModified, blob, savedAt }
 * ──────────────────────────────────────────────────────────────────────────────
 */

const DB_NAME = "MediScanFiles";
const DB_VERSION = 1;
const STORE_NAME = "uploadedFiles";

// ── Internal: open (or create) the database ──────────────────────────────────

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        // autoIncrement gives every record a unique numeric key
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("name", "name", { unique: false });
        store.createIndex("savedAt", "savedAt", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ── Internal: run a single transaction ───────────────────────────────────────

function withStore(mode, callback) {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const store = tx.objectStore(STORE_NAME);
        const result = callback(store);

        // If callback returned an IDBRequest, wait for it
        if (result && typeof result.onsuccess === "undefined" === false) {
          result.onsuccess = () => resolve(result.result);
          result.onerror = () => reject(result.error);
        } else {
          tx.oncomplete = () => resolve(result);
          tx.onerror = () => reject(tx.error);
        }
      })
  );
}

// ── saveFiles ─────────────────────────────────────────────────────────────────

/**
 * Persist an array of File objects to IndexedDB.
 * Returns the stored records (with their generated `id` fields).
 *
 * @param {File[]} files
 * @returns {Promise<Array<{id:number, name:string, size:number, type:string, lastModified:number, blob:Blob, savedAt:string}>>}
 */
export async function saveFiles(files) {
  const db = await openDB();

  const stored = await Promise.all(
    files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const record = {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            blob: file, // File extends Blob — IndexedDB stores it natively
            savedAt: new Date().toISOString(),
          };

          const tx = db.transaction(STORE_NAME, "readwrite");
          const store = tx.objectStore(STORE_NAME);
          const req = store.add(record);

          req.onsuccess = () => resolve({ ...record, id: req.result });
          req.onerror = () => reject(req.error);
        })
    )
  );

  return stored;
}

// ── loadFiles ─────────────────────────────────────────────────────────────────

/**
 * Load all stored files from IndexedDB.
 * Each entry includes the original Blob so you can create object URLs for preview.
 *
 * @returns {Promise<Array<{id:number, name:string, size:number, type:string, lastModified:number, blob:Blob, savedAt:string}>>}
 */
export async function loadFiles() {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();

    req.onsuccess = () => resolve(req.result ?? []);
    req.onerror = () => reject(req.error);
  });
}

// ── deleteFile ────────────────────────────────────────────────────────────────

/**
 * Remove a single file record by its IndexedDB id.
 *
 * @param {number} id
 * @returns {Promise<void>}
 */
export async function deleteFile(id) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ── clearAllFiles ─────────────────────────────────────────────────────────────

/**
 * Wipe every stored file (e.g. on logout or "Start over").
 *
 * @returns {Promise<void>}
 */
export async function clearAllFiles() {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.clear();

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}