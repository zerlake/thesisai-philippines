'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Trash2, Plus } from 'lucide-react';

interface Slide {
  id: string;
  title: string;
  bullets: string[];
  notes: string;
  timeEstimate: number;
  order: number;
}

interface SlideEditorProps {
  slide: Slide;
  onUpdate: (slideId: string, updates: Partial<Slide>) => void;
  onAddSlide: (afterSlideId?: string) => void;
  onDelete: () => void;
  totalBudgetSeconds: number;
}

export function SlideEditor({
  slide,
  onUpdate,
  onAddSlide,
  onDelete,
  totalBudgetSeconds,
}: SlideEditorProps) {
  const [editingBulletIndex, setEditingBulletIndex] = useState<number | null>(null);

  const updateBullet = (index: number, text: string) => {
    const newBullets = [...slide.bullets];
    newBullets[index] = text;
    onUpdate(slide.id, { bullets: newBullets });
  };

  const addBullet = () => {
    onUpdate(slide.id, { bullets: [...slide.bullets, '• '] });
  };

  const removeBullet = (index: number) => {
    if (slide.bullets.length > 1) {
      onUpdate(slide.id, { bullets: slide.bullets.filter((_, i) => i !== index) });
    }
  };

  const isTooMuchText = slide.bullets.some(b => b.length > 100);
  const timePercentage = (slide.timeEstimate / totalBudgetSeconds) * 100;
  const isTimeWarning = timePercentage > 20;

  return (
    <div className="space-y-6">
      {/* Title */}
      <Card>
        <CardHeader>
          <CardTitle>Slide {slide.order + 1}: Title</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={slide.title}
            onChange={(e) => onUpdate(slide.id, { title: e.target.value })}
            placeholder="Enter slide title"
            className="text-lg font-semibold"
          />
        </CardContent>
      </Card>

      {/* Content - Bullets */}
      <Card>
        <CardHeader>
          <CardTitle>Slide Content</CardTitle>
          <CardDescription>
            Keep bullets concise (1-3 bullets max, under 100 characters each)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isTooMuchText && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800 ml-2">
                Some bullets are too long. Consider breaking them into separate slides.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {slide.bullets.map((bullet, index) => (
              <div key={index} className="flex gap-3 items-start">
                <span className="text-xl text-muted-foreground mt-1">•</span>
                <textarea
                  value={bullet.replace('• ', '')}
                  onChange={(e) => updateBullet(index, `• ${e.target.value}`)}
                  placeholder="Enter bullet point"
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background resize-none"
                  rows={2}
                />
                {slide.bullets.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBullet(index)}
                    className="mt-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button variant="outline" onClick={addBullet} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Bullet
          </Button>
        </CardContent>
      </Card>

      {/* Presenter Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Presenter Notes</CardTitle>
          <CardDescription>
            30-60 second speaking script for this slide (not shown to audience)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={slide.notes}
            onChange={(e) => onUpdate(slide.id, { notes: e.target.value })}
            placeholder="Write your speaking notes here..."
            rows={6}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {slide.notes.split(/\s+/).length} words (aim for 50-100 words)
          </p>
        </CardContent>
      </Card>

      {/* Timing */}
      <Card>
        <CardHeader>
          <CardTitle>Time Estimate</CardTitle>
          <CardDescription>
            Estimated speaking time for this slide
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="minutes">Minutes</Label>
              <Input
                id="minutes"
                type="number"
                min="0"
                max="5"
                value={Math.floor(slide.timeEstimate / 60)}
                onChange={(e) => {
                  const minutes = parseInt(e.target.value) || 0;
                  const seconds = slide.timeEstimate % 60;
                  onUpdate(slide.id, { timeEstimate: minutes * 60 + seconds });
                }}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="seconds">Seconds</Label>
              <Input
                id="seconds"
                type="number"
                min="0"
                max="59"
                value={slide.timeEstimate % 60}
                onChange={(e) => {
                  const seconds = parseInt(e.target.value) || 0;
                  const minutes = Math.floor(slide.timeEstimate / 60);
                  onUpdate(slide.id, { timeEstimate: minutes * 60 + seconds });
                }}
              />
            </div>
          </div>

          {isTimeWarning && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800 ml-2">
                This slide uses {timePercentage.toFixed(0)}% of your total time budget. Consider if content is dense.
              </AlertDescription>
            </Alert>
          )}

          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                isTimeWarning ? 'bg-orange-500' : 'bg-primary'
              }`}
              style={{ width: `${Math.min(100, timePercentage)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {timePercentage.toFixed(0)}% of total budget
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => onAddSlide(slide.id)} className="flex-1">
          <Plus className="h-4 w-4 mr-2" />
          Add Slide After This
        </Button>
        <Button variant="destructive" onClick={onDelete} className="flex-1">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Slide
        </Button>
      </div>
    </div>
  );
}
