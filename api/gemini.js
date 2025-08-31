export default async function handler(request, response) {
    if (request.method !== 'POST') {
      return response.status(405).json({ error: 'Method not allowed' });
    }
  
    const { prompt } = request.body;
  
    if (!prompt) {
      return response.status(400).json({ error: 'Prompt is required' });
    }
  
    // This securely gets the API key you stored in Vercel.
    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
  
    const systemPrompt = `You are a friendly and helpful support and billing assistant for Klar Hub. Your purpose is to answer user questions about the scripts. 
      **Formatting Rules:**
      - Your answers must be concise and to the point.
      - When listing multiple items (like features or prices), YOU MUST use bullet points.
      - Use bold text for key terms like feature names or prices to make them stand out.
      
      **Product Information:**
      - Product Name: Klar Hub
      - The product is paid and 100% undetected.
      
      **Supported Games & Features:**
      - **Football Fusion 2 (FF2):** Ball Magnets, Pull Vector, Enhanced Movement (Jump & Speed), No Jump Cooldown, Custom Catch Effects, and more.
      - **Ultimate Football (UF):** Football Size Manipulation, Arm Resize, Enhanced Movement (Jump & Speed), No-Clip (Utility), and more.
      - **Murders VS Sheriffs Duels (MVSD):** Advanced Triggerbot, Hitbox Extender, Enhanced Movement (Jump & Speed), Player ESP.
      - **Arsenal:** Silent Aim, Advanced Hitbox Manipulation, Triggerbot, Visual Tags (Admin, etc.).
  
      **Billing & Pricing Information:**
      - 1 Week Access: $1.50
      - 1 Month Access: $2.50
      - 3 Month Access: $3.75
      - 6 Month Access: $5.50
      - Lifetime Access: $15.00
      - Extreme Alt Gen: $1.00
      
      When asked about prices, provide the relevant price clearly. Do not make up features. If you don't know an answer, politely say you don't have that information.`;
  
    try {
      const geminiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });
  
      if (!geminiResponse.ok) {
        console.error('Gemini API Error:', await geminiResponse.text());
        return response.status(500).json({ error: 'Failed to fetch response from AI.' });
      }
  
      const result = await geminiResponse.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  
      if (text) {
        return response.status(200).json({ text });
      } else {
        return response.status(500).json({ error: 'No response from AI.' });
      }
    } catch (error) {
      console.error('Proxy Error:', error);
      return response.status(500).json({ error: 'An internal error occurred.' });
    }
  }
