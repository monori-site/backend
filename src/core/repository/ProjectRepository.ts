import { Repository, Website } from '..';

export interface ProjectModel {
  organisation: string;
  translators: string[];
  repository?: string;
  languages: string[];
  name: string;
}

interface CreateProject {
  name: string;
  org: string;
}

export default class ProjectRepository extends Repository<ProjectModel> {
  constructor(website: Website) {
    super(website, 'projects');
  }

  async get(org: string, name: string) {
    const model = await this.collection.findOne({ name, organisation: org });
    return model === null ? await this.create({ name, org }) : model!;
  }

  async create(packet: CreateProject) {
    const project: ProjectModel = {
      organisation: packet.org,
      translators: [],
      languages: [],
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

  async rename(project: string, name: string) {
    await this.update('set', project, {
      name
    });
  }

  async setRepository(project: string, repoUrl: string) {
    await this.update('set', project, {
      repository: repoUrl
    });
  }
}