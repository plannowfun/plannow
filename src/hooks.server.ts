import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ resolve, event }) => {
    const protocol = event.request.headers.get('x-forwarded-proto') || 'http';
    const origin = `${protocol}://plannow.fun`;
    if (event.request.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
                'Access-Control-Allow-Origin': origin,
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Credentials': 'true'
            }
        });
    }
    const response = await resolve(event);
    response.headers.append('Access-Control-Allow-Origin', origin);
    response.headers.append('Access-Control-Allow-Credentials', 'true');
    return response;
};
