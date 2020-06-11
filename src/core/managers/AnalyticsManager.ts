import { Website } from '..';

export default class AnalyticsManager {
  public requests: number;
  private website: Website;

  constructor(website: Website) {
    this.requests = 0;
    this.website = website;
  }

  get enabled() {
    return this.website.config.analytics;
  }
}