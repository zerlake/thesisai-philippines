"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Send, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdvisorMessagesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  const conversations = [
    { id: "1", name: "Maria Santos", lastMessage: "Thank you for the feedback!", time: "2 hours ago", unread: 2 },
    { id: "2", name: "Juan Dela Cruz", lastMessage: "I have questions about methodology", time: "5 hours ago", unread: 0 },
    { id: "3", name: "Ana Reyes", lastMessage: "Can we schedule a meeting?", time: "1 day ago", unread: 1 },
    { id: "4", name: "Carlos Gomez", lastMessage: "Final draft submitted!", time: "2 days ago", unread: 0 },
  ];

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">Communicate with your students</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle>Conversations</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {conversations.map((conv) => (
                <div key={conv.id} onClick={() => setSelectedStudent(conv.id)} className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-muted ${selectedStudent === conv.id ? 'bg-muted' : ''}`}>
                  <Avatar><AvatarFallback>{conv.name.split(" ").map(n => n[0]).join("")}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">{conv.name}</span>
                      {conv.unread > 0 && <Badge variant="default" className="ml-2">{conv.unread}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                    <span className="text-xs text-muted-foreground">{conv.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle>{selectedStudent ? conversations.find(c => c.id === selectedStudent)?.name : "Select a conversation"}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {selectedStudent ? (
              <>
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  <div className="bg-muted p-3 rounded-lg max-w-[80%]">
                    <p className="text-sm">Hello! I wanted to ask about the feedback on Chapter 2.</p>
                    <span className="text-xs text-muted-foreground">10:30 AM</span>
                  </div>
                  <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-[80%] ml-auto">
                    <p className="text-sm">Sure! What would you like to discuss?</p>
                    <span className="text-xs opacity-70">10:35 AM</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Type a message..." className="flex-1" />
                  <Button><Send className="h-4 w-4" /></Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
