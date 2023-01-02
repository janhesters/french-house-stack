import { describe } from 'vitest';

import { assert } from '~/test/assert';

import { classNames } from './class-names';

describe('classNames()', () => {
  assert({
    given: 'some class names',
    should: 'concatenate them',
    actual: classNames('bg-gray-100', '', undefined, 'block px-4 py-2 '),
    expected: 'bg-gray-100 block px-4 py-2',
  });

  assert({
    given: 'conditional class names',
    should: 'concatenate them',
    actual: classNames(false && 'py-8 grid', true && 'mt-10 block', 'px-4'),
    expected: 'mt-10 block px-4',
  });

  assert({
    given: 'empty class names',
    should: 'filter them out',
    actual: classNames('bg-gray-100', ' ', 'block', ' ', 'py-2'),
    expected: 'bg-gray-100 block py-2',
  });
});
