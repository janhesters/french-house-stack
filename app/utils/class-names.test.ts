import { describe } from 'vitest';

import { classNames } from './class-names';

describe('classNames()', () => {
  test('given no class names: returns an empty string', () => {
    expect(classNames()).toEqual('');
  });

  test('given some class names: concatenates them', () => {
    expect(
      classNames('bg-gray-100', '', undefined, 'block px-4 py-2 '),
    ).toEqual('bg-gray-100 block px-4 py-2');
  });

  test('given conditional class names: concatenates them', () => {
    expect(
      classNames(false && 'py-8 grid', true && 'mt-10 block', 'px-4'),
    ).toEqual('mt-10 block px-4');
  });

  test('given empty class names: filters them out', () => {
    expect(classNames('bg-gray-100', ' ', 'block', ' ', 'py-2')).toEqual(
      'bg-gray-100 block py-2',
    );
  });
});
