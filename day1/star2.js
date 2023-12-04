const fs = require('node:fs');
const readline = require('node:readline')

function first(xs) {
  return xs[0];
}

function last(xs) {
  return xs[xs.length - 1];
}

function create_scanner(s, res) {
  const l = s.length;
  let idx = 0;
  return function scan(ch) {
    if (idx === l) {
      return { op: 'done' };
    }
    if (s.charAt(idx) !== ch) {
      return { op: "cancel" };
    }
    idx = idx + 1;
    if (idx === l) {
      return {
        op: "finished", 
        result: res
      };
    }
    return { op: "continue" };
  }
}

function digit_scanner() {
  return [
    ['0', 0],
    ['1', 1],
    ['2', 2],
    ['3', 3],
    ['4', 4],
    ['5', 5],
    ['6', 6],
    ['7', 7],
    ['8', 8],
    ['9', 9],
    ['zero', 0],
    ['one', 1],
    ['two', 2],
    ['three', 3],
    ['four', 4],
    ['five', 5],
    ['six', 6],
    ['seven', 7],
    ['eight', 8],
    ['nine', 9],
  ].map(([s, r]) => create_scanner(s, r))
}


function parseLine(line) {
  let a, b;
  let scanner = [];
  let res = [];

  for (let i = 0; i < line.length; i++) {
    scanner = scanner.concat(digit_scanner())
    const c = line.charAt(i);
    scanner = scanner.filter(sc => { 
      const {result, op} = sc(c);
      if (result) {
        res.push(result);
      }
      return op === 'continue';
    });
  }

  return 10 * first(res) + last(res);
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

