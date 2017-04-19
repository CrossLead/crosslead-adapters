import GoogleMailAdapter from './mail';
import GoogleCalendarAdapter from './calendar';
import { InvalidGrantError, UnauthorizedClientError } from './errors';
declare var _default: {
    GoogleMailAdapter: typeof GoogleMailAdapter;
    GoogleCalendarAdapter: typeof GoogleCalendarAdapter;
    InvalidGrantError: typeof InvalidGrantError;
    UnauthorizedClientError: typeof UnauthorizedClientError;
};
export default _default;
