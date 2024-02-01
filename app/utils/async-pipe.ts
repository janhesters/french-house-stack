type Callback = (a: any) => MaybePromise<unknown>;
type FunToReturnType<F> = F extends Callback
  ? ReturnType<F> extends Promise<infer U>
    ? U
    : ReturnType<F>
  : never;
type EmptyPipe = (a: never) => Promise<never>;

type AsyncPipeReturnType<
  FS extends Callback[],
  P = Parameters<FS[0]>[0],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
> = FS extends [...infer _, infer Last]
  ? (a: P) => Promise<FunToReturnType<Last>>
  : EmptyPipe;

type AsyncParameters<
  FS extends Callback[],
  P = Parameters<FS[0]>[0],
> = FS extends [infer H, ...infer Rest]
  ? H extends (p: P) => unknown
    ? Rest extends Callback[]
      ? [H, ...AsyncParameters<Rest, FunToReturnType<H>>]
      : [{ error: '__A_PARAMETER_NOT_A_FUNCTION__' }, ...Rest]
    : [
        { error: '__INCORRECT_FUNCTION__'; provided: H; expected_parameter: P },
        ...Rest,
      ]
  : FS;

type MaybePromise<T> = T | Promise<T>;

export function asyncPipe<A, B>(
  ab: (a: A) => MaybePromise<B>,
): (a: A) => Promise<B>;
export function asyncPipe<A, B, C>(
  ab: (a: A) => MaybePromise<B>,
  bc: (b: B) => MaybePromise<C>,
): (a: A) => Promise<C>;
export function asyncPipe<A, B, C, D>(
  ab: (a: A) => MaybePromise<B>,
  bc: (b: B) => MaybePromise<C>,
  cd: (c: C) => MaybePromise<D>,
): (a: A) => Promise<D>;
export function asyncPipe<A, B, C, D, E>(
  ab: (a: A) => MaybePromise<B>,
  bc: (b: B) => MaybePromise<C>,
  cd: (c: C) => MaybePromise<D>,
  de: (d: D) => MaybePromise<E>,
): (a: A) => Promise<E>;
export function asyncPipe<A, B, C, D, E, F>(
  ab: (a: A) => MaybePromise<B>,
  bc: (b: B) => MaybePromise<C>,
  cd: (c: C) => MaybePromise<D>,
  de: (d: D) => MaybePromise<E>,
  // eslint-disable-next-line unicorn/prevent-abbreviations
  ef: (e: E) => MaybePromise<F>,
): (a: A) => Promise<F>;
export function asyncPipe<A, B, C, D, E, F, G>(
  ab: (a: A) => MaybePromise<B>,
  bc: (b: B) => MaybePromise<C>,
  cd: (c: C) => MaybePromise<D>,
  de: (d: D) => MaybePromise<E>,
  // eslint-disable-next-line unicorn/prevent-abbreviations
  ef: (e: E) => MaybePromise<F>,
  fg: (f: F) => MaybePromise<G>,
): (a: A) => Promise<G>;
export function asyncPipe<A, B, C, D, E, F, G, H>(
  ab: (a: A) => MaybePromise<B>,
  bc: (b: B) => MaybePromise<C>,
  cd: (c: C) => MaybePromise<D>,
  de: (d: D) => MaybePromise<E>,
  // eslint-disable-next-line unicorn/prevent-abbreviations
  ef: (e: E) => MaybePromise<F>,
  fg: (f: F) => MaybePromise<G>,
  gh: (g: G) => MaybePromise<H>,
): (a: A) => Promise<H>;

/**
 * Composes functions which can, but don't have to, return promises.
 *
 * @param fns - The functions to compose.
 * @returns A function that takes an argument and returns a promise.
 */
export function asyncPipe<FS extends any[]>(
  ...fns: AsyncParameters<FS>
): AsyncPipeReturnType<FS>;
export function asyncPipe(...fns: AsyncParameters<any[]>) {
  if (fns.length === 0) return () => Promise.resolve();
  // eslint-disable-next-line prettier/prettier
  return (x: Parameters<(typeof fns)[0]>[0]) =>
    fns.reduce(async (y, function_) => function_(await y), x);
}
