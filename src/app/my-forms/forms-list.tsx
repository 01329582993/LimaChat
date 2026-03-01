"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, FileText, ChevronRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import Link from "next/link";
import { Card } from "@/components/ui/card";

interface FormsListProps {
    initialForms: any[];
}

export function FormsList({ initialForms }: FormsListProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredForms = initialForms.filter((form) =>
        form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (form.description && form.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <Card className="overflow-hidden border-none shadow-sm rounded-3xl bg-white">
            <div className="flex items-center gap-4 border-b border-muted p-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search your forms..."
                        className="pl-10 rounded-xl bg-muted/30 border-none h-11 focus-visible:ring-primary/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="icon" className="rounded-xl h-11 w-11 border-muted bg-muted/10">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[400px] py-4 font-bold text-foreground">Form Name</TableHead>
                            <TableHead className="py-4 font-bold text-foreground">Status</TableHead>
                            <TableHead className="py-4 font-bold text-foreground">Responses</TableHead>
                            <TableHead className="py-4 font-bold text-foreground">Created</TableHead>
                            <TableHead className="text-right py-4"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredForms.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="py-20 text-center">
                                    <div className="flex flex-col items-center">
                                        <div className="rounded-2xl bg-muted p-4 mb-4">
                                            <FileText className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <p className="font-bold text-foreground">No forms found</p>
                                        <p className="text-sm text-muted-foreground italic text-center">
                                            {searchQuery ? `No results for "${searchQuery}"` : "Try adjusting your search or create a new one."}
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredForms.map((form: any) => (
                                <TableRow key={form.id} className="group hover:bg-muted/20 border-b border-muted transition-colors">
                                    <TableCell className="py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary font-black uppercase">
                                                {form.title.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-foreground">{form.title}</span>
                                                <span className="text-xs text-muted-foreground line-clamp-1 italic max-w-xs">{form.description || "No description"}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${form.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                                            {form.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-bold text-foreground">
                                        {form._count.responseSessions}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {format(new Date(form.createdAt), "MMM d, yyyy")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="sm" className="rounded-xl h-9 hover:bg-primary/5 hover:text-primary font-bold" asChild>
                                                <Link href={`/forms/${form.id}/builder`}>Edit</Link>
                                            </Button>
                                            <Button variant="outline" size="sm" className="rounded-xl h-9 border-muted bg-white shadow-xs font-bold" asChild>
                                                <Link href={`/forms/${form.id}/responses`}>
                                                    Results
                                                    <ChevronRight className="ml-1 h-3.5 w-3.5" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </Card>
    );
}
