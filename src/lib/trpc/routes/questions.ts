import { QuestionType, Role, type Question } from '@prisma/client';
import { z } from 'zod';
import prisma from '../db';
import { authenticate } from '../middleware';
import { t } from '../t';

export const getQuestions: () => Promise<Question[]> = async () => {
	return await prisma.question.findMany({
		orderBy: [{ order: 'asc' }],
	});
};

export const questionsRouter = t.router({
	/**
	 * Gets all questions.
	 */
	get: t.procedure.query(async (): Promise<Question[]> => {
		return await getQuestions();
	}),

	/**
	 * Creates a new question. User must be an admin.
	 *
	 * TODO: Only supports SENTENCE questions for now
	 */
	create: t.procedure.use(authenticate).mutation(async (req): Promise<Question> => {
		if (req.ctx.user.role !== Role.ADMIN) {
			throw new Error('You have insufficient permissions to perform this action.');
		}
		// TODO: Only supports adding at end for now
		const lastOrder = Math.max(...(await getQuestions()).map((question) => question.order));
		return await prisma.question.create({
			data: {
				label: '',
				type: QuestionType.SENTENCE,
				order: lastOrder + 1,
			},
		});
	}),

	/**
	 * Updates the given application questions. User must be an admin.
	 */
	update: t.procedure
		.use(authenticate)
		.input(z.record(z.string()))
		.mutation(async (req): Promise<void> => {
			if (req.ctx.user.role !== Role.ADMIN) {
				throw new Error('You have insufficient permissions to perform this action.');
			}
			for (const id of Object.keys(req.input)) {
				await prisma.question.update({
					where: { id },
					data: { label: req.input[id] },
				});
			}
		}),

	/**
	 * Deletes a question. User must be an admin.
	 */
	delete: t.procedure
		.use(authenticate)
		.input(z.string())
		.mutation(async (req): Promise<void> => {
			if (req.ctx.user.role !== Role.ADMIN) {
				throw new Error('You have insufficient permissions to perform this action.');
			}
			await prisma.question.delete({ where: { id: req.input } });
		}),
});