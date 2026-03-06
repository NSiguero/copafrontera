"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { bulkCreatePlayers } from "@/lib/actions/bulk-import";
import type { PlayerImportRow } from "@/lib/actions/bulk-import";
import { PLAYER_POSITIONS } from "@/lib/utils/constants";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

interface BulkImportPlayersDialogProps {
  open: boolean;
  onClose: () => void;
  teamId: string;
}

type Step = "input" | "preview" | "result";

interface ParsedRow extends PlayerImportRow {
  error?: string;
}

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

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
      first_name: "",
      last_name: "",
    };

    headers.forEach((header, idx) => {
      const val = values[idx] ?? "";
      if (header === "first_name") row.first_name = val;
      else if (header === "last_name") row.last_name = val;
      else if (header === "dorsal" && val) row.dorsal = Number(val);
      else if (header === "position" && val)
        row.position = val as PlayerImportRow["position"];
      else if (header === "date_of_birth" && val) row.date_of_birth = val;
      else if (header === "is_captain")
        row.is_captain = val.toLowerCase() === "true";
    });

    // Validate
    if (!row.first_name || !row.last_name) {
      row.error = "nameRequired";
    } else if (
      row.dorsal !== undefined &&
      (isNaN(row.dorsal) || row.dorsal < 1 || row.dorsal > 99)
    ) {
      row.error = "dorsalInvalid";
    } else if (
      row.position &&
      !(PLAYER_POSITIONS as readonly string[]).includes(row.position)
    ) {
      row.error = "positionInvalid";
    } else if (row.date_of_birth && !DATE_REGEX.test(row.date_of_birth)) {
      row.error = "dateInvalid";
    }

    rows.push(row);
  }

  return rows;
}

export function BulkImportPlayersDialog({
  open,
  onClose,
  teamId,
}: BulkImportPlayersDialogProps) {
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
    const importResult = await bulkCreatePlayers(teamId, valid);
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
      "first_name, last_name, dorsal, position, date_of_birth, is_captain\n"
    );

  const validCount = rows.filter((r) => !r.error).length;

  return (
    <Dialog open={open} onClose={handleClose} className="max-w-2xl">
      <DialogHeader>{t("importPlayers")}</DialogHeader>

      {step === "input" && (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            {t("importInstructions")}
          </p>
          <div className="bg-bg-dark/5 rounded-[8px] p-3">
            <p className="text-xs text-text-muted font-mono whitespace-pre-line">
              {t("importPlayersTemplate")}
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
              download="players-template.csv"
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
                  <th className="text-left px-3 py-2">First</th>
                  <th className="text-left px-3 py-2">Last</th>
                  <th className="text-left px-3 py-2">#</th>
                  <th className="text-left px-3 py-2">Pos</th>
                  <th className="text-left px-3 py-2">DOB</th>
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
                    <td className="px-3 py-1.5">{row.first_name || "-"}</td>
                    <td className="px-3 py-1.5">{row.last_name || "-"}</td>
                    <td className="px-3 py-1.5">{row.dorsal ?? "-"}</td>
                    <td className="px-3 py-1.5">{row.position || "-"}</td>
                    <td className="px-3 py-1.5">{row.date_of_birth || "-"}</td>
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
                : t("importPlayers") + ` (${validCount})`}
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

