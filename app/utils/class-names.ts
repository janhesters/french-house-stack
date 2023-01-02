import { filter, join, map, pipe, trim } from 'ramda';

export const classNames = (...classes: (string | undefined | boolean)[]) =>
  pipe(filter(Boolean), map(trim), filter(Boolean), join(' '))(classes);
