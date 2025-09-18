import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface ThesisAIDB extends DBSchema {
  'unsaved-documents': {
    key: string;
    value: {
      documentId: string;
      title: string;
      content: string;
      timestamp: number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<ThesisAIDB>> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<ThesisAIDB>('thesis-ai-db', 1, {
      upgrade(db) {
        db.createObjectStore('unsaved-documents', { keyPath: 'documentId' });
      },
    });
  }
  return dbPromise;
}

export async function saveDocumentOffline(doc: { documentId: string; title: string; content: string; }) {
  const db = await getDb();
  await db.put('unsaved-documents', { ...doc, timestamp: Date.now() });
}

export async function getOfflineDocuments() {
  const db = await getDb();
  return db.getAll('unsaved-documents');
}

export async function deleteOfflineDocument(documentId: string) {
  const db = await getDb();
  await db.delete('unsaved-documents', documentId);
}