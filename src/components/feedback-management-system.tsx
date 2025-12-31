"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageCircle, 
  ThumbsUp, 
  ThumbsDown, 
  Reply, 
  MoreHorizontal, 
  Search,
  Filter,
  FileText,
  User,
  Calendar,
  Clock,
  Eye,
  Download,
  Archive,
  Trash2,
  Edit3,
  Check,
  X,
  Paperclip,
  Send,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  UserCircle
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    role: "student" | "advisor" | "critic";
  };
  content: string;
  createdAt: string;
  updatedAt?: string;
  likes: number;
  dislikes: number;
  isLiked: boolean;
  isDisliked: boolean;
  replies: Comment[];
  documentId: string;
  documentTitle: string;
  studentId: string;
  studentName: string;
  status: "open" | "resolved" | "archived";
  priority: "low" | "medium" | "high" | "critical";
}

interface Thread {
  id: string;
  documentId: string;
  documentTitle: string;
  studentId: string;
  studentName: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    role: "student" | "advisor" | "critic";
  };
  content: string;
  createdAt: string;
  updatedAt: string;
  commentsCount: number;
  status: "open" | "in-progress" | "resolved" | "archived";
  priority: "low" | "medium" | "high" | "critical";
  tags: string[];
}

const FeedbackManagementSystem = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeTab, setActiveTab] = useState<"threads" | "comments" | "resolved">("threads");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [newReply, setNewReply] = useState<{[key: string]: string}>({});

  // Mock data initialization
  useEffect(() => {
    // Simulate API call to fetch feedback data
    setTimeout(() => {
      const mockThreads: Thread[] = [
        {
          id: "1",
          documentId: "doc-1",
          documentTitle: "Chapter 2 - Literature Review",
          studentId: "student-1",
          studentName: "Maria Santos",
          author: {
            id: "student-1",
            name: "Maria Santos",
            avatar: "",
            role: "student"
          },
          content: "I'm having trouble with the methodology section. Could you review this part?",
          createdAt: "2024-12-20T10:30:00Z",
          updatedAt: "2024-12-22T14:20:00Z",
          commentsCount: 5,
          status: "in-progress",
          priority: "high",
          tags: ["methodology", "chapter-2", "revision-needed"]
        },
        {
          id: "2",
          documentId: "doc-2",
          documentTitle: "Thesis Proposal",
          studentId: "student-2",
          studentName: "Juan Dela Cruz",
          author: {
            id: "student-2",
            name: "Juan Dela Cruz",
            avatar: "",
            role: "student"
          },
          content: "Please review my research problem statement",
          createdAt: "2024-12-18T09:15:00Z",
          updatedAt: "2024-12-21T11:45:00Z",
          commentsCount: 3,
          status: "open",
          priority: "medium",
          tags: ["proposal", "research-problem", "approval-needed"]
        },
        {
          id: "3",
          documentId: "doc-3",
          documentTitle: "Chapter 3 - Methodology",
          studentId: "student-3",
          studentName: "Ana Reyes",
          author: {
            id: "advisor-1",
            name: "Dr. Juan Dela Cruz",
            avatar: "",
            role: "advisor"
          },
          content: "This methodology section needs significant improvements",
          createdAt: "2024-12-15T14:20:00Z",
          updatedAt: "2024-12-19T16:30:00Z",
          commentsCount: 8,
          status: "in-progress",
          priority: "critical",
          tags: ["methodology", "major-revision", "chapter-3"]
        }
      ];

      const mockComments: Comment[] = [
        {
          id: "c1",
          author: {
            id: "advisor-1",
            name: "Dr. Juan Dela Cruz",
            avatar: "",
            role: "advisor"
          },
          content: "The literature review needs more recent sources. Please include studies from the last 3 years.",
          createdAt: "2024-12-20T10:30:00Z",
          likes: 2,
          dislikes: 0,
          isLiked: false,
          isDisliked: false,
          replies: [
            {
              id: "r1",
              author: {
                id: "student-1",
                name: "Maria Santos",
                avatar: "",
                role: "student"
              },
              content: "Thank you for the feedback. I'll look for more recent studies.",
              createdAt: "2024-12-20T11:15:00Z",
              likes: 1,
              dislikes: 0,
              isLiked: false,
              isDisliked: false,
              replies: [],
              documentId: "doc-1",
              documentTitle: "Chapter 2 - Literature Review",
              studentId: "student-1",
              studentName: "Maria Santos",
              status: "open",
              priority: "medium"
            }
          ],
          documentId: "doc-1",
          documentTitle: "Chapter 2 - Literature Review",
          studentId: "student-1",
          studentName: "Maria Santos",
          status: "open",
          priority: "high"
        },
        {
          id: "c2",
          author: {
            id: "student-2",
            name: "Juan Dela Cruz",
            avatar: "",
            role: "student"
          },
          content: "I'm not sure if my research questions are aligned with the objectives.",
          createdAt: "2024-12-18T09:15:00Z",
          likes: 0,
          dislikes: 0,
          isLiked: false,
          isDisliked: false,
          replies: [],
          documentId: "doc-2",
          documentTitle: "Thesis Proposal",
          studentId: "student-2",
          studentName: "Juan Dela Cruz",
          status: "open",
          priority: "medium"
        }
      ];

      setThreads(mockThreads);
      setComments(mockComments);
    }, 800);
  }, []);

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedThread) return;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      author: {
        id: "current-user", // This would be the actual logged-in user
        name: "Dr. Juan Dela Cruz", // Current advisor name
        avatar: "",
        role: "advisor"
      },
      content: newComment,
      createdAt: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      isLiked: false,
      isDisliked: false,
      replies: [],
      documentId: selectedThread.documentId,
      documentTitle: selectedThread.documentTitle,
      studentId: selectedThread.studentId,
      studentName: selectedThread.studentName,
      status: "open",
      priority: "medium"
    };

    setComments([...comments, comment]);
    setNewComment("");
  };

  const handleAddReply = (commentId: string) => {
    if (!newReply[commentId]?.trim()) return;

    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        const reply: Comment = {
          id: `reply-${Date.now()}`,
          author: {
            id: "current-user",
            name: "Dr. Juan Dela Cruz", // Current advisor name
            avatar: "",
            role: "advisor"
          },
          content: newReply[commentId],
          createdAt: new Date().toISOString(),
          likes: 0,
          dislikes: 0,
          isLiked: false,
          isDisliked: false,
          replies: [],
          documentId: comment.documentId,
          documentTitle: comment.documentTitle,
          studentId: comment.studentId,
          studentName: comment.studentName,
          status: "open",
          priority: "medium"
        };
        
        return {
          ...comment,
          replies: [...comment.replies, reply]
        };
      }
      return comment;
    }));

    setNewReply(prev => ({
      ...prev,
      [commentId]: ""
    }));
  };

  const handleLikeComment = (commentId: string) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        const newLikes = comment.isLiked 
          ? comment.likes - 1 
          : comment.likes + 1;
        const newDislikes = comment.isDisliked 
          ? comment.dislikes - 1 
          : comment.dislikes;
        
        return {
          ...comment,
          likes: newLikes,
          dislikes: newDislikes,
          isLiked: !comment.isLiked,
          isDisliked: comment.isLiked ? false : comment.isDisliked
        };
      }
      
      // Update replies if needed
      return {
        ...comment,
        replies: comment.replies.map(reply => {
          if (reply.id === commentId) {
            const newLikes = reply.isLiked 
              ? reply.likes - 1 
              : reply.likes + 1;
            const newDislikes = reply.isDisliked 
              ? reply.dislikes - 1 
              : reply.dislikes;
            
            return {
              ...reply,
              likes: newLikes,
              dislikes: newDislikes,
              isLiked: !reply.isLiked,
              isDisliked: reply.isLiked ? false : reply.isDisliked
            };
          }
          return reply;
        })
      };
    }));
  };

  const handleDislikeComment = (commentId: string) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        const newDislikes = comment.isDisliked 
          ? comment.dislikes - 1 
          : comment.dislikes + 1;
        const newLikes = comment.isLiked 
          ? comment.likes - 1 
          : comment.likes;
        
        return {
          ...comment,
          likes: newLikes,
          dislikes: newDislikes,
          isDisliked: !comment.isDisliked,
          isLiked: comment.isDisliked ? false : comment.isLiked
        };
      }
      
      // Update replies if needed
      return {
        ...comment,
        replies: comment.replies.map(reply => {
          if (reply.id === commentId) {
            const newDislikes = reply.isDisliked 
              ? reply.dislikes - 1 
              : reply.dislikes + 1;
            const newLikes = reply.isLiked 
              ? reply.likes - 1 
              : reply.likes;
            
            return {
              ...reply,
              likes: newLikes,
              dislikes: newDislikes,
              isDisliked: !reply.isDisliked,
              isLiked: reply.isDisliked ? false : reply.isLiked
            };
          }
          return reply;
        })
      };
    }));
  };

  const filteredThreads = threads.filter(thread => {
    const matchesSearch = 
      thread.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thread.documentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thread.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thread.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || thread.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || thread.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>;
      case "high":
        return <Badge className="bg-red-500">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="outline">Open</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case "resolved":
        return <Badge className="bg-green-500">Resolved</Badge>;
      case "archived":
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "student":
        return <Badge variant="outline" className="border-blue-300 text-blue-600">Student</Badge>;
      case "advisor":
        return <Badge className="bg-purple-500">Advisor</Badge>;
      case "critic":
        return <Badge className="bg-orange-500">Critic</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Feedback Management System</h2>
          <p className="text-muted-foreground">
            Manage document comments, threaded discussions, and student feedback
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm">AI Feedback Assistant: Active</span>
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col md:flex-row gap-6">
        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          {/* Controls */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex gap-2">
              <Button 
                variant={activeTab === "threads" ? "default" : "outline"}
                onClick={() => setActiveTab("threads")}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Discussion Threads
              </Button>
              <Button 
                variant={activeTab === "comments" ? "default" : "outline"}
                onClick={() => setActiveTab("comments")}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Recent Comments
              </Button>
              <Button 
                variant={activeTab === "resolved" ? "default" : "outline"}
                onClick={() => setActiveTab("resolved")}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Resolved Issues
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search feedback..."
                  className="pl-8 w-full md:w-[200px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full md:w-[120px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Discussion Threads */}
          {activeTab === "threads" && (
            <div className="space-y-4">
              {filteredThreads.map((thread) => (
                <Card key={thread.id} className="hover:bg-muted/50 transition-colors overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center space-x-3 min-w-0">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarImage src={thread.author.avatar} alt={thread.author.name} />
                          <AvatarFallback>{thread.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{thread.studentName}</div>
                          <div className="text-sm text-muted-foreground truncate">{thread.documentTitle}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {getPriorityBadge(thread.priority)}
                        {getStatusBadge(thread.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-3">{thread.content}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <UserCircle className="h-4 w-4 mr-1" />
                          <span className="truncate max-w-[120px]">{thread.author.name}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDate(thread.createdAt)}
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {thread.commentsCount}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {thread.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredThreads.length === 0 && (
                <div className="text-center py-10">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium">No feedback threads</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {searchTerm ? "No threads match your search." : "No feedback threads found."}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Recent Comments */}
          {activeTab === "comments" && (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 mt-0.5">
                      <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                      <AvatarFallback>{comment.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{comment.author.name}</span>
                        {getRoleBadge(comment.author.role)}
                        <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="mt-1">{comment.content}</p>
                      <div className="mt-2 flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleLikeComment(comment.id)}
                            className={comment.isLiked ? "text-green-600" : ""}
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {comment.likes}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDislikeComment(comment.id)}
                            className={comment.isDisliked ? "text-red-600" : ""}
                          >
                            <ThumbsDown className="h-4 w-4 mr-1" />
                            {comment.dislikes}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          >
                            <Reply className="h-4 w-4 mr-1" />
                            Reply
                          </Button>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {comment.documentTitle} • {comment.studentName}
                        </div>
                      </div>
                      
                      {/* Reply form */}
                      {replyingTo === comment.id && (
                        <div className="mt-3 ml-6 flex gap-2">
                          <Input
                            placeholder="Write your reply..."
                            value={newReply[comment.id] || ""}
                            onChange={(e) => setNewReply(prev => ({
                              ...prev,
                              [comment.id]: e.target.value
                            }))}
                          />
                          <Button 
                            size="sm" 
                            onClick={() => handleAddReply(comment.id)}
                            disabled={!newReply[comment.id]?.trim()}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setReplyingTo(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      
                      {/* Replies */}
                      {comment.replies.length > 0 && (
                        <div className="mt-4 space-y-3">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex items-start gap-3 ml-6 p-3 bg-muted rounded-lg">
                              <Avatar className="h-6 w-6 mt-0.5">
                                <AvatarImage src={reply.author.avatar} alt={reply.author.name} />
                                <AvatarFallback>{reply.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{reply.author.name}</span>
                                  {getRoleBadge(reply.author.role)}
                                  <span className="text-xs text-muted-foreground">{formatDate(reply.createdAt)}</span>
                                </div>
                                <p className="text-sm mt-1">{reply.content}</p>
                                <div className="mt-2 flex items-center gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleLikeComment(reply.id)}
                                    className={reply.isLiked ? "text-green-600" : ""}
                                  >
                                    <ThumbsUp className="h-3 w-3 mr-1" />
                                    {reply.likes}
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleDislikeComment(reply.id)}
                                    className={reply.isDisliked ? "text-red-600" : ""}
                                  >
                                    <ThumbsDown className="h-3 w-3 mr-1" />
                                    {reply.dislikes}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {comments.length === 0 && (
                <div className="text-center py-10">
                  <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium">No recent comments</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    No comments found matching your criteria.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Resolved Issues */}
          {activeTab === "resolved" && (
            <div className="space-y-4">
              <div className="text-center py-10">
                <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium">No resolved issues</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Issues that are marked as resolved will appear here.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Document Preview & Actions */}
        <div className="w-full md:w-80 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Manage feedback and document reviews
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Review Document
              </Button>
              <Button className="w-full" variant="outline">
                <Edit3 className="h-4 w-4 mr-2" />
                Add Comment
              </Button>
              <Button className="w-full" variant="outline">
                <Archive className="h-4 w-4 mr-2" />
                Archive Thread
              </Button>
              <Button className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Feedback
              </Button>
              <Button className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Send Feedback
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Document Preview</CardTitle>
              <CardDescription>
                Currently selected: {selectedThread ? selectedThread.documentTitle : "None"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted">
                  <div className="font-medium">Chapter 2 - Literature Review</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Maria Santos • Last updated: Dec 22, 2024
                  </div>
                  <div className="mt-3 text-sm">
                    This section reviews existing literature on the impact of social media on academic performance...
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Badge variant="outline">PDF</Badge>
                    <Badge variant="outline">12 pages</Badge>
                    <Badge variant="outline">2.4 MB</Badge>
                  </div>
                </div>
                
                <div className="text-center text-sm text-muted-foreground">
                  <Paperclip className="h-8 w-8 mx-auto mt-2" />
                  <p className="mt-2">Document preview would appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feedback Summary</CardTitle>
              <CardDescription>
                Overview of feedback activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Open Issues</span>
                  <span className="text-sm font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">In Progress</span>
                  <span className="text-sm font-medium">5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Resolved Today</span>
                  <span className="text-sm font-medium">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Avg. Response Time</span>
                  <span className="text-sm font-medium">24h</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Total Threads</span>
                  <span className="text-sm font-medium">20</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FeedbackManagementSystem;