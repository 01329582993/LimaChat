import { Navbar } from "@/components/navbar";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { QuestionEditor } from "./question-editor";
import { FormSettings } from "./form-settings";
import { ActionButtons } from "./action-buttons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function BuilderPage({ params }: { params: { id: string } }) {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
        redirect("/sign-in");
    }

    const form = await prisma.form.findUnique({
        where: { id },
        include: {
            questions: {
                orderBy: { order: "asc" },
            },
        },
    });

    if (!form || form.ownerId !== userId) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <Navbar />
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{form.title}</h1>
                        <p className="text-muted-foreground">{form.description}</p>
                    </div>
                    <div className="flex gap-2">
                        <ActionButtons form={form} />
                    </div>
                </div>

                <Tabs defaultValue="questions" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="questions">Questions</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                        <Button variant="ghost" size="sm" className="h-9 px-3 text-sm font-medium" asChild>
                            <Link href={`/forms/${form.id}/responses`}>Responses</Link>
                        </Button>
                    </TabsList>
                    <TabsContent value="questions" className="space-y-4">
                        <QuestionEditor formId={form.id} initialQuestions={form.questions} />
                    </TabsContent>
                    <TabsContent value="settings">
                        <FormSettings form={form} />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
