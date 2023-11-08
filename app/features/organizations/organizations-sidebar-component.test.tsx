/* eslint-disable testing-library/render-result-naming-convention */
import { describe, expect, test } from 'vitest';

import {
  findHeaderTitle,
  findRenderBackButton,
  findRenderSearchBar,
  findRenderStaticSidebar,
} from './organizations-sidebar-component';

describe('findHeaderTitle()', () => {
  test('given an array of matches: returns the last item in the array that has a header title', () => {
    const matches = [
      {
        id: 'root',
        pathname: '/',
        params: { organizationSlug: 'tromp---schinner' },
        data: { headerTitle: 'wrong-title' },
        handle: { i18n: 'common' },
      },
      {
        id: 'routes/organization_.$organizationSlug',
        pathname: '/organizations/tromp---schinner',
        params: { organizationSlug: 'tromp---schinner' },
        data: { headerTitle: 'correct-title' },
        handle: { i18n: ['organizations', 'sidebar'] },
      },
      {
        id: 'routes/organization_.$organizationSlug.recordings',
        pathname: '/organizations/tromp---schinner/recordings',
        params: { organizationSlug: 'tromp---schinner' },
        data: { currentPage: 1, organizationName: 'Tromp - Schinner' },
        handle: { i18n: 'recordings' },
      },
    ];

    const actual = findHeaderTitle(matches);
    const expected = 'correct-title';

    expect(actual).toEqual(expected);
  });
});

describe('findRenderSearchBar()', () => {
  test('given an array of matches: returns the last item in the array that has renderSearchBar', () => {
    const matches = [
      {
        id: 'root',
        pathname: '/',
        params: { organizationSlug: 'tromp---schinner' },
        data: { renderSearchBar: false },
        handle: { i18n: 'common' },
      },
      {
        id: 'routes/organization_.$organizationSlug',
        pathname: '/organizations/tromp---schinner',
        params: { organizationSlug: 'tromp---schinner' },
        data: { renderSearchBar: true },
        handle: { i18n: ['organizations', 'sidebar'] },
      },
      {
        id: 'routes/organization_.$organizationSlug.recordings',
        pathname: '/organizations/tromp---schinner/recordings',
        params: { organizationSlug: 'tromp---schinner' },
        data: { currentPage: 1, organizationName: 'Tromp - Schinner' },
        handle: { i18n: 'recordings' },
      },
    ];

    const actual = findRenderSearchBar(matches);
    const expected = true;

    expect(actual).toEqual(expected);
  });
});

describe('findRenderBackButton()', () => {
  test('given an array of matches: returns the last item in the array that has renderBackButton', () => {
    const matches = [
      {
        id: 'root',
        pathname: '/',
        params: { organizationSlug: 'tromp---schinner' },
        data: { renderBackButton: false },
        handle: { i18n: 'common' },
      },
      {
        id: 'routes/organization_.$organizationSlug',
        pathname: '/organizations/tromp---schinner',
        params: { organizationSlug: 'tromp---schinner' },
        data: { renderBackButton: true },
        handle: { i18n: ['organizations', 'sidebar'] },
      },
      {
        id: 'routes/organization_.$organizationSlug.recordings',
        pathname: '/organizations/tromp---schinner/recordings',
        params: { organizationSlug: 'tromp---schinner' },
        data: { currentPage: 1, organizationName: 'Tromp - Schinner' },
        handle: { i18n: 'recordings' },
      },
    ];

    const actual = findRenderBackButton(matches);
    const expected = true;

    expect(actual).toEqual(expected);
  });
});

describe('findRenderStaticSidebar()', () => {
  test('given an array of matches: returns the last item in the array that has renderStaticSidebar', () => {
    const matches = [
      {
        id: 'root',
        pathname: '/',
        params: { organizationSlug: 'tromp---schinner' },
        data: { renderStaticSidebar: false },
        handle: { i18n: 'common' },
      },
      {
        id: 'routes/organization_.$organizationSlug',
        pathname: '/organizations/tromp---schinner',
        params: { organizationSlug: 'tromp---schinner' },
        data: { renderStaticSidebar: true },
        handle: { i18n: ['organizations', 'sidebar'] },
      },
      {
        id: 'routes/organization_.$organizationSlug.recordings',
        pathname: '/organizations/tromp---schinner/recordings',
        params: { organizationSlug: 'tromp---schinner' },
        data: { currentPage: 1, organizationName: 'Tromp - Schinner' },
        handle: { i18n: 'recordings' },
      },
    ];

    const actual = findRenderStaticSidebar(matches);
    const expected = true;

    expect(actual).toEqual(expected);
  });
});
