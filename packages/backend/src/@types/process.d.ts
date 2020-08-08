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

declare namespace NodeJS {
  interface ProcessEnv {
    // So we prevent the error:
    // Property 'prop' of type 'type' is not assignable to string index type 'string | undefined'. ts(2411)
    [x: string]: any;

    GITHUB_CLIENT_SECRET: string;
    GITHUB_CALLBACK_URL: string;
    DATABASE_USERNAME: string;
    DATABASE_PASSWORD: string;
    GITHUB_CLIENT_ID: string;
    GITHUB_ENABLED: boolean;
    REDIS_PASSWORD: string | null;
    GITHUB_SCOPES: string[];
    DATABASE_PORT: number;
    DATABASE_HOST: string;
    DATABASE_NAME: string;
    ANALYTICS: boolean;
    REDIS_HOST: string;
    REDIS_PORT: number;
    NODE_ENV: 'development' | 'production';
    SECRET: string;
    PORT: number;
  }
}