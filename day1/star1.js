const fs = require('node:fs');
const readline = require('node:readline')

function parseLine(line) {
  let a, b;

  for (let i = 0; i < line.length; i++) {
    const c = line.charAt(i);
    if ('0' <= c && c <= '9') {
      if (!a) {
        a = c;
      }
      b = c;
    }
  }

  return 10 * a + 1 * b;
}

async function processInput() {
  const rl = readline.createInterface({
    input: fs.createReadStream('input.txt'),
    crlfDelay: Infinity,
  });

  let sum = 0;

  for await (const line of rl) {
    sum = sum + parseLine(line);
  }

  return sum;
}

processInput()
  .then(result => console.log(`Total of input: ${result}`));

