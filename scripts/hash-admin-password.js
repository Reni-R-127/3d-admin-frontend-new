import bcrypt from 'bcryptjs';

if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== 'function') {
  console.error('Run this script directly in an interactive terminal so the password is not echoed.');
  process.exit(1);
}

const stdin = process.stdin;
let password = '';
let finished = false;
stdin.setEncoding('utf8');
stdin.setRawMode(true);
stdin.resume();
process.stdout.write('Enter a new admin password (hidden, at least 12 characters): ');

stdin.on('data', async (chunk) => {
  if (finished) return;
  for (const character of chunk) {
    if (character === '\u0003') {
      finished = true;
      stdin.setRawMode(false);
      stdin.pause();
      process.stdout.write('\nCancelled.\n');
      process.exit(130);
    }
    if (character === '\r' || character === '\n') {
      finished = true;
      stdin.setRawMode(false);
      stdin.pause();
      process.stdout.write('\n');
      if (password.length < 12) {
        password = '';
        console.error('Use a password with at least 12 characters. No hash generated.');
        process.exitCode = 1;
        return;
      }
      try {
        const hash = await bcrypt.hash(password, 12);
        password = '';
        console.log('Copy this hash to the private ADMIN_PASSWORD_HASH environment variable:');
        console.log(hash);
      } catch (error) {
        password = '';
        console.error('Could not create password hash:', error.message);
        process.exitCode = 1;
      }
      return;
    }
    if (character === '\u007f' || character === '\b') password = password.slice(0, -1);
    else if (character >= ' ' && character !== '\u001b') password += character;
  }
});
