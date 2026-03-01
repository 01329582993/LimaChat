"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send, Bot, User, ChevronDown, ChevronUp, BarChart3, Info } from "lucide-react";
import { analyzeResponses } from "@/app/actions/ai";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Message {
    role: "user" | "model";
    content: string;
    stats?: any[];
}

export function AiResponseAssistant({ form }: { form: any }) {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "model",
            content: `Hi! I'm your AI data assistant. I've analyzed the ${form.responseSessions.length} responses for "${form.title}". How can I help you today?`,
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input;
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setIsLoading(true);

        try {
            const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));
            const response = await analyzeResponses(
                form.title,
                form.questions,
                form.responseSessions,
                chatHistory,
                userMsg
            );

            if (response) {
                setMessages(prev => [...prev, {
                    role: "model",
                    content: response.message,
                    stats: response.stats
                }]);
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: "model", content: "Sorry, I had trouble processing that." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="mb-4 w-[400px] max-w-[calc(100vw-3rem)]"
                    >
                        <Card className="flex h-[600px] flex-col overflow-hidden border-none bg-white/80 shadow-2xl backdrop-blur-xl rounded-[2rem]">
                            <CardHeader className="flex flex-row items-center justify-between border-b bg-primary/5 px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
                                        <Sparkles className="h-4 w-4" />
                                    </div>
                                    <CardTitle className="text-lg font-black tracking-tight">AI Insights</CardTitle>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full">
                                    <ChevronDown className="h-5 w-5" />
                                </Button>
                            </CardHeader>

                            <CardContent className="flex-1 overflow-hidden p-0">
                                <ScrollArea className="h-full px-6 py-6" viewportRef={scrollRef}>
                                    <div className="flex flex-col gap-6">
                                        {messages.map((message, i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "flex max-w-[85%] flex-col gap-2",
                                                    message.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                                                )}
                                            >
                                                <div className={cn(
                                                    "flex h-8 w-8 items-center justify-center rounded-lg shadow-sm mb-1",
                                                    message.role === "user" ? "bg-muted" : "bg-primary/10 text-primary"
                                                )}>
                                                    {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                                </div>
                                                <div className={cn(
                                                    "rounded-2xl px-5 py-4 text-base leading-relaxed tracking-tight",
                                                    message.role === "user"
                                                        ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 rounded-tr-none font-medium"
                                                        : "bg-white border-2 border-primary/5 shadow-md rounded-tl-none font-medium text-foreground/90 whitespace-pre-wrap"
                                                )}>
                                                    {message.content}
                                                </div>

                                                {message.stats && message.stats.length > 0 && (
                                                    <div className="mt-4 w-full flex flex-col gap-4">
                                                        {message.stats.map((stat, idx) => (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.95 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                transition={{ delay: idx * 0.1 }}
                                                                key={idx}
                                                                className="rounded-[1.5rem] border-2 border-primary/5 bg-white p-5 shadow-lg shadow-black/5 hover:border-primary/20 transition-all"
                                                            >
                                                                {stat.type === "METRIC" ? (
                                                                    <div className="flex items-start gap-4">
                                                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
                                                                            <Info className="h-6 w-6" />
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 mb-1">{stat.label}</p>
                                                                            <p className="text-2xl font-black text-foreground tracking-tight">{stat.value}</p>
                                                                            {stat.description && <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground/80">{stat.description}</p>}
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div>
                                                                        <div className="mb-3 flex items-center justify-between">
                                                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">{stat.label}</p>
                                                                            <p className="text-sm font-black text-primary bg-primary/5 px-2 py-0.5 rounded-lg">{stat.value || `${stat.percentage}%`}</p>
                                                                        </div>
                                                                        <div className="h-3 w-full overflow-hidden rounded-full bg-muted shadow-inner">
                                                                            <motion.div
                                                                                initial={{ width: 0 }}
                                                                                animate={{ width: `${stat.percentage}%` }}
                                                                                className="h-full bg-gradient-to-r from-primary to-blue-500 shadow-lg"
                                                                            />
                                                                        </div>
                                                                        {stat.description && <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground/80">{stat.description}</p>}
                                                                    </div>
                                                                )}
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {isLoading && (
                                            <div className="mr-auto flex items-start gap-2">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary mb-1">
                                                    <Bot className="h-4 w-4" />
                                                </div>
                                                <div className="rounded-2xl rounded-tl-none bg-white border px-4 py-3 shadow-sm">
                                                    <div className="flex gap-1.5">
                                                        <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]" />
                                                        <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.15s]" />
                                                        <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </CardContent>

                            <div className="p-6 pt-2 bg-gradient-to-t from-white to-transparent">
                                <div className="relative flex items-center gap-2">
                                    <Input
                                        placeholder="Ask about your data..."
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                        className="h-12 rounded-2xl border-2 border-primary/10 bg-white/50 pl-4 pr-12 focus-visible:ring-primary"
                                    />
                                    <Button
                                        size="icon"
                                        onClick={handleSend}
                                        disabled={!input.trim() || isLoading}
                                        className="absolute right-1.5 h-9 w-9 rounded-xl shadow-md transition-transform hover:scale-105 active:scale-95"
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <Button
                size="lg"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "h-14 w-14 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95",
                    isOpen ? "rounded-2xl" : "rounded-full"
                )}
            >
                {isOpen ? <ChevronDown className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
            </Button>
        </div>
    );
}
