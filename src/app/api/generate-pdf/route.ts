import { NextRequest, NextResponse } from "next/server";

const YET_REPORT_API = "https://api.yet.report";
const API_KEY = process.env.YET_REPORT_API_KEY || "V2Yo3NNGSh7gEKqsrsrnE5JxIuEp75SU2RKnmYoA";
const POLL_INTERVAL = 2000; // 2 seconds
const MAX_POLL_TIME = 120000; // 2 minutes

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { success: false, error: "Content is required" },
        { status: 400 }
      );
    }

    // Step 1: Submit job - pass content directly with legal style
    // yet.report API only accepts: content (required) and style (optional)
    const submitResponse = await fetch(`${YET_REPORT_API}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({
        content,
        style: "legal",
      }),
    });

    if (!submitResponse.ok) {
      const errorData = await submitResponse.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, error: errorData.error || `API error: ${submitResponse.status}` },
        { status: submitResponse.status }
      );
    }

    const submitData = await submitResponse.json();

    if (!submitData.success || !submitData.job_id) {
      return NextResponse.json(
        { success: false, error: submitData.error || "Failed to get job ID" },
        { status: 500 }
      );
    }

    const jobId = submitData.job_id;

    // Step 2: Poll for completion at /status/{jobId}
    const startTime = Date.now();

    while (Date.now() - startTime < MAX_POLL_TIME) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));

      const statusResponse = await fetch(`${YET_REPORT_API}/status/${jobId}`, {
        headers: {
          "x-api-key": API_KEY,
        },
      });

      if (!statusResponse.ok) {
        continue; // Retry on error
      }

      const statusData = await statusResponse.json();

      if (statusData.status === "complete" && (statusData.pdf_url || statusData.pdfUrl)) {
        return NextResponse.json({
          success: true,
          pdfUrl: statusData.pdf_url || statusData.pdfUrl,
        });
      }

      if (statusData.status === "failed") {
        return NextResponse.json(
          { success: false, error: statusData.error || "PDF generation failed" },
          { status: 500 }
        );
      }

      // Continue polling if pending/processing
    }

    // Timeout
    return NextResponse.json(
      { success: false, error: "PDF generation timed out" },
      { status: 504 }
    );
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
