import { Navbar } from "@/components/navbar";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { ResponsesTable } from "./responses-table";
import { ExportButton } from "./export-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ResponsesPage({ params }: { params: { id: string } }) {
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
            responseSessions: {
                where: { submittedAt: { not: null } },
                include: {
                    answers: true,
                },
                orderBy: { submittedAt: "desc" },
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
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">Responses</h1>
                        <p className="mt-1 text-muted-foreground">
                            Viewing <span className="font-bold text-primary">{form.responseSessions.length}</span> submissions for &quot;{form.title}&quot;
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/forms/${form.id}/builder`}>Back to Builder</Link>
                        </Button>
                        <ExportButton form={form} />
                    </div>
                </div>

                <ResponsesTable form={form} />
            </main>
        </div>
    );
}
