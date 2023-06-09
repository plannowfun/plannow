import type { HandleFetch } from '@sveltejs/kit';

export const handleFetch = (async ({ event, request, fetch }) => {
    if (request.url.startsWith('https://api.my-domain.com/')) {
        request.headers.set('cookie', event.request.headers.get('cookie'));
    }

    return fetch(request);
}) satisfies HandleFetch;