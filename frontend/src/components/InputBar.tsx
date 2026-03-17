import { useState, useRef, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Send, X, Loader2 } from "lucide-react";

interface InputBarProps {
  onSend: (prompt: string, files: File[]) => void;
  isLoading: boolean;
}

const SUGGESTED_PROMPTS = [
  "DCF Model",
  "Investment Memo",
  "Compare Companies",
  "Risk Factors",
  "Financial Ratios",
];

export function InputBar({ onSend, isLoading }: InputBarProps) {
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if ((!prompt.trim() && files.length === 0) || isLoading) return;
    onSend(prompt.trim(), files);
    setPrompt("");
    setFiles([]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    const pdfFiles = newFiles.filter((f) => f.type === "application/pdf");
    const totalFiles = [...files, ...pdfFiles].slice(0, 5);
    setFiles(totalFiles);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChipClick = (chipPrompt: string) => {
    setPrompt(chipPrompt);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="border-t border-border/40 bg-background/80 backdrop-blur-xl p-3 md:p-4">
      <div className="mx-auto max-w-3xl space-y-3">
        {/* Suggested prompts */}
        {files.length === 0 && !prompt && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((chip) => (
              <button
                key={chip}
                onClick={() => handleChipClick(chip)}
                className="rounded-full border border-border/50 bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground hover:border-emerald-500/30 transition-all duration-200"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* File chips */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {files.map((file, i) => (
              <div
                key={`${file.name}-${i}`}
                className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-muted/30 px-2.5 py-1.5 text-xs group"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded bg-red-500/15 text-red-400 text-[9px] font-bold">
                  PDF
                </div>
                <span className="max-w-[120px] truncate text-foreground/80">
                  {file.name}
                </span>
                <span className="text-muted-foreground text-[10px]">
                  {formatFileSize(file.size)}
                </span>
                <button
                  onClick={() => removeFile(i)}
                  className="ml-0.5 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {files.length < 5 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-dashed border-border/50 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-emerald-500/40 transition-all"
              >
                + Add more
              </button>
            )}
          </div>
        )}

        {/* Input area */}
        <div className="flex items-end gap-2 rounded-xl border border-border/50 bg-muted/20 p-2 focus-within:border-emerald-500/40 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-emerald-500"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || files.length >= 5}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your financial documents..."
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground/60 max-h-32 min-h-[32px] py-1.5"
            style={{
              height: "auto",
              minHeight: "32px",
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = Math.min(target.scrollHeight, 128) + "px";
            }}
            disabled={isLoading}
          />

          <Button
            size="icon"
            className="h-8 w-8 shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            onClick={handleSubmit}
            disabled={isLoading || (!prompt.trim() && files.length === 0)}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
