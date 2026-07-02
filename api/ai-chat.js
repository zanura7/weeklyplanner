const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.VITE_9ROUTER_API_KEY || process.env.NINE_ROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: '9router API key not configured' });
  }

  const baseUrl = (process.env.VITE_9ROUTER_BASE_URL || process.env.NINE_ROUTER_BASE_URL || 'https://9.viber.id/v1').replace(/\/+$/, '');

  try {
    const upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': req.headers.origin || 'https://my.speedplan.space',
        'X-Title': 'Speed Planner',
      },
      body: JSON.stringify(req.body),
    });

    res.status(upstream.status);
    upstream.headers.forEach((value, key) => {
      if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    if (req.body?.stream && upstream.body) {
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      const reader = upstream.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(Buffer.from(value));
      }
      return res.end();
    }

    const text = await upstream.text();
    return res.send(text);
  } catch (error) {
    console.error('AI proxy failed:', error);
    return res.status(500).json({ error: 'AI proxy failed' });
  }
}