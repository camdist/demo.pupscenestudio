export async function onRequestPost(context) {
  const { request, env } = context;
  const body = await request.json().catch(() => null);
  if (!body || !body.event) return new Response('Bad Request', { status: 400 });
  if (!env.DB) return Response.json({ ok: false, error: 'D1 binding DB is not configured' }, { status: 503 });

  const email = (body.email || '').trim().toLowerCase() || null;
  const demoLimit = 10;

  if (body.event === 'check_allowance') {
    if (!email) return Response.json({ ok: true, allowed: false, generation_count: 0, remaining: 0 });
    const row = await env.DB.prepare(`SELECT COUNT(*) AS c FROM demo_events WHERE email = ? AND event = 'storyboard_generated'`).bind(email).first();
    const count = Number(row?.c || 0);
    return Response.json({ ok: true, allowed: count < demoLimit, generation_count: count, remaining: Math.max(0, demoLimit - count) });
  }

  if (body.event === 'storyboard_generated' && email) {
    const row = await env.DB.prepare(`SELECT COUNT(*) AS c FROM demo_events WHERE email = ? AND event = 'storyboard_generated'`).bind(email).first();
    const count = Number(row?.c || 0);
    if (count >= demoLimit) return Response.json({ ok: false, allowed: false, generation_count: count, remaining: 0 }, { status: 429 });
  }

  const known = ['event','email','session_id','ts','path','referrer','viewport','user_agent'];
  const extra = Object.fromEntries(Object.entries(body).filter(([k]) => !known.includes(k)));
  await env.DB.prepare(`INSERT INTO demo_events (event,email,session_id,ts,path,referrer,viewport,user_agent,payload) VALUES (?,?,?,?,?,?,?,?,?)`)
    .bind(
      body.event,
      email,
      body.session_id || null,
      body.ts || new Date().toISOString(),
      body.path || null,
      body.referrer || null,
      body.viewport || null,
      body.user_agent || null,
      JSON.stringify(extra)
    ).run();

  if (body.event === 'storyboard_generated' && email) {
    const row = await env.DB.prepare(`SELECT COUNT(*) AS c FROM demo_events WHERE email = ? AND event = 'storyboard_generated'`).bind(email).first();
    const count = Number(row?.c || 0);
    return Response.json({ ok: true, allowed: count < demoLimit, generation_count: count, remaining: Math.max(0, demoLimit - count) });
  }
  return Response.json({ ok: true });
}
