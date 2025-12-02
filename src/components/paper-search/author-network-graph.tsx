'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Paper } from '@/types/paper';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Info
} from 'lucide-react';

interface AuthorNetworkGraphProps {
  papers: Paper[];
  onAuthorSelect: (authorName: string, papers: Paper[]) => void;
  className?: string;
}

interface AuthorNode {
  id: string;
  name: string;
  papers: Paper[];
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  connections: number;
}

interface CollaborationLink {
  source: string;
  target: string;
  strength: number;
}

export function AuthorNetworkGraph({
  papers,
  onAuthorSelect,
  className = ''
}: AuthorNetworkGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<AuthorNode[]>([]);
  const [links, setLinks] = useState<CollaborationLink[]>([]);
  const [hoveredNode, setHoveredNode] = useState<AuthorNode | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isPlaying, setIsPlaying] = useState(true);

  // Process papers to extract authors and their connections
  useEffect(() => {
    if (papers.length === 0) return;

    // Extract all authors and build paper-author mapping
    const authorMap = new Map<string, { papers: Paper[], connections: Set<string> }>();
    
    papers.forEach(paper => {
      paper.authors.forEach(author => {
        if (!authorMap.has(author.name)) {
          authorMap.set(author.name, {
            papers: [],
            connections: new Set()
          });
        }
        
        // Add paper to author
        const authorData = authorMap.get(author.name)!;
        authorData.papers.push(paper);
        
        // Add connections to co-authors
        paper.authors.forEach(coAuthor => {
          if (coAuthor.name !== author.name) {
            authorData.connections.add(coAuthor.name);
          }
        });
      });
    });

    // Create nodes
    const newNodes: AuthorNode[] = Array.from(authorMap.entries()).map(([name, data]) => ({
      id: name,
      name,
      papers: data.papers,
      x: Math.random() * 800,
      y: Math.random() * 600,
      vx: 0,
      vy: 0,
      size: Math.max(8, Math.min(24, Math.log(data.papers.length + 1) * 5)),
      connections: data.connections.size
    }));

    // Create links based on co-authorship
    const newLinks: CollaborationLink[] = [];
    Array.from(authorMap.entries()).forEach(([authorName, authorData]) => {
      authorData.connections.forEach(coAuthorName => {
        // Check if link already exists to avoid duplicates
        const exists = newLinks.some(link => 
          (link.source === authorName && link.target === coAuthorName) ||
          (link.source === coAuthorName && link.target === authorName)
        );
        
        if (!exists) {
          newLinks.push({
            source: authorName,
            target: coAuthorName,
            strength: 1 // Could be based on number of collaborations
          });
        }
      });
    });

    setNodes(newNodes);
    setLinks(newLinks);
  }, [papers]);

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
        ctx.strokeStyle = 'rgba(150, 150, 150, 0.3)';
        ctx.stroke();
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      const isHighlighted = hoveredNode?.id === node.id;
      
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
      
      // Color based on number of connections
      const connectionRatio = node.connections / Math.max(1, nodes.reduce((max, n) => Math.max(max, n.connections), 1));
      const hue = 200 + (connectionRatio * 60); // Blue to green scale
      ctx.fillStyle = isHighlighted 
        ? `hsl(${hue}, 100%, 50%)` 
        : `hsl(${hue}, 70%, 60%)`;

      ctx.fill();
      
      // Add border for highlighted nodes
      if (isHighlighted) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      // Draw author name if node is large enough
      if (node.size > 12) {
        ctx.fillStyle = '#ffffff';
        ctx.font = `${Math.max(10, node.size / 2)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.name.split(' ')[0], node.x, node.y + node.size + 10);
      }
    });

    ctx.restore();
  }, [nodes, links, scale, offset, hoveredNode]);

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

      if (distance <= node.size) { // Within node radius
        onAuthorSelect(node.name, node.papers);
        return;
      }
    }
  }, [nodes, scale, offset, onAuthorSelect]);

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

      if (distance <= node.size) { // Within node radius
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
      </div>

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
          <div className="font-medium text-sm">{hoveredNode.name}</div>
          <div className="text-xs text-gray-500 mt-1">
            {hoveredNode.papers.length} papers • {hoveredNode.connections} connections
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {hoveredNode.papers.slice(0, 3).map((paper, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs truncate max-w-[120px]">
                {Array.isArray(paper.title) ? (paper.title[0] || 'Untitled').substring(0, 20) : (paper.title || 'Untitled').substring(0, 20)}...
              </Badge>
            ))}
            {hoveredNode.papers.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{hoveredNode.papers.length - 3} more
              </Badge>
            )}
          </div>
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
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <div className="text-lg font-medium mb-2">No author connections</div>
              <p className="text-sm">Add papers with author information to see the network</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}