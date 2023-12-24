const fs = require('node:fs');
const readline = require('node:readline')

const line_r = /(\w+) = \((\w+), (\w+)\)/g;

function walker(directions) {
  let i = 0;
  let counter = 0;
  return {
    steps() {
      return counter;
    },
    next() {
      const result = directions[i];
      counter++;
      i++;
      if (i >= directions.length) {
        i = 0;
      }
      return result;
    }
  }
}

function generate_parser() {
  const directions = [];
  const maps = {};
  let finished = false;
  return {
    parse_line(line) {
      if (finished) {
        throw new Error("parser finished");
      }
      if (line === '') {
        return;
      }
      if (directions.length === 0) {
        directions.push(...line);
        Object.freeze(directions);
        return;
      }
      const match = [...line.matchAll(line_r)];
      const [[_, key, l, r]] = match;
      if (!Object.hasOwnProperty(key)) {
        maps[key] = [l, r];
        return;
      }
      throw new Error("Duplicate key", { cause: key });
    },
    finish() {
      finished = true;
      Object.freeze(maps);
    },
    directions,
    maps,
  };
}

async function process_file(file, parser) {
  const rl = readline.createInterface({
    input: fs.createReadStream(file),
    crlfDelay: Infinity,
  });
  for await (const line of rl) {
    parser.parse_line(line);
  }
  parser.finish();
  return parser;
}

const parser = generate_parser();

process_file('input', parser)
  .then((p) => {
    const w = walker(p.directions);
    const m = p.maps;
    let key = 'AAA';
    while (key !== 'ZZZ') {
      const d = w.next();
      const [l, r] = m[key]; 
      key = d === 'L' ? l : r
    }
    console.log(`Required steps from 'AAA' to 'ZZZ': ${w.steps()}`);
  });
