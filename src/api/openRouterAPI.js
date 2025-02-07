const apiKey = process.env.REACT_APP_OPENROUTER_API_KEY;

const fetchAIContent = async (genre) => {
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`, // Secure API key usage
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "google/gemini-2.0-flash-thinking-exp:free",
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": `Generate a list of 30 words related to the genre: ${genre}. 
                                The words should be commonly associated with this genre and suitable for a charades game. 
                                For example, if recieved "famous rappers" - returns a list of famous rappers like akon, 2pac, eminem and etc.
                                Do not include explanations, just return a clean JSON array of words.`
                            }
                        ]
                    }
                ]
            })
        });

        const data = await response.json();

        if (!data.choices || data.choices.length === 0) {
            console.error("Invalid AI response format:", data);
            return [];
        }

        let aiContent = data.choices[0].message.content.trim();

        // Handle the case where the response is wrapped in triple backticks
        if (aiContent.startsWith("```json")) {
            aiContent = aiContent.replace(/```json|```/g, "").trim();
        }

        // Try parsing the response into an array
        try {
            const parsedWords = JSON.parse(aiContent);
            if (Array.isArray(parsedWords)) {
                return parsedWords;
            } else {
                console.error("Parsed data is not an array:", parsedWords);
                return [];
            }
        } catch (parseError) {
            console.error("Error parsing AI response:", parseError, "Response:", aiContent);
            return [];
        }

    } catch (error) {
        console.error("Error fetching AI content:", error);
        return [];
    }
};

export default fetchAIContent;
