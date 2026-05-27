export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.VITE_OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://musas-digitales.vercel.app',
            'X-Title': 'Musas Digitales',
        },
        body: JSON.stringify(req.body),
    })

    const data = await response.json()
    return res.status(response.status).json(data)
}