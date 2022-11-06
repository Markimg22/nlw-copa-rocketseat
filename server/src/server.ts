import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';

import {
  poolRoutes,
  userRoutes,
  guessRoutes,
  authRoutes,
  gameRoutes,
} from './routes';

async function boostrap() {
  const fastify = Fastify({
    logger: true,
  });
  await fastify.register(cors, {
    origin: true,
  });
  await fastify.register(jwt, {
    secret:
      'adajlsdjalkjdlajslALSDALJDLAJasdaj19301231@)!U#)!*@)#(*!@)(#*)$!@#j12312312-0i-da-a-da-dka-0ksda-0k1',
  });
  await fastify.register(poolRoutes);
  await fastify.register(userRoutes);
  await fastify.register(guessRoutes);
  await fastify.register(authRoutes);
  await fastify.register(gameRoutes);
  await fastify.listen({ port: 3333, host: '0.0.0.0' });
}

boostrap();
