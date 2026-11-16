export async function onRequestPost(context) {
  const { request } = context;

  try {
    const payload = await request.json();
    const question = String(payload?.question || '').trim();

    if (!question) {
      return new Response(JSON.stringify({ error: 'Question is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const lower = question.toLowerCase();
    let answer = 'I can help you explore suppliers, buyers, and growth opportunities in your network.';

    if (lower.includes('supplier')) {
      answer = 'Try filtering by supplier in the Business Search panel and shortlist vendors by region, niche, and demand fit.';
    } else if (lower.includes('buyer') || lower.includes('lead')) {
      answer = 'Use the contact form to capture buyer interest and start a demo call with prospects in your pipeline.';
    } else if (lower.includes('marketing') || lower.includes('growth')) {
      answer = 'Focus on brand visibility, partner outreach, and repeatable sales follow-up to accelerate cross-border demand.';
    } else if (lower.includes('pricing') || lower.includes('cost')) {
      answer = 'Start with a lean pilot: define the target market, validate demand, and measure conversion before scaling spend.';
    }

    return new Response(JSON.stringify({ answer }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ answer: 'I could not process your request right now. Please try again in a moment.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
