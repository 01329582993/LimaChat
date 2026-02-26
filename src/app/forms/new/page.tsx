import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createForm } from "@/app/actions/form";

export default function NewFormPage() {
    return (
        <div className="min-h-screen bg-muted/30">
            <Navbar />
            <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Create New Form</CardTitle>
                        <CardDescription>
                            Give your form a title and description to get started.
                        </CardDescription>
                    </CardHeader>
                    <form action={createForm}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Form Title</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    placeholder="e.g. Customer Satisfaction Survey"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Tell your respondents what this form is about..."
                                    rows={4}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t px-6 py-4">
                            <Button variant="ghost" asChild>
                                <a href="/dashboard">Cancel</a>
                            </Button>
                            <Button type="submit">Create Form</Button>
                        </CardFooter>
                    </form>
                </Card>
            </main>
        </div>
    );
}
