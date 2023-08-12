import { Data, Effect, pipe } from 'effect';
import { z } from 'zod';

export class EnvError extends Data.TaggedClass('EnvError')<{}> {}

export class InsertAdminError extends Data.TaggedClass(
  'InsertAdminError'
)<{}> {}

const schemaEnv = z.object({
  FASTIFY_PORT: z.string(),
  PLANETSCALE_URL: z.string().refine(async (val) => val.length <= 8),
});

const env = {
  parsed: {
    FASTIFY_PORT: `3000`,
    PLANETSCALE_URL: 'bar',
  },
};

const initFastify = (port: number) => `fastifyInstance ${port}`;
const db = async (n: string) => [n];

pipe(
  Effect.Do,
  Effect.tap(() => Effect.log('Parsing env variables...')),
  Effect.bind('env', () =>
    Effect.tryPromise({
      catch: () => new EnvError(),
      try: () => schemaEnv.parseAsync(env.parsed),
    })
  ),
  Effect.tap(() => Effect.log('Initalizing Fastify web server and routes...')),
  Effect.bind('fastifyInstance', ({ env }) =>
    Effect.sync(() => initFastify(parseInt(env.FASTIFY_PORT, 10)))
  ),
  Effect.tap(({ env }) =>
    Effect.log(`Started fastify on port ${env.FASTIFY_PORT}`)
  ),
  Effect.bind('admin-user', ({ env }) =>
    Effect.tryPromise({
      catch: () => new InsertAdminError(),
      try: async () => await db(env.PLANETSCALE_URL),
    })
  ),
  Effect.tap(() => Effect.log('Inserted admin user to DB')),
  Effect.catchTag('InsertAdminError', () => Effect.succeed('err'))
)
  .pipe(Effect.tap((x) => Effect.log(x)))
  .pipe(Effect.runFork);
