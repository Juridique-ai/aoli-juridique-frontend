const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-functions-key": API_KEY!,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = "API request failed";
    let errorCode: string | undefined;

    try {
      const error = await response.json();
      errorMessage = error.error || error.message || errorMessage;
      errorCode = error.code;
    } catch {
      // Response wasn't JSON
    }

    throw new ApiError(errorMessage, response.status, errorCode);
  }

  return response.json();
}

export async function apiPost<T>(endpoint: string, data: unknown): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
