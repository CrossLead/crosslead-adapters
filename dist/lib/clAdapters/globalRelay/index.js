"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Adapter_1 = require("../base/Adapter");
const request = require("request-promise");
const uuid = require("node-uuid");
const nodemailer = require("nodemailer");
const moment = require("moment");
const toRFC822 = (date) => {
    return moment(date).format('ddd, DD MMM YYYY HH:mm:ss ZZ');
};
const envelopeFrom = 'Daemon <daemon@crosslead.com>';
var GlobalRelayMessageType;
(function (GlobalRelayMessageType) {
    GlobalRelayMessageType[GlobalRelayMessageType["Chat"] = 0] = "Chat";
    GlobalRelayMessageType[GlobalRelayMessageType["Update"] = 1] = "Update";
    GlobalRelayMessageType[GlobalRelayMessageType["Plan"] = 2] = "Plan";
    GlobalRelayMessageType[GlobalRelayMessageType["Team"] = 3] = "Team";
})(GlobalRelayMessageType = exports.GlobalRelayMessageType || (exports.GlobalRelayMessageType = {}));
const typeToString = (type) => {
    switch (type) {
        case GlobalRelayMessageType.Chat: return 'Chat';
        case GlobalRelayMessageType.Update: return 'Update';
        case GlobalRelayMessageType.Plan: return 'Plan';
        case GlobalRelayMessageType.Team: return 'Team';
        default: throw new Error(`Unknown message type ${type}`);
    }
    ;
};
class GlobalRelayAdapter extends Adapter_1.default {
    constructor() {
        super(...arguments);
        this.credentials = {
            username: '',
            password: '',
            host: '',
            port: '',
            rcptTo: '',
            secure: '',
        };
        this.sensitiveCredentialsFields = ['password'];
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    getFieldData() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Global Relay does not support `getFieldData()`');
        });
    }
    runConnectionTest() {
    }
    archive(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            return push(msg, this.credentials);
        });
    }
}
exports.GlobalRelayAdapter = GlobalRelayAdapter;
const mkOptions = (creds) => {
    const ret = {
        host: creds.host,
        port: parseInt(creds.port) || 25,
        secure: creds.secure === 'true',
        logger: false,
        debug: false,
    };
    if (creds.username && creds.password) {
        ret.auth = {
            user: creds.username,
            pass: creds.password,
        };
    }
    return ret;
};
const push = (msg, creds) => __awaiter(this, void 0, void 0, function* () {
    const options = mkOptions(creds);
    const transport = nodemailer.createTransport(options);
    const verify = new Promise((res, rej) => {
        transport.verify((err, success) => {
            if (err) {
                console.error(err);
                rej(err);
            }
            else {
                res(success);
            }
        });
    });
    yield verify;
    const messageId = `<${uuid.v4()}@crosslead.com>`;
    const headers = {
        'MIME-Version': '1.0',
        'X-GlobalRelay-MsgType': 'CrossLead',
        'Message-ID': messageId,
    };
    if (msg.thread) {
        headers['X-CrossLead-Thread-Id'] = msg.thread;
    }
    if (msg.objId) {
        headers['X-CrossLead-Object-Id'] = msg.objId;
    }
    const subject = `${typeToString(msg.type)}, ${msg.to.length} Users, 1 Message`;
    const toAttachment = (url) => {
        const encoding = 'base64';
        const toBase64 = (buf) => Buffer.from(buf).toString(encoding);
        const toContent = (content) => ({ content, encoding });
        return request.get({ url }).then(toBase64).then(toContent);
    };
    const attachments = yield Promise.all((msg.attachments || []).map(toAttachment));
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
    return new Promise((res, rej) => {
        transport.sendMail(message, (err) => {
            if (err) {
                console.error(`Caught error sending mail: ${err}`);
                rej(err);
            }
            else {
                res();
            }
        });
    });
});
//# sourceMappingURL=index.js.map