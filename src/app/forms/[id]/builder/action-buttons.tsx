"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { togglePublish } from "@/app/actions/form";
import { toast } from "sonner";
import { Loader2, Eye, Send } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";

export function ActionButtons({ form }: { form: any }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState(form.status);

    const handleToggle = async () => {
        setIsSubmitting(true);
        try {
            const updated = await togglePublish(form.id);
            setStatus(updated.status);
            toast.success(updated.status === "PUBLISHED" ? "Form published!" : "Form set to draft");
        } catch (error) {
            toast.error("Failed to update status");
        } finally {
            setIsSubmitting(false);
        }
    };

    const [shareUrl, setShareUrl] = useState("");

    useEffect(() => {
        setShareUrl(`${window.location.origin}/f/${form.shareSlug}`);
    }, [form.shareSlug]);

    return (
        <div className="flex items-center gap-2">
            <Button variant="outline" asChild size="sm">
                <Link href={`/f/${form.shareSlug}`} target="_blank">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                </Link>
            </Button>

            {status === "PUBLISHED" ? (
                <Dialog>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Send className="mr-2 h-4 w-4" />
                            Share
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Share your form</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <p className="text-sm text-muted-foreground">
                                Anyone with this link can view and answer your form.
                            </p>
                            <div className="flex items-center gap-2">
                                <Input value={shareUrl} readOnly />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                        navigator.clipboard.writeText(shareUrl);
                                        toast.success("Link copied to clipboard");
                                    }}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="secondary" onClick={handleToggle} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Unpublish
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            ) : (
                <Button onClick={handleToggle} disabled={isSubmitting} size="sm">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Publish
                </Button>
            )}
        </div>
    );
}
