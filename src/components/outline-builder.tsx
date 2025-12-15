import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Trash2, 
  Move, 
  Copy, 
  Download, 
  Edit3, 
  Check, 
  X, 
  GripVertical,
  Bot,
  BookText,
  FileText,
  Target,
  ListTree
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth-provider';
import { callPuterAI } from '@/lib/puter-ai-wrapper';
import { FieldOfStudySelector } from '@/components/field-of-study-selector';

// Define types for outline structure
interface OutlineSection {
  id: string;
  title: string;
  description: string;
  level: number; // 1 for main chapters, 2 for sections, 3 for subsections, etc.
  estimatedWords?: number;
  isLocked?: boolean;
  children: OutlineSection[];
}

interface OutlineData {
  topic: string;
  field: string;
  university: string;
  citationStyle: string;
  sections: OutlineSection[];
  createdAt: string;
}

const OutlineBuilder: React.FC = () => {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const [outlineData, setOutlineData] = useState<OutlineData>({
    topic: '',
    field: '',
    university: '',
    citationStyle: 'apa',
    sections: [],
    createdAt: new Date().toISOString(),
  });
  
  const [draggedSection, setDraggedSection] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionLevel, setNewSectionLevel] = useState(2);
  const [newSectionParentId, setNewSectionParentId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Add a new section to the outline
  const addSection = (parentId: string | null = null, level: number = 2) => {
    if (!newSectionTitle.trim()) {
      toast.error('Please enter a section title');
      return;
    }

    const newSection: OutlineSection = {
      id: `section-${Date.now()}`,
      title: newSectionTitle,
      description: '',
      level: level,
      children: [],
    };

    setOutlineData(prev => {
      if (!parentId) {
        // Add as top-level section
        return {
          ...prev,
          sections: [...prev.sections, newSection]
        };
      } else {
        // Add as child of parent section
        const addAsChild = (sections: OutlineSection[]): OutlineSection[] => {
          return sections.map(section => {
            if (section.id === parentId) {
              return {
                ...section,
                children: [...section.children, newSection]
              };
            }
            return {
              ...section,
              children: addAsChild(section.children)
            };
          });
        };

        return {
          ...prev,
          sections: addAsChild(prev.sections)
        };
      }
    });

    setNewSectionTitle('');
    setNewSectionParentId(null);
    toast.success('Section added successfully');
  };

  // Update a section's properties
  const updateSection = (id: string, updates: Partial<OutlineSection>) => {
    const updateInSection = (sections: OutlineSection[]): OutlineSection[] => {
      return sections.map(section => {
        if (section.id === id) {
          return { ...section, ...updates };
        }
        return {
          ...section,
          children: updateInSection(section.children)
        };
      });
    };

    setOutlineData(prev => ({
      ...prev,
      sections: updateInSection(prev.sections)
    }));
  };

  // Delete a section and all its children
  const deleteSection = (id: string) => {
    const removeSection = (sections: OutlineSection[]): OutlineSection[] => {
      return sections
        .filter(section => section.id !== id)
        .map(section => ({
          ...section,
          children: removeSection(section.children)
        }));
    };

    setOutlineData(prev => ({
      ...prev,
      sections: removeSection(prev.sections)
    }));
    
    toast.success('Section deleted');
  };

  // Helper function to find a section and its parent
  const findSectionAndParent = (
    sections: OutlineSection[],
    id: string,
    parent: OutlineSection | null = null
  ): { section: OutlineSection; parent: OutlineSection | null } | null => {
    for (const section of sections) {
      if (section.id === id) {
        return { section, parent };
      }

      const foundInChildren = findSectionAndParent(section.children, id, section);
      if (foundInChildren) {
        return foundInChildren;
      }
    }
    return null;
  };

  // Move a section to be a child of another section
  const moveSection = (draggedId: string, targetId: string) => {
    // Don't move if trying to move onto itself
    if (draggedId === targetId) return;

    const draggedSectionInfo = findSectionAndParent(outlineData.sections, draggedId);
    const targetSectionInfo = findSectionAndParent(outlineData.sections, targetId);

    if (!draggedSectionInfo || !targetSectionInfo) {
      console.error('Could not find dragged or target section');
      return;
    }

    const { section: draggedSection, parent: draggedParent } = draggedSectionInfo;
    const { section: targetSection, parent: targetParent } = targetSectionInfo;

    // Create a deep copy of the outline
    let newSections = JSON.parse(JSON.stringify(outlineData.sections)) as OutlineSection[];

    // Remove the dragged section from its current location
    const removeSection = (sections: OutlineSection[]): OutlineSection[] => {
      return sections
        .filter(section => section.id !== draggedId)
        .map(section => ({
          ...section,
          children: removeSection(section.children)
        }));
    };

    newSections = removeSection(newSections);

    // Add the dragged section as a child of the target
    const addAsChild = (sections: OutlineSection[]): OutlineSection[] => {
      return sections.map(section => {
        if (section.id === targetId) {
          return {
            ...section,
            children: [
              ...section.children,
              { ...draggedSection, id: `${draggedId}-moved-${Date.now()}-${Math.random()}` } // New unique ID
            ]
          };
        }
        return {
          ...section,
          children: addAsChild(section.children)
        };
      });
    };

    newSections = addAsChild(newSections);

    setOutlineData(prev => ({
      ...prev,
      sections: newSections
    }));

    toast.success(`Moved "${draggedSection.title}" under "${targetSection.title}"`);
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('sectionId', id);
    setDraggedSection(id);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('sectionId');

    if (draggedId === targetId) return; // Can't drop onto self

    moveSection(draggedId, targetId);
    setDraggedSection(null);
  };

  // Generate outline from AI
  const generateOutline = async () => {
    if (!outlineData.topic || !outlineData.field) {
      toast.error('Please enter both topic and field of study');
      return;
    }

    setIsGenerating(true);

    try {
      const prompt = `Generate a detailed thesis outline for "${outlineData.topic}" in the field of "${outlineData.field}".

      Requirements:
      - Structure should be appropriate for ${outlineData.university || 'a university'} thesis
      - Follow IMRaD structure (Introduction, Literature Review, Methodology, Results, Discussion/Conclusion) or appropriate structure for field
      - Each section should have 3-5 sub-sections
      - Include a brief description for each section
      - Follow ${outlineData.citationStyle.toUpperCase()} style guidelines

      Format the response as a hierarchical outline with these specific sections:
      1. Introduction chapter with sections: Background, Problem Statement, Research Questions, Objectives, Significance, Scope & Delimitations
      2. Literature Review with sections: Theoretical Framework, Related Studies, Gap Analysis
      3. Methodology with sections: Research Design, Participants, Instruments, Procedures, Data Analysis
      4. (Results/Findings section for empirical studies OR Proposed Solution/Design for capstone projects)
      5. Discussion & Conclusion with sections: Summary, Implications, Limitations, Future Research

      Use markdown-like formatting with # for main sections, ## for subsections, ### for sub-subsections.
      For each section, provide both the title and a brief description on the same line like:
      ## Section Title: Brief description of what should be covered in this section`;

      const aiGeneratedOutline = await callPuterAI(prompt, {
        temperature: 0.6, // Slightly more deterministic for structured outlines
        max_tokens: 2000
      });

      // Parse the AI response to create structured outline sections
      const sections: OutlineSection[] = [];
      const lines = aiGeneratedOutline.split('\n');

      let currentMainSection: OutlineSection | null = null;
      let currentSubSection: OutlineSection | null = null;

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        // Match main sections (# Section Title: Description)
        const mainSectionMatch = trimmedLine.match(/^# ([^:]+):\s*(.*)$/);
        if (mainSectionMatch) {
          currentMainSection = {
            id: `sec-${Date.now()}-${sections.length}`,
            title: mainSectionMatch[1].trim(),
            description: mainSectionMatch[2].trim() || '',
            level: 1,
            children: []
          };
          sections.push(currentMainSection);
          currentSubSection = null;
          continue;
        }

        // Match subsections (## Section Title: Description)
        const subSectionMatch = trimmedLine.match(/^## ([^:]+):\s*(.*)$/);
        if (subSectionMatch && currentMainSection) {
          currentSubSection = {
            id: `sub-${Date.now()}-${currentMainSection.children.length}`,
            title: subSectionMatch[1].trim(),
            description: subSectionMatch[2].trim() || '',
            level: 2,
            children: []
          };
          currentMainSection.children.push(currentSubSection);
          continue;
        }

        // Match sub-subsections (### Section Title: Description)
        const subSubSectionMatch = trimmedLine.match(/^### ([^:]+):\s*(.*)$/);
        if (subSubSectionMatch && currentSubSection) {
          const newSubSubSection: OutlineSection = {
            id: `subsub-${Date.now()}-${currentSubSection.children.length}`,
            title: subSubSectionMatch[1].trim(),
            description: subSubSectionMatch[2].trim() || '',
            level: 3,
            children: []
          };
          currentSubSection.children.push(newSubSubSection);
          continue;
        }

        // Handle lines that don't match the pattern but might be continuations
        if (trimmedLine.startsWith('#')) {
          // This is a new header section, but didn't match our pattern
          continue;
        }

        // Handle description lines that are indented or follow sections
        if (!trimmedLine.startsWith('#') && (currentSubSection || currentMainSection)) {
          // If this line doesn't start with #, it might be a continuation of description
          if (currentSubSection) {
            currentSubSection.description += ' ' + trimmedLine;
          } else if (currentMainSection) {
            currentMainSection.description += ' ' + trimmedLine;
          }
        }
      }

      // If no sections were parsed properly, try a simpler approach
      if (sections.length === 0) {
        // Simple approach: split by common chapter markers
        const simpleLines = aiGeneratedOutline.split('\n');
        for (const line of simpleLines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          // Look for chapter-like titles (e.g., "Chapter 1: Introduction" or just "Introduction")
          if (trimmed.includes('Introduction') ||
              trimmed.includes('Literature') ||
              trimmed.includes('Methodology') ||
              trimmed.includes('Results') ||
              trimmed.includes('Discussion') ||
              trimmed.includes('Conclusion')) {

            const newSection: OutlineSection = {
              id: `ch-${Date.now()}-${sections.length}`,
              title: trimmed.replace(/^[^a-zA-Z]*/, '').replace(/:/, ''), // Remove leading symbols, keep text
              description: 'Chapter section for your thesis',
              level: 1,
              children: []
            };
            sections.push(newSection);
          }
        }
      }

      setOutlineData(prev => ({
        ...prev,
        sections
      }));

      toast.success(`Outline generated successfully with ${sections.length} main sections!`);
    } catch (error) {
      console.error('Error generating outline:', error);
      toast.error('Failed to generate outline. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save outline as draft to the user's document library
  const saveAsDraft = async () => {
    if (!user || outlineData.sections.length === 0) {
      toast.error('Cannot save empty outline');
      return;
    }

    setIsSaving(true);
    
    try {
      // Convert outline to a readable format for storage
      const content = generateOutlineContent(outlineData);
      
      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          title: `Outline: ${outlineData.topic || 'Untitled'}`,
          content: content,
          content_json: { outlineData },
          word_count: content.split(/\s+/).length
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Outline saved as draft!');
    } catch (error) {
      console.error('Error saving outline:', error);
      toast.error('Failed to save outline. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Export outline as downloadable file in different formats
  const exportOutline = (format: 'txt' | 'md' | 'docx' | 'latex') => {
    const content = generateOutlineContent(outlineData, format);

    let mimeType = 'text/plain';
    let extension = '.txt';

    if (format === 'md') {
      mimeType = 'text/markdown';
      extension = '.md';
    } else if (format === 'docx') {
      // For .docx export, we'll need to use a library in a real implementation
      // For now, we'll export as RTF which can be opened in Word
      mimeType = 'application/rtf';
      extension = '.rtf';
    } else if (format === 'latex') {
      mimeType = 'application/x-latex';
      extension = '.tex';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thesis-outline-${outlineData.topic.replace(/\s+/g, '_')}${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Outline exported as ${format.toUpperCase()}!`);
  };

  // Helper function to generate readable outline content in different formats
  const generateOutlineContent = (outline: OutlineData, format: 'txt' | 'md' | 'docx' | 'latex' | 'html' = 'md'): string => {
    if (format === 'latex') {
      // Generate LaTeX format
      let latexContent = `\\documentclass[12pt]{report}\n`;
      latexContent += `\\usepackage[utf8]{inputenc}\n`;
      latexContent += `\\usepackage{geometry}\n`;
      latexContent += `\\geometry{a4paper, margin=1in}\n`;
      latexContent += `\\usepackage{setspace}\n`;
      latexContent += `\\onehalfspacing\n\n`;

      latexContent += `\\title{${outline.topic || 'Thesis Outline'}}\n`;
      latexContent += `\\author{Generated by ThesisAI}\n`;
      latexContent += `\\date{\\today}\n\n`;

      latexContent += `\\begin{document}\n`;
      latexContent += `\\maketitle\n\n`;

      latexContent += `\\tableofcontents\n\n`;

      const processLatexSections = (sections: OutlineSection[], depth: number) => {
        let text = '';
        const sectionCmd = depth === 0 ? 'chapter' :
                          depth === 1 ? 'section' :
                          depth === 2 ? 'subsection' :
                          'subsubsection';

        for (const section of sections) {
          text += `\\${sectionCmd}{${section.title}}\n`;
          if (section.description) {
            text += `${section.description}\n\n`;
          }

          text += processLatexSections(section.children, depth + 1);
        }

        return text;
      };

      latexContent += processLatexSections(outline.sections, 0);
      latexContent += `\n\\end{document}`;

      return latexContent;
    }
    else if (format === 'html') {
      // Generate HTML format
      let htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>${outline.topic || 'Thesis Outline'}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #2c5282; }
    .section { margin-left: 20px; }
    .description { color: #4a5568; margin-top: 5px; }
  </style>
</head>
<body>
  <h1>${outline.topic || 'Thesis Outline'}</h1>
  <p><strong>Field:</strong> ${outline.field}</p>
  <p><strong>University:</strong> ${outline.university}</p>
  <p><strong>Citation Style:</strong> ${outline.citationStyle.toUpperCase()}</p>
`;

      const processHtmlSections = (sections: OutlineSection[], depth: number) => {
        let text = '';
        const tag = depth === 0 ? 'h2' :
                   depth === 1 ? 'h3' :
                   depth === 2 ? 'h4' : 'h5';

        for (const section of sections) {
          text += `  <${tag}>${section.title}</${tag}>\n`;
          if (section.description) {
            text += `  <p class="description">${section.description}</p>\n`;
          }

          if (section.children.length > 0) {
            text += `  <div class="section">\n`;
            text += processHtmlSections(section.children, depth + 1);
            text += `  </div>\n`;
          }
        }

        return text;
      };

      htmlContent += processHtmlSections(outline.sections, 0);
      htmlContent += `</body>\n</html>`;

      return htmlContent;
    }
    else {
      // Generate Markdown format (default)
      let content = `# ${outline.topic || 'Thesis Outline'}\n\n`;
      content += `**Field:** ${outline.field}\n\n`;
      content += `**University:** ${outline.university}\n\n`;
      content += `**Citation Style:** ${outline.citationStyle.toUpperCase()}\n\n`;

      const processSections = (sections: OutlineSection[]) => {
        let text = '';

        for (const section of sections) {
          text += `${'#'.repeat(section.level + 1)} ${section.title}\n`;
          if (section.description) {
            text += `${section.description}\n\n`;
          }

          if (section.children.length > 0) {
            text += processSections(section.children);
          }
        }

        return text;
      };

      content += processSections(outline.sections);
      return content;
    }
  };

  // Render the outline tree recursively
  const renderOutlineSection = (section: OutlineSection, depth = 0) => {
    const indentClass = `ml-${depth * 4}`;
    
    return (
      <div 
        key={section.id} 
        draggable
        onDragStart={(e) => handleDragStart(e, section.id)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, section.id)}
        className={`border-l-2 pl-4 py-1 ${draggedSection === section.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
      >
        <div className={`${indentClass} flex items-start gap-2 group`}>
          <GripVertical className="h-4 w-4 text-gray-400 mt-1 cursor-move opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {editingSection === section.id ? (
            <div className="flex-1 space-y-2">
              <Input
                value={section.title}
                onChange={(e) => updateSection(section.id, { title: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setEditingSection(null);
                  if (e.key === 'Escape') setEditingSection(null);
                }}
                autoFocus
                className="font-medium"
              />
              <Textarea
                value={section.description}
                onChange={(e) => updateSection(section.id, { description: e.target.value })}
                placeholder="Section description..."
                rows={2}
              />
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => setEditingSection(null)}
                  className="gap-1"
                >
                  <Check className="h-3 w-3" />
                  Save
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setEditingSection(null)}
                  className="gap-1"
                >
                  <X className="h-3 w-3" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className={`font-medium ${depth === 0 ? 'text-lg' : depth === 1 ? 'text-base' : 'text-sm'}`}>
                  {section.title}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  Lvl {section.level}
                </Badge>
              </div>
              {section.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {section.description}
                </p>
              )}
            </div>
          )}
          
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setEditingSection(section.id === editingSection ? null : section.id)}
            >
              {editingSection === section.id ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => addSection(section.id, section.level + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => deleteSection(section.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {section.children.map(child => renderOutlineSection(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">AI-Powered Outline Builder</h1>
        <p className="text-muted-foreground">
          Create structured thesis outlines with AI assistance
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListTree className="h-5 w-5" />
            Outline Settings
          </CardTitle>
          <CardDescription>
            Define your thesis parameters to generate a tailored outline
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Research Topic</Label>
              <Input
                id="topic"
                placeholder="e.g., The Impact of Social Media on Academic Performance"
                value={outlineData.topic}
                onChange={(e) => setOutlineData({...outlineData, topic: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Field of Study</Label>
              <FieldOfStudySelector
                value={outlineData.field}
                onValueChange={(value) => setOutlineData({...outlineData, field: value})}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="university">University (Optional)</Label>
              <Input
                id="university"
                placeholder="e.g., University of the Philippines"
                value={outlineData.university}
                onChange={(e) => setOutlineData({...outlineData, university: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="citationStyle">Citation Style</Label>
              <Select
                value={outlineData.citationStyle}
                onValueChange={(value) => setOutlineData({...outlineData, citationStyle: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apa">APA</SelectItem>
                  <SelectItem value="mla">MLA</SelectItem>
                  <SelectItem value="chicago">Chicago</SelectItem>
                  <SelectItem value="harvard">Harvard</SelectItem>
                  <SelectItem value="ieee">IEEE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="addSection">Add New Section</Label>
              <div className="flex gap-2">
                <Input
                  id="addSection"
                  placeholder="New section title"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSection(newSectionParentId, newSectionLevel)}
                />
                <Button onClick={() => addSection(newSectionParentId, newSectionLevel)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              onClick={generateOutline}
              disabled={isGenerating || !outlineData.topic || !outlineData.field}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Bot className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4" />
                  Generate with AI
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={saveAsDraft}
              disabled={isSaving || outlineData.sections.length === 0}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save as Draft'}
            </Button>

            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={() => exportOutline('txt')}
                disabled={outlineData.sections.length === 0}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export TXT
              </Button>
              <Button
                variant="outline"
                onClick={() => exportOutline('md')}
                disabled={outlineData.sections.length === 0}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export MD
              </Button>
              <Button
                variant="outline"
                onClick={() => exportOutline('docx')}
                disabled={outlineData.sections.length === 0}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export DOCX
              </Button>
              <Button
                variant="outline"
                onClick={() => exportOutline('latex')}
                disabled={outlineData.sections.length === 0}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export LaTeX
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {outlineData.sections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BookText className="h-5 w-5" />
                Thesis Outline
              </span>
              <Badge variant="outline">
                {outlineData.sections.length} main sections
              </Badge>
            </CardTitle>
            <CardDescription>
              Drag to reorder sections, click edit to modify, or add new sections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {outlineData.sections.map(section => renderOutlineSection(section))}
            </div>
          </CardContent>
        </Card>
      )}

      {outlineData.sections.length === 0 && (
        <Card>
          <CardHeader className="text-center">
            <ListTree className="h-12 w-12 mx-auto text-muted-foreground" />
            <CardTitle>No Outline Yet</CardTitle>
            <CardDescription>
              Enter a research topic and field of study, then click "Generate with AI" to create your outline
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};

export default OutlineBuilder;