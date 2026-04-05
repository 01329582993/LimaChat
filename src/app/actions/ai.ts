"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function getAiReaction(formTitle: string, formDescription: string, question: string, answer: string) {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
        console.error("AI Error: GOOGLE_GENERATIVE_AI_API_KEY is missing in ENV");
        return null;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            You are a friendly and helpful chat host for a form titled "${formTitle}".
            The form is about: "${formDescription}".
            
            The user just answered the following question:
            Question: "${question}"
            User's Answer: "${answer}"
            
            Provide a VERY SHORT (one sentence max), conversational, and encouraging reaction to their answer. 
            Do NOT ask a new question. Just acknowledge what they said in a natural way that fits the form's context.
            If the answer is simple (like "yes" or "no"), be brief but polite.
            If the answer is detailed, be appreciative but concise.
            
            Example reaction: "That sounds like a fascinating perspective, thanks for sharing that!"
            Keep it under 15 words.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();
        console.log("AI Reaction generated:", text);
        return text;
    } catch (error) {
        console.error("Gemini AI Error (getAiReaction):", error);
        return null;
    }
}

export async function generateFormFromPrompt(userPrompt: string) {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
        console.error("AI Error: GOOGLE_GENERATIVE_AI_API_KEY is missing in ENV");
        return null;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const prompt = `
            You are an expert form designer. Based on the user's objective, generate a structured form.
            User Objective: "${userPrompt}"
            
            Return a JSON object with the following structure:
            {
                "title": "Clear and concise form title",
                "description": "Short, engaging description",
                "questions": [
                    {
                        "type": "SHORT_TEXT" | "LONG_TEXT" | "MULTIPLE_CHOICE" | "CHECKBOX" | "DROPDOWN" | "RATING",
                        "prompt": "The question text",
                        "required": true,
                        "options": ["Option 1", "Option 2"] // Only if type is CHOICE/CHECKBOX/DROPDOWN
                    }
                ]
            }
            
            Guidelines:
            - Create between 3 to 6 questions.
            - Ensure a mix of question types if appropriate.
            - Options should be relevant and concise.
            - The tone should be professional yet conversational.
            - IMPORTANT: Return ONLY the JSON object. Do not include markdown code blocks or any other text.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Robust JSON extraction
        if (text.includes("```")) {
            text = text.replace(/```json|```/g, "").trim();
        }

        try {
            return JSON.parse(text);
        } catch (parseError) {
            console.error("AI JSON Parse Error:", parseError);
            console.error("Raw text was:", text);
            throw new Error("Failed to parse AI response");
        }
    } catch (error) {
        console.error("Gemini Generation Error (generateFormFromPrompt):", error);
        return null;
    }
}

export async function analyzeResponses(formTitle: string, questions: any[], responses: any[], chatHistory: { role: "user" | "model", content: string }[], userMessage: string) {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
        console.error("AI Error: GOOGLE_GENERATIVE_AI_API_KEY is missing in ENV");
        return null;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const prompt = `
            You are a top-tier data strategist for a form titled "${formTitle}".
            
            FORM STRUCTURE (Questions):
            ${JSON.stringify(questions, null, 2)}
            
            RESPONSES DATA:
            ${JSON.stringify(responses, null, 2)}
            
            CONTEXT:
            Your job is to provide short, direct, and MOTIVATING insights.
            
            RETURN FORMAT (JSON):
            {
                "message": "Your response here. Keep it SHORT and DIRECT. Do NOT use markdown symbols like *, #, -, or bolding. Use plain text only. Be punchy and professional.",
                "stats": [ 
                    {
                        "type": "METRIC" | "PROGRESS_CHART", 
                        "label": "Metric or Chart Label",
                        "value": "Number/String for METRIC (e.g. '85%', '24 Submissions')",
                        "percentage": number (0-100) for PROGRESS_CHART,
                        "description": "Short, clear explanation (plain text only)."
                    }
                ]
            }
            
            GUIDELINES:
            - NO MARKDOWN SYMBOLS: Never use #, *, -, or markdown lists.
            - SHORT & DIRECT: Get straight to the point. No fluff.
            - PROACTIVE: Call out key trends immediately.
            - CLEAN: Use simple, plain sentences that are easy to scan.
            - TONE: Professional, expert, and encouraging.
            
            USER MESSAGE: "${userMessage}"
            CHAT HISTORY: ${JSON.stringify(chatHistory)}
            
            IMPORTANT: Return ONLY the JSON object.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        if (text.includes("```")) {
            text = text.replace(/```json|```/g, "").trim();
        }

        try {
            return JSON.parse(text);
        } catch (parseError) {
            console.error("AI JSON Parse Error:", parseError);
            return { message: "I'm having trouble analyzing that right now. Could you try rephrasing?" };
        }
    } catch (error) {
        console.error("Gemini Analysis Error (analyzeResponses):", error);
        return { message: "Sorry, I encountered an error while analyzing the responses." };
    }
}

