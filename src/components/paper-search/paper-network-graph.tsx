'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Paper } from '@/types/paper';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Info,
  Circle,
  Square,
  Triangle,
  Filter
} from 'lucide-react';

interface PaperNetworkGraphProps {
  papers: Paper[];
  onPaperSelect: (paper: Paper) => void;
  selectedPaper?: Paper;
  className?: string;
}

interface Node {
  id: string;
  paper: Paper;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx?: number;
  fy?: number;
  highlighted: boolean;
}

interface Link {
  source: string;
  target: string;
  type: 'citation' | 'similarity' | 'author';
}

export function PaperNetworkGraph({
  papers,
  onPaperSelect,
  selectedPaper,
  className = ''
}: PaperNetworkGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isPlaying, setIsPlaying] = useState(true);
  
  // Filter settings
  const [filterSettings, setFilterSettings] = useState({
    showCitations: true,
    showSimilarity: true,
    showAuthors: true,
    minCitations: 0,
    maxCitations: 100,
    showOpenAccess: true,
    showOnlySelected: false
  });
  
  const [showFilters, setShowFilters] = useState(false);

  // Initialize nodes and links
  useEffect(() => {
    if (papers.length === 0) return;

    // Create nodes
    const newNodes: Node[] = papers.map((paper, index) => ({
      id: paper.id,
      paper,
      x: Math.random() * 800,
      y: Math.random() * 600,
      vx: 0,
      vy: 0,
      highlighted: selectedPaper?.id === paper.id
    }));

    // Create links (simplified - in real implementation, you'd have actual citation data)
    const newLinks: Link[] = [];
    for (let i = 0; i < papers.length; i++) {
      for (let j = i + 1; j < papers.length; j++) {
        // Create a random link between papers (in a real implementation, this would be based on actual citations, references, or similarities)
        if (Math.random() > 0.7) {
          newLinks.push({
            source: papers[i].id,
            target: papers[j].id,
            type: Math.random() > 0.5 ? 'citation' : 'similarity'
          });
        }
      }
    }

    setNodes(newNodes);
    setLinks(newLinks);
  }, [papers, selectedPaper]);

  // Force-directed layout simulation
  useEffect(() => {
    if (!isPlaying || nodes.length === 0) return;

    let animationFrameId: number;

    const simulate = () => {
      setNodes(prevNodes => {
        const newNodes = [...prevNodes];
        const width = containerRef.current?.clientWidth || 800;
        const height = containerRef.current?.clientHeight || 600;

        // Simple force-directed simulation
        for (let i = 0; i < newNodes.length; i++) {
          let fx = 0;
          let fy = 0;

          // Repulsion between nodes
          for (let j = 0; j < newNodes.length; j++) {
            if (i === j) continue;
            
            const dx = newNodes[i].x - newNodes[j].x;
            const dy = newNodes[i].y - newNodes[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0) {
              const force = 100 / (distance * distance);
              fx += (dx / distance) * force;
              fy += (dy / distance) * force;
            }
          }

          // Attraction along links
          for (const link of links) {
            if (link.source === newNodes[i].id) {
              const targetNode = newNodes.find(n => n.id === link.target);
              if (targetNode) {
                const dx = targetNode.x - newNodes[i].x;
                const dy = targetNode.y - newNodes[i].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const force = distance * 0.01;
                fx -= (dx / distance) * force;
                fy -= (dy / distance) * force;
              }
            } else if (link.target === newNodes[i].id) {
              const sourceNode = newNodes.find(n => n.id === link.source);
              if (sourceNode) {
                const dx = sourceNode.x - newNodes[i].x;
                const dy = sourceNode.y - newNodes[i].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const force = distance * 0.01;
                fx -= (dx / distance) * force;
                fy -= (dy / distance) * force;
              }
            }
          }

          // Boundary constraints
          if (newNodes[i].x < 0) fx += 10;
          if (newNodes[i].x > width) fx -= 10;
          if (newNodes[i].y < 0) fy += 10;
          if (newNodes[i].y > height) fy -= 10;

          // Update position with damping
          newNodes[i].vx = (newNodes[i].vx + fx) * 0.9;
          newNodes[i].vy = (newNodes[i].vy + fy) * 0.9;
          newNodes[i].x += newNodes[i].vx;
          newNodes[i].y += newNodes[i].vy;
        }

        return newNodes;
      });

      animationFrameId = requestAnimationFrame(simulate);
    };

    animationFrameId = requestAnimationFrame(simulate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, links, nodes.length]);

  // Draw the graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const container = containerRef.current;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply scale and offset
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // Draw links
    ctx.lineWidth = 1;
    links.forEach(link => {
      const sourceNode = nodes.find(n => n.id === link.source);
      const targetNode = nodes.find(n => n.id === link.target);

      if (sourceNode && targetNode) {
        ctx.beginPath();
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(targetNode.x, targetNode.y);
        
        // Color based on link type
        switch (link.type) {
          case 'citation':
            ctx.strokeStyle = 'rgba(100, 100, 200, 0.3)';
            break;
          case 'similarity':
            ctx.strokeStyle = 'rgba(100, 200, 100, 0.3)';
            break;
          case 'author':
            ctx.strokeStyle = 'rgba(200, 100, 100, 0.3)';
            break;
        }
        
        ctx.stroke();
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      const isSelected = selectedPaper?.id === node.id;
      const isHighlighted = node.highlighted || hoveredNode?.id === node.id;
      
      // Calculate node size based on citation count
      const baseSize = 8;
      const citationCount = node.paper.metadata.citationCount || 0;
      const size = Math.max(baseSize, Math.min(baseSize + Math.log(citationCount + 1) * 2, 20));

      ctx.beginPath();
      ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
      
      // Color based on open access status
      const isOpenAccess = node.paper.metadata.isOpenAccess;
      ctx.fillStyle = isSelected 
        ? '#3b82f6' // blue for selected
        : isHighlighted 
          ? '#f59e0b' // amber for hovered
          : isOpenAccess 
            ? '#10b981' // green for open access
            : '#9ca3af'; // gray for regular

      ctx.fill();
      
      // Add border for selected or highlighted nodes
      if (isSelected || isHighlighted) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    ctx.restore();
  }, [nodes, links, scale, offset, selectedPaper, hoveredNode]);

  // Handle canvas interactions
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x) / scale;
    const y = (e.clientY - rect.top - offset.y) / scale;

    // Find clicked node
    for (const node of nodes) {
      const dx = node.x - x;
      const dy = node.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= 10) { // 10px radius
        onPaperSelect(node.paper);
        return;
      }
    }
  }, [nodes, scale, offset, onPaperSelect]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x) / scale;
    const y = (e.clientY - rect.top - offset.y) / scale;

    // Find hovered node
    for (const node of nodes) {
      const dx = node.x - x;
      const dy = node.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= 10) { // 10px radius
        setHoveredNode(node);
        setTooltipPosition({ x: e.clientX, y: e.clientY });
        return;
      }
    }
    
    setHoveredNode(null);
  }, [nodes, scale, offset]);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return; // Only left mouse button
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  }, [offset]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleCanvasMouseLeave = useCallback(() => {
    setIsDragging(false);
    setHoveredNode(null);
  }, []);

  const handleCanvasDrag = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  // Zoom functions
  const zoomIn = () => setScale(prev => Math.min(prev * 1.2, 3));
  const zoomOut = () => setScale(prev => Math.max(prev * 0.8, 0.3));
  const resetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  // Toggle simulation
  const toggleSimulation = () => setIsPlaying(prev => !prev);

  return (
    <div className={`relative ${className}`}>
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <div className="flex flex-col gap-1 bg-white/90 dark:bg-gray-800/90 p-2 rounded-lg shadow-md">
          <Button size="sm" variant="outline" onClick={zoomIn} className="h-8 w-8 p-0">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={zoomOut} className="h-8 w-8 p-0">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={resetView} className="h-8 w-8 p-0">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={toggleSimulation} 
            className="h-8 w-8 p-0"
          >
            {isPlaying ? '⏸️' : '▶️'}
          </Button>
        </div>
        
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <Card className="absolute top-4 left-4 z-10 p-4 w-64 bg-white dark:bg-gray-800 shadow-lg">
          <h3 className="font-semibold mb-3">Network Filters</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Checkbox 
                  checked={filterSettings.showCitations}
                  onCheckedChange={(checked) => setFilterSettings(prev => ({
                    ...prev,
                    showCitations: checked as boolean
                  }))}
                />
                Citation Links
              </Label>
              
              <Label className="flex items-center gap-2">
                <Checkbox 
                  checked={filterSettings.showSimilarity}
                  onCheckedChange={(checked) => setFilterSettings(prev => ({
                    ...prev,
                    showSimilarity: checked as boolean
                  }))}
                />
                Similarity Links
              </Label>
              
              <Label className="flex items-center gap-2">
                <Checkbox 
                  checked={filterSettings.showAuthors}
                  onCheckedChange={(checked) => setFilterSettings(prev => ({
                    ...prev,
                    showAuthors: checked as boolean
                  }))}
                />
                Author Links
              </Label>
            </div>
            
            <div className="space-y-2">
              <Label>Citation Count: {filterSettings.minCitations} - {filterSettings.maxCitations}</Label>
              <Slider
                min={0}
                max={100}
                step={1}
                value={[filterSettings.minCitations, filterSettings.maxCitations]}
                onValueChange={([min, max]) => setFilterSettings(prev => ({
                  ...prev,
                  minCitations: min,
                  maxCitations: max
                }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Checkbox 
                  checked={filterSettings.showOpenAccess}
                  onCheckedChange={(checked) => setFilterSettings(prev => ({
                    ...prev,
                    showOpenAccess: checked as boolean
                  }))}
                />
                Open Access Only
              </Label>
              
              <Label className="flex items-center gap-2">
                <Checkbox 
                  checked={filterSettings.showOnlySelected}
                  onCheckedChange={(checked) => setFilterSettings(prev => ({
                    ...prev,
                    showOnlySelected: checked as boolean
                  }))}
                />
                Focus on Selected
              </Label>
            </div>
          </div>
        </Card>
      )}

      {/* Tooltip */}
      {hoveredNode && (
        <div
          className="absolute z-20 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border max-w-xs"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 10,
            pointerEvents: 'none'
          }}
        >
          <div className="font-medium text-sm">{hoveredNode.paper.title}</div>
          <div className="text-xs text-gray-500 mt-1">
            {hoveredNode.paper.authors.slice(0, 2).map(a => a.name).join(', ')}
            {hoveredNode.paper.authors.length > 2 && ` +${hoveredNode.paper.authors.length - 2}`}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {hoveredNode.paper.year} • {hoveredNode.paper.metadata.citationCount || 0} citations
          </div>
          {hoveredNode.paper.metadata.isOpenAccess && (
            <Badge variant="secondary" className="mt-1 text-xs">Open Access</Badge>
          )}
        </div>
      )}

      {/* Graph container */}
      <div 
        ref={containerRef}
        className="w-full h-[600px] border rounded-lg bg-gray-50 dark:bg-gray-900 relative overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseMove={(e) => {
            handleCanvasMouseMove(e);
            if (isDragging) handleCanvasDrag(e);
          }}
          onMouseDown={handleCanvasMouseDown}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseLeave}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
        />
        
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-lg font-medium mb-2">No papers to visualize</div>
              <p className="text-sm">Search for papers to see the network graph</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}