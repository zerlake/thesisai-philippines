"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Link as LinkIcon, Copy, Trash2, Mail as MailIcon, Lock } from "lucide-react";
import { toast } from "sonner";

interface ShareDialogProps {
  isOpen: boolean;
  documentTitle?: string;
  documentUrl?: string;
  onClose: () => void;
  onShareByEmail?: (email: string, permission: string) => Promise<void>;
  onShareByLink?: (permission: string) => Promise<void>;
  sharedWith?: Array<{ email: string; permission: string; status: "owner" | "invited" | "accepted" }>;
  onRemoveAccess?: (email: string) => Promise<void>;
}

type Permission = "view" | "comment" | "edit";

const permissionDescriptions: Record<Permission, string> = {
  view: "Can view only",
  comment: "Can view and comment",
  edit: "Can edit",
};

export function DocumentShareDialog({
  isOpen,
  documentTitle = "Document",
  documentUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/docs/sample`,
  onClose,
  onShareByEmail,
  onShareByLink,
  sharedWith = [],
  onRemoveAccess,
}: ShareDialogProps) {
  const [email, setEmail] = useState("");
  const [emailPermission, setEmailPermission] = useState<Permission>("comment");
  const [linkPermission, setLinkPermission] = useState<Permission>("view");
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [isLoadingLink, setIsLoadingLink] = useState(false);

  const handleShareByEmail = async () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    setIsLoadingEmail(true);
    try {
      await onShareByEmail?.(email, emailPermission);
      setEmail("");
      toast.success(`Invitation sent to ${email}`);
    } catch (error) {
      toast.error("Failed to send invitation");
    } finally {
      setIsLoadingEmail(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(documentUrl);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleShareByLink = async () => {
    setIsLoadingLink(true);
    try {
      await onShareByLink?.(linkPermission);
      toast.success("Link sharing enabled");
    } catch (error) {
      toast.error("Failed to enable link sharing");
    } finally {
      setIsLoadingLink(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share "{documentTitle}"</DialogTitle>
          <DialogDescription>
            Invite others to collaborate on this document
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* EMAIL SHARING SECTION */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <MailIcon className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-lg">📧 Share by Email</h3>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-900">
              Send an invitation email with a personalized link
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="advisor@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoadingEmail}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-permission">Permission Level</Label>
                <Select value={emailPermission} onValueChange={(v) => setEmailPermission(v as Permission)}>
                  <SelectTrigger id="email-permission">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">
                      <div>
                        <p className="font-medium">👁️ View Only</p>
                        <p className="text-xs text-muted-foreground">Can read the document</p>
                      </div>
                    </SelectItem>
                    <SelectItem value="comment">
                      <div>
                        <p className="font-medium">💬 Can Comment</p>
                        <p className="text-xs text-muted-foreground">Can add feedback</p>
                      </div>
                    </SelectItem>
                    <SelectItem value="edit">
                      <div>
                        <p className="font-medium">✏️ Can Edit</p>
                        <p className="text-xs text-muted-foreground">Full access</p>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleShareByEmail}
                disabled={!email || isLoadingEmail}
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                {isLoadingEmail ? "Sending..." : "Send Invitation"}
              </Button>
            </div>
          </div>

          {/* LINK SHARING SECTION */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <LinkIcon className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-lg">🔗 Share by Link</h3>
            </div>

            <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-900">
              Generate a link that anyone can access (with permission)
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="link-permission">Who can access?</Label>
                <Select value={linkPermission} onValueChange={(v) => setLinkPermission(v as Permission)}>
                  <SelectTrigger id="link-permission">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View Only</SelectItem>
                    <SelectItem value="comment">Can Comment</SelectItem>
                    <SelectItem value="edit">Can Edit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Document Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={documentUrl}
                    readOnly
                    className="text-xs"
                  />
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    size="icon"
                    className="flex-shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Share this link with anyone you want to access your document
              </p>
            </div>
          </div>

          {/* CURRENT ACCESS SECTION */}
          {sharedWith.length > 0 && (
            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Lock className="w-5 h-5" />
                👥 People with Access
              </h3>

              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {sharedWith.map((person) => (
                  <div
                    key={person.email}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{person.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {person.status === "owner"
                          ? "Owner"
                          : person.status === "accepted"
                          ? `Can ${person.permission}`
                          : "Invitation pending"}
                      </p>
                    </div>

                    {person.status !== "owner" && (
                      <Button
                        onClick={() => onRemoveAccess?.(person.email)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TIPS SECTION */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
            <p className="text-sm font-semibold text-gray-900">💡 Sharing Tips:</p>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>• Email: Send a personalized invitation with permission</li>
              <li>• Link: Share with many people at once (good for open collaboration)</li>
              <li>• Permissions: Change who can view, comment, or edit anytime</li>
              <li>• Remove access: Click the trash icon to revoke sharing</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button onClick={onClose} variant="outline">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
