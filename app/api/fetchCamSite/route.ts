import { NextResponse } from "next/server";

export async function GET() {
    const response = await fetch('https://www.kymesonet.org/json/appSiteCam/appSiteCam.json', 
        {
            // cache: "force-cache", // Force the response to use cached data if available
            next: { revalidate: 600 }, 
          });

    if (!response.ok) {
        throw new Error('Failed to fetch weather data');
    }

    const data = await response.json();

    return NextResponse.json(data);
}