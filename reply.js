export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const { msg, industry, channel } = body;

    const prompt = `You are a senior export sales manager with 10+ years experience in ${industry}.

Customer ${channel} message: "${msg}"

Write 3 different replies. Follow these rules strictly:
- Natural human tone, NOT robotic or AI-sounding
- 3 to 5 sentences each
- No "I hope this finds you well" or clichés
- Sound like a real experienced salesperson

Reply format - use EXACTLY these markers on their own line:

[PROFESSIONAL]
Write reply 1 here.

[CLOSING]
Write reply 2 here.

[NEGOTIATION]
Write reply 3 here.`;

    const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await apiRes.json();
    const text = data.content?.[0]?.text || '';

    return new Response(JSON.stringify({ text }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch(e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
