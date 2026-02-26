"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

export function ResponsesTable({ form }: { form: any }) {
    const { questions, responseSessions } = form;

    if (responseSessions.length === 0) {
        return (
            <Card className="p-12 text-center">
                <h3 className="text-lg font-semibold">No responses yet</h3>
                <p className="text-sm text-muted-foreground">Once people start answering your form, their responses will appear here.</p>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden border-none shadow-sm">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[180px] font-bold text-foreground py-4">Submitted At</TableHead>
                            {questions.map((q: any) => (
                                <TableHead key={q.id} className="min-w-[200px] font-bold text-foreground border-l py-4">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{q.type.replace("_", " ")}</span>
                                        <span className="line-clamp-1">{q.prompt}</span>
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {responseSessions.map((session: any) => (
                            <TableRow key={session.id} className="group transition-colors hover:bg-primary/5">
                                <TableCell className="py-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                                    {format(new Date(session.submittedAt), "MMM d, yyyy")}
                                    <span className="block text-[10px] text-muted-foreground/60">{format(new Date(session.submittedAt), "HH:mm")}</span>
                                </TableCell>
                                {questions.map((q: any) => {
                                    const answer = session.answers.find((a: any) => a.questionId === q.id);
                                    return (
                                        <TableCell key={q.id} className="border-l py-4">
                                            {answer ? (
                                                <div className="max-w-[400px] text-sm text-foreground">
                                                    {Array.isArray(answer.value) ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {answer.value.map((v: string, i: number) => (
                                                                <span key={`${v}-${i}`} className="rounded-md bg-primary/10 px-1.5 py-0.5 text-xs text-primary font-medium">
                                                                    {v}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="line-clamp-3">{answer.value.toString()}</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground/40 italic text-xs">No answer</span>
                                            )}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </Card>
    );
}
