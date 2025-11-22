'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { EditorToolbar } from './editor-toolbar';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Heading from '@tiptap/extension-heading';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Strike from '@tiptap/extension-strike';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import History from '@tiptap/extension-history';
import { useEffect, useState } from 'react';
import { PuterAITools } from './puter-ai-tools';
import { useAuth } from './auth-provider';
import { supabase } from '@/integrations/supabase/client';

export function Editor({ documentId }: { documentId: string }) {
  const { session, isLoading } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [content, setContent] = useState('');

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!documentId) return;

    const loadDocument = async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('content')
        .eq('id', documentId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading document:', error);
        // Using toast would require importing it, but this creates a circular dependency issue
        return;
      }

      if (data && data.content) {
        setContent(data.content);
      } else {
        setContent(`<h1>Chapter I: The Problem and Its Background</h1>
<p>This chapter presents the background of the study, statement of the problem, objectives, scope and limitations, significance of the study, and definition of terms.</p>
<h2>Introduction</h2>
<p>In recent years, the increasing demand for technological advancement has created new challenges and opportunities in the academic environment. Educational institutions are now faced with the need to integrate digital tools and platforms to enhance the learning experience.</p>
<h2>Statement of the Problem</h2>
<p>This study aims to address the following research questions:</p>
<ol>
<li>How do students perceive the effectiveness of AI-assisted academic writing tools?</li>
<li>What are the challenges faced by students using AI-powered thesis writing platforms?</li>
<li>To what extent do these platforms improve the quality and efficiency of academic writing?</li>
</ol>
<h2>Objectives of the Study</h2>
<p>The specific objectives of this study are to:</p>
<ul>
<li>Assess the effectiveness of AI-assisted writing tools in thesis preparation</li>
<li>Identify the challenges and benefits of using academic writing platforms</li>
<li>Determine the impact of these tools on writing productivity and quality</li>
</ul>
<h2>Scope and Limitations</h2>
<p>This study focuses on college students enrolled in thesis writing courses who utilize AI-powered academic writing platforms. The research is limited to students from public universities in the Philippines.</p>
<h2>Significance of the Study</h2>
<p>The findings of this study will benefit students, instructors, and educational administrators. Students will gain insights into optimizing their use of AI writing tools. Instructors will understand how to better integrate these tools into their curricula. Administrators will be equipped with information to make decisions about adopting such technologies.</p>
<h2>Definition of Terms</h2>
<p>For clarity, the following terms are defined:</p>
<ul>
<li><strong>AI Writing Tools:</strong> Artificial intelligence-powered platforms designed to assist in academic writing</li>
<li><strong>Academic Writing:</strong> Formal writing practiced in educational institutions</li>
<li><strong>Thesis Writing:</strong> The process of preparing and writing a formal academic thesis or dissertation</li>
</ul>`);
      }
    };

    loadDocument();
  }, [documentId]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      Document,
      Paragraph,
      Text,
      Heading.configure({ levels: [2, 3, 4] }),
      Bold,
      Italic,
      Strike,
      BulletList,
      OrderedList,
      ListItem,
      History,
    ],
    content: content,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl focus:outline-none min-h-[500px] w-full p-5 bg-white text-gray-900',
      },
    },
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      setContent(newContent);
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!isClient || isLoading) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <EditorToolbar editor={editor} />
      {editor && session && (
        <div className="flex gap-1 bg-background p-1 rounded-lg shadow-lg border">
          <PuterAITools editor={editor} session={session} supabaseClient={supabase} />
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}