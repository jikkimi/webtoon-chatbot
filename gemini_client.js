const GEMINI_API_KEY = "AIzaSyCCy8MdeUCBXlF3iM3B-xYHgc10q4Q_jak"; // Provided in request
const MODEL_NAME = "gemini-1.5-flash";

async function getChatResponse(userMessage, webtoonsData, chatHistory = []) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;

    // Construct the context
    const systemPrompt = `You are a webtoon recommendation expert. Your goal is to help users find webtoons from the provided database.
Rules:
1. Use only the provided webtoon data.
2. Recommend 3-5 works based on user preference.
3. If recommending, ALWAYS wrap the recommendation data in [RECOMMENDATIONS] and [/RECOMMENDATIONS] tags.
4. Inside the tags, provide a valid JSON array of objects:
   [
     {"title": "Webtoon Title", "reason": "Reason for recommendation", "line": "A style line"}
   ]
5. For any other text, put it outside the tags.
6. Support follow-up questions.

Webtoon Database Summary (Top 100):
${webtoonsData.slice(0, 100).map(w => `- ${w.title} (${w.genre?.join(', ') || 'N/A'}): ${w.story?.substring(0, 50)}...`).join('\n')}
(I have access to the full database of ${webtoonsData.length} works.)`;

    const messages = [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "I understand. I will provide recommendations based on your webtoon database." }] },
        ...chatHistory,
        { role: "user", parts: [{ text: userMessage }] }
    ];

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: messages })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || `HTTP error! status: ${response.status}`);
        }

        if (!data.candidates || data.candidates.length === 0) {
            throw new Error("No response from AI candidates.");
        }

        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("Gemini API Error details:", error);
        return `죄송합니다. 챗봇 연결에 문제가 발생했습니다. (오류: ${error.message})`;
    }
}
