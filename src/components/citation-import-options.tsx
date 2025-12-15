import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  ExternalLink, 
  Download, 
  FileText, 
  Upload,
  AlertTriangle
} from 'lucide-react';
import ZoteroImportModal from './zotero-import-modal';
import { toast } from 'sonner';

const CitationImportOptions = () => {
  const [isZoteroModalOpen, setIsZoteroModalOpen] = useState(false);

  const handleImportComplete = () => {
    toast.success('Citations imported successfully!');
  };

  const handleMendeleyClick = () => {
    toast.info(
      'Mendeley import requires a premium subscription. Only Zotero import is available for free. ' +
      'You can still import Mendeley libraries by exporting as BibTeX/JSON and using the file import option below.'
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Import Citations
          </CardTitle>
          <CardDescription>
            Bring your existing research library from other tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Zotero Import Card */}
            <Card className="hover:border-blue-500 transition-colors cursor-pointer"
                  onClick={() => setIsZoteroModalOpen(true)}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Zotero</CardTitle>
                    <CardDescription>Free and open-source</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Import your Zotero libraries with one click. No subscription required.
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="secondary">Free</Badge>
                  <Badge variant="outline">OAuth</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Mendeley Import Card */}
            <Card className="opacity-70" onClick={handleMendeleyClick}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <ExternalLink className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      Mendeley
                      <Badge variant="outline" className="text-xs">Premium</Badge>
                    </CardTitle>
                    <CardDescription>Requires subscription</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Import your Mendeley libraries. Premium subscription required.
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="outline">Subscription</Badge>
                  <Badge variant="outline">OAuth</Badge>
                  <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Required</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* File Import Option */}
          <div className="mt-6">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import from File
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              Import citations from BibTeX (.bib), RIS, or CSV files
            </p>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Upload .bib
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Upload .ris
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Upload .csv
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ZoteroImportModal 
        isOpen={isZoteroModalOpen}
        onClose={() => setIsZoteroModalOpen(false)}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
};

export default CitationImportOptions;