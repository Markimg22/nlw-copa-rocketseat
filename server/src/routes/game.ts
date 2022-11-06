import { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { prisma } from '../lib/prisma';
import { authenticate } from '../plugins/authenticate';

export async function gameRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/pools/:id/games',
    { onRequest: [authenticate] },
    async (request, response) => {
      const getPoolsParams = z.object({
        id: z.string(),
      });
      const { id } = getPoolsParams.parse(request.params);
      const games = await prisma.game.findMany({
        orderBy: {
          date: 'desc',
        },
        include: {
          guesses: {
            where: {
              participant: {
                userId: request.user.sub,
                poolId: id,
              },
            },
          },
        },
      });
      return response.status(200).send({
        games: games.map((game) => {
          return {
            ...game,
            guess: game.guesses.length > 0 ? game.guesses[0] : null,
            guesses: undefined,
          };
        }),
      });
    }
  );

  fastify.post(
    '/pools/:poolId/games/:gameId/guesses',
    { onRequest: [authenticate] },
    async (request, response) => {
      const createGuessParams = z.object({
        poolId: z.string(),
        gameId: z.string(),
      });
      const createGuessBody = z.object({
        firstTeamPoints: z.number(),
        secondTeamPoints: z.number(),
      });
      const { poolId, gameId } = createGuessParams.parse(request.params);
      const { firstTeamPoints, secondTeamPoints } = createGuessBody.parse(
        request.body
      );
      const participant = await prisma.participant.findUnique({
        where: {
          userId_poolId: {
            poolId,
            userId: request.user.sub,
          },
        },
      });
      if (!participant) {
        return response.status(400).send({
          message: 'You are not allowed to create a guess inside this pool.',
        });
      }
      const guess = await prisma.guess.findUnique({
        where: {
          participantId_gameId: {
            participantId: participant.id,
            gameId,
          },
        },
      });
      if (guess) {
        return response.status(400).send({
          message: 'You already send a guess to this game on this pool.',
        });
      }
      const game = await prisma.game.findUnique({
        where: {
          id: gameId,
        },
      });
      if (!game) {
        return response.status(400).send({
          message: 'Game not found.',
        });
      }
      if (game.date < new Date()) {
        return response.status(400).send({
          message: 'You cannot send guesses after the game.',
        });
      }
      await prisma.guess.create({
        data: {
          gameId,
          participantId: participant.id,
          firstTeamPoints,
          secondTeamPoints,
        },
      });
      return response.status(201).send({});
    }
  );
}
