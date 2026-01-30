import { NextResponse } from "next/server";

type ForwardRequest = {
  url?: string;
  payload?: Record<string, unknown>;
};

const isValidHttpUrl = (value: string) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

export async function POST(request: Request) {
  const body = (await request.json()) as ForwardRequest;
  const targetUrl = body.url?.trim();

  if (!targetUrl || !isValidHttpUrl(targetUrl)) {
    return NextResponse.json(
      { error: "Invalid webhook URL." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body.payload ?? {}),
    });

    const contentType = response.headers.get("content-type") ?? "text/plain";
    const text = await response.text();

    return new Response(text, {
      status: response.status,
      headers: {
        "content-type": contentType,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to reach webhook.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 502 },
    );
  }
}
