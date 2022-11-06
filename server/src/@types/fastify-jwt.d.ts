import '@fastify/jwt';

declare module '@fastify/jwt' {
  // eslint-disable-next-line no-unused-vars
  interface FastifyJWT {
    user: {
      sub: string;
      name: string;
      avatarUrl: string;
    };
  }
}
