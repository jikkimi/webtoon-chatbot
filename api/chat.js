const fetch = require('node-fetch');

const MODEL_NAME = "gemini-2.5-flash-lite";

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { userMessage, webtoonsData, chatHistory } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'API Key not configured on server.' });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;

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
            return res.status(response.status).json({ error: data.error?.message || 'Gemini API Error' });
        }

        const botResponse = data.candidates[0].content.parts[0].text;
        res.status(200).json({ text: botResponse });
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
