import fuzzysort from 'fuzzysort';
import authenticate from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { Role } from '@prisma/client';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ cookies, url }) => {
	const { magicLink } = await authenticate(cookies.get('magicLink'), Role.ADMIN);
	const users = await trpc().getUsers(magicLink);
	const search = url.searchParams.get('search');
	if (search === null) {
		return { users };
	}
	if (search == '') {
		throw redirect(301, '/admin');
	}
	const results = fuzzysort.go(search, users, { key: 'name' });
	return { users: results.map((user) => user.obj), search };
}) satisfies PageServerLoad;