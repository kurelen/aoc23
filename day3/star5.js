const fs = require('node:fs');
const readline = require('node:readline')

function collect() {
  const result = [];
  return function next(item) {
    if (arguments.length === 0) {
      return result;
    }
    result.push(item);
  };
}

function parse_line(line) {
  return [...line];
}

async function process_file(file, parse_line, reducer) {
  const rl = readline.createInterface({
    input: fs.createReadStream(file),
    crlfDelay: Infinity,
  });
  for await (const line of rl) {
    reducer(parse_line(line));
  }
  return reducer;
}

process_file('input.txt', parse_line, collect())
  .then(result => console.log(`Parsed input`, result()));

