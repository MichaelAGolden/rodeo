/**
 * This script is used to seed the database with example data.
 * WARNING: This script will reset the database before seeding.
 * To use it, run `npx prisma db seed`
 *
 * You can then log in to some test accounts with the following emails
 * (password is empty):
 *
 * hacker@yopmail.com (sample hacker account)
 * admin@yopmail.com (sample admin account)
 */

import { lucia } from 'lucia';
import 'lucia/polyfill/node';
import { MY_TIMEZONE, events, questions } from './data';
import { PrismaClient, Status, Prisma } from '@prisma/client';
import { prisma as prismaAdapter } from '@lucia-auth/adapter-prisma';

const prisma = new PrismaClient();

const auth = lucia({
	adapter: prismaAdapter(prisma, {
		user: 'authUser',
		session: 'authSession',
		key: 'authKey',
	}),
	env: 'DEV',
});

async function register(email: string, password: string): Promise<string> {
	const user = await auth.createUser({
		attributes: {
			email: email,
			roles: ['HACKER'],
			status: 'VERIFIED',
		},
		key: {
			providerId: 'email',
			providerUserId: email,
			password: password,
		},
	});
	return user.userId;
}

async function main() {
	// Reset database
	await prisma.announcement.deleteMany();
	await prisma.decision.deleteMany();
	await prisma.event.deleteMany();
	await prisma.question.deleteMany();
	await prisma.settings.deleteMany();
	await prisma.user.deleteMany();
	await prisma.authUser.deleteMany();
	await prisma.authSession.deleteMany();
	await prisma.authKey.deleteMany();

	// Create example announcement
	await prisma.announcement.create({
		data: {
			body: 'We are now accepting applications for HackTX! The deadline is Friday, September 17th at 11:59 PM.',
			published: new Date('2021-09-01T00:00:00'),
		},
	});

	// Create example questions
	// Remove the generate function (used when creating dummy users) before creating questions
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	await prisma.question.createMany({ data: questions.map(({ generate, ...keep }) => keep) });
	const createdQuestions = await prisma.question.findMany();

	// Create example events
	await prisma.event.createMany({ data: events });

	// Create default settings
	await prisma.settings.create({ data: { timezone: MY_TIMEZONE } });

	// Generate fake users and status changes
	// NOTE: By "fake", I mean the fact that there is no way to sign in
	// as these users, since they don't have passwords, and hashing
	// passwords is slow by design
	const authUsers: Prisma.AuthUserCreateManyInput[] = [];
	const users: Prisma.UserCreateManyInput[] = [];
	const statusChanges: Prisma.StatusChangeCreateManyInput[] = [];
	const maxSecondsBetweenStatusChanges = 60 * 60 * 24 * 7; // 1 week
	const startingTime = new Date();
	// We must allow enough time for 5 status changes
	// (CREATED -> VERIFIED -> APPLIED -> ACCEPTED/REJECTED/WAITLISTED -> CONFIRMED/DECLINED)
	startingTime.setSeconds(-maxSecondsBetweenStatusChanges * 6);

	for (let i = 0; i < 1000; i++) {
		const id = `hacker${String(i).padStart(3, '0')}@yopmail.com`;
		const statusFlow = generateStatusFlow(id, startingTime, maxSecondsBetweenStatusChanges);
		// Generate a completed application for each hacker
		const application = {};
		for (const question of createdQuestions) {
			// IMPORTANT: This assumes that the questions variable is ordered by the order field!!
			application[question.id] = questions[question.order].generate();
		}
		authUsers.push({
			id: id,
			email: id,
			roles: ['HACKER'],
			status: statusFlow[statusFlow.length - 1].newStatus,
		});
		users.push({ authUserId: id, application });
		statusChanges.push(...statusFlow);
	}

	await prisma.authUser.createMany({ data: authUsers });
	// HACK: This is to avoid unique key constraint errors due to the
	// trigger that automatically creates a User when an AuthUser is
	// created and the fact that Prisma doesn't support bulk updates yet
	await prisma.user.deleteMany();
	await prisma.user.createMany({ data: users });
	// HACK: Delete status changes autogenerated by trigger since we are
	// generating them manually (must do this AFTER creating fake users
	// but BEFORE creating test hacker and admin)
	await prisma.statusChange.deleteMany();
	await prisma.statusChange.createMany({ data: statusChanges });

	// Create test hacker and admin
	// (must do this AFTER calling prisma.user.deleteMany() and prisma.statusChange.deleteMany())
	await register('hacker@yopmail.com', '');
	const adminId = await register('admin@yopmail.com', '');
	await prisma.authUser.update({ where: { id: adminId }, data: { roles: ['ADMIN'] } });

	// Generate decisions for fake users
	const decisions: Prisma.DecisionCreateManyInput[] = [];
	const hackers = await prisma.authUser.findMany({
		where: {
			roles: { has: 'HACKER' },
			status: { in: ['APPLIED', 'WAITLISTED'] },
		},
		orderBy: { id: 'asc' },
	});
	for (const hacker of hackers) {
		// Don't decide on every user probability
		if (random() >= 0.5) {
			decisions.push({
				userId: hacker.id,
				status: randomElement(['ACCEPTED', 'REJECTED', 'WAITLISTED']),
			});
		}
	}
	await prisma.decision.createMany({ data: decisions });
}

/**
 * Generates a random status flow for a hacker.
 *
 * @param id The hacker's id
 * @param startingTime The earliest time the first status change can
 * occur (ideally somewhat close to the current date so the graph
 * looks realistic)
 * @param maxSecondsBetweenStatusChanges The maximum number of seconds
 * that can pass between each status change
 */
function generateStatusFlow(
	id: string,
	startingTime: Date,
	maxSecondsBetweenStatusChanges: number
): Prisma.StatusChangeCreateManyInput[] {
	const statusChanges: Prisma.StatusChangeCreateManyInput[] = [];
	const attritionRate = 0.1; // 10% of hackers drop out at each stage
	let lastTimestamp = startingTime;
	for (const status of ['CREATED', 'VERIFIED', 'APPLIED'] as Status[]) {
		lastTimestamp = new Date(
			lastTimestamp.getTime() + 1000 * maxSecondsBetweenStatusChanges * random()
		);
		statusChanges.push({ newStatus: status, timestamp: lastTimestamp, userId: id });
		if (random() < attritionRate) {
			return statusChanges;
		}
	}
	const afterStatusAppliedRandom = randomElement([
		'ACCEPTED',
		'REJECTED',
		'WAITLISTED',
	] as Status[]);
	lastTimestamp = new Date(
		lastTimestamp.getTime() + 1000 * maxSecondsBetweenStatusChanges * random()
	);
	statusChanges.push({
		newStatus: afterStatusAppliedRandom,
		timestamp: lastTimestamp,
		userId: id,
	});

	if (random() >= attritionRate && afterStatusAppliedRandom == 'ACCEPTED') {
		lastTimestamp = new Date(
			lastTimestamp.getTime() + 1000 * maxSecondsBetweenStatusChanges * random()
		);
		statusChanges.push({
			newStatus: randomElement(['CONFIRMED', 'DECLINED'] as Status[]),
			timestamp: lastTimestamp,
			userId: id,
		});
	}
	return statusChanges;
}

// Quick and dirty seedable random number generator taken from https://stackoverflow.com/a/19303725/16458492
let seed = 0;
export function random() {
	const x = Math.sin(seed++) * 10000;
	return x - Math.floor(x);
}

export function randomElement<T>(array: T[]): T {
	return array[Math.floor(random() * array.length)];
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
