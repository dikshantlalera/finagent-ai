import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorCardProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorCard({ message, onRetry }: ErrorCardProps) {
  return (
    <Card className="border-red-500/30 bg-red-500/5 backdrop-blur overflow-hidden">
      <CardContent className="flex items-start gap-3 pt-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/15">
          <AlertCircle className="h-4 w-4 text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-400 mb-1">Analysis Failed</p>
          <p className="text-xs text-red-300/80 break-words">{message}</p>
        </div>
        {onRetry && (
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            className="shrink-0 gap-1.5 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
