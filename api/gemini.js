export default async function handler(request, response) {
    if (request.method !== 'POST') {
        response.setHeader('Allow', ['POST']);
        return response.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt, history } = request.body;

    if (!prompt) {
        return response.status(400).json({ error: 'Prompt is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("GEMINI_API_KEY is not set in environment variables.");
        return response.status(500).json({ error: 'Server configuration error.' });
    }

    // Updated model version to the correct preview date
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    let onlineMembers = 'several'; // Default value

    try {
        // Fetch Discord member count
        const discordRes = await fetch('https://discord.com/api/guilds/1357439616877072545/widget.json');
        if (discordRes.ok) {
            const discordData = await discordRes.json();
            if (discordData.presence_count) {
                onlineMembers = discordData.presence_count;
            }
        }
    } catch (e) {
        console.error("Could not fetch Discord member count:", e);
        // Continue without failing the request
    }

    const systemPrompt = `You are Klaro, the friendly and helpful AI assistant for Klar Hub. Your purpose is to answer user questions about the scripts. There are currently ${onlineMembers} members online in the Discord.
      **Formatting Rules:**
      - Your answers must be concise and to the point.
      - When listing multiple items (like features or prices), YOU MUST use bullet points (using a hyphen, e.g., "- Item 1").
      - Use bold text for key terms like feature names or prices to make them stand out.
      
      **Product Information:**
      - Product Name: Klar Hub
      - The product is paid and 100% undetected.
      
      **Supported Games & Features:**
      - **Football Fusion 2 (FF2):** Ball Magnets, Pull Vector, Enhanced Movement (Jump & Speed), No Jump Cooldown, Custom Catch Effects, QB Aimbot, Auto Guard, Auto QB, Auto Rush, Auto Boost, Auto Getup, Auto Reset, Auto Swat, Auto Catch, Auto Jump, Tackle Reach, Endzone Reach, Dive Power, Click Tackle, Head Resizement, Quick TP, Visualize Football Path, Football Highlight, No Texture (Boost FPS), Destroy Stadium, No Weather, Time of Day, Field of View (FOV), Jump/Dive Prediction, Streamer Mode, No Football Trail.
      - **Ultimate Football (UF):** Football Size Manipulation, Arm Resize, Enhanced Movement (Jump & Speed), No-Clip (Utility), Player ESP, Infinite Stamina.
      - **Murders VS Sheriffs Duels (MVSD):** Advanced Triggerbot, Hitbox Extender, Enhanced Movement (Jump & Speed), Player ESP, Silent Aim, Rapid Fire.
      - **Arsenal:** Silent Aim, Advanced Hitbox Manipulation, Unlock All Skins, Infinite Ammo, Visual Tags (Admin, etc.).
      - **Flag Football:** Full Magnet & Aimbot Suite, Player Enhancements (Speed, Jump), Full Auto-Play Suite (Catch, Rush), Visual Helpers (ESP, Paths), and more.

      **Billing & Pricing Information:**
      - **1 Week Access:** $1.50
      - **1 Month Access:** $2.50 (or 450 Robux)
      - **3 Month Access:** $3.75 (or 800 Robux)
      - **6 Month Access:** $5.50 (or 1225 Robux)
      - **Lifetime Access:** $15.00
      - **Extreme Alt Gen:** $1.00
      
      When asked about prices, provide the relevant price clearly. Do not make up features. If you don't know an answer, politely say you don't have that information.`;

    // Ensure history is an array and map it correctly
    const contents = Array.isArray(history) 
        ? history.map(msg => ({
            role: msg.role === 'ai' ? 'model' : 'user',
            parts: [{ text: msg.text }]
        })) 
        : [];
        
    contents.push({ role: 'user', parts: [{ text: prompt }] });

    try {
        const geminiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemPrompt }] },
                contents: contents,
            }),
        });

        if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text();
            console.error('Gemini API Error:', errorText);
            return response.status(geminiResponse.status).json({ error: 'Failed to fetch response from AI.', details: errorText });
        }

        const result = await geminiResponse.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (text) {
            return response.status(200).json({ text });
        } else {
            return response.status(500).json({ error: 'No response text received from AI.' });
        }
    } catch (error) {
        console.error('Proxy Error:', error);
        return response.status(500).json({ error: 'An internal error occurred.' });
    }
}
