"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { createSession, saveAnswer, submitSession } from "@/app/actions/respondent";
import { getAiReaction } from "@/app/actions/ai";
import { Loader2, Send, CheckCircle2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export function ChatRunner({ form, questions }: { form: any, questions: any[] }) {
    const [session, setSession] = useState<any>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1); // -1 for Intro
    const [messages, setMessages] = useState<{ role: "bot" | "user" | "ai", content: string | any, type?: string }[]>([]);
    const [inputValue, setInputValue] = useState<any>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAiDeveloping, setIsAiDeveloping] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isAiDeveloping]);

    const startSession = async () => {
        setIsSubmitting(true);
        try {
            const s = await createSession(form.id);
            setSession(s);
            setMessages([{ role: "bot", content: `Welcome to ${form.title}!` }]);
            if (form.description) {
                setMessages(prev => [...prev, { role: "bot", content: form.description }]);
            }
            setCurrentQuestionIndex(0);
            askQuestion(0);
        } catch (error) {
            console.error(error);
            toast.error("Failed to start session");
        } finally {
            setIsSubmitting(false);
        }
    };

    const askQuestion = (index: number) => {
        if (index >= questions.length) {
            finishChat();
            return;
        }
        const q = questions[index];
        setMessages(prev => [...prev, { role: "bot", content: q.prompt, type: q.type }]);
        setInputValue("");
    };

    const handleSend = async (val?: any) => {
        const value = val !== undefined ? val : inputValue;
        const currentQ = questions[currentQuestionIndex];

        if (!value && currentQ.required) {
            toast.error("This question is required");
            return;
        }

        const displayValue = Array.isArray(value) ? value.join(", ") : value.toString();
        setMessages(prev => [...prev, { role: "user", content: displayValue }]);
        setInputValue("");
        setIsSubmitting(true);

        try {
            // 1. Save Answer
            await saveAnswer(session.id, currentQ.id, value);

            // 2. Get AI Reaction (Optional)
            setIsAiDeveloping(true);
            const reaction = await getAiReaction(form.title, form.description || "", currentQ.prompt, displayValue);
            setIsAiDeveloping(false);

            if (reaction) {
                setMessages(prev => [...prev, { role: "ai", content: reaction }]);
                // Small delay for readability
                await new Promise(r => setTimeout(r, 1000));
            }

            // 3. Move to Next
            const nextIndex = currentQuestionIndex + 1;
            setCurrentQuestionIndex(nextIndex);
            askQuestion(nextIndex);
        } catch (error) {
            console.error(error);
            toast.error("Failed to save answer");
        } finally {
            setIsSubmitting(false);
            setIsAiDeveloping(false);
        }
    };

    const finishChat = async () => {
        setIsSubmitting(true);
        try {
            await submitSession(session.id);
            setMessages(prev => [...prev, { role: "bot", content: form.thankYouMessage || "Thank you for your response!" }]);
            setIsDone(true);
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit session");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderInput = () => {
        const q = questions[currentQuestionIndex];
        if (!q || isSubmitting) return null;

        if (q.type === "MULTIPLE_CHOICE" || q.type === "DROPDOWN") {
            return (
                <div className="grid grid-cols-1 gap-2 w-full">
                    {/* @ts-ignore */}
                    {q.options?.map((opt: string, i: number) => (
                        <Button key={`${opt}-${i}`} variant="outline" className="justify-center h-12 shadow-sm hover:bg-primary/5 hover:border-primary/50 transition-all border-2 rounded-2xl font-bold" onClick={() => handleSend(opt)} disabled={isSubmitting}>
                            {opt}
                        </Button>
                    ))}
                </div>
            );
        }

        if (q.type === "CHECKBOX") {
            return (
                <div className="space-y-4 w-full">
                    <div className="grid grid-cols-1 gap-2">
                        {/* @ts-ignore */}
                        {q.options?.map((opt: string, i: number) => {
                            const isSelected = Array.isArray(inputValue) && inputValue.includes(opt);
                            return (
                                <Button
                                    key={`${opt}-${i}`}
                                    variant={isSelected ? "default" : "outline"}
                                    className={`justify-center h-12 border-2 transition-all rounded-2xl font-bold ${isSelected ? "ring-2 ring-primary ring-offset-2" : "hover:border-primary/50"}`}
                                    onClick={() => {
                                        const currentVal = Array.isArray(inputValue) ? inputValue : [];
                                        const newVal = currentVal.includes(opt)
                                            ? currentVal.filter(v => v !== opt)
                                            : [...currentVal, opt];
                                        setInputValue(newVal);
                                    }}
                                    disabled={isSubmitting}
                                >
                                    {opt}
                                </Button>
                            );
                        })}
                    </div>
                    <Button className="w-full h-12 shadow-lg rounded-2xl font-bold" onClick={() => handleSend(inputValue)} disabled={isSubmitting || (Array.isArray(inputValue) && inputValue.length === 0 && q.required)}>
                        Confirm Selection
                    </Button>
                </div>
            );
        }

        if (q.type === "RATING") {
            return (
                <div className="flex flex-col items-center gap-4 w-full">
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(val => (
                            <Button
                                key={val}
                                variant={inputValue === val ? "default" : "outline"}
                                className={`h-14 w-14 text-xl font-bold border-2 rounded-2xl ${inputValue === val ? "scale-110 shadow-lg" : "hover:border-primary/50"}`}
                                onClick={() => handleSend(val)}
                                disabled={isSubmitting}
                            >
                                {val}
                            </Button>
                        ))}
                    </div>
                </div>
            );
        }

        return (
            <div className="flex gap-2 w-full">
                <Input
                    placeholder={q.type === "LONG_TEXT" ? "Type your detailed answer..." : "Type your answer..."}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    disabled={isSubmitting}
                    className="h-12 text-base shadow-sm border-2 focus-visible:ring-primary rounded-2xl px-4"
                />
                <Button size="icon" className="h-12 w-12 shadow-lg hover:scale-105 transition-transform rounded-2xl" onClick={() => handleSend()} disabled={isSubmitting || (!inputValue && q.required)}>
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
            </div>
        );
    };

    if (currentQuestionIndex === -1) {
        return (
            <div className="flex flex-1 items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-2xl border-none rounded-[2.5rem] isolate overflow-hidden relative group">
                        <div className="absolute inset-x-0 top-0 h-2 bg-primary" />
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent -z-10 group-hover:scale-110 transition-transform duration-700" />
                        <div className="space-y-4">
                            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-2 shadow-inner">
                                <Sparkles className="h-8 w-8" />
                            </div>
                            <h1 className="text-4xl font-black tracking-tighter text-foreground">{form.title}</h1>
                            <p className="text-muted-foreground text-lg leading-relaxed italic">{form.description}</p>
                        </div>
                        <Button className="w-full h-15 text-xl font-black rounded-3xl shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] transition-all bg-primary" onClick={startSession} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : "Start Chat"}
                        </Button>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1 max-w-2xl mx-auto w-full border-x bg-slate-50 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-[size:20px_20px] opacity-50 pointer-events-none" />

            <header className="px-6 py-5 border-b bg-white/90 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="font-black truncate max-w-[150px] sm:max-w-[250px] text-base tracking-tight leading-none mb-1">{form.title}</h2>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">AI Host Active</span>
                    </div>
                </div>
                <div className="text-[10px] font-black px-3 py-1.5 bg-primary text-white shadow-lg shadow-primary/20 rounded-full uppercase tracking-tighter">
                    {currentQuestionIndex >= 0 && currentQuestionIndex < questions.length ? (
                        `${currentQuestionIndex + 1} / ${questions.length}`
                    ) : isDone ? (
                        "Done"
                    ) : (
                        "..."
                    )}
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                <AnimatePresence mode="popLayout">
                    {messages.map((m, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[85%] rounded-[2rem] px-6 py-4 shadow-sm relative ${m.role === "user"
                                    ? "bg-primary text-primary-foreground rounded-tr-none shadow-primary/20"
                                    : m.role === "ai"
                                        ? "bg-blue-50 border-2 border-blue-100 rounded-tl-none text-blue-900 italic font-semibold"
                                        : "bg-white border border-border rounded-tl-none text-foreground"
                                    }`}
                            >
                                <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                                {m.role === "ai" && (
                                    <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-primary animate-pulse" />
                                )}
                            </div>
                        </motion.div>
                    ))}
                    {isAiDeveloping && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex justify-start"
                        >
                            <div className="bg-white border border-border rounded-[2rem] rounded-tl-none px-6 py-4 shadow-sm flex items-center gap-2">
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                                </div>
                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">AI Host is thinking...</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </main>

            <footer className="p-6 bg-white border-t border-muted/50 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
                {!isDone && !isAiDeveloping && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-xl mx-auto w-full"
                    >
                        {renderInput()}
                    </motion.div>
                )}
                {isAiDeveloping && (
                    <div className="h-12 flex items-center justify-center text-xs font-bold text-muted-foreground italic uppercase tracking-widest animate-pulse">
                        Wait for AI Host...
                    </div>
                )}
                {isDone && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-center py-5 text-emerald-600 font-black text-lg gap-3 bg-emerald-50 rounded-[2rem] border-2 border-emerald-100 shadow-inner"
                    >
                        <CheckCircle2 className="h-7 w-7" />
                        Response Submitted!
                    </motion.div>
                )}
            </footer>
        </div>
    );
}
