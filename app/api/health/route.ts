import { createApiResponse } from "@/lib/api-utils";

export async function GET() {
  return createApiResponse({ status: "ok" });
}
