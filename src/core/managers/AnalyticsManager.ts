import { Website } from '..';

export default class AnalyticsManager {
  public requests: number;
  private website: Website;

  constructor(website: Website) {
    this.requests = 0;
    this.website = website;
  }

  getRequestsPerMinute() {
    return (this.requests / (this.website.bootedAt / (1000 * 60))).toFixed();
  }

  getRequestsPerHour() {
    return (this.requests / (this.website.bootedAt / (1000 * 60 * 60))).toFixed();
  }

  get enabled() {
    return this.website.config.analytics;
  }
}