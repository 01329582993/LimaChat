"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function FormSettings({ form }: { form: any }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Form Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="form-title">Title</Label>
                    <Input id="form-title" defaultValue={form.title} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="form-desc">Description</Label>
                    <Textarea id="form-desc" defaultValue={form.description} rows={4} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="thank-you">Thank You Message</Label>
                    <Textarea id="thank-you" defaultValue={form.thankYouMessage} rows={3} />
                </div>
            </CardContent>
        </Card>
    );
}
