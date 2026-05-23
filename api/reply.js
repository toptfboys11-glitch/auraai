export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { return res.status(200).end(); }
  if (req.method !== 'POST') { return res.status(405).json({ error: 'Method not allowed' }); }

  try {
    const { msg, industry, channel } = req.body;
    const GEMINI_KEY = 'AIzaSyBKhAFgwHr_2kBQwWVvLyyuJ_0BeAEltdc';
    
    const prompt = `You are a senior export sales manager with 10+ years experience in ${industry}.

Customer ${channel} message: "${msg}"

Write 3 different replies. Rules:
- Natural human tone, NOT robotic
- 3 to 5 sentences each
- No cliches like "I hope this finds you well"
- Sound like a real salesperson

Use EXACTLY this format:

[PROFESSIONAL]
Reply 1 here.

[CLOSING]
Reply 2 here.

[NEGOTIATION]
Reply 3 here.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 1000, temperature: 0.7 }
        })
      }
    );

    const data = await response.json();
    console.log('Gemini status:', response.status);
    console.log('Gemini data:', JSON.stringify(data).substring(0, 300));

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return res.status(200).json({ text });

  } catch (e) {
    console.error('Error:', e);
    return res.status(500).json({ error: e.message });
  }
}
