import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Importing the client we created earlier

export async function GET() {
  try {
    // 1. Try to create a snippet in the database
    const newSnippet = await db.snippet.create({
      data: {
        title: "Test Snippet",
        language: "javascript",
        code: "console.log('Hello from Neon DB!')",
      },
    });

    // 2. Return the result to the browser
    return NextResponse.json({ 
      message: "Success! Database is connected.", 
      data: newSnippet 
    });

  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ 
      message: "Failed to connect to DB", 
      error: error 
    }, { status: 500 });
  }
}