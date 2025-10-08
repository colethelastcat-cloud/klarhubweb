export default async function handler(request, response) {
    const serverId = '1357439616877072545';
    const apiUrl = `https://discord.com/api/guilds/${serverId}/widget.json`;

    try {
        const discordResponse = await fetch(apiUrl);

        if (!discordResponse.ok) {
            // Forward Discord's error status if something goes wrong
            return response.status(discordResponse.status).json({ error: 'Failed to fetch Discord widget data.' });
        }

        const data = await discordResponse.json();
        
        // Allow requests from any origin (CORS)
        response.setHeader('Access-Control-Allow-Origin', '*');
        
        return response.status(200).json({
            onlineCount: data.presence_count || 0
        });

    } catch (error) {
        console.error('Error fetching Discord data:', error);
        return response.status(500).json({ error: 'Internal Server Error' });
    }
}
