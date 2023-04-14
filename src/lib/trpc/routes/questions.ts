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
		const orders = (await getQuestions()).map((question) => question.order);
		const lastOrder = orders.length == 0 ? 0 : Math.max(...orders);
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
		.input(z.record(z.record(z.any())))
		.mutation(async (req): Promise<void> => {
			if (req.ctx.user.role !== Role.ADMIN) {
				throw new Error('You have insufficient permissions to perform this action.');
			}
			for (const questionId in req.input) {
				await prisma.question.update({
					where: { id: questionId },
					data: { ...req.input[questionId] },
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
			await prisma.question.deleteMany({ where: { id: req.input } });
		}),
});
