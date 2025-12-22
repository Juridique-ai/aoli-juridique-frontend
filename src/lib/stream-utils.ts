// Shared utilities for handling SSE streams and JSON extraction

/**
 * Extract JSON from content that may have text before/after
 */
export function extractJSON(content: string): {
  json: Record<string, unknown> | null;
  textBefore: string;
  textAfter: string;
} {
  if (!content) return { json: null, textBefore: "", textAfter: "" };

  // Handle markdown code blocks
  let processedContent = content;
  if (content.includes("```json")) {
    const match = content.match(/```json\s*([\s\S]*?)```/);
    if (match) {
      try {
        return {
          json: JSON.parse(match[1].trim()),
          textBefore: content.substring(0, content.indexOf("```json")).trim(),
          textAfter: content.substring(content.lastIndexOf("```") + 3).trim(),
        };
      } catch {
        // Continue to other methods
      }
    }
  }

  // Find the JSON object in the content
  const jsonStart = processedContent.indexOf("{");
  if (jsonStart === -1) return { json: null, textBefore: content, textAfter: "" };

  // Find matching closing brace
  let depth = 0;
  let jsonEnd = -1;
  for (let i = jsonStart; i < processedContent.length; i++) {
    if (processedContent[i] === "{") depth++;
    else if (processedContent[i] === "}") {
      depth--;
      if (depth === 0) {
        jsonEnd = i;
        break;
      }
    }
  }

  if (jsonEnd === -1) return { json: null, textBefore: content, textAfter: "" };

  const jsonStr = processedContent.substring(jsonStart, jsonEnd + 1);
  const textBefore = processedContent.substring(0, jsonStart).trim();
  const textAfter = processedContent.substring(jsonEnd + 1).trim();

  try {
    const parsed = JSON.parse(jsonStr);
    return { json: parsed, textBefore, textAfter };
  } catch {
    return { json: null, textBefore: content, textAfter: "" };
  }
}

/**
 * Try to parse JSON from content (handles markdown code blocks and mixed text+JSON)
 */
export function tryParseJSON(content: string): Record<string, unknown> | null {
  if (!content) return null;
  try {
    let trimmed = content.trim();

    // Handle markdown code blocks
    if (trimmed.startsWith("```")) {
      const lines = trimmed.split("\n");
      lines.shift();
      if (lines[lines.length - 1]?.trim() === "```") {
        lines.pop();
      }
      trimmed = lines.join("\n").trim();
    }

    // Direct JSON
    if (trimmed.startsWith("{")) {
      return JSON.parse(trimmed);
    }

    // Look for JSON object anywhere in the content
    const { json } = extractJSON(content);
    return json;
  } catch {
    return null;
  }
}

/**
 * Check if content looks like it contains JSON
 */
export function looksLikeJSON(content: string): boolean {
  if (!content) return false;
  const trimmed = content.trim();
  return (
    trimmed.startsWith("{") ||
    trimmed.includes('"phase"') ||
    trimmed.includes('"proceduralDocument"') ||
    trimmed.includes('"legalOpinion"') ||
    trimmed.includes("```json")
  );
}

/**
 * Process SSE data line
 */
export function parseSSEData(line: string): { type: string; data: string } | null {
  if (!line.startsWith("data: ")) return null;
  const data = line.slice(6);
  if (data === "[DONE]") return { type: "done", data: "" };

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}
