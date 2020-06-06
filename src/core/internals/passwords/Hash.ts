import { getHashes, randomBytes } from 'crypto';
import { pbkdf2Sync } from 'pbkdf2';

export interface HashOptions {
  iterations?: number;
  digest?: string;
  length?: number;
  salt?: string;
}

const defaults = {
  iterations: 1000,
  digest: 'md5',
  length: 10,
  salt: randomBytes(128).toString('base64')
};

function getOption<T>(prop: string, defaultValue: T, options?: HashOptions): T {
  // If options is defined,
  //   check if the property exists
  //       if so, return the value
  //       else use the default value provides
  //   if not, use the default value
  // return the default value if the options object doesn't exist
  return options ? options.hasOwnProperty(prop) ? options[prop]! : defaultValue : defaultValue;
}

const hashes = getHashes();

// Credit: https://repl.it/@PassTheWessel/PasswordHasher#Worker.js
export default class Hash {
  private iterations: number;
  private digest: string;
  private length: number;
  private salt: string;

  constructor(options?: HashOptions) {
    this.iterations = getOption('iterations', defaults.iterations, options);
    this.digest     = getOption('digest', defaults.digest, options);
    this.length     = getOption('length', defaults.length, options);
    this.salt       = getOption('salt', defaults.salt, options);
  }

  encrypt(password: string) {
    if (!hashes.includes(this.digest)) throw new Error(`Digest type must be one of "${hashes.join(', ')}", received "${this.digest}"`);
    
    const hash = pbkdf2Sync(password, this.salt, this.iterations, this.length, this.digest);
    return hash.toString('base64');
  }

  decrypt(password: string, hash: string) {
    if (!hashes.includes(this.digest)) throw new Error(`Digest type must be one of "${hashes.join(', ')}", received "${this.digest}"`);
  
    const checker = pbkdf2Sync(password, this.salt, this.iterations, this.length, this.digest);
    return !!(checker.toString('base64') === hash);
  }
}