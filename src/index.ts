import { Effect, pipe } from 'effect';

pipe(Effect.succeed(25))
  .pipe(Effect.tap((x) => Effect.log(x)))
  .pipe(Effect.runFork);
