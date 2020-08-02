/**
 * Copyright (c) 2020 August
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { getOption, randomChars } from '../../util';
import type { Website } from '.';
import * as errors from './errors';
import { Queue } from '@augu/immutable';

/** Interface of the options used in this OAuth2 provider */
interface OAuth2ProviderInfo {
  /** If we should validate the request incoming */
  useStates?: boolean;
}

export interface NormalOAuthCallback {
  error_description?: string; // eslint-disable-line
  error?: string;
  state?: string;
}

/**
 * Base class of what an OAuth2 provider should run like
 */
export abstract class OAuth2Provider {
  /** The website instance */
  private website!: Website;

  /** The stats to validate the request */
  public states?: Queue<string>;

  /**
   * Creates a new OAuth2 Provider
   * @param info The information
   */
  constructor(private options: OAuth2ProviderInfo) {
    const useStates = getOption(options, 'useStates', true);

    if (useStates) this.states = new Queue();
  }

  /**
   * Initalises the provider
   * @param website The website
   */
  init(website: Website) {
    this.website = website;
    return this;
  }

  /**
   * Getter if it's enabled
   */
  public abstract get isEnabled(): boolean;

  /**
   * Getter to format the feature
   */
  public abstract get feature(): string;

  /**
   * Function to check if we should use states
   */
  get useStates() {
    return getOption(this.options, 'useStates', true);
  }

  /**
   * Used for the "redirect" portion
   * @param ip The user's IP
   * @param opts The redirect URI options
   */
  async redirect(ip: string, format: (redirectUrl: string, state?: string) => string) {
    if (await this.website.sessions.exists(ip)) throw new errors.ConcurrentSessionError();
    if (!this.isEnabled) throw new errors.FeatureNotEnabledError(this.feature);

    const redirectUrl = process.env.GITHUB_CALLBACK_URL.replace(/{port}/g, String(process.env.PORT));
    let state: string | undefined;

    if (this.useStates) {
      state = randomChars(8);
      this.states!.add(state);
    } else {
      state = undefined;
    }

    return format(encodeURIComponent(redirectUrl), state);
  }

  /**
   * Provided when a user accepts the request
   * @param callback The callback function to validate the request
   */
  onReceived<T extends NormalOAuthCallback>(data: T, callback: (error?: Error) => void) {
    const hasError = getOption(data, 'error', false);
    if (hasError) return callback(new Error(data.error_description || 'No error description was provided'));

    if (this.useStates) {
      const hasState = getOption(data, 'state', null) === null;

      if (!hasState) return callback(new Error('States is enabled but didn\'t receive one?'));
      if (!this.states!.includes(data.state!)) return callback(new errors.InvalidOAuthStateError(data.state!));

      // Remove the state from the queue
      this.states!.remove(data.state!);
    }

    return callback();
  }
}