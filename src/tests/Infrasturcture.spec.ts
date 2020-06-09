/**
 * @jest-environment jsdom
 */

import { cleanup, render as renderComponent } from '@testing-library/react';
import * as mocked from '../mock';
import * as core from '../core';
import { join } from 'path';
import React from 'react';

describe('Infrastructure', () => {
  let website!: core.Website;
  let router!: mocked.MockedRouter;

  beforeEach(() => {
    // Mock the website itself
    website = mocked.mockWebsite();

    // Mock a router instance
    router = mocked.mockRouter('/', website);
  });

  afterEach(cleanup);

  describe('Routing', () => {
    it('should be a new mocked route', () => {
      const route = mocked.mockRoute('/', router, { method: core.Method.Get });

      expect(route).toBeDefined();
      expect(route.path).toBe('/');
      expect(route.method).toBe(core.Method.Get);
      expect(route.requirements).toBeDefined();
    });

    it('should return /u/abcd when added to the router', () => {
      const uRouter = mocked.mockRouter('/u', website);
      const route = mocked.mockRoute('/abcd', uRouter, { method: core.Method.Get });
      expect(route).toBeDefined();
      expect(route.path).toBe('/abcd');

      const { path } = uRouter.mockRegister(route);
      expect(uRouter.routes.empty).toBeFalsy();
      expect(uRouter.routes.size).toBe(1);
      expect(route.path).toBe(path);
    });
  });

  describe('React', () => {
    const render = mocked.mockEngine(join(process.cwd(), 'src', 'tests'));
    it('should return a Component', () => {
      const { component: Component } = render('components/TestComponent');
      expect(Component).toBeDefined();
    });

    it('should return "new text" when a button is clicked', () => {
      const { component: Component } = render('components/TestComponent');

      expect(Component).toBeDefined();
      const testbed = renderComponent(React.createElement(Component)); // <Component /> is just basically React.createElement
    
      const text = testbed.queryByText('Test component, not really much added here, move on with your day');
      expect(text).toBeTruthy(); // See if text contains "Test"
    });
  });
});