const GEMINI_API_KEY = ""; // ⚠️ API 키가 유출되어 비활성화되었습니다. 새 키를 발급받아 입력해주세요.
const MODEL_NAME = "gemini-1.5-flash";

async function getChatResponse(userMessage, webtoonsData, chatHistory = []) {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userMessage, webtoonsData, chatHistory })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `Server error: ${response.status}`);
        }

        return data.text;
    } catch (error) {
        console.error("Chat Error:", error);
        return `죄송합니다. 챗봇 연결에 문제가 발생했습니다. (오류: ${error.message})`;
    }
}
