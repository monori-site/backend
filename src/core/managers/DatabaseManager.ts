import { Logger, ConsoleTransport, FileTransport } from '@augu/logging';
import { MongoClient, Db } from 'mongodb';
import UserRepo, { User } from '../repository/UserRepository';
import { EventEmitter } from 'events';
import { Collection } from '@augu/immutable';
import Repository from '../internals/Repository';

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

  constructor(public url: string) {
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
  }

  async connect() {
    if (this.connection === ConnectionStatus.Online) {
      this.logger.warn('Database is online, why are you connecting?');
      return;
    }

    this.logger.info(`Connected to MongoDB with URI: ${this.url}`);
    this.mongo = this.client.db('i18n');
    this.connection = ConnectionStatus.Online;

    this.emit('online');
    this.repositories.set('users', new UserRepo());
  }

  disconnect() {
    if (this.connection === ConnectionStatus.Offline) {
      this.logger.warn('Database is offline, why are you disconnecting?');
      return;
    }

    this.logger.warn('Disconnected from MongoDB');
    this.emit('offline', Date.now() - this.bootedAt);

    this.repositories.clear();
  }

  getRepository(name: 'users'): Repository<User>;
  getRepository(name: string) {
    return this.repositories.get(name);
  }
}