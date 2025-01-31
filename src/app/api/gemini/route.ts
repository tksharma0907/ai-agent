import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function POST(request: Request) {
  if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    return NextResponse.json(
      { text: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    const { prompt } = await request.json();
    
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { text: "Invalid prompt" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const fullPrompt = `${prompt} Answer this in context of current real estate market trends and news. 
      Include relevant statistics and market insights where applicable. 
      If mentioning specific locations, focus on major global markets unless specified otherwise.`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    
    return NextResponse.json({ text: response.text() });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { text: "Error processing your request. Please try again." },
      { status: 500 }
    );
  }
} 