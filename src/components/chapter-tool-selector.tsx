import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  IntroductionGenerator,
  LiteratureReviewStructureGenerator,
  MethodologyPlanner,
  ResultsAnalysisPlanner,
  ConclusionSynthesisTool,
} from './chapter-specific-tools';

const chapterTools = [
  { id: 'introduction', name: 'Chapter I: Introduction', component: <IntroductionGenerator /> },
  { id: 'literature-review', name: 'Chapter II: Literature Review', component: <LiteratureReviewStructureGenerator /> },
  { id: 'methodology', name: 'Chapter III: Methodology', component: <MethodologyPlanner /> },
  { id: 'results', name: 'Chapter IV: Results', component: <ResultsAnalysisPlanner /> },
  { id: 'conclusion', name: 'Chapter V: Conclusion', component: <ConclusionSynthesisTool /> },
];

const ChapterToolSelector: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState(chapterTools[0]);

  const handleToolChange = (toolId: string) => {
    const tool = chapterTools.find((t) => t.id === toolId);
    if (tool) {
      setSelectedTool(tool);
    }
  };

  return (
    <div>
      <Select onValueChange={handleToolChange} defaultValue={selectedTool.id}>
        <SelectTrigger>
          <SelectValue placeholder="Select a chapter tool" />
        </SelectTrigger>
        <SelectContent>
          {chapterTools.map((tool) => (
            <SelectItem key={tool.id} value={tool.id}>
              {tool.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="mt-4">{selectedTool.component}</div>
    </div>
  );
};

export default ChapterToolSelector;
