/**
 * Retry Submission Button Component
 * 
 * Allows mentors to retry failed or completed submissions.
 * Shows confirmation dialog before retrying.
 */

"use client";

import { useState } from "react";
import { AlertCircle, RotateCcw, Loader2 } from "lucide-react";
import { retrySubmissionEvaluation } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface RetryButtonProps {
  groupId: string;
  submissionId: string;
  status: string;
  retryCount?: number;
  onRetrySuccess?: () => void;
}

export function RetrySubmissionButton({
  groupId,
  submissionId,
  status,
  retryCount = 0,
  onRetrySuccess,
}: RetryButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canRetry = ["FAILED", "COMPLETED", "REJECTED"].includes(status) && retryCount < 3;

  const handleRetry = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await retrySubmissionEvaluation(groupId, submissionId);

      if (response.success) {
        setShowConfirm(false);
        onRetrySuccess?.();
      }
    } catch (err: any) {
      setError(err.message || "Failed to retry submission");
    } finally {
      setIsLoading(false);
    }
  };

  if (!canRetry) {
    return null;
  }

  if (showConfirm) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 space-y-3">
        <div className="flex gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-900">Retry evaluation?</p>
            <p className="text-sm text-yellow-800 mt-1">
              This will reset the submission status and re-run the entire evaluation pipeline.
              {retryCount > 0 && ` (Attempt ${retryCount + 1}/3)`}
            </p>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => setShowConfirm(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRetry}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4 mr-2" />
                Retry Evaluation
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setShowConfirm(true)}
      className="gap-2"
    >
      <RotateCcw className="h-4 w-4" />
      Retry {retryCount > 0 && `(${retryCount})`}
    </Button>
  );
}
