"use client";

import { useState, useCallback, useRef } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

interface StreamingState {
  isStreaming: boolean;
  content: string;
  currentTool: string | null;
  error: string | null;
}

interface UseStreamingOptions {
  onContent?: (content: string) => void;
  onToolStart?: (tool: string) => void;
  onToolEnd?: (tool: string) => void;
  onComplete?: (fullContent: string) => void;
  onError?: (error: string) => void;
}

interface StreamEvent {
  type: "content" | "tool_start" | "tool_end" | "done" | "error";
  content?: string;
  tool?: string;
  error?: string;
}

export function useStreaming(options: UseStreamingOptions = {}) {
  const [state, setState] = useState<StreamingState>({
    isStreaming: false,
    content: "",
    currentTool: null,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const stream = useCallback(
    async (endpoint: string, data: Record<string, unknown>) => {
      // Abort any existing stream
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      setState({
        isStreaming: true,
        content: "",
        currentTool: null,
        error: null,
      });

      try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-functions-key": API_KEY!,
            Accept: "text/event-stream",
          },
          body: JSON.stringify(data),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `HTTP ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const decoder = new TextDecoder();
        let buffer = "";
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") {
                setState((prev) => ({
                  ...prev,
                  isStreaming: false,
                  currentTool: null,
                }));
                options.onComplete?.(fullContent);
                return fullContent;
              }

              try {
                const event: StreamEvent = JSON.parse(data);

                switch (event.type) {
                  case "content":
                    if (event.content) {
                      fullContent += event.content;
                      setState((prev) => ({
                        ...prev,
                        content: fullContent,
                      }));
                      options.onContent?.(fullContent);
                    }
                    break;

                  case "tool_start":
                    if (event.tool) {
                      setState((prev) => ({
                        ...prev,
                        currentTool: event.tool!,
                      }));
                      options.onToolStart?.(event.tool);
                    }
                    break;

                  case "tool_end":
                    setState((prev) => ({
                      ...prev,
                      currentTool: null,
                    }));
                    if (event.tool) {
                      options.onToolEnd?.(event.tool);
                    }
                    break;

                  case "error":
                    const errorMsg = event.error || "Unknown error";
                    setState((prev) => ({
                      ...prev,
                      error: errorMsg,
                      isStreaming: false,
                    }));
                    options.onError?.(errorMsg);
                    return;

                  case "done":
                    setState((prev) => ({
                      ...prev,
                      isStreaming: false,
                      currentTool: null,
                    }));
                    options.onComplete?.(fullContent);
                    return fullContent;
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }

        setState((prev) => ({
          ...prev,
          isStreaming: false,
        }));
        options.onComplete?.(fullContent);
        return fullContent;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        const errorMsg =
          error instanceof Error ? error.message : "Stream failed";
        setState((prev) => ({
          ...prev,
          error: errorMsg,
          isStreaming: false,
        }));
        options.onError?.(errorMsg);
      }
    },
    [options]
  );

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setState((prev) => ({
        ...prev,
        isStreaming: false,
        currentTool: null,
      }));
    }
  }, []);

  const reset = useCallback(() => {
    abort();
    setState({
      isStreaming: false,
      content: "",
      currentTool: null,
      error: null,
    });
  }, [abort]);

  return {
    ...state,
    stream,
    abort,
    reset,
  };
}
