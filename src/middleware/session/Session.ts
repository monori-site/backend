import type { UserModel } from '../../core/repository/UserRepository';
import { randomBytes } from 'crypto';
import { sign } from 'cookie-signature';

export default class Session {
  public encryptedSessionID!: string;
  public sessionID: string;
  public expires: Date;
  public user!: UserModel;

  constructor(secret: string, prev?: Session) {
    this.sessionID = randomBytes(4).toString('hex');
    this.expires = new Date(Date.now() + 604800000);

    if (prev) this.handlePreviousSession(prev);
    this.sign(secret);
  }

  private handlePreviousSession(session: Session) {
    for (const key of Object.keys(session)) {
      if (!['expires'].includes(key)) this[key] = session[key];
    }
  }

  isExpired() {
    return this.expires.getTime() <= Date.now();
  }

  private sign(secret: string) {
    return sign(this.sessionID, secret);
  }

  toJSON() {
    return {
      sessionID: this.sessionID,
      expires: this.expires.toISOString(),
      user: this.user
    };
  }

  set(key: keyof this, value: any) {
    this[key] = value;
    return this;
  }
}