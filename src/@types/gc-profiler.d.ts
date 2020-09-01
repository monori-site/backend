// TypeScript definitions for package: "gc-profiler"
// Project: https://github.com/bretcope/node-gc-profiler
// Definitions by:
//     - August <august@augu.dev>

declare module 'gc-profiler' {
  import { EventEmitter } from 'events';

  type GCTypes = 'Scavenge' | 'MarkSweepCompact' | 'IncrementalMarking' | 'ProcessWeakCallbacks' | 'All';
  interface GarbageCollector {
    duration: number;
    forced: boolean;
    flags: number;
    type: GCTypes;
    date: Date;
  }

  class GcProfiler extends EventEmitter {
    on(event: 'gc', listener: (info: GarbageCollector) => void): this;
    once(event: 'gc', listener: (info: GarbageCollector) => void): this;
  }

  const Profiler: GcProfiler;
  export = Profiler;
}
