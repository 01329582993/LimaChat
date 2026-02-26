"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { nanoid } from "nanoid";

export async function createForm(formData: FormData) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    if (!title) {
        throw new Error("Title is required");
    }

    const form = await prisma.form.create({
        data: {
            ownerId: userId,
            title,
            description,
            shareSlug: nanoid(10), // Generate a unique slug
        },
    });

    revalidatePath("/dashboard");
    redirect(`/forms/${form.id}/builder`);
}

export async function addQuestion(formId: string, type: any, prompt: string, order: number, options?: string[]) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const form = await prisma.form.findUnique({
        where: { id: formId },
    });

    if (!form || form.ownerId !== userId) {
        throw new Error("Forbidden");
    }

    const question = await prisma.question.create({
        data: {
            formId,
            type,
            prompt,
            order,
            options: options || undefined,
        },
    });

    revalidatePath(`/forms/${formId}/builder`);
    return question;
}

export async function updateQuestion(questionId: string, data: any) {
    const { userId } = await auth();

    const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: { form: true },
    });

    if (!question || question.form.ownerId !== userId) {
        throw new Error("Unauthorized");
    }

    const updated = await prisma.question.update({
        where: { id: questionId },
        data,
    });

    revalidatePath(`/forms/${question.formId}/builder`);
    return updated;
}

export async function deleteQuestion(questionId: string) {
    const { userId } = await auth();

    const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: { form: true },
    });

    if (!question || question.form.ownerId !== userId) {
        throw new Error("Unauthorized");
    }

    await prisma.question.delete({
        where: { id: questionId },
    });

    revalidatePath(`/forms/${question.formId}/builder`);
}

export async function reorderQuestions(formId: string, questionIds: string[]) {
    const { userId } = await auth();

    const form = await prisma.form.findUnique({
        where: { id: formId },
    });

    if (!form || form.ownerId !== userId) {
        throw new Error("Unauthorized");
    }

    await prisma.$transaction(
        questionIds.map((id, index) =>
            prisma.question.update({
                where: { id },
                data: { order: index },
            })
        )
    );

    revalidatePath(`/forms/${formId}/builder`);
}

export async function togglePublish(formId: string) {
    const { userId } = await auth();

    const form = await prisma.form.findUnique({
        where: { id: formId },
    });

    if (!form || form.ownerId !== userId) {
        throw new Error("Unauthorized");
    }

    const updated = await prisma.form.update({
        where: { id: formId },
        data: {
            status: form.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
        },
    });

    revalidatePath(`/forms/${formId}/builder`);
    revalidatePath("/dashboard");
    return updated;
}

export async function createFormWithQuestions(data: { title: string, description: string, questions: any[] }) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const form = await prisma.$transaction(async (tx: any) => {
        const newForm = await tx.form.create({
            data: {
                ownerId: userId,
                title: data.title,
                description: data.description,
                shareSlug: nanoid(10),
            },
        });

        await Promise.all(
            data.questions.map((q, index) =>
                tx.question.create({
                    data: {
                        formId: newForm.id,
                        type: q.type,
                        prompt: q.prompt,
                        required: q.required ?? true,
                        order: index,
                        options: q.options || undefined,
                    },
                })
            )
        );

        return newForm;
    });

    revalidatePath("/dashboard");
    return form;
}
