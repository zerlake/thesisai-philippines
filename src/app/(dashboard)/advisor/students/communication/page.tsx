"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Send, Search } from "lucide-react";

export default function CommunicationHubPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const conversations = [
    { id: "1", name: "Maria Santos", lastMessage: "Thank you for the feedback on Chapter 2!", time: "2 hours ago", unread: 2 },
    { id: "2", name: "Juan Dela Cruz", lastMessage: "I have some questions about the methodology...", time: "5 hours ago", unread: 0 },
    { id: "3", name: "Ana Reyes", lastMessage: "Can we schedule a meeting next week?", time: "1 day ago", unread: 1 },
    { id: "4", name: "Carlos Gomez", lastMessage: "Final draft submitted!", time: "2 days ago", unread: 0 },
  ];

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Communication Hub</h1>
        <p className="text-muted-foreground">Message and communicate with your students</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {conversations.map((conv) => (
                <div key={conv.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                  <Avatar>
                    <AvatarFallback>{conv.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{conv.name}</span>
                      {conv.unread > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">{conv.unread}</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                    <span className="text-xs text-muted-foreground">{conv.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Select a Conversation</CardTitle>
            <CardDescription>Choose a student from the list to start messaging</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Select a conversation to view messages</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
