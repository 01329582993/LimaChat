import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { FormsList } from "./forms-list";

export default async function MyFormsPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    const forms = await prisma.form.findMany({
        where: { ownerId: userId },
        include: {
            _count: {
                select: { responseSessions: { where: { submittedAt: { not: null } } } }
            }
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <Navbar />
            <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">My Forms</h1>
                        <p className="mt-1 text-muted-foreground italic">Manage and organize all your conversational forms.</p>
                    </div>
                    <Button asChild className="rounded-full shadow-lg shadow-primary/20">
                        <Link href="/forms/new">
                            <PlusCircle className="mr-2 h-5 w-5" />
                            Create New Form
                        </Link>
                    </Button>
                </div>

                <FormsList initialForms={forms} />
            </main>
        </div>
    );
}
