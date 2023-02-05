import type { RenderOptions } from '@testing-library/react';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { I18nextProvider } from 'react-i18next';

import i18next from './i18n';

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'queries'>,
) =>
  render(ui, {
    wrapper: ({ children }) => (
      <I18nextProvider i18n={i18next}>{children}</I18nextProvider>
    ),
    ...options,
  });

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };
export { generateRandomDid } from './generate-random-did.server';
export { unstable_createRemixStub as createRemixStub } from '@remix-run/testing';
