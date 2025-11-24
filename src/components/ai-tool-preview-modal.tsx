"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, RotateCcw, Copy } from "lucide-react";
import { toast } from "sonner";

interface AIToolPreviewModalProps {
  isOpen: boolean;
  title: string;
  outputs: string[];
  onInsert?: (output: string) => void;
  onInsertAll?: () => void;
  onRegenerate?: () => void;
  onClose: () => void;
  qualityRating?: number; // 1-5
}

export function AIToolPreviewModal({
  isOpen,
  title,
  outputs,
  onInsert,
  onInsertAll,
  onRegenerate,
  onClose,
  qualityRating = 4,
}: AIToolPreviewModalProps) {
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const getQualityLabel = (rating: number) => {
    if (rating <= 2) return "Poor match";
    if (rating <= 3) return "Fair match";
    if (rating <= 4) return "Good match";
    return "Excellent match";
  };

  const getQualityColor = (rating: number) => {
    if (rating <= 2) return "text-red-600";
    if (rating <= 3) return "text-yellow-600";
    if (rating <= 4) return "text-blue-600";
    return "text-green-600";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Quality Indicator */}
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <span className="text-sm font-medium">Quality:</span>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`text-lg ${i < qualityRating ? "text-yellow-400" : "text-gray-300"}`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className={`text-sm font-medium ${getQualityColor(qualityRating)}`}>
              {getQualityLabel(qualityRating)}
            </span>
          </div>

          {/* Outputs */}
          {outputs.length === 1 ? (
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 whitespace-pre-wrap text-sm leading-relaxed">
                {outputs[0]}
              </div>
            </div>
          ) : (
            <Tabs defaultValue="0" className="w-full">
              <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Math.min(outputs.length, 3)}, 1fr)` }}>
                {outputs.map((_, index) => (
                  <TabsTrigger key={index} value={String(index)}>
                    Option {index + 1}
                  </TabsTrigger>
                ))}
              </TabsList>

              {outputs.map((output, index) => (
                <TabsContent key={index} value={String(index)} className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 whitespace-pre-wrap text-sm leading-relaxed max-h-[300px] overflow-y-auto">
                    {output}
                  </div>
                  <Button
                    onClick={() => handleCopyToClipboard(output)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Option {index + 1}
                  </Button>
                </TabsContent>
              ))}
            </Tabs>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 border-t pt-4">
            {/* Insert Options */}
            {outputs.length === 1 && onInsert ? (
              <Button onClick={() => onInsert(outputs[0])} className="w-full">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Insert into Document
              </Button>
            ) : (
              <>
                <Button onClick={() => onInsert?.(outputs[0])} className="w-full">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Insert Selected Option
                </Button>
                {onInsertAll && (
                  <Button onClick={onInsertAll} variant="outline" className="w-full">
                    Insert All Options
                  </Button>
                )}
              </>
            )}

            {/* Regenerate Option */}
            {onRegenerate && (
              <Button onClick={onRegenerate} variant="ghost" className="w-full">
                <RotateCcw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            )}

            {/* Close */}
            <Button onClick={onClose} variant="ghost" className="w-full">
              Close
            </Button>
          </div>

          {/* Info */}
          <p className="text-xs text-muted-foreground text-center">
            You can edit the content after inserting it into your document
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
