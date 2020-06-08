import * as mocked from '../mock';
import * as core from '../core';

describe('Infrastructure', () => {
  let website!: core.Website;
  let router!: mocked.MockedRouter;

  beforeEach(() => {
    // Mock the website itself
    website = mocked.mockWebsite();

    // Mock a router instance
    router = mocked.mockRouter('/', website);
  });

  describe('Infrastructure | Routing', () => {
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

  /*
  describe('Infrastructure | Render Engine', () => {
    it('should be a React component', () => {
      const { component } = engine('partials/Navbar', {
        req: {
          session: null
        }
      });

      expect(component).toBeDefined();
      expect(component).toBe(React.Component);
    });
  });
  */
});