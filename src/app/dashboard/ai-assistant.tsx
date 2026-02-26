"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2, Send, Wand2 } from "lucide-react";
import { generateFormFromPrompt } from "@/app/actions/ai";
import { createFormWithQuestions } from "@/app/actions/form";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export function AiFormAssistant() {
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const router = useRouter();

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        toast.info("AI is designing your form...");

        try {
            const formData = await generateFormFromPrompt(prompt);
            if (!formData) {
                toast.error("Failed to generate form. Please try again.");
                return;
            }

            toast.success("Form designed! Creating it now...");
            const form = await createFormWithQuestions(formData);

            router.push(`/forms/${form.id}/builder`);
            toast.success("Form created successfully!");
        } catch (error) {
            console.error(error);
            toast.error("An error occurred during generation.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Card className="relative overflow-hidden border-none bg-white shadow-xl rounded-[2.5rem] isolate">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-50/30 -z-10" />
            <div className="absolute top-0 right-0 p-8 text-primary/10 -z-10">
                <Wand2 className="h-24 w-24 rotate-12" />
            </div>

            <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                        <Sparkles className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-primary">AI Form Builder</span>
                </div>
                <CardTitle className="text-2xl font-black tracking-tight text-foreground">What do you want to build?</CardTitle>
                <CardDescription className="text-muted-foreground font-medium italic">
                    Describe your form objective, and our AI will handle the rest.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="relative flex items-center gap-2">
                    <Input
                        placeholder="e.g. A feedback form for a modern coffee shop with rating and suggestions..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                        disabled={isGenerating}
                        className="h-14 rounded-3xl border-2 border-primary/10 bg-white/50 pl-6 pr-14 text-base focus-visible:ring-primary shadow-inner"
                    />
                    <Button
                        size="icon"
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt.trim()}
                        className="absolute right-2 h-10 w-10 rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95"
                    >
                        {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                </div>

                <AnimatePresence>
                    {isGenerating && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="mt-4 flex items-center justify-center gap-3 py-2 px-4 rounded-2xl bg-primary/5 border border-primary/10"
                        >
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                            </div>
                            <span className="text-xs font-black text-primary uppercase tracking-widest">Designing your form experience...</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
