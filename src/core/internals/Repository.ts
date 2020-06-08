import { Collection } from 'mongodb';
import { Website } from '..';

export default abstract class Repository<TModel = any> {
  private website: Website;
  public name: string;

  constructor(web: Website, name: string) {
    this.website = web;
    this.name = name;
  }

  get collection(): Collection<TModel> {
    return this.website.database.getCollection(this.name);
  }

  public abstract get(...args: any[]): Promise<TModel>;
  public abstract create(...args: any[]): Promise<TModel>;
  public abstract remove(...args: any[]): Promise<void>;
  public abstract update(type: 'set' | 'push', userID: string, values: { [x: string]: any }): Promise<void>;
}