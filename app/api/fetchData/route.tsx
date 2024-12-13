// pages/api/getDynamicData.js
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get the file path to `dynamicData.json`
    const filePath = path.join(process.cwd(), "dynamicData.json");

    // Read the file contents
    const fileContents = fs.readFileSync(filePath, "utf8");

    // Parse the data to JSON and return it
    const data = JSON.parse(fileContents);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to read data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
