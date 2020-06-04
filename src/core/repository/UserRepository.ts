import type Website from '../internals/Website';
import Repository from '../internals/Repository';

export interface UserModel {
  discord: {
    username: string;
    discriminator: string;
    avatarUrl: string;
  } | null;
  organisations: string[];
  contributor: boolean;
  translator: boolean;
  userID: string;
  admin: boolean;
}

export default class UserRepository extends Repository<UserModel> {
  constructor(website: Website) {
    super(website, 'users');
  }

  async get(id: string) {
    const model = await this.collection.findOne({ 'userID': id });
    return model === null ? await this.create(id) : model!;
  }

  async create(pkt: any) {
    const user: UserModel = {
      discord: null,
      organisations: [],
      contributor: false,
      translator: false,
      userID: pkt,
      admin: false
    };

    await this.collection.insertOne(user);
    return user;
  }

  async remove(id: string) {
    await this.collection.deleteOne({ userID: id });
  }

  async update(type: 'set' | 'push', userID: string, values: { [x: string]: any }) {
    const key = `$${type}`;
    await this.collection.updateOne({ userID }, {
      [key]: values
    });
  }
}