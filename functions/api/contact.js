export async function onRequestPost(context) {
  const { request } = context;
  let payload;

  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'The request body must be valid JSON.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }

  const name = String(payload?.name || '').trim();
  const email = String(payload?.email || '').trim();
  const company = String(payload?.company || '').trim();
  const message = String(payload?.message || '').trim();

  if (!name || !email || !company || !message) {
    return new Response(JSON.stringify({ error: 'All fields are required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailValid) {
    return new Response(JSON.stringify({ error: 'A valid email is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }

  return new Response(JSON.stringify({
    error: 'Contact submissions are not configured and your request was not saved.'
  }), {
    status: 501,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}
