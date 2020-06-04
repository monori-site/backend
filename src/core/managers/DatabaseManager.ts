import { Logger, ConsoleTransport, FileTransport } from '@augu/logging';
import OrganisationRepo, { OrganisationModel } from '../repository/OrganisationRepository';
import ProjectRepo, { ProjectModel } from '../repository/ProjectRepository';
import UserRepo, { UserModel } from '../repository/UserRepository';
import { Repository, Website } from '..';
import { MongoClient, Db } from 'mongodb';
import { EventEmitter } from 'events';
import { Collection } from '@augu/immutable';

enum ConnectionStatus {
  Online = 'online',
  Offline = 'offline'
}

export default class DatabaseManager extends EventEmitter {
  public repositories: Collection<Repository>;
  public connection: ConnectionStatus;
  public bootedAt: number;
  public client: MongoClient;
  public logger: Logger;
  public mongo!: Db;
  public url: string;

  // This seems fucked but trust me, this works...
  constructor(private web: Website, url: string) {
    super();

    this.repositories = new Collection();
    this.connection = ConnectionStatus.Offline;
    this.bootedAt = Date.now();
    this.client = new MongoClient(url, {
      useUnifiedTopology: true,
      useNewUrlParser: true
    });
    this.logger = new Logger('Database', {
      transports: [new ConsoleTransport(), new FileTransport('./logs/database.log')]
    });
    this.url = url;
  }

  async connect() {
    if (this.connection === ConnectionStatus.Online) {
      this.logger.warn('Database is online, why are you connecting?');
      return;
    }

    await this.client.connect();
    this.mongo = this.client.db('i18n');
    this.connection = ConnectionStatus.Online;

    this.emit('online');
    this.repositories.set('users', new UserRepo(this.web));
    this.repositories.set('projects', new ProjectRepo(this.web));
    this.repositories.set('orginsations', new OrganisationRepo(this.web));
  }

  disconnect() {
    if (this.connection === ConnectionStatus.Offline) {
      this.logger.warn('Database is offline, why are you disconnecting?');
      return;
    }

    this.emit('offline', Date.now() - this.bootedAt);
    this.repositories.clear();
    this.client.close();
  }

  getRepository(name: 'users'): Repository<UserModel>;
  getRepository(name: 'projects'): Repository<ProjectModel>;
  getRepository(name: 'organisations'): Repository<OrganisationModel>;
  getRepository(name: string) {
    return this.repositories.get(name);
  }

  once(event: 'online', listener: () => void): this;
  once(event: 'offline', listener: (elapsed: number) => void): this;
  once(event: string, listener: (...args: any[]) => void) {
    return super.once(event, listener);
  }

  getCollection<C>(name: string) {
    return this.mongo.collection<C>(name);
  }
}