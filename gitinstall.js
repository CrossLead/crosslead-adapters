/**
 * build script for installing via github
 */
const {spawn} = require('child_process');
const config = require('./package.json');

Promise.resolve()
  .then(run('npm', 'install --only=dev --ignore-scripts'))
  .then(run('npm', 'run tsc'))
  .then(() => process.exit(0))
  .catch(() => (console.log(error.stack), process.exit(1)));

function run(cmd, argString = '') {
  const args = argString.split(' ');
  return () => new Promise((res, rej) => {
    console.log(`crosslead-adapters: ${[cmd].concat(args).join(' ')}`);
    const thread = spawn(cmd, args, { shell: true, stdio: 'inherit' });
    thread.on('data', data => console.log(data.toString()));
    thread.on('err', err => rej(new Error(err.toString())));
    thread.on('exit', res);
  });
}
