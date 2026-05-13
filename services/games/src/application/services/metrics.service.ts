import { Injectable } from '@nestjs/common';
import { Counter, Gauge, Histogram, register } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly rtpGauge: Gauge;
  private readonly betVolumeCounter: Counter;
  private readonly totalWinCounter: Counter;
  private readonly websocketLatency: Histogram;

  constructor() {
    this.rtpGauge = new Gauge({
      name: 'game_rtp_ratio',
      help: 'Return to Player ratio (Total Win / Total Bet)',
    });

    this.betVolumeCounter = new Counter({
      name: 'game_bet_volume_total',
      help: 'Total volume of bets in cents',
    });

    this.totalWinCounter = new Counter({
      name: 'game_total_win_total',
      help: 'Total win amount in cents',
    });

    this.websocketLatency = new Histogram({
      name: 'game_websocket_event_latency',
      help: 'Latency of websocket events in milliseconds',
      labelNames: ['event_type'],
      buckets: [10, 50, 100, 200, 500],
    });
  }

  recordBet(amount: number) {
    this.betVolumeCounter.inc(amount);
    this.updateRTP();
  }

  recordWin(amount: number) {
    this.totalWinCounter.inc(amount);
    this.updateRTP();
  }

  recordWSLatency(eventType: string, latencyMs: number) {
    this.websocketLatency.labels(eventType).observe(latencyMs);
  }

  private async updateRTP() {
    const totalBet = (await this.betVolumeCounter.get()).values[0]?.value || 0;
    const totalWin = (await this.totalWinCounter.get()).values[0]?.value || 0;
    if (totalBet > 0) {
      this.rtpGauge.set(totalWin / totalBet);
    }
  }

  async getMetrics(): Promise<string> {
    return register.metrics();
  }
}
