"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { bulkCreateTeams } from "@/lib/actions/bulk-import";
import type { TeamImportRow } from "@/lib/actions/bulk-import";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

interface BulkImportTeamsDialogProps {
  open: boolean;
  onClose: () => void;
}

type Step = "input" | "preview" | "result";

interface ParsedRow extends TeamImportRow {
  error?: string;
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const rows: ParsedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(",").map((v) => v.trim());
    const row: ParsedRow = {
      name: "",
      short_name: "",
      city: "",
      group_name: "",
    };

    headers.forEach((header, idx) => {
      const val = values[idx] ?? "";
      if (header === "name") row.name = val;
      else if (header === "short_name") row.short_name = val;
      else if (header === "city") row.city = val;
      else if (header === "group_name") row.group_name = val;
    });

    if (!row.name) {
      row.error = "nameRequired";
    }

    rows.push(row);
  }

  return rows;
}

export function BulkImportTeamsDialog({
  open,
  onClose,
}: BulkImportTeamsDialogProps) {
  const t = useTranslations("admin");
  const router = useRouter();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("input");
  const [csvText, setCsvText] = useState("");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    imported: number;
    failed: number;
    errors: string[];
  } | null>(null);

  function reset() {
    setStep("input");
    setCsvText("");
    setRows([]);
    setImporting(false);
    setResult(null);
  }

  function handleClose() {
    if (result && result.imported > 0) {
      router.refresh();
    }
    reset();
    onClose();
  }

  function handlePreview() {
    const parsed = parseCSV(csvText);
    setRows(parsed);
    setStep("preview");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setCsvText(text);
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    const valid = rows.filter((r) => !r.error);
    if (valid.length === 0) return;

    setImporting(true);
    const importResult = await bulkCreateTeams(valid);
    setResult(importResult);
    setStep("result");
    setImporting(false);

    if (importResult.imported > 0) {
      toast(t("importSuccess", { count: importResult.imported }), "success");
    }
  }

  const templateDataUri =
    "data:text/csv;charset=utf-8," +
    encodeURIComponent(
      "name, short_name, city, group_name\n"
    );

  const validCount = rows.filter((r) => !r.error).length;

  return (
    <Dialog open={open} onClose={handleClose} className="max-w-2xl">
      <DialogHeader>{t("importTeams")}</DialogHeader>

      {step === "input" && (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            {t("importInstructions")}
          </p>
          <div className="bg-bg-dark/5 rounded-[8px] p-3">
            <p className="text-xs text-text-muted font-mono whitespace-pre-line">
              {t("importTeamsTemplate")}
            </p>
          </div>
          <textarea
            className="w-full h-40 border border-border rounded-[10px] p-3 text-sm font-mono bg-bg-card text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-accent/50"
            placeholder={t("pasteCSV")}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
          />
          <div className="flex items-center gap-3">
            <label className="text-sm text-accent cursor-pointer hover:underline">
              {t("uploadCSV")}
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            <a
              href={templateDataUri}
              download="teams-template.csv"
              className="text-sm text-accent hover:underline"
            >
              {t("downloadTemplate")}
            </a>
          </div>
          {csvText && (
            <p className="text-xs text-text-muted">
              {t("rowsDetected", {
                count: csvText.trim().split("\n").length - 1,
              })}
            </p>
          )}
        </div>
      )}

      {step === "preview" && (
        <div className="space-y-4">
          <p className="text-sm font-medium">
            {t("importPreview", { count: rows.length })}
          </p>
          <div className="max-h-64 overflow-y-auto border border-border rounded-[10px]">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-bg-dark/5">
                  <th className="text-left px-3 py-2">#</th>
                  <th className="text-left px-3 py-2">Name</th>
                  <th className="text-left px-3 py-2">Short</th>
                  <th className="text-left px-3 py-2">City</th>
                  <th className="text-left px-3 py-2">Group</th>
                  <th className="text-left px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={i}
                    className={cn(
                      "border-b border-border/50",
                      row.error && "bg-red-50"
                    )}
                  >
                    <td className="px-3 py-1.5">{i + 1}</td>
                    <td className="px-3 py-1.5">{row.name || "-"}</td>
                    <td className="px-3 py-1.5">{row.short_name || "-"}</td>
                    <td className="px-3 py-1.5">{row.city || "-"}</td>
                    <td className="px-3 py-1.5">{row.group_name || "-"}</td>
                    <td className="px-3 py-1.5">
                      {row.error ? (
                        <span className="text-red-600">{t(row.error)}</span>
                      ) : (
                        <span className="text-green-600">OK</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {step === "result" && result && (
        <div className="space-y-4">
          {result.failed === 0 ? (
            <p className="text-sm text-green-600 font-medium">
              {t("importSuccess", { count: result.imported })}
            </p>
          ) : (
            <p className="text-sm text-amber-600 font-medium">
              {t("importErrorPartial", {
                imported: result.imported,
                failed: result.failed,
              })}
            </p>
          )}
          {result.errors.length > 0 && (
            <div className="max-h-40 overflow-y-auto text-xs text-red-600 space-y-1">
              {result.errors.map((err, i) => (
                <p key={i}>{err}</p>
              ))}
            </div>
          )}
        </div>
      )}

      <DialogFooter>
        {step === "input" && (
          <>
            <Button variant="ghost" onClick={handleClose}>
              {t("cancel")}
            </Button>
            <Button onClick={handlePreview} disabled={!csvText.trim()}>
              {t("importPreview", {
                count: csvText
                  ? csvText.trim().split("\n").length - 1
                  : 0,
              })}
            </Button>
          </>
        )}
        {step === "preview" && (
          <>
            <Button variant="ghost" onClick={() => setStep("input")}>
              {t("cancel")}
            </Button>
            <Button
              onClick={handleImport}
              disabled={importing || validCount === 0}
            >
              {importing
                ? t("importing")
                : t("importTeams") + ` (${validCount})`}
            </Button>
          </>
        )}
        {step === "result" && (
          <Button onClick={handleClose}>{t("cancel")}</Button>
        )}
      </DialogFooter>
    </Dialog>
  );
}

