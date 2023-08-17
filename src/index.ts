import { Effect, pipe } from 'effect';

const refetchToken = () =>
  Effect.tryPromise({
    try: () => Promise.resolve({ token: `good` }),
    catch: () => new Error(`Cannot `),
  }).pipe(Effect.tap(() => Effect.log(`Refetching`)));

const verifyCredentials = (params: { token: string }) =>
  pipe(
    Effect.succeed(params),
    Effect.filterOrElse(({ token }) => token === 'good', refetchToken)
  ).pipe(Effect.tap((x) => Effect.log(x)));

pipe(verifyCredentials({ token: `good` }), Effect.runFork);

pipe(verifyCredentials({ token: `bad` }), Effect.runFork);
