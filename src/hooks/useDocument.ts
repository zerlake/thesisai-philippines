"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth-provider';
import { toast } from 'sonner';
import { useDebounce } from './use-debounce';
import { type Editor } from '@tiptap/react';
import { saveDocumentOffline, getOfflineDocuments, deleteOfflineDocument } from '@/lib/offline-db';

export type Comment = {
  id: string;
  content: string;
  created_at: string;
  resolved_at: string | null;
  selection_from: number;
  selection_to: number;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
};

export type Review = {
  id: string;
  comments: string | null;
  created_at: string;
  status: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
  } | null;
};

export function useDocument(documentId: string, editor: Editor | null) {
  const { session, supabase, profile } = useAuth();
  const user = session?.user;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [reviewStatus, setReviewStatus] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isCriticViewing, setIsCriticViewing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isOffline, setIsOffline] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [reviewHistory, setReviewHistory] = useState<Review[]>([]);

  const debouncedTitle = useDebounce(title, 1000);
  const debouncedContent = useDebounce(content, 1000);

  const fetchDocumentData = useCallback(async () => {
    if (!user || !editor) return;
    
    const { data, error } = await supabase
      .from('documents')
      .select('*, profiles(*, critic:critic_student_relationships(critic_id)), comments(*, profiles(*)), document_reviews(*, profiles(*))')
      .eq('id', documentId)
      .single();

    if (error) {
      toast.error('Failed to load document.');
      return;
    }

    setTitle(data.title || '');
    setContent(data.content || '');
    setReviewStatus(data.review_status);
    setIsPublic(data.is_public);
    
    const ownerId = data.user_id;
    setIsOwner(ownerId === user.id);

    // @ts-ignore
    const criticRel = data.profiles?.critic[0];
    if (criticRel && profile?.id === criticRel.critic_id) {
      setIsCriticViewing(true);
    }

    // @ts-ignore
    setComments(data.comments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    // @ts-ignore
    setReviewHistory(data.document_reviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));

    if (editor.getHTML() !== data.content) {
      editor.commands.setContent(data.content || '', { emitUpdate: false });
    }
    
    setIsLoading(false);
  }, [documentId, user, editor, supabase, profile]);

  useEffect(() => {
    fetchDocumentData();
  }, [fetchDocumentData]);

  const saveDocument = useCallback(async (force = false) => {
    if (!isOwner || saveState === 'saving') return;
    if (navigator.onLine === false) {
      setIsOffline(true);
      await saveDocumentOffline({ documentId, title, content });
      toast.warning("You're offline. Document saved locally.", { id: 'offline-save' });
      return;
    }

    if (isOffline) { // Sync offline changes if we are now online
      const offlineDocs = await getOfflineDocuments();
      const thisDoc = offlineDocs.find(d => d.documentId === documentId);
      if (thisDoc) {
        toast.loading("Syncing offline changes...", { id: 'syncing' });
        const { error } = await supabase.from('documents').update({ title: thisDoc.title, content: thisDoc.content }).eq('id', documentId);
        if (error) toast.error("Failed to sync offline changes.");
        else {
          await deleteOfflineDocument(documentId);
          toast.success("Offline changes synced!", { id: 'syncing' });
        }
      }
      setIsOffline(false);
    }

    setSaveState('saving');
    const { error } = await supabase.from('documents').update({ title, content }).eq('id', documentId);
    if (error) {
      toast.error('Failed to save document.');
      setSaveState('idle');
    } else {
      setSaveState('saved');
      if (force) toast.success("Document saved!");
      setTimeout(() => setSaveState('idle'), 2000);
    }
  }, [isOwner, saveState, documentId, title, content, supabase, isOffline]);

  useEffect(() => {
    if (!isLoading) {
      saveDocument();
    }
  }, [debouncedTitle, debouncedContent]);

  return {
    title, setTitle,
    content, setContent,
    reviewStatus, setReviewStatus,
    isPublic, setIsPublic,
    isOwner,
    isCriticViewing,
    isLoading,
    saveState,
    isOffline,
    comments, setComments,
    reviewHistory,
    saveDocument,
    fetchDocumentData,
  };
}