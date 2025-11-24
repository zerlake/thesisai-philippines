"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
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

type CriticRelationship = {
  critic_id: string;
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
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [certificationDate, setCertificationDate] = useState<string | null>(null);
  const isSettingInitialContent = useRef(false);

  const debouncedTitle = useDebounce(title, 1000);
  const debouncedContent = useDebounce(content, 1000);

  const fetchDocumentData = useCallback(async () => {
    if (!user || !editor) return;
    
    // First get the document data without the profile join to avoid relationship conflicts
    const documentResult = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (documentResult.error && (documentResult.error.message || documentResult.error.code)) {
      console.error('Error loading document:', documentResult.error);
      toast.error(`Failed to load document: ${documentResult.error.message || 'Unknown error'}`);
      return;
    }

    if (!documentResult.data) {
      toast.error('Document not found.');
      return;
    }

    let documentData = documentResult.data;

    // Get the profile separately to avoid relationship conflicts
    let profileData = null;
    if (documentData.user_id) {
      const profileResult = await supabase
        .from('profiles')
        .select('*')
        .eq('id', documentData.user_id)
        .single();

      if (profileResult.error && (profileResult.error.message || profileResult.error.code)) {
        console.error('Error loading profile:', profileResult.error);
        // Continue with document even if profile fails to load
      } else {
        profileData = profileResult.data;
      }
    }

    // Combine document and profile data
    documentData = {
      ...documentData,
      profiles: profileData
    };

    // Get comments separately to avoid relationship conflicts
    let commentsData = [];
    try {
      const result = await supabase
        .from('comments')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at', { ascending: false });

      if (result.error && (result.error.message || result.error.code)) {
        console.error('Error loading comments:', result.error);
      } else {
        commentsData = result.data || [];
        
        // If comments exist, get their profiles separately
        if (commentsData.length > 0) {
          const commentUserIds = [...new Set(commentsData.map(comment => comment.user_id))];
          if (commentUserIds.length > 0) {
            const { data: profilesData, error: profilesError } = await supabase
              .from('profiles')
              .select('*')
              .in('id', commentUserIds);

            if (profilesError) {
              console.error('Error loading comment profiles:', profilesError);
            } else {
              // Attach profile data to comments
              commentsData = commentsData.map(comment => {
                const profile = profilesData.find(p => p.id === comment.user_id);
                return { ...comment, profiles: profile || null };
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Exception loading comments:', error);
      commentsData = [];
    }

    // Get document reviews separately
    let reviewsData = [];
    try {
      const result = await supabase
        .from('document_reviews')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at', { ascending: false });

      if (result.error && (result.error.message || result.error.code)) {
        console.error('Error loading document reviews:', result.error);
      } else {
        reviewsData = result.data || [];
        
        // If reviews exist, get their profiles separately
        if (reviewsData.length > 0) {
          const reviewUserIds = [...new Set(reviewsData.map(review => review.user_id))];
          if (reviewUserIds.length > 0) {
            const { data: profilesData, error: profilesError } = await supabase
              .from('profiles')
              .select('*')
              .in('id', reviewUserIds);

            if (profilesError) {
              console.error('Error loading review profiles:', profilesError);
            } else {
              // Attach profile data to reviews
              reviewsData = reviewsData.map(review => {
                const profile = profilesData.find(p => p.id === review.user_id);
                return { ...review, profiles: profile || null };
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Exception loading document reviews:', error);
      reviewsData = [];
    }

    // Get critic relationships separately if needed
    let criticRelationships: CriticRelationship[] = [];
    if (documentData.user_id) {
      try {
        const criticResult = await supabase
          .from('critic_student_relationships')
          .select('critic_id')
          .eq('student_id', documentData.user_id);

        if (criticResult.error && (criticResult.error.message || criticResult.error.code)) {
          // No critic relationship found is normal, so we just ignore it
          if (criticResult.error.code !== 'PGRST116') { // PGRST116 = Row not found
            console.error('Error loading critic relationship:', criticResult.error);
          }
        } else {
          criticRelationships = criticResult.data || [];
        }
      } catch (error) {
        console.error('Exception loading critic relationship:', error);
      }
    }
    
    // Combine the data with related information
    const data = {
      ...documentData,
      comments: commentsData || [],
      document_reviews: reviewsData || [],
      profiles: {
        ...documentData.profiles,
        critic: criticRelationships
      }
    };

    if (title !== data.title) {
      setTitle(data.title || '');
    }
    if (content !== data.content) {
      setContent(data.content || '');
    }
    if (reviewStatus !== data.review_status) {
      setReviewStatus(data.review_status);
    }
    if (isPublic !== data.is_public) {
      setIsPublic(data.is_public);
    }
    
    const ownerId = data.user_id;
    const shouldSetAsOwner = (ownerId === user.id);
    if (isOwner !== shouldSetAsOwner) {
      setIsOwner(shouldSetAsOwner);
    }

    // @ts-ignore
    const criticRel = data.profiles?.critic[0];
    const shouldBeCriticViewing = !!(criticRel && profile?.id === criticRel.critic_id);
    if (isCriticViewing !== shouldBeCriticViewing) {
      setIsCriticViewing(shouldBeCriticViewing);
    }

    const sortedComments = data.comments.sort((a: Comment, b: Comment) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    if (JSON.stringify(comments) !== JSON.stringify(sortedComments)) {
      // @ts-ignore
      setComments(sortedComments);
    }

    const sortedReviews = data.document_reviews.sort((a: Review, b: Review) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    if (JSON.stringify(reviewHistory) !== JSON.stringify(sortedReviews)) {
      // @ts-ignore
      setReviewHistory(sortedReviews);
    }

    if (JSON.stringify(studentProfile) !== JSON.stringify(data.profiles)) {
      // @ts-ignore
      setStudentProfile(data.profiles);
    }

    if (certificationDate !== data.certified_at) {
      setCertificationDate(data.certified_at);
    }

    // Only update editor content if it's different from current editor content to prevent flickering
    if (editor && data.content && editor.getHTML() !== data.content) {
      isSettingInitialContent.current = true;
      editor.commands.setContent(data.content);
      setTimeout(() => {
        isSettingInitialContent.current = false;
      }, 100);
    }

    setIsLoading(false);
    justLoadedRef.current = false;  // Mark that we're no longer in the initial load state
  }, [documentId, user, editor, supabase, profile, certificationDate, comments, content, isCriticViewing, isOwner, isPublic, reviewHistory, reviewStatus, studentProfile, title]);

  useEffect(() => {
    fetchDocumentData();
  }, [fetchDocumentData]);

  const saveDocument = useCallback(async (force = false) => {
    // Don't save if we're currently setting initial content to prevent loops
    if (isSettingInitialContent.current && !force) return;
    
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

  const justLoadedRef = useRef(true); // Set to true initially, will be reset after first load

  useEffect(() => {
    // Skip saving if we just loaded the document
    if (!isLoading && !justLoadedRef.current) {
      saveDocument();
    }
  }, [debouncedTitle, debouncedContent, isLoading, saveDocument]);

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
    studentProfile,
    certificationDate,
    saveDocument,
    fetchDocumentData,
  };
}
