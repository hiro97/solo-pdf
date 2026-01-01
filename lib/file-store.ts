// Simple file store for passing PDF between pages
// Uses IndexedDB for reliable storage of large files

const DB_NAME = "solo-pdf-store"
const STORE_NAME = "pending-files"
const FILE_KEY = "pending-pdf"

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
  })
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(reader.error)
    reader.readAsArrayBuffer(file)
  })
}

export async function storePendingFile(file: File): Promise<void> {
  // Read file first (before opening transaction)
  const arrayBuffer = await readFileAsArrayBuffer(file)

  const fileData = {
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: file.lastModified,
    arrayBuffer,
  }

  // Now open transaction and store
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite")
    const store = transaction.objectStore(STORE_NAME)

    const request = store.put(fileData, FILE_KEY)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function getPendingFile(): Promise<File | null> {
  try {
    const db = await openDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly")
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(FILE_KEY)

      request.onsuccess = () => {
        const data = request.result
        if (!data || !data.arrayBuffer) {
          resolve(null)
          return
        }

        // Reconstruct File from stored data
        const file = new File([data.arrayBuffer], data.name, {
          type: data.type,
          lastModified: data.lastModified,
        })
        resolve(file)
      }
      request.onerror = () => reject(request.error)
    })
  } catch {
    return null
  }
}

export async function clearPendingFile(): Promise<void> {
  try {
    const db = await openDB()

    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, "readwrite")
      const store = transaction.objectStore(STORE_NAME)
      store.delete(FILE_KEY)
      resolve()
    })
  } catch {
    // Ignore errors on clear
  }
}
