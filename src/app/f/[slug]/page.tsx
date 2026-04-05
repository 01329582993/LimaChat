import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ChatRunner } from "./chat-runner";
import { auth } from "@clerk/nextjs/server";

export default async function publicFormPage({ params }: { params: { slug: string } }) {
    const { slug } = await params;
    const { userId } = await auth();

    let form;
    try {
        form = await prisma.form.findUnique({
            where: { shareSlug: slug },
            include: {
                questions: {
                    orderBy: { order: "asc" },
                },
            },
        });
    } catch (error) {
        console.error("Database error in publicFormPage:", error);
        notFound();
    }

    if (!form) {
        notFound();
    }

    const isOwner = userId === form.ownerId;
    if (form.status !== "PUBLISHED" && !isOwner) {
        notFound();
    }

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <ChatRunner form={form} questions={form.questions} />
        </div>
    );
}
