import { WorkerIPC } from '../structures/clustering';

declare module 'cluster' {
  interface Worker {
    ipc: WorkerIPC;
    id: number;
  }
}
