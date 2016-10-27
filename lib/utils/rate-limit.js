/**
 * Limit calls of this function to at most 1/rate,
 * where rate is in milliseconds. Instead of grouping (like _.debounce)
 * calls are added to a queue and executed serially.
 *
 * @param fn ?: function to rate limit
 * @param rate : milliseconds to wait between invocations
 * @param count : maximum concurrent calls between wait periods
 */
export default function rateLimit(fn, rate = 1000, count = 1) {


  // if first arg is not number,
  // assume decorator syntax, return curried decorator
  if (typeof fn !== 'function') {
    const args = Array.from(arguments);
    return (proto, prop) => {
      const baseFn = proto[prop];
      if (typeof baseFn !== 'function') {
        throw new TypeError(`Cannot wrap property ${prop}, must be function`);
      }
      proto[prop] = rateLimit(baseFn, ...args);
    };
  }

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
    if ((queue.length === 0) || (working === count)) return;
    working++;
    recurse();
    const [context, args, resolve, reject] = queue.shift();
    try {
      resolve(fn.apply(context, args));
    } catch (err) {
      reject(err);
    }
  }

  /**
   * Returned wrapped function, keeping correct context
   */
  return function(...args) {
    return new Promise((resolve, reject) => {
      try {
        queue.push([this, args, resolve, reject]);
        if (working < count) dequeue();
      } catch (err) {
        reject(err);
      }
    });
  };
}