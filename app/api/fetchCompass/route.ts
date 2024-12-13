// import { NextResponse } from "next/server";

// export async function GET() {
//     try {
//       const response = await fetch("https://www.kymesonet.org/json/SiteCamAngleInfo.json");
//       if (!response.ok) {
//         throw new Error("Failed to fetch the compass data");
//       }
//       const data = await response.json();
//       return NextResponse.json(data);
//     } catch (error) {
//       return NextResponse.json({ error:"Not working" }, { status: 500 });
//     }
//   }
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://www.kymesonet.org/json/SiteCamAngleInfo.json", {
      // cache: "force-cache", // Force the response to use cached data if available
      next: { revalidate: 3600 }, // Revalidate the cache every 1 hour (3600 seconds)
    });

    if (!response.ok) {
      throw new Error("Failed to fetch the compass data");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Not working" }, { status: 500 });
  }
}
