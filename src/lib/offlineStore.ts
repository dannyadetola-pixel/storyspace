// Saves books on the device using IndexedDB. Only call these functions from
// the browser, inside effects or event handlers.

const DB_NAME = "storyspace-offline";
const STORE = "books";
const DB_VERSION = 1;

export type OfflineChapter = {
  id: string;
  title: string;
  order: number;
  priceKobo: number;
  wordCount: number;
  body: string | null; // null when the chapter is locked for this reader
  locked: boolean;
};

export type OfflineBook = {
  id: string;
  title: string;
  description: string | null;
  genre: string | null;
  status: string;
  isMature: boolean;
  tags: string[];
  coverUrl: string | null;
  coverDataUrl: string | null; // the cover image, saved so it works offline
  user: { username: string; isVerified: boolean };
  chapters: OfflineChapter[];
  savedAt: string;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function run<T>(
  mode: IDBTransactionMode,
  make: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = make(tx.objectStore(STORE));
    tx.oncomplete = () => {
      db.close();
      resolve(req.result);
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export const saveBook = (book: OfflineBook) =>
  run("readwrite", (s) => s.put(book));

export const getBook = (id: string) =>
  run<OfflineBook | undefined>("readonly", (s) => s.get(id));

export const listBooks = () =>
  run<OfflineBook[]>("readonly", (s) => s.getAll());

export const deleteBook = (id: string) =>
  run("readwrite", (s) => s.delete(id));

export const clearBooks = () => run("readwrite", (s) => s.clear());
