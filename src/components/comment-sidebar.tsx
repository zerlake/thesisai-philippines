"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "./auth-provider";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Check, CornerUpLeft, Loader2, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { type Editor } from "@tiptap/react";
import { ScrollArea } from "./ui/scroll-area";
import { type Comment } from "../hooks/useDocument";

interface CommentSidebarProps {
  documentId: string;
  editor: Editor | null;
  comments: Comment[];
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  activeCommentId: string | null;
  setActiveCommentId: (id: string | null) => void;
}

export function CommentSidebar({ documentId, editor, comments, setComments, activeCommentId, setActiveCommentId }: CommentSidebarProps) {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const activeCommentRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (activeCommentId && activeCommentRef.current) {
      activeCommentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeCommentId]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !editor || !user) return;
    const { from, to } = editor.state.selection;
    if (from === to) {
      toast.error("Please select text to comment on.");
      return;
    }

    setIsSubmitting(true);
    const { data, error } = await supabase
      .from("comments")
      .insert({
        document_id: documentId,
        user_id: user.id,
        content: newComment,
        selection_from: from,
        selection_to: to,
      })
      .select("*, profiles:user_id(*)")
      .single();

    if (error) {
      toast.error("Failed to add comment.");
    } else if (data) {
      // @ts-ignore
      setComments([data, ...comments]);
      (editor.chain().focus().setTextSelection({ from, to }) as any).setCommentHighlight(data.id).run();
      setNewComment("");
    }
    setIsSubmitting(false);
  };

  const handleToggleResolve = async (comment: Comment) => {
    const newResolvedAt = comment.resolved_at ? null : new Date().toISOString();
    const { error } = await supabase
      .from("comments")
      .update({ resolved_at: newResolvedAt })
      .eq("id", comment.id);

    if (error) {
      toast.error("Failed to update comment status.");
    } else {
      setComments(comments.map(c => c.id === comment.id ? { ...c, resolved_at: newResolvedAt } : c));
    }
  };

  const handleCommentClick = (comment: Comment) => {
    if (!editor) return;
    editor.chain().focus().setTextSelection({ from: comment.selection_from, to: comment.selection_to }).run();
    setActiveCommentId(comment.id);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold flex items-center gap-2"><MessageSquare className="w-5 h-5" />Comments</h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {comments.map(comment => (
            <div 
              key={comment.id} 
              ref={activeCommentId === comment.id ? activeCommentRef : null}
              className={`p-3 rounded-md border transition-all cursor-pointer ${activeCommentId === comment.id ? 'bg-accent ring-2 ring-primary' : ''}`} 
              onClick={() => handleCommentClick(comment)}
            >
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                  <AvatarFallback>{comment.profiles?.first_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{comment.profiles?.first_name} {comment.profiles?.last_name}</p>
                    <p className="text-xs text-muted-foreground">{isMounted && formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</p>
                  </div>
                  <p className={`text-sm mt-1 ${comment.resolved_at ? 'line-through text-muted-foreground' : ''}`}>{comment.content}</p>
                  <Button variant="ghost" size="sm" className="mt-2" onClick={(e) => { e.stopPropagation(); handleToggleResolve(comment); }}>
                    {comment.resolved_at ? <><CornerUpLeft className="w-3 h-3 mr-1" />Unresolve</> : <><Check className="w-3 h-3 mr-1" />Resolve</>}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t mt-auto">
        <Textarea placeholder="Add a comment on selected text..." value={newComment} onChange={e => setNewComment(e.target.value)} />
        <div className="flex justify-end mt-2">
          <Button onClick={handleAddComment} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Comment
          </Button>
        </div>
      </div>
    </div>
  );
}