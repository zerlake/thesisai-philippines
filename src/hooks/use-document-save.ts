import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

interface DocumentSaveOptions {
  documentId: string;
  debounceDelay?: number;
  createVersion?: boolean;
}

interface SavePayload {
  documentId: string;
  contentJson: Record<string, any>;
  contentHtml?: string;
  title?: string;
  wordCount?: number;
  createVersion?: boolean;
}

export function useDocumentSave({ documentId, debounceDelay = 2000, createVersion = false }: DocumentSaveOptions) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined);

  const save = useCallback(
    async (payload: SavePayload): Promise<boolean> => {
      if (!payload.documentId) {
        console.error('No document ID provided');
        return false;
      }

      setIsSaving(true);
      try {
        const response = await fetch('/api/documents/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...payload,
            createVersion: payload.createVersion || createVersion,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to save document');
        }

        const data = await response.json();
        setLastSaved(new Date());
        return true;
      } catch (error) {
        console.error('Save error:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to save document');
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [createVersion]
  );

  const debouncedSave = useCallback(
    (payload: SavePayload) => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        save(payload);
      }, debounceDelay);
    },
    [save, debounceDelay]
  );

  const createCheckpoint = useCallback(
    async (
      content: Record<string, any>,
      title: string,
      checkpointLabel: string,
      wordCount?: number
    ): Promise<boolean> => {
      try {
        const response = await fetch('/api/documents/versions/checkpoint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentId,
            content,
            title,
            checkpointLabel,
            wordCount: wordCount || 0,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create checkpoint');
        }

        return true;
      } catch (error) {
        console.error('Checkpoint error:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to create checkpoint');
        return false;
      }
    },
    [documentId]
  );

  const listVersions = useCallback(
    async (onlyCheckpoints = false, limit = 50, offset = 0) => {
      try {
        const params = new URLSearchParams({
          documentId,
          checkpoints: onlyCheckpoints.toString(),
          limit: limit.toString(),
          offset: offset.toString(),
        });

        const response = await fetch(`/api/documents/versions/list?${params}`, {
          method: 'GET',
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to fetch versions');
        }

        const data = await response.json();
        return data.versions || [];
      } catch (error) {
        console.error('List versions error:', error);
        return [];
      }
    },
    [documentId]
  );

  const restoreVersion = useCallback(
    async (versionId: string): Promise<boolean> => {
      try {
        const response = await fetch('/api/documents/versions/restore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ versionId, documentId }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to restore version');
        }

        toast.success('Version restored successfully');
        return true;
      } catch (error) {
        console.error('Restore error:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to restore version');
        return false;
      }
    },
    [documentId]
  );

  return {
    save,
    debouncedSave,
    createCheckpoint,
    listVersions,
    restoreVersion,
    isSaving,
    lastSaved,
  };
}
