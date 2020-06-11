import type Website from '../internals/Website';
import Repository from '../internals/Repository';

export interface OrganisationModel {
  permissions: {
    [x: string]: {
      publish: boolean;
      edit: boolean;
    }
  }
  projects: string[];
  members: string[];
  github: any; // TODO: Find a way to integrate GitHub/GitLab/etc...
  owner: string;
  name: string;
}

interface CreateOrgPacket {
  owner: string;
  name: string;
}

export default class OrgainsationRepository extends Repository<OrganisationModel> {
  constructor(website: Website) {
    super(website, 'organisations');
  }

  async get(name: string) {
    const model = await this.collection.findOne({ name });
    return model!;
  }

  async create(packet: CreateOrgPacket) {
    const data: OrganisationModel = {
      permissions: {},
      projects: [],
      members: [],
      github: null,
      owner: packet.owner,
      name: packet.name
    };

    await this.collection.insertOne(data);
    return data;
  }

  async remove(name: string) {
    await this.collection.deleteOne({ name });
  }

  async update(type: 'set' | 'push', name: string, values: { [x: string]: any; }) {
    await this.collection.updateOne({ name }, {
      [`$${type}`]: values
    });
  }

  async addProject(name: string, projectID: string) {
    await this.update('push', name, {
      projects: projectID
    });
  }

  async addMember(name: string, userID: string) {
    await this.update('push', name, {
      members: userID
    });
  }

  async setPermission(name: string, memberID: string, permission: { [x in 'access' | 'edit']?: boolean }) {
    if (!Object.keys(permission).length) throw new Error('Must provide a permission to set.');
    for (const perm of Object.keys(permission)) {
      await this.update('set', name, {
        [`permissions.${memberID}.${perm}`]: permission[perm]
      });
    }
  }
}