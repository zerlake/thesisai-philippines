/**
 * Student Chat Page
 * Phase 5: Communication & Collaboration
 */

'use client';

import { ChatInterface } from '@/components/chat-interface';

export default function StudentChatPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-serif">My Messages</h1>
        <p className="text-muted-foreground">Chat with your advisor and critic</p>
      </div>

      <div className="border rounded-lg h-[calc(100vh-200px)]">
        <ChatInterface />
      </div>
    </div>
  );
}