import { Repository, Website } from '..';

export interface ProjectModel {
  translators: string[];
  languages: string[];
  strings: number;
  name: string;
}

export default class ProjectRepository extends Repository<ProjectModel> {
  constructor(website: Website) {
    super(website, 'projects');
  }

  async get(name: string) {
    const model = await this.collection.findOne({ name });
    return model === null ? await this.create(name) : model!;
  }

  async create(packet: any) {
    const project: ProjectModel = {
      translators: [],
      languages: [],
      strings: 0,
      name: packet.name
    };

    await this.collection.insertOne(project);
    return project;
  }

  async remove(name: string) {
    await this.collection.deleteOne({ name });
  }

  async update(type: 'set' | 'push', name: string, values: { [x: string]: any }) {
    const key = `$${type}`;
    await this.collection.updateOne({ name }, {
      [key]: values
    });
  }

  async addTranslator(project: string, userID: string) {
    await this.update('push', project, {
      translators: userID
    });
  }

  async addLanguage(project: string, language: string) {
    await this.update('push', project, {
      languages: language
    });
  }

  async setStrings(project: string, strings: number) {
    await this.update('set', project, {
      strings
    });
  }

  async rename(project: string, name: string) {
    await this.update('set', project, {
      name
    });
  }
}