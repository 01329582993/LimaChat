"use client";

import { motion } from "framer-motion";
import { PlusCircle, MessageSquare, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface DashboardClientProps {
    forms: any[];
    totalResponses: number;
    user: {
        firstName?: string | null;
    } | null;
}

export function DashboardClient({ forms, totalResponses, user }: DashboardClientProps) {
    return (
        <>
            {/* Welcoming Hero Section */}
            <div className="relative overflow-hidden bg-primary px-4 py-16 sm:px-6 lg:px-8 shadow-xl shadow-primary/10 rounded-b-[3rem]">
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#f8fafc] to-transparent pointer-events-none" />
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-[30%] -left-[10%] h-[70%] w-[40%] rounded-full bg-white/10 blur-3xl transition-transform duration-1000 group-hover:scale-110" />
                    <div className="absolute -bottom-[20%] -right-[5%] h-[60%] w-[30%] rounded-full bg-blue-400/20 blur-3xl" />
                </div>

                <div className="relative mx-auto max-w-7xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center"
                    >
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="flex h-7 w-7 items-center justify-center rounded-2xl bg-white/20 text-[10px] font-bold text-white backdrop-blur-md">
                                    <Sparkles className="h-3.5 w-3.5" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-100/80">Dashboard Creator</span>
                            </div>
                            <h1 className="text-5xl font-black tracking-tighter text-white sm:text-6xl">
                                Hello, {user?.firstName || "Creator"}
                            </h1>
                            <p className="mt-4 max-w-xl text-xl font-medium text-blue-100/90 leading-relaxed">
                                You have <span className="font-black text-white px-2 py-0.5 bg-white/10 rounded-lg">{forms.length}</span> active forms and <span className="font-black text-white px-2 py-0.5 bg-white/10 rounded-lg">{totalResponses}</span> responses.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Button asChild size="lg" className="h-14 rounded-3xl bg-white text-primary hover:bg-blue-50 text-base font-black shadow-xl shadow-black/10 px-8 transition-all hover:scale-105 active:scale-95 border-none">
                                <Link href="/forms/new">
                                    <PlusCircle className="mr-2 h-5 w-5" />
                                    New ChatForm
                                </Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="mt-12">
                {forms.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-primary/20 p-20 text-center bg-white shadow-sm"
                    >
                        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 mb-6">
                            <PlusCircle className="h-10 w-10 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground">Launch your first form</h3>
                        <p className="mt-3 max-w-sm text-muted-foreground italic text-lg">
                            Transform your data collection into an engaging chat experience in minutes.
                        </p>
                        <Button asChild size="lg" className="mt-8 rounded-full px-8 h-12">
                            <Link href="/forms/new">Create your first Form</Link>
                        </Button>
                    </motion.div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {forms.map((form: any, index: number) => (
                            <motion.div
                                key={form.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="group relative h-full overflow-hidden border-none bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-2 rounded-[2.5rem]">
                                    <div className="absolute inset-x-0 top-0 h-1.5 bg-primary/10 transition-colors group-hover:bg-primary" />
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center justify-between">
                                            <div className="rounded-2xl bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                                                <MessageSquare className="h-6 w-6" />
                                            </div>
                                            <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${form.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                                                {form.status}
                                            </span>
                                        </div>
                                        <div className="mt-6">
                                            <CardTitle className="truncate text-xl font-black text-foreground group-hover:text-primary transition-colors">{form.title}</CardTitle>
                                            <CardDescription className="mt-2 line-clamp-2 min-h-[40px] text-sm leading-relaxed italic text-muted-foreground">
                                                {form.description || "Start collecting beautiful insights with this chat-based form."}
                                            </CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="flex items-center justify-between border-t border-muted pt-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold uppercase text-muted-foreground/60 tracking-tighter">Responses</span>
                                                <span className="text-lg font-black text-foreground">{form._count.responseSessions}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm" className="h-9 rounded-full px-4 text-xs font-bold hover:bg-primary/5 hover:text-primary" asChild>
                                                    <Link href={`/forms/${form.id}/builder`}>Edit Builder</Link>
                                                </Button>
                                                <Button size="sm" className="h-9 rounded-full px-5 text-xs font-black shadow-md shadow-primary/20 transition-all hover:scale-105 active:scale-95" asChild>
                                                    <Link href={`/forms/${form.id}/responses`}>
                                                        View Results
                                                        <ChevronRight className="ml-1 h-3.5 w-3.5" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
