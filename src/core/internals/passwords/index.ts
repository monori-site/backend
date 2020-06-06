// Credit: // Credit: https://repl.it/@PassTheWessel/PasswordHasher#Worker.js
import Worker, { HashOptions } from './Hash';

export function decrypt(password: string, hash: string, options?: HashOptions) {
  const worker = new Worker(options);
  return worker.decrypt(password, hash);
}

export function encrypt(password: string, options?: HashOptions) {
  const worker = new Worker(options);
  return worker.encrypt(password);
}