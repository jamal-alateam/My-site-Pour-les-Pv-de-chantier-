// IndexedDB Storage Engine for ARCHITEXPERT
// Stores large datasets including high-res photos (16:9), signatures, and PV history without quota limits.

const DB_NAME = 'architexpert_indexeddb';
const DB_VERSION = 1;
const STORE_NAME = 'app_data';
const HISTORY_STORE = 'history_snapshots';

interface HistorySnapshot {
  id: string;
  timestamp: string;
  action: string;
  pvCount: number;
  projectCount: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
      if (!db.objectStoreNames.contains(HISTORY_STORE)) {
        db.createObjectStore(HISTORY_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  // Save to IndexedDB first (supports unlimited size for photos and PVs)
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error(`[Storage] Failed to write to IndexedDB:`, err);
  }

  // Also update localStorage as fast cache (catch quota errors gracefully)
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`[Storage] LocalStorage quota limit reached for key ${key}, saved safely in IndexedDB.`);
  }
}

export async function getItem<T>(key: string, fallbackValue: T): Promise<T> {
  // Try IndexedDB first for full dataset
  try {
    const db = await openDB();
    const dbResult = await new Promise<T | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result as T);
      req.onerror = () => reject(req.error);
    });

    if (dbResult !== undefined && dbResult !== null) {
      return dbResult;
    }
  } catch (err) {
    console.warn(`[Storage] IndexedDB read error for ${key}, falling back to localStorage:`, err);
  }

  // Fallback to localStorage
  try {
    const localVal = localStorage.getItem(key);
    if (localVal) {
      return JSON.parse(localVal) as T;
    }
  } catch (e) {
    console.error(`[Storage] LocalStorage read error:`, e);
  }

  return fallbackValue;
}

export async function recordSnapshot(action: string, pvs: any[], projects: any[], office: any): Promise<void> {
  try {
    const db = await openDB();
    const snapshot: HistorySnapshot & { pvs: any[]; projects: any[]; office: any } = {
      id: `snap_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      action,
      pvCount: pvs.length,
      projectCount: projects.length,
      pvs,
      projects,
      office
    };

    const tx = db.transaction(HISTORY_STORE, 'readwrite');
    const store = tx.objectStore(HISTORY_STORE);
    store.put(snapshot);

    // Keep only last 20 snapshots to save space
    const allKeysReq = store.getAllKeys();
    allKeysReq.onsuccess = () => {
      const keys = allKeysReq.result;
      if (keys.length > 20) {
        const toDelete = keys.slice(0, keys.length - 20);
        toDelete.forEach(k => store.delete(k));
      }
    };
  } catch (err) {
    console.error(`[Storage] Failed to record snapshot:`, err);
  }
}

export async function getHistorySnapshots(): Promise<HistorySnapshot[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(HISTORY_STORE, 'readonly');
      const store = tx.objectStore(HISTORY_STORE);
      const req = store.getAll();
      req.onsuccess = () => {
        const items = (req.result || []) as (HistorySnapshot & { pvs: any[] })[];
        // return metadata without full heavy blobs
        resolve(
          items.map(i => ({
            id: i.id,
            timestamp: i.timestamp,
            action: i.action,
            pvCount: i.pvCount,
            projectCount: i.projectCount
          })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        );
      };
      req.onerror = () => resolve([]);
    });
  } catch (err) {
    return [];
  }
}

export async function restoreSnapshot(snapshotId: string): Promise<{ office?: any; projects?: any[]; pvs?: any[] } | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(HISTORY_STORE, 'readonly');
      const store = tx.objectStore(HISTORY_STORE);
      const req = store.get(snapshotId);
      req.onsuccess = () => {
        const item = req.result;
        if (item) {
          resolve({
            office: item.office,
            projects: item.projects,
            pvs: item.pvs
          });
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    return null;
  }
}
