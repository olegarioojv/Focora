import { Injectable } from '@nestjs/common';

// Below this window, a real CPU tick (V8/event-loop overhead) divided by
// a near-zero elapsed time produces a wildly inflated, meaningless
// percentage — e.g. two calls a few ms apart. Reuse the last computed
// value instead of recomputing on a too-small window.
const MIN_SAMPLE_WINDOW_MS = 250;

// A single shared instance (Nest singleton) so every caller sees
// consistent CPU% deltas — two independent samplers would each compute
// slightly different (and less accurate) percentages from the same
// underlying process.
@Injectable()
export class ProcessMetricsService {
  private lastCpuUsage = process.cpuUsage();
  private lastCpuSampleTime = Date.now();
  private lastCpuPercent = 0;

  getMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      rssMb: Math.round((usage.rss / 1024 / 1024) * 10) / 10,
      heapUsedMb: Math.round((usage.heapUsed / 1024 / 1024) * 10) / 10,
      heapTotalMb: Math.round((usage.heapTotal / 1024 / 1024) * 10) / 10,
    };
  }

  // Process CPU% (single-core basis), computed from the delta since the
  // last sample — cross-platform, unlike os.loadavg() which always
  // returns [0,0,0] on Windows.
  getCpuPercent() {
    const currentUsage = process.cpuUsage();
    const currentTime = Date.now();
    const elapsedMs = currentTime - this.lastCpuSampleTime;

    if (elapsedMs < MIN_SAMPLE_WINDOW_MS) {
      return this.lastCpuPercent;
    }

    const totalDiffMicros =
      currentUsage.user -
      this.lastCpuUsage.user +
      (currentUsage.system - this.lastCpuUsage.system);

    this.lastCpuUsage = currentUsage;
    this.lastCpuSampleTime = currentTime;

    const percent = (totalDiffMicros / (elapsedMs * 1000)) * 100;
    this.lastCpuPercent = Math.round(Math.max(0, Math.min(100, percent)) * 10) / 10;
    return this.lastCpuPercent;
  }
}
