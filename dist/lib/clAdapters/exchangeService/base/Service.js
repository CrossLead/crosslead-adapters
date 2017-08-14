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
const _ = require("lodash");
const index_1 = require("../../base/index");
const EWS = require("node-ews");
class ExchangeServiceService extends index_1.Service {
    constructor(config) {
        super(config);
        this.config = config;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const credentials = this.config.credentials;
            const ewsConfig = {
                username: credentials.username,
                password: credentials.password,
                host: credentials.connectUrl
            };
            this.ews = new EWS(ewsConfig);
            return true;
        });
    }
    buildSoapHeader(emailAddress) {
        return {
            't:ExchangeImpersonation': {
                't:ConnectingSID': {
                    't:PrimarySmtpAddress': emailAddress
                }
            }
        };
    }
    getOptionalAttendees(itemId, itemChangeKey, addr) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.ews) {
                throw new Error('EWS has not been inited!');
            }
            const ewsArgs = {
                ItemShape: {
                    BaseShape: 'IdOnly',
                    AdditionalProperties: [
                        {
                            FieldURI: {
                                attributes: {
                                    FieldURI: 'calendar:OptionalAttendees'
                                }
                            }
                        }
                    ]
                },
                ItemIds: [
                    {
                        ItemId: {
                            attributes: {
                                Id: itemId,
                                ChangeKey: itemChangeKey
                            }
                        }
                    }
                ]
            };
            const soapHeader = this.buildSoapHeader(addr);
            const result = yield this.ews.run('GetItem', ewsArgs, soapHeader);
            const attendees = _.get(result, 'ResponseMessages.GetItemResponseMessage.Items.CalendarItem.OptionalAttendees.Attendee');
            return attendees;
        });
    }
    getRequiredAttendees(itemId, itemChangeKey, addr) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.ews) {
                throw new Error('EWS has not been inited!');
            }
            const ewsArgs = {
                ItemShape: {
                    BaseShape: 'IdOnly',
                    AdditionalProperties: [
                        {
                            FieldURI: {
                                attributes: {
                                    FieldURI: 'calendar:RequiredAttendees'
                                }
                            }
                        }
                    ]
                },
                ItemIds: [
                    {
                        ItemId: {
                            attributes: {
                                Id: itemId,
                                ChangeKey: itemChangeKey
                            }
                        }
                    }
                ]
            };
            const soapHeader = this.buildSoapHeader(addr);
            const result = yield this.ews.run('GetItem', ewsArgs, soapHeader);
            const attendees = _.get(result, 'ResponseMessages.GetItemResponseMessage.Items.CalendarItem.RequiredAttendees.Attendee');
            return attendees;
        });
    }
    findItem(startDate, endDate, addr) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.ews) {
                throw new Error('EWS has not been inited!');
            }
            const ewsArgs = {
                attributes: {
                    Traversal: 'Shallow'
                },
                ItemShape: {
                    BaseShape: 'AllProperties'
                },
                CalendarView: {
                    attributes: {
                        StartDate: startDate,
                        EndDate: endDate
                    }
                },
                ParentFolderIds: {
                    DistinguishedFolderId: {
                        attributes: {
                            Id: 'calendar'
                        }
                    }
                }
            };
            const soapHeader = this.buildSoapHeader(addr);
            return this.ews.run('FindItem', ewsArgs, soapHeader);
        });
    }
}
exports.default = ExchangeServiceService;
;
//# sourceMappingURL=Service.js.map