// IndexedDB utility functions for offline data storage

// Database configuration
const DB_NAME = 'fintracker_db';
const DB_VERSION = 1;

// Store names
export const STORES = {
  TRANSACTIONS: 'transactions',
  GOALS: 'goals',
  CATEGORIES: 'categories',
  SYNC_QUEUE: 'sync_queue',
  USER_SETTINGS: 'user_settings',
};

// Initialize the database
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject('IndexedDB is not supported in this browser');
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      reject(`Database error: ${(event.target as IDBOpenDBRequest).error}`);
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores with indexes
      if (!db.objectStoreNames.contains(STORES.TRANSACTIONS)) {
        const transactionsStore = db.createObjectStore(STORES.TRANSACTIONS, { keyPath: 'id', autoIncrement: true });
        transactionsStore.createIndex('user_id', 'user_id', { unique: false });
        transactionsStore.createIndex('date', 'date', { unique: false });
        transactionsStore.createIndex('synced', 'synced', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.GOALS)) {
        const goalsStore = db.createObjectStore(STORES.GOALS, { keyPath: 'id', autoIncrement: true });
        goalsStore.createIndex('user_id', 'user_id', { unique: false });
        goalsStore.createIndex('synced', 'synced', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.CATEGORIES)) {
        const categoriesStore = db.createObjectStore(STORES.CATEGORIES, { keyPath: 'id' });
        categoriesStore.createIndex('user_id', 'user_id', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const syncQueueStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
        syncQueueStore.createIndex('timestamp', 'timestamp', { unique: false });
        syncQueueStore.createIndex('type', 'type', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.USER_SETTINGS)) {
        db.createObjectStore(STORES.USER_SETTINGS, { keyPath: 'id' });
      }
    };
  });
};

// Generic function to add an item to a store
export const addItem = async <T>(storeName: string, item: T): Promise<number> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add({ ...item, synced: false, timestamp: Date.now() });

    request.onsuccess = (event) => {
      resolve((event.target as IDBRequest).result as number);
    };

    request.onerror = (event) => {
      reject(`Error adding item to ${storeName}: ${(event.target as IDBRequest).error}`);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Generic function to get all items from a store
export const getAllItems = async <T>(storeName: string, indexName?: string, indexValue?: IDBValidKey | IDBKeyRange): Promise<T[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);

    let request: IDBRequest;

    if (indexName && indexValue !== undefined) {
      const index = store.index(indexName);
      request = index.getAll(indexValue);
    } else {
      request = store.getAll();
    }

    request.onsuccess = (event) => {
      resolve((event.target as IDBRequest).result as T[]);
    };

    request.onerror = (event) => {
      reject(`Error getting items from ${storeName}: ${(event.target as IDBRequest).error}`);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Generic function to update an item in a store
export const updateItem = async <T>(storeName: string, id: number | string, updates: Partial<T>): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = (event) => {
      const data = (event.target as IDBRequest).result;
      if (!data) {
        reject(`Item with id ${id} not found in ${storeName}`);
        return;
      }

      const updatedItem = { ...data, ...updates, synced: false, timestamp: Date.now() };
      const updateRequest = store.put(updatedItem);

      updateRequest.onsuccess = () => {
        resolve();
      };

      updateRequest.onerror = (event) => {
        reject(`Error updating item in ${storeName}: ${(event.target as IDBRequest).error}`);
      };
    };

    request.onerror = (event) => {
      reject(`Error getting item from ${storeName}: ${(event.target as IDBRequest).error}`);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Generic function to delete an item from a store
export const deleteItem = async (storeName: string, id: number | string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => {
      // Add to sync queue to delete from server when online
      addSyncQueueItem({
        type: 'delete',
        store: storeName,
        itemId: id,
        timestamp: Date.now(),
      });
      resolve();
    };

    request.onerror = (event) => {
      reject(`Error deleting item from ${storeName}: ${(event.target as IDBRequest).error}`);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Define the type for sync queue items
interface SyncQueueItem {
  id: number;
  type: 'add' | 'update' | 'delete';
  store: string;
  itemId?: number | string;
  data?: unknown;
  timestamp: number;
}

// Add an item to the sync queue
export const addSyncQueueItem = async (item: Omit<SyncQueueItem, 'id'>): Promise<void> => {
  try {
    await addItem(STORES.SYNC_QUEUE, item);
  } catch (error) {
    console.error('Error adding item to sync queue:', error);
  }
};

// Process the sync queue when online
export const processSyncQueue = async (): Promise<void> => {
  if (!navigator.onLine) return;

  try {
    const syncItems = await getAllItems<SyncQueueItem>(STORES.SYNC_QUEUE);

    // Sort by timestamp to process in order
    syncItems.sort((a, b) => a.timestamp - b.timestamp);

    for (const item of syncItems) {
      try {
        // Process each sync item based on type
        // This would call your API endpoints
        console.log('Processing sync item:', item);

        // After successful sync, remove from queue
        await deleteItem(STORES.SYNC_QUEUE, item.id);
      } catch (error) {
        console.error('Error processing sync item:', error);
        // Leave in queue to try again later
      }
    }
  } catch (error) {
    console.error('Error processing sync queue:', error);
  }
};

// Listen for online events to process sync queue
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    processSyncQueue();
  });
}
