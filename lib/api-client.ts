interface RequestOptions extends RequestInit {
  params?: Record<string, string | number>;
}

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(
  endpoint: string,
  { params, ...options }: RequestOptions = {}
): Promise<T> {
  try {
    const url = new URL(endpoint, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url.toString(), {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new ApiError(data.error || "エラーが発生しました");
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : "エラーが発生しました"
    );
  }
}
