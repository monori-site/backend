import { randomBytes } from 'crypto';
import * as passwords from '../internals/passwords';
import type Website from '../internals/Website';
import Repository from '../internals/Repository';

export interface UserModel {
  organisations: string[];
  passwordHash: string;
  contributor: boolean;
  translator: boolean;
  username: string;
  password: string;
  github: string | null;
  email: string;
  token: string;
  admin: boolean;
  salt: string;
}

interface GitHubUser {
  accessToken: string;
  avatarUrl: string;
  username: string;
}

export default class UserRepository extends Repository<UserModel> {
  constructor(website: Website) {
    super(website, 'users');
  }

  async get(username: string) {
    const model = await this.collection.findOne({ 'username': username });
    return model!;
  }

  async getByGitHubId(id: string) {
    return await this.collection.findOne({ 'github.username': id });
  }

  async getByEmail(email: string) {
    return await this.collection.findOne({ 'email': email });
  }

  async create(username: string, email: string, password: string) {
    const salt = randomBytes(32).toString('hex');
    const pass = passwords.encrypt(password, { salt });
    const token = randomBytes(32).toString('hex');

    const user: UserModel = {
      organisations: [],
      contributor: false,
      translator: false,
      github: null,
      admin: false,
      email,
      username,
      password,
      salt,
      token,
      passwordHash: pass
    };

    await this.collection.insertOne(user);
    return user;
  }

  async remove(id: string) {
    await this.collection.deleteOne({ username: id });
  }

  async update(type: 'set' | 'push', username: string, values: { [x: string]: any }) {
    const key = `$${type}`;
    await this.collection.updateOne({ username }, {
      [key]: values
    });
  }

  async addGitHubCredentials(username: string, user: GitHubUser) {
    await this.update('set', username, {
      github: user
    });
  }
}