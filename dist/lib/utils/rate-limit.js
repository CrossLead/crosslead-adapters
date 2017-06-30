"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function rateLimitDecorator(rate = 1000, count = 1) {
    return (target, propertyKey, descriptor) => {
        const fn = descriptor.value;
        descriptor.value = rateLimit(fn, rate, count);
        return descriptor;
    };
}
exports.default = rateLimitDecorator;
/**
 * Limit calls of this function to at most 1/rate,
 * where rate is in milliseconds. Instead of grouping (like _.debounce)
 * calls are added to a queue and executed serially.
 *
 * TODO: once spread types are available, fn can have typed args:
 *    https://github.com/Microsoft/TypeScript/issues/10727
 *
 * @param fn function to rate limit
 * @param rate milliseconds to wait between invocations
 * @param count maximum concurrent calls between wait periods
 */
function rateLimit(fn, rate = 1000, count = 1) {
    const queue = [];
    let working = 0;
    /**
     * Continue dequeing jobs at rate limited pace
     */
    function recurse() {
        return (new Promise(res => setTimeout(res, rate)))
            .then(() => {
            working--;
            dequeue();
        });
    }
    /**
     * Run a job if it exists
     */
    function dequeue() {
        if ((queue.length === 0) || (working === count))
            return;
        working++;
        recurse();
        const next = queue.shift();
        if (next) {
            const [context, args, resolve, reject] = next;
            try {
                resolve(fn.apply(context, args));
            }
            catch (err) {
                reject(err);
            }
        }
    }
    /**
     * Returned wrapped function, keeping correct context
     */
    return function (...args) {
        return new Promise((resolve, reject) => {
            try {
                queue.push([this, args, resolve, reject]);
                if (working < count)
                    dequeue();
            }
            catch (err) {
                reject(err);
            }
        });
    };
}
//# sourceMappingURL=rate-limit.js.map