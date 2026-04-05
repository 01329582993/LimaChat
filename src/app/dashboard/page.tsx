import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AiFormAssistant } from "./ai-assistant";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId) {
        redirect("/sign-in");
    }

    let forms: any[] = [];
    try {
        forms = await prisma.form.findMany({
            where: { ownerId: userId },
            include: {
                _count: {
                    select: { responseSessions: { where: { submittedAt: { not: null } } } }
                }
            },
            orderBy: { createdAt: "desc" },
        });
    } catch (error) {
        console.error("Failed to fetch forms:", error);
        // We could redirect to an error page or show an error state
    }

    const totalResponses = forms.reduce((acc: number, form: any) => acc + (form._count?.responseSessions || 0), 0);

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <Navbar />

            <DashboardClient 
                forms={forms} 
                totalResponses={totalResponses} 
                user={user ? { firstName: user.firstName } : null} 
            />

            <main className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
                <div className="mt-12 mb-16">
                    <AiFormAssistant />
                </div>
                
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Recent Forms</h2>
                    <Button variant="ghost" size="sm" className="text-primary font-semibold hover:bg-primary/5" asChild>
                        <Link href="/dashboard" className="flex items-center gap-1">
                            View all forms
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                {/* The forms list is now handled inside DashboardClient to support animations */}
            </main>
        </div>
    );
}
