"use client";

import { useRef, useState, type DragEvent } from "react";
import { cn } from "@/lib/utils/cn";
import { useTranslations } from "next-intl";

interface FileUploadProps {
  accept?: string;
  maxSizeMB?: number;
  currentUrl?: string | null;
  shape?: "circle" | "square";
  onFileSelect: (file: File) => void;
  className?: string;
}

export function FileUpload({
  accept = "image/*",
  maxSizeMB = 2,
  currentUrl,
  shape = "square",
  onFileSelect,
  className,
}: FileUploadProps) {
  const t = useTranslations("admin");
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayUrl = preview || currentUrl;

  function handleFile(file: File) {
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError(t("invalidFileType"));
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(t("fileTooLarge"));
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);
    onFileSelect(file);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  return (
    <div className={className}>
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
        className={cn(
          "relative flex items-center justify-center border-2 border-dashed cursor-pointer transition-colors overflow-hidden",
          shape === "circle"
            ? "w-24 h-24 rounded-full"
            : "w-32 h-32 rounded-[10px]",
          isDragging
            ? "border-accent bg-accent/5"
            : "border-border hover:border-accent/50",
          displayUrl && "border-solid border-border"
        )}
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt=""
            className={cn(
              "w-full h-full object-cover",
              shape === "circle" ? "rounded-full" : "rounded-[10px]"
            )}
          />
        ) : (
          <div className="flex flex-col items-center gap-1 p-2 text-center">
            <svg
              className="w-6 h-6 text-text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <span className="text-xs text-text-muted leading-tight">
              {t("dragOrClick")}
            </span>
          </div>
        )}

        {displayUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
              />
            </svg>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {error && <p className="mt-1 text-xs text-error">{error}</p>}
      {!error && (
        <p className="mt-1 text-xs text-text-muted">
          {t("maxFileSize", { size: maxSizeMB })}
        </p>
      )}
    </div>
  );
}
