import { randomBytes } from 'crypto';
import { sign } from 'cookie-signature';

export default class Session {
  public encryptedSessionID!: string;
  public sessionID: string;
  public username: string;
  public expires: Date;

  constructor(username: string | null, secret: string, prev?: Session) {
    this.sessionID = randomBytes(4).toString('hex');
    this.username = username || '';
    this.expires = new Date(Date.now() + 604800000);

    if (prev) this.handlePreviousSession(prev);
    this.sign(secret);
  }

  handlePreviousSession(session: Session) {
    for (const key of Object.keys(session)) {
      if (!['expires'].includes(key)) this[key] = session[key];
    }
  }

  isExpired() {
    return this.expires.getTime() <= Date.now();
  }

  sign(secret: string) {
    return sign(this.sessionID, secret);
  }

  toJSON() {
    return {
      sessionID: this.sessionID,
      username: this.username,
      expires: this.expires.toISOString()
    };
  }
}