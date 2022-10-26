import type { RenderOptions } from '@testing-library/react';
import { render } from '@testing-library/react';
import type { InitialEntry } from 'history';
import type { ReactElement } from 'react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';

import i18next from './i18n';

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'queries'> & {
    initialEntries?: InitialEntry[];
  },
) =>
  render(ui, {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={options?.initialEntries}>
        <I18nextProvider i18n={i18next}>{children}</I18nextProvider>
      </MemoryRouter>
    ),
    ...options,
  });

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };
export { default as generateRandomDid } from './generate-random-did';
