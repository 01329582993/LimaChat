"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronUp, ChevronDown, PlusCircle, GripVertical, Trash2, Edit2, Loader2, Check } from "lucide-react";
import { QuestionType } from "@prisma/client";
import { addQuestion, deleteQuestion, updateQuestion, reorderQuestions } from "@/app/actions/form";
import {
    Dialog as ShadDialog,
    DialogContent as ShadDialogContent,
    DialogHeader as ShadDialogHeader,
    DialogTitle as ShadDialogTitle,
    DialogFooter as ShadDialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface Question {
    id: string;
    type: QuestionType;
    prompt: string;
    required: boolean;
    order: number;
    options: string[] | null;
}

export function QuestionEditor({ formId, initialQuestions }: { formId: string, initialQuestions: any[] }) {
    const [questions, setQuestions] = useState<Question[]>(initialQuestions);
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState<{ id?: string, type: QuestionType, prompt: string, required: boolean, options: string[] }>({
        type: QuestionType.SHORT_TEXT,
        prompt: "",
        required: false,
        options: ["Option 1"]
    });

    const onDragEnd = async (result: any) => {
        if (!result.destination) return;

        const items = Array.from(questions);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        const oldQuestions = questions;
        setQuestions(items);

        try {
            await reorderQuestions(formId, items.map(q => q.id));
            // toast.success("Order updated");
        } catch (error) {
            toast.error("Failed to update order");
            setQuestions(oldQuestions);
        }
    };

    const handleAddQuestion = async () => {
        if (!currentQuestion.prompt) return;
        setIsSubmitting(true);
        try {
            const q = await addQuestion(
                formId,
                currentQuestion.type,
                currentQuestion.prompt,
                questions.length,
                currentQuestion.options.length > 0 ? currentQuestion.options : undefined
            );
            setQuestions([...questions, q as any]);
            setIsAdding(false);
            resetCurrent();
            toast.success("Question added");
        } catch (error) {
            toast.error("Failed to add question");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        if (!currentQuestion.id || !currentQuestion.prompt) return;
        setIsSubmitting(true);
        try {
            const q = await updateQuestion(currentQuestion.id, {
                prompt: currentQuestion.prompt,
                required: currentQuestion.required,
                options: currentQuestion.options.length > 0 ? currentQuestion.options : null
            });
            setQuestions(questions.map(item => item.id === q.id ? q as any : item));
            setIsEditing(false);
            resetCurrent();
            toast.success("Question updated");
        } catch (error) {
            toast.error("Failed to update question");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await deleteQuestion(id);
            setQuestions(questions.filter(q => q.id !== id));
            toast.success("Question deleted");
        } catch (error) {
            toast.error("Failed to delete question");
        }
    };

    const resetCurrent = () => {
        setCurrentQuestion({ type: QuestionType.SHORT_TEXT, prompt: "", required: false, options: ["Option 1"] });
    };

    const addOption = () => {
        setCurrentQuestion({ ...currentQuestion, options: [...currentQuestion.options, `Option ${currentQuestion.options.length + 1}`] });
    };

    const removeOption = (index: number) => {
        setCurrentQuestion({ ...currentQuestion, options: currentQuestion.options.filter((_, i) => i !== index) });
    };

    const updateOption = (index: number, value: string) => {
        const newOptions = [...currentQuestion.options];
        newOptions[index] = value;
        setCurrentQuestion({ ...currentQuestion, options: newOptions });
    };

    const isChoiceType = (type: QuestionType) =>
        [QuestionType.MULTIPLE_CHOICE, QuestionType.CHECKBOX, QuestionType.DROPDOWN].includes(type);

    return (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
                {questions.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center p-12 text-center border-none shadow-sm rounded-3xl bg-white">
                        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 mb-6">
                            <PlusCircle className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold">No questions yet</h3>
                        <p className="text-sm text-muted-foreground mt-2 max-w-[200px]">Add your first question to start building the form.</p>
                    </Card>
                ) : (
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="questions">
                            {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                                    {questions.map((q, index) => (
                                        <Draggable key={q.id} draggableId={q.id} index={index}>
                                            {(provided) => (
                                                <Card
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className="group relative border-none bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 rounded-3xl isolate overflow-hidden"
                                                >
                                                    <div className="absolute inset-y-0 left-0 w-1 bg-primary/10 group-hover:bg-primary transition-colors" />
                                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                        <CardTitle className="text-sm font-medium flex items-center gap-3">
                                                            <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing p-2 rounded-xl bg-muted/50 text-muted-foreground/30 transition-all group-hover:bg-primary/10 group-hover:text-primary">
                                                                <GripVertical className="h-4 w-4" />
                                                            </div>
                                                            <span className="flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full text-[10px] font-black uppercase tracking-widest text-primary">
                                                                {q.type.replace("_", " ")}
                                                            </span>
                                                        </CardTitle>
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 rounded-full text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors"
                                                                onClick={() => {
                                                                    setCurrentQuestion({
                                                                        id: q.id,
                                                                        type: q.type,
                                                                        prompt: q.prompt,
                                                                        required: q.required,
                                                                        options: q.options || (isChoiceType(q.type) ? ["Option 1"] : [])
                                                                    });
                                                                    setIsEditing(true);
                                                                }}
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/5 transition-colors" onClick={() => handleDelete(q.id)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="pt-2 pb-6">
                                                        <p className="text-xl font-black tracking-tight text-foreground leading-tight">{q.prompt}</p>
                                                        {isChoiceType(q.type) && q.options && (
                                                            <div className="mt-4 flex flex-wrap gap-2">
                                                                {q.options.map((opt, i) => (
                                                                    <span key={i} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold uppercase text-slate-500 tracking-tighter">
                                                                        {opt}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {q.required && (
                                                            <div className="mt-4 flex items-center gap-2">
                                                                <div className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-destructive/80">Required field</span>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                )}
            </div>

            <div className="space-y-4">
                <Card className="sticky top-24 border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
                    <CardHeader className="pb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 mb-3">
                            <PlusCircle className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-xl font-black tracking-tight">Add Question</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3">
                        {[
                            { type: QuestionType.SHORT_TEXT, label: "Short Text" },
                            { type: QuestionType.LONG_TEXT, label: "Long Text" },
                            { type: QuestionType.MULTIPLE_CHOICE, label: "Choice" },
                            { type: QuestionType.CHECKBOX, label: "Check" },
                            { type: QuestionType.DROPDOWN, label: "Drop" },
                            { type: QuestionType.RATING, label: "Rating" },
                        ].map((t) => (
                            <Button
                                key={t.type}
                                variant="outline"
                                className="h-12 justify-center text-[10px] font-black uppercase tracking-widest border-2 hover:bg-primary/5 hover:border-primary transition-all rounded-2xl"
                                onClick={() => {
                                    setCurrentQuestion({ ...currentQuestion, type: t.type, options: isChoiceType(t.type) ? ["Option 1"] : [] });
                                    setIsAdding(true);
                                }}
                            >
                                {t.label}
                            </Button>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <ShadDialog open={isAdding || isEditing} onOpenChange={(open) => {
                if (!open) {
                    setIsAdding(false);
                    setIsEditing(false);
                    resetCurrent();
                }
            }}>
                <ShadDialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl p-8">
                    <ShadDialogHeader>
                        <ShadDialogTitle className="text-2xl font-black tracking-tight text-foreground">{isAdding ? "Add" : "Edit"} {currentQuestion.type.replace("_", " ")}</ShadDialogTitle>
                    </ShadDialogHeader>
                    <div className="space-y-6 py-6 max-h-[60vh] overflow-y-auto pr-2">
                        <div className="space-y-2">
                            <Label htmlFor="prompt" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Question Prompt</Label>
                            <Input
                                id="prompt"
                                placeholder="e.g. What is your name?"
                                value={currentQuestion.prompt}
                                onChange={(e) => setCurrentQuestion({ ...currentQuestion, prompt: e.target.value })}
                                className="h-14 rounded-2xl border-2 focus-visible:ring-primary text-base font-medium shadow-inner"
                            />
                        </div>

                        {isChoiceType(currentQuestion.type) && (
                            <div className="space-y-4">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Choices</Label>
                                <div className="space-y-3">
                                    {currentQuestion.options.map((option, index) => (
                                        <div key={index} className="flex items-center gap-2 group">
                                            <Input
                                                value={option}
                                                onChange={(e) => updateOption(index, e.target.value)}
                                                placeholder={`Option ${index + 1}`}
                                                className="h-12 rounded-xl border-2 focus-visible:ring-primary text-sm font-medium"
                                            />
                                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => removeOption(index)} disabled={currentQuestion.options.length <= 1}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button variant="outline" size="sm" className="w-full h-12 rounded-xl border-dashed border-2 font-bold uppercase tracking-widest text-[10px] hover:bg-primary/5 hover:border-primary transition-all" onClick={addOption}>
                                        <PlusCircle className="mr-2 h-4 w-4" /> Add Choice
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                            <Label htmlFor="required" className="text-sm font-bold text-foreground leading-none">Make this field required</Label>
                            <Switch
                                id="required"
                                checked={currentQuestion.required}
                                onCheckedChange={(checked) => setCurrentQuestion({ ...currentQuestion, required: checked })}
                                className="data-[state=checked]:bg-primary"
                            />
                        </div>
                    </div>
                    <ShadDialogFooter className="gap-2 sm:gap-0">
                        <Button variant="ghost" className="h-14 rounded-2xl px-6 font-bold text-muted-foreground" onClick={() => { setIsAdding(false); setIsEditing(false); resetCurrent(); }}>Cancel</Button>
                        <Button className="h-14 rounded-3xl px-8 font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" onClick={isAdding ? handleAddQuestion : handleUpdate} disabled={isSubmitting || !currentQuestion.prompt}>
                            {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                            {isAdding ? "Add Question" : "Save Changes"}
                        </Button>
                    </ShadDialogFooter>
                </ShadDialogContent>
            </ShadDialog>
        </div>
    );
}
