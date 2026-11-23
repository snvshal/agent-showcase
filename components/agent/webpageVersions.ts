export type WebpageVersionSource = "agent" | "manual" | "restore" | "restore-checkpoint"

export interface WebpageVersion {
  id: number
  filename: string
  html: string
  commitMessage?: string
  createdAt: number
  source: WebpageVersionSource
}

type StoredWebpageVersion = WebpageVersion & { workspaceId: string }

const DATABASE_NAME = "webpage-builder-history"
const DATABASE_VERSION = 1
const STORE_NAME = "versions"
const WORKSPACE_ID = "default"
export const MAX_WEBPAGE_VERSIONS = 10

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is unavailable in this browser"))
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)

    request.onupgradeneeded = () => {
      const database = request.result
      if (database.objectStoreNames.contains(STORE_NAME)) return
      const store = database.createObjectStore(STORE_NAME, {
        keyPath: "id",
        autoIncrement: true,
      })
      store.createIndex("workspaceId", "workspaceId", { unique: false })
    }
    request.onsuccess = () => {
      request.result.onversionchange = () => request.result.close()
      resolve(request.result)
    }
    request.onerror = () => reject(request.error ?? new Error("Could not open version history"))
    request.onblocked = () => reject(new Error("Version history is blocked by another tab"))
  })
}

function toPublicVersion(version: StoredWebpageVersion): WebpageVersion {
  return {
    id: version.id,
    filename: version.filename,
    html: version.html,
    commitMessage: version.commitMessage,
    createdAt: version.createdAt,
    source: version.source,
  }
}

function newestFirst(a: WebpageVersion, b: WebpageVersion) {
  return b.createdAt - a.createdAt || b.id - a.id
}

export async function listWebpageVersions(): Promise<WebpageVersion[]> {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly")
    const request = transaction
      .objectStore(STORE_NAME)
      .index("workspaceId")
      .getAll(WORKSPACE_ID) as IDBRequest<StoredWebpageVersion[]>
    let versions: WebpageVersion[] = []

    request.onsuccess = () => {
      versions = request.result.map(toPublicVersion).sort(newestFirst)
    }
    request.onerror = () => reject(request.error ?? new Error("Could not load version history"))
    transaction.oncomplete = () => {
      database.close()
      resolve(versions)
    }
    transaction.onerror = () => {
      database.close()
      reject(transaction.error ?? new Error("Could not load version history"))
    }
  })
}

export async function saveWebpageVersion(
  version: Omit<WebpageVersion, "id" | "createdAt"> & { createdAt?: number },
): Promise<WebpageVersion> {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite")
    const store = transaction.objectStore(STORE_NAME)
    const request = store.index("workspaceId").getAll(WORKSPACE_ID) as IDBRequest<
      StoredWebpageVersion[]
    >
    let savedVersion: WebpageVersion | null = null

    request.onsuccess = () => {
      const existing = request.result
        .map(toPublicVersion)
        .sort((a, b) => a.createdAt - b.createdAt || a.id - b.id)
      const latest = existing[existing.length - 1]

      if (latest?.html === version.html && latest.filename === version.filename) {
        savedVersion = latest
        return
      }

      const record: Omit<StoredWebpageVersion, "id"> = {
        ...version,
        createdAt: version.createdAt ?? Date.now(),
        workspaceId: WORKSPACE_ID,
      }
      const addRequest = store.add(record)
      addRequest.onsuccess = () => {
        savedVersion = { ...record, id: Number(addRequest.result) }
        const pruneCount = Math.max(0, existing.length + 1 - MAX_WEBPAGE_VERSIONS)
        for (const oldVersion of existing.slice(0, pruneCount)) {
          store.delete(oldVersion.id)
        }
      }
      addRequest.onerror = () => transaction.abort()
    }
    request.onerror = () => transaction.abort()
    transaction.oncomplete = () => {
      database.close()
      if (savedVersion) resolve(savedVersion)
      else reject(new Error("Could not save version history"))
    }
    transaction.onerror = () => {
      database.close()
      reject(transaction.error ?? new Error("Could not save version history"))
    }
    transaction.onabort = () => {
      database.close()
      reject(transaction.error ?? new Error("Could not save version history"))
    }
  })
}

export async function updateWebpageVersionNote(id: number, commitMessage: string): Promise<void> {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite")
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(id) as IDBRequest<StoredWebpageVersion | undefined>

    request.onsuccess = () => {
      const version = request.result
      if (version) store.put({ ...version, commitMessage })
    }

    transaction.oncomplete = () => {
      database.close()
      resolve()
    }
    transaction.onerror = () => {
      database.close()
      reject(transaction.error ?? new Error("Could not update version note"))
    }
    transaction.onabort = () => {
      database.close()
      reject(transaction.error ?? new Error("Could not update version note"))
    }
  })
}
