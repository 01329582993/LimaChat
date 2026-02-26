"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createSession(formId: string, respondentMeta?: any) {
    return await prisma.responseSession.create({
        data: {
            formId,
            respondentMeta: respondentMeta || {},
        },
    });
}

export async function saveAnswer(sessionId: string, questionId: string, value: any) {
    // Check if answer already exists for this question in this session
    const existing = await prisma.answer.findFirst({
        where: {
            sessionId,
            questionId,
        },
    });

    if (existing) {
        return await prisma.answer.update({
            where: { id: existing.id },
            data: { value },
        });
    }

    return await prisma.answer.create({
        data: {
            sessionId,
            questionId,
            value,
        },
    });
}

export async function submitSession(sessionId: string) {
    return await prisma.responseSession.update({
        where: { id: sessionId },
        data: {
            submittedAt: new Date(),
        },
    });
}
