import { randomBytes, pbkdf2Sync } from 'crypto';
import type Website from '../internals/Website';
import Repository from '../internals/Repository';

export interface UserModel {
  discord: string | null;
  github: string | null;
  organisations: string[];
  contributor: boolean;
  translator: boolean;
  username: string;
  password: string;
  email: string;
  token: string;
  admin: boolean;
  salt: string;
}

export default class UserRepository extends Repository<UserModel> {
  constructor(website: Website) {
    super(website, 'users');
  }

  async get(id: string) {
    const model = await this.collection.findOne({ 'userID': id });
    return model!;
  }

  async getByGitHubId(id: string) {
    const model = await this.collection.findOne({ 'github': id });
    return model;
  }

  async getByDiscordId(id: string) {
    const model = await this.collection.findOne({ 'discord': id });
    return model;
  }

  async create(username: string, email: string, password: string) {
    const salt = randomBytes(32).toString('hex');
    const pass = pbkdf2Sync(password, salt, 100000, 32, 'sha256');
    const token = randomBytes(32).toString('hex');

    const user: UserModel = {
      discord: null,
      organisations: [],
      contributor: false,
      translator: false,
      admin: false,
      github: null,
      email,
      username,
      password: pass.toString('hex'),
      salt,
      token
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