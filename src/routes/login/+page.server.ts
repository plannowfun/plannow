import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/data/db'
import { getTime } from '$lib/data/tools';

export const actions = {
	default: async ({ request, cookies }) => {
		// Get form data
		const data = await request.formData();
		const phone = data.get('phone');
		const password = data.get('password');

		// Check if type of phone is not a file
		if (typeof phone === 'string') {
			// Find user by phone number
			const user = await prisma.user.findFirstOrThrow({
				where: {
					phone: parseInt(phone)
				}
			});

			// Check if password is correct
			if (user.password === password) {
				// Set cookies
				cookies.set('logged_in', 'true', { path: '/', secure: false });
				console.log('cookies set to true!!!')

				// Get time
				const time = getTime(user.date, user.view);

				// Redirect to plan page
				throw redirect(303, `/${user.id}/${user.watching_member ?? user.id}/plan/${user.view}/${time}/${user.subject_view ?? 0}`);
			}
		}
	}
};