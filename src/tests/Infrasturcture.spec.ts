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

  describe('Infrastructure | Website', () => {
    // do tests here
  });

  describe('Infrastructure | Routing', () => {
    // do tests here
  });

  describe('Infrastructure | Render Engine', () => {
    // do tests here
  });
});