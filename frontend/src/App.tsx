import { useState, useCallback } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/Navbar";
import { SettingsModal } from "@/components/SettingsModal";
import { ChatArea } from "@/components/ChatArea";
import { InputBar } from "@/components/InputBar";
import { analyzeDocuments } from "@/lib/api";
import type { ChatMessage } from "@/lib/types";

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastPrompt, setLastPrompt] = useState("");
  const [lastFiles, setLastFiles] = useState<File[]>([]);

  const handleSend = useCallback(
    async (prompt: string, files: File[]) => {
      let apiKey = localStorage.getItem("finagent_api_key") || "";
      if (!apiKey) {
        setSettingsOpen(true);
        return;
      }

      if (files.length === 0) {
        // Show an error if no files uploaded
        const errorMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "error",
          content: "Please upload at least one PDF document to analyze.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
        return;
      }

      // Check file sizes
      const oversized = files.find((f) => f.size > 20 * 1024 * 1024);
      if (oversized) {
        const errorMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "error",
          content: `File "${oversized.name}" exceeds the 20MB size limit.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
        return;
      }

      // Store for retry
      setLastPrompt(prompt);
      setLastFiles(files);

      // Add user message
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: prompt,
        files: files.map((f) => f.name),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const response = await analyzeDocuments(files, prompt, apiKey);

        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          analysis: response.analysis,
          downloads: response.downloads,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (error) {
        const errorContent =
          error instanceof Error ? error.message : "An unexpected error occurred";

        const errorMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "error",
          content: errorContent,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleRetry = useCallback(
    (messageId: string) => {
      // Remove the error message
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      // Retry with last prompt and files
      if (lastPrompt || lastFiles.length > 0) {
        handleSend(lastPrompt, lastFiles);
      }
    },
    [lastPrompt, lastFiles, handleSend]
  );

  return (
    <TooltipProvider>
      <div className="flex h-screen flex-col bg-background">
        <Navbar onOpenSettings={() => setSettingsOpen(true)} />

        <ChatArea
          messages={messages}
          isLoading={isLoading}
          onRetry={handleRetry}
        />

        <InputBar onSend={handleSend} isLoading={isLoading} />

        <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      </div>
    </TooltipProvider>
  );
}

export default App;
