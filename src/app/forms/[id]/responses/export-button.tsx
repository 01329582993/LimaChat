"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { format } from "date-fns";

export function ExportButton({ form }: { form: any }) {
    const { questions, responseSessions, title } = form;

    const handleExport = () => {
        const data = responseSessions.map((session: any) => {
            const row: any = {
                "Submitted At": format(new Date(session.submittedAt), "yyyy-MM-dd HH:mm:ss"),
            };

            questions.forEach((q: any) => {
                const answer = session.answers.find((a: any) => a.questionId === q.id);
                row[q.prompt] = answer
                    ? (Array.isArray(answer.value) ? answer.value.join(", ") : answer.value.toString())
                    : "";
            });

            return row;
        });

        const csvConfig = mkConfig({
            fieldSeparator: ",",
            decimalSeparator: ".",
            useKeysAsHeaders: true,
            filename: `${title.replace(/\s+/g, "_")}_responses`,
        });

        const csv = generateCsv(csvConfig)(data);
        download(csvConfig)(csv);
    };

    return (
        <Button variant="outline" size="sm" onClick={handleExport} disabled={responseSessions.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
        </Button>
    );
}
