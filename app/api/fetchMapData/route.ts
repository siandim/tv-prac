import { NextResponse } from "next/server";

export async function GET() {
    const response = await fetch(
        "https://www.kymesonet.org/maps/production/latest.json",
        {
          // cache: "force-cache", // Force the response to use cached data if available
          next: { revalidate: 600 }, 
        }
      );
      const data = await response.json();
     return  NextResponse.json(data);
  }