import authenticate from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import type { Actions } from './$types';
import { Role } from '@prisma/client';
import { redirect } from '@sveltejs/kit';

const FILE_SIZE_LIMIT = 1 * 1024 * 1024; // 1 MB

export const load = async ({ cookies }) => {
	const user = await authenticate(cookies, [Role.HACKER]);
	return {
		user,
		settings: trpc(cookies).settings.getPublic(),
	};
};

export const actions: Actions = {
	save: async ({ cookies, request }) => {
		const formData = await request.formData();
		const data = Object.fromEntries(formData);
		const user = {
			...data,
			photoReleaseAgreed: data.photoReleaseAgreed === 'on',
			liabilityWaiverAgreed: data.liabilityWaiverAgreed === 'on',
			codeOfConductAgreed: data.codeOfConductAgreed === 'on',
			firstGeneration: data.firstGeneration === 'on',
			international: data.international === 'on',
			hackathonsAttended: Number(data.hackathonsAttended),
			race: formData.getAll('race').map((x) => x as string),
			workshops: formData.getAll('workshops').map((x) => x as string),
			dietaryRestrictions: formData.getAll('dietaryRestrictions').map((x) => x as string),
			lunch: data.lunch === 'on',
		};

		if (data.resume instanceof Object && data.resume?.size > FILE_SIZE_LIMIT) {
			return 'tooBig';
		}

		await trpc(cookies).users.update(user);
		return 'Saved!';
	},

	finish: async ({ cookies, request }) => {
		if (!(await trpc(cookies).settings.getPublic()).applicationOpen) {
			throw redirect(301, '/apply');
		}
		const formData = await request.formData();
		const data = Object.fromEntries(formData);
		const user = {
			...data,
			photoReleaseAgreed: data.photoReleaseAgreed === 'on',
			liabilityWaiverAgreed: data.liabilityWaiverAgreed === 'on',
			codeOfConductAgreed: data.codeOfConductAgreed === 'on',
			firstGeneration: data.firstGeneration === 'on',
			international: data.international === 'on',
			hackathonsAttended: Number(data.hackathonsAttended),
			race: formData.getAll('race').map((x) => x as string),
			workshops: formData.getAll('workshops').map((x) => x as string),
			dietaryRestrictions: formData.getAll('dietaryRestrictions').map((x) => x as string),
			lunch: data.lunch === 'on',
		};

		if (data.resume instanceof Object && data.resume?.size > FILE_SIZE_LIMIT) {
			return 'tooBig';
		}

		await trpc(cookies).users.update(user);
		return await trpc(cookies).users.submitApplication();
	},

	withdraw: async ({ cookies }) => {
		if (!(await trpc(cookies).settings.getPublic()).applicationOpen) {
			throw redirect(301, '/apply');
		}
		await trpc(cookies).users.update({});
	},

	confirm: async ({ cookies }) => {
		await trpc(cookies).users.rsvp('CONFIRMED');
	},

	decline: async ({ cookies }) => {
		await trpc(cookies).users.rsvp('DECLINED');
	},
};
