import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  BookOpen, 
  ExternalLink, 
  Download, 
  Zap, 
  User, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Copy,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface ZoteroImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

interface ZoteroLibrary {
  id: number;
  name: string;
  type: 'user' | 'group';
  itemCount?: number;
  selected?: boolean;
}

const ZOTERO_DOCS_URL = 'https://www.zotero.org/support/creating_api_keys';
const ZOTERO_SETTINGS_URL = 'https://www.zotero.org/settings/keys';

const ZoteroImportModal: React.FC<ZoteroImportModalProps> = ({ isOpen, onClose, onImportComplete }) => {
  const [apiKey, setApiKey] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'verified' | 'error'>('idle');
  const [libraries, setLibraries] = useState<ZoteroLibrary[]>([]);
  const [isLoadingLibraries, setIsLoadingLibraries] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string>('');
  const [showApiKeyHelp, setShowApiKeyHelp] = useState(false);

  // Verify the Zotero API key
  const verifyApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter your Zotero API key');
      return;
    }

    setVerificationStatus('verifying');
    
    try {
      // In a real implementation, this would call our backend to verify the API key
      // For now, we'll simulate the verification process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful verification by fetching mock libraries
      const mockLibraries: ZoteroLibrary[] = [
        { id: 12345, name: 'My Library', type: 'user', itemCount: 24, selected: true },
        { id: 67890, name: 'Research Papers', type: 'user', itemCount: 45, selected: true },
        { id: 54321, name: 'Thesis Sources', type: 'user', itemCount: 67, selected: true },
        { id: 98765, name: 'Personal Notes', type: 'user', itemCount: 5, selected: false }
      ];
      
      setLibraries(mockLibraries);
      setVerificationStatus('verified');
      toast.success('Zotero API key verified successfully!');
    } catch (error) {
      console.error('Error verifying Zotero API key:', error);
      setVerificationStatus('error');
      toast.error('Failed to verify Zotero API key. Please check and try again.');
    }
  };

  // Fetch libraries after verification
  const fetchLibraries = async () => {
    if (verificationStatus !== 'verified') return;
    
    setIsLoadingLibraries(true);
    try {
      // In a real implementation, this would call our backend to fetch libraries
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Libraries are already set in verifyApiKey function
    } catch (error) {
      console.error('Error fetching Zotero libraries:', error);
      toast.error('Failed to fetch libraries from Zotero.');
    } finally {
      setIsLoadingLibraries(false);
    }
  };

  useEffect(() => {
    if (verificationStatus === 'verified' && isOpen) {
      fetchLibraries();
    }
  }, [verificationStatus, isOpen]);

  // Toggle library selection
  const toggleLibrarySelection = (id: number) => {
    setLibraries(libs => 
      libs.map(lib => 
        lib.id === id ? { ...lib, selected: !lib.selected } : lib
      )
    );
  };

  // Start the import process
  const startImport = async () => {
    const selectedLibs = libraries.filter(lib => lib.selected);
    if (selectedLibs.length === 0) {
      toast.error('Please select at least one library to import');
      return;
    }

    setIsImporting(true);
    setImportProgress(0);
    setImportStatus('Starting import...');

    try {
      // Simulate import process
      const totalItems = selectedLibs.reduce((sum, lib) => sum + (lib.itemCount || 0), 0);
      let importedCount = 0;
      
      // Simulate the import process with progress updates
      const importInterval = setInterval(() => {
        if (importedCount < totalItems) {
          importedCount += Math.floor(Math.random() * 5) + 1;
          const progress = Math.min(100, Math.floor((importedCount / totalItems) * 100));
          setImportProgress(progress);
          setImportStatus(`Imported ${Math.min(importedCount, totalItems)} of ${totalItems} items...`);
        } else {
          clearInterval(importInterval);
          setImportProgress(100);
          setImportStatus('Import completed successfully!');
          
          setTimeout(() => {
            setIsImporting(false);
            toast.success(`Successfully imported ${totalItems} items from Zotero!`);
            onImportComplete();
            onClose();
          }, 1000);
        }
      }, 300);
    } catch (error) {
      console.error('Error during import:', error);
      setIsImporting(false);
      setImportStatus('Import failed');
      toast.error('Import failed. Please try again.');
    }
  };

  // Reset the form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setApiKey('');
      setVerificationStatus('idle');
      setLibraries([]);
      setImportProgress(0);
      setIsImporting(false);
      setImportStatus('');
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            Import from Zotero
          </DialogTitle>
          <DialogDescription>
            Connect your Zotero account to import your research library into ThesisAI
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* API Key Input Section */}
          {!['verified'].includes(verificationStatus) && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500" />
                  Your Zotero API Key
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                  You'll need your Zotero API key to connect your library. 
                  Don't have one?{' '}
                  <button 
                    type="button"
                    onClick={() => setShowApiKeyHelp(!showApiKeyHelp)}
                    className="text-blue-600 dark:text-blue-400 underline"
                  >
                    See how to get it
                  </button>
                </p>
                
                {showApiKeyHelp && (
                  <div className="mt-3 p-3 bg-white dark:bg-gray-800 border border-blue-200 dark:border-gray-700 rounded-md text-sm">
                    <p className="font-medium mb-2">Getting your Zotero API Key:</p>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>Go to <a 
                        href={ZOTERO_SETTINGS_URL} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 underline"
                      >
                        Zotero Settings &gt; Keys
                      </a></li>
                      <li>Click "Create new private key"</li>
                      <li>Give it a name (e.g., "ThesisAI")</li>
                      <li>Set permissions to "Allow this key to access all of my data"</li>
                      <li>Copy the generated key and paste below</li>
                    </ol>
                    <p className="mt-2 text-xs text-gray-500">
                      Your API key is securely transmitted and stored encrypted.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="zotero-api-key">Zotero API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="zotero-api-key"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your Zotero API key"
                    disabled={verificationStatus === 'verifying'}
                  />
                  <Button 
                    onClick={verifyApiKey} 
                    disabled={verificationStatus === 'verifying' || !apiKey.trim()}
                  >
                    {verificationStatus === 'verifying' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Verifying...
                      </>
                    ) : (
                      'Verify'
                    )}
                  </Button>
                </div>
              </div>
              
              {verificationStatus === 'error' && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  <span>Invalid API key. Please check and try again.</span>
                </div>
              )}
            </div>
          )}
          
          {/* Libraries Selection - only shown after verification */}
          {verificationStatus === 'verified' && !isImporting && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Select Libraries to Import</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setLibraries(libs => libs.map(lib => ({...lib, selected: true})))}
                >
                  Select All
                </Button>
              </div>
              
              {isLoadingLibraries ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-3 border rounded-md animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mt-2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {libraries.map((library) => (
                    <div 
                      key={library.id} 
                      className={`flex items-center gap-3 p-3 border rounded-md ${
                        library.selected 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        id={`lib-${library.id}`}
                        checked={library.selected}
                        onChange={() => toggleLibrarySelection(library.id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label 
                        htmlFor={`lib-${library.id}`} 
                        className="flex-1 cursor-pointer min-w-0"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{library.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {library.itemCount} items
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {library.type === 'user' ? 'Personal Library' : 'Group Library'}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Import Progress - only shown during import */}
          {isImporting && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Importing citations</span>
                  <span className="text-sm font-medium">{importProgress}%</span>
                </div>
                <Progress value={importProgress} className="w-full" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center py-4">
                {importStatus}
              </p>
            </div>
          )}
        </div>
        
        {/* Footer Actions */}
        <CardFooter className="flex justify-between p-0 border-t pt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isImporting}
          >
            Cancel
          </Button>
          
          {verificationStatus === 'verified' && !isImporting && (
            <Button 
              onClick={startImport}
              disabled={libraries.filter(l => l.selected).length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Import Selected Libraries
            </Button>
          )}
        </CardFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ZoteroImportModal;