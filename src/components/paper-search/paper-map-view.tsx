'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { Paper } from '@/types/paper';
import { Card } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface PaperMapViewProps {
  papers: Paper[];
  isLoading?: boolean;
  onPaperSelect?: (paper: Paper) => void;
  selectedPaperId?: string;
}

interface GraphNode {
  id: string;
  label: string;
  size: number;
  citations: number;
  year: number;
}

interface GraphLink {
  source: string;
  target: string;
}

/**
 * Paper Map View Component
 * Visualizes paper relationships as a network graph
 * Note: This is a simplified implementation. For production use,
 * integrate a library like vis.js or d3.js
 */
export function PaperMapView({
  papers,
  isLoading = false,
  onPaperSelect,
  selectedPaperId,
}: PaperMapViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const graphData = useMemo(() => {
    const nodes: GraphNode[] = papers.map((paper) => {
      // Handle the case where title might be an array (e.g. from CrossRef API)
      let titleString = 'Untitled Paper';
      if (paper.title) {
        if (Array.isArray(paper.title)) {
          titleString = paper.title[0] || 'Untitled Paper';
        } else {
          titleString = paper.title;
        }
      }

      const truncatedTitle = titleString.substring(0, 30);
      const displayLabel = titleString.length > 30 ? `${truncatedTitle}...` : truncatedTitle;

      return {
        id: paper.id,
        label: displayLabel,
        size: Math.sqrt((paper.metadata.citationCount || 1) + 1) * 5,
        citations: paper.metadata.citationCount || 0,
        year: paper.year || 0,
      };
    });

    // Create links between papers from the same year or source
    const links: GraphLink[] = [];
    for (let i = 0; i < papers.length; i++) {
      for (let j = i + 1; j < papers.length; j++) {
        // Connect papers with common authors or same year
        const authors1 = papers[i].authors || [];
        const authors2 = papers[j].authors || [];
        const commonAuthors = authors1.some((a1) =>
          authors2.some((a2) => a1.name === a2.name)
        );
        const sameYear = papers[i].year === papers[j].year && papers[i].year !== undefined && papers[i].year !== null;

        if (commonAuthors || sameYear) {
          links.push({
            source: papers[i].id,
            target: papers[j].id,
          });
        }
      }
    }

    return { nodes, links };
  }, [papers]);

  useEffect(() => {
    if (!canvasRef.current || papers.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simple force-directed graph visualization
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    // Draw links
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    graphData.links.forEach((link) => {
      const sourceNode = graphData.nodes.find((n) => n.id === link.source);
      const targetNode = graphData.nodes.find((n) => n.id === link.target);

      if (sourceNode && targetNode) {
        // Simple positioning - arrange in circle
        const sourceIndex = graphData.nodes.findIndex((n) => n.id === link.source);
        const targetIndex = graphData.nodes.findIndex((n) => n.id === link.target);

        if (sourceIndex !== -1 && targetIndex !== -1) {
          const sourceAngle = (sourceIndex / graphData.nodes.length) * Math.PI * 2;
          const targetAngle = (targetIndex / graphData.nodes.length) * Math.PI * 2;

          const radius = Math.min(width, height) / 3;
          const centerX = width / 2;
          const centerY = height / 2;

          const sourceX = centerX + Math.cos(sourceAngle) * radius;
          const sourceY = centerY + Math.sin(sourceAngle) * radius;
          const targetX = centerX + Math.cos(targetAngle) * radius;
          const targetY = centerY + Math.sin(targetAngle) * radius;

          ctx.beginPath();
          ctx.moveTo(sourceX, sourceY);
          ctx.lineTo(targetX, targetY);
          ctx.stroke();
        }
      }
    });

    // Draw nodes
    graphData.nodes.forEach((node, index) => {
      const angle = (index / graphData.nodes.length) * Math.PI * 2;
      const radius = Math.min(width, height) / 3;
      const x = width / 2 + Math.cos(angle) * radius;
      const y = height / 2 + Math.sin(angle) * radius;

      // Node circle
      ctx.fillStyle = selectedPaperId === node.id ? '#3b82f6' : '#e5e7eb';
      ctx.beginPath();
      ctx.arc(x, y, node.size, 0, Math.PI * 2);
      ctx.fill();

      // Border
      ctx.strokeStyle = selectedPaperId === node.id ? '#1e40af' : '#9ca3af';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#000';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label || 'Untitled', x, y);
    });
  }, [graphData, selectedPaperId]);

  if (isLoading) {
    return (
      <Card className="h-96 animate-pulse bg-muted" />
    );
  }

  if (papers.length === 0) {
    return (
      <Card className="flex h-96 items-center justify-center">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <p className="mt-4 text-muted-foreground">
            No papers to visualize
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative h-96 w-full bg-white">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full"
          style={{ display: 'block' }}
        />
        <div className="absolute bottom-2 right-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
          {graphData.nodes.length} papers, {graphData.links.length} connections
        </div>
      </div>
    </Card>
  );
}
