import Adapter from '../base/Adapter';

import * as request from 'request-promise';
import * as uuid from 'node-uuid';
import * as nodemailer from 'nodemailer';
import * as moment from 'moment';

const toRFC822 = (date: Date) => {
  return moment(date).format('ddd, DD MMM YYYY HH:mm:ss ZZ');
};

const envelopeFrom = 'Daemon <daemon@crosslead.com>';

export enum GlobalRelayMessageType {
  Chat = 0,
  Update = 1,
  Plan = 2,
  Team = 3,
  Work = 4,
}

const typeToString = (type: GlobalRelayMessageType) => {
  switch (type) {
  case GlobalRelayMessageType.Chat: return 'Chat';
  case GlobalRelayMessageType.Update: return 'Update';
  case GlobalRelayMessageType.Plan: return 'Plan';
  case GlobalRelayMessageType.Team: return 'Team';
  case GlobalRelayMessageType.Work: return 'Work';
  default: throw new Error( `Unknown message type ${type}` );
  };
};

export type GlobalRelayMessage = {
  type: GlobalRelayMessageType;
  from: string;
  to: string[];
  body: string;
  date: Date;
  thread?: string;
  objId?: string;
  attachments?: string[];
};

export type GlobalRelayCredentials = {
  username: string;
  password: string;
  host: string;
  port: string;
  rcptTo: string;
  secure: string;
};

export class GlobalRelayAdapter extends Adapter {
  credentials: GlobalRelayCredentials = {
    username: '',
    password: '',
    host: '',
    port: '',
    rcptTo: '',
    secure: '',
  };

  sensitiveCredentialsFields: (keyof GlobalRelayCredentials)[] = ['password'];

  async init() {

  }

  async getFieldData() {
    throw new Error('Global Relay does not support `getFieldData()`');
  }

  runConnectionTest() {

  }

  async archive( msg: GlobalRelayMessage ) {
    return push(msg, this.credentials);
  }
}

type Options = {
  host: string;
  port: number;
  secure: boolean;
  logger: boolean;
  debug: boolean;
  auth?: {
    user: string;
    pass: string;
  };
  tls?: { ciphers: string };
  requireTLS?: boolean;
};

const mkOptions = (creds: GlobalRelayCredentials) => {

  const ret: Options = {
    host: creds.host,
    port: parseInt(creds.port) || 25,
    secure: creds.secure === 'true',
    logger: false,
    debug: false,
  };

  if (creds.username && creds.password) {
    ret.auth =  {
      user: creds.username,
      pass: creds.password,
    };
  }

  return ret;
};

const push = async (msg: GlobalRelayMessage, creds: GlobalRelayCredentials) => {
  const options = mkOptions(creds);
  const transport = nodemailer.createTransport(options);

  const verify = new Promise( (res, rej) => {
    transport.verify( (err, success) => {
      if (err) {
        console.error(err);
        rej(err);
      } else {
        res(success);
      }
    });
  });

  await verify;

  const messageId = `<${uuid.v4()}@crosslead.com>`;

  const headers: {[key: string]: string} = {
    'MIME-Version': '1.0',
    'X-GlobalRelay-MsgType': 'CrossLead',
    'Message-ID': messageId,
  };

  if (msg.thread) {
    headers[ 'X-CrossLead-Thread-Id' ] = msg.thread;
  }

  if (msg.objId) {
    headers[ 'X-CrossLead-Object-Id' ] = msg.objId;
  }

  const subject = `${typeToString(msg.type)}, ${msg.to.length} Users, 1 Message`;
  const toAttachment = (url: string) => {
    const encoding = 'base64';
    const toBase64 = (buf: string) => Buffer.from(buf).toString(encoding);
    const toContent = (content: string) => ({content, encoding});
    return request.get({url}).then(toBase64).then(toContent);
  };

  const attachments = await Promise.all((msg.attachments || []).map(toAttachment));

  const message = {
    envelope: {
      from: envelopeFrom,
      to: creds.rcptTo,
    },
    headers,
    messageId,
    date: toRFC822(msg.date),
    from: msg.from,
    to: msg.to,
    subject,
    text: msg.body,
    attachments,
  };

  return new Promise( (res, rej) => {
    transport.sendMail( message, (err) => {
      if (err) {
        console.error(`Caught error sending mail: ${err}` );
        rej(err);
      } else {
        res();
      }
    });
  });

};

