import type { APIRoute } from 'astro';
import { savePushSubscription } from '../../../../lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const subscription = await request.json();
    
    if (!subscription || !subscription.endpoint) {
      return new Response(JSON.stringify({ error: 'Invalid subscription' }), { status: 400 });
    }

    const dbBinding = (locals as any).runtime?.env?.DB;
    const success = await savePushSubscription(subscription, dbBinding);

    if (success) {
      return new Response(JSON.stringify({ success: true }), { status: 201 });
    } else {
      return new Response(JSON.stringify({ error: 'Failed to save subscription' }), { status: 500 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
