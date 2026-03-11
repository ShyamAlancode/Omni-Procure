import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.BACKEND_URL || "http://localhost:8000";

// Generic proxy helper
async function proxyToBackend(
  endpoint: string,
  method: string,
  body?: unknown
): Promise<NextResponse> {
  try {
    const fetchInit: RequestInit = {
      method,
      headers: { "Content-Type": "application/json" },
    };
    if (body !== undefined) {
      fetchInit.body = JSON.stringify(body);
    }
    const res = await fetch(`${API_BASE}${endpoint}`, fetchInit);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Backend unreachable", detail: err.message },
      { status: 502 }
    );
  }
}

// POST /api/procurement  → POST /agent/procure
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  return proxyToBackend("/agent/procure", "POST", body);
}

// GET /api/procurement?job_id=xxx  → GET /agent/status/{job_id}
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const job_id = searchParams.get("job_id");
  const user_id = searchParams.get("user_id");

  if (job_id) {
    return proxyToBackend(`/agent/status/${job_id}`, "GET");
  }

  if (user_id) {
    return proxyToBackend(`/agent/orders/${user_id}`, "GET");
  }

  return NextResponse.json({ error: "Missing job_id or user_id query param" }, { status: 400 });
}
