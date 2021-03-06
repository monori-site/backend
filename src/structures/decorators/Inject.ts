/**
 * Copyright (c) 2020-2021 Arisu
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

import { MetadataKeys } from '../internal/MetadataKeys';

/** definition of a injectable reference when retrived from [getInjectables] or [Reflect.getMetadata(MetadataKeys.Injection, \<target\>)] */
interface InjectableReference {
  /** The reflection of the referenced object */
  ref: any;

  /** The property key */
  key: string;
}

/**
 * Returns all the injectable references in the specified [target].
 * @param target The target class
 * @returns The injectable reference(s) or an empty array if
 * the `@Inject` decorator wasn't used
 */
export const getInjectables = (target: any): InjectableReference[] =>
  Reflect.getMetadata(MetadataKeys.Injection, target) ?? [];

/**
 * Inject a reference from the reference manager to a specified property.
 */
const _Inject: PropertyDecorator = (target: any, property) => {
  const inferRef = Reflect.getMetadata('design:type', target, property);
  if (inferRef === undefined)
    throw new TypeError(`Inferred reference for property \`${String(property)}\` was not found.`);

  const references: InjectableReference[] = Reflect.getMetadata(MetadataKeys.Injection, target) ?? [];
  references.push({ ref: inferRef, key: String(property) });

  Reflect.defineMetadata(MetadataKeys.Injection, references, target);
};

export default _Inject;
