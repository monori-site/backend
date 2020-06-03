// This seems like a bad idea to do, but I honestly don't care
// Find another solution? Make a PR!
import Website from '../core/internals/Website';

declare global {
  var website: Website;

  namespace NodeJS {
    interface Global {
      website: Website;
    }
  }
}