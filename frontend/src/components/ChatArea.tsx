import { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BrainCircuit, User, FileText, Loader2 } from "lucide-react";
import type { ChatMessage } from "@/lib/types";
import { DcfCard } from "./results/DcfCard";
import { MemoCard } from "./results/MemoCard";
import { ComparisonCard } from "./results/ComparisonCard";
import { QaCard } from "./results/QaCard";
import { RatioCard } from "./results/RatioCard";
import { ErrorCard } from "./results/ErrorCard";

interface ChatAreaProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onRetry?: (messageId: string) => void;
}

export function ChatArea({ messages, isLoading, onRetry }: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md space-y-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20 flex items-center justify-center">
              <BrainCircuit className="h-8 w-8 text-emerald-500" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              FinAgent AI
            </h2>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              Upload financial documents and ask questions. Get DCF models,
              investment memos, company comparisons, and more.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            {[
              "\"Build a 5-year DCF model\"",
              "\"Write an investment memo\"",
              "\"Compare revenue trends\"",
              "\"Calculate profit margins\"",
            ].map((example) => (
              <div
                key={example}
                className="rounded-lg border border-border/30 bg-muted/20 p-2.5 text-left"
              >
                {example}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-2">
            {/* User message */}
            {msg.role === "user" && (
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <User className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 pt-0.5">
                  {msg.content && (
                    <p className="text-sm text-foreground">{msg.content}</p>
                  )}
                  {msg.files && msg.files.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {msg.files.map((f, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 rounded bg-muted/30 px-2 py-0.5 text-[10px] text-muted-foreground"
                        >
                          <FileText className="h-3 w-3" />
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Assistant result */}
            {msg.role === "assistant" && msg.analysis && (
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500">
                  <BrainCircuit className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  {msg.analysis.analysis_type === "dcf" && (
                    <DcfCard
                      analysis={msg.analysis}
                      excelFile={msg.downloads?.excel}
                    />
                  )}
                  {msg.analysis.analysis_type === "memo" && (
                    <MemoCard
                      analysis={msg.analysis}
                      wordFile={msg.downloads?.word}
                    />
                  )}
                  {msg.analysis.analysis_type === "comparison" && (
                    <ComparisonCard
                      analysis={msg.analysis}
                      excelFile={msg.downloads?.excel}
                    />
                  )}
                  {msg.analysis.analysis_type === "custom_qa" && (
                    <QaCard analysis={msg.analysis} />
                  )}
                  {msg.analysis.analysis_type === "ratio_analysis" && (
                    <RatioCard
                      analysis={msg.analysis}
                      excelFile={msg.downloads?.excel}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Error */}
            {msg.role === "error" && (
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500/20">
                  <BrainCircuit className="h-3.5 w-3.5 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <ErrorCard
                    message={msg.content || "Unknown error occurred"}
                    onRetry={onRetry ? () => onRetry(msg.id) : undefined}
                  />
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500">
              <BrainCircuit className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-border/30 bg-muted/20 px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
              <span className="text-sm text-muted-foreground">
                Analyzing your documents...
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
