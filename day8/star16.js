const fs = require('node:fs');
const readline = require('node:readline')

const line_r = /(\w+) = \((\w+), (\w+)\)/g;

function walker(directions) {
  let i = 0;
  let counter = 0;
  let log = 10;
  return {
    steps() {
      return counter;
    },
    next() {
      const result = directions[i];
      counter++;
      if (counter === log) {
        console.log(`Beep at ${counter}`);
        log *= 10;
        if (log >= 1e30) {
          throw new Error('This problem needs a mathematical solution');
        }
      }
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

function ends_with(char) {
  return function key_ends_with(key) {
    return key.endsWith(char);
  }
}

function negate(predicate_fn) {
  return function negated(...args) {
    return !predicate_fn(...args);
  }
}

process_file('input', parser)
  .then((p) => {
    const w = walker(p.directions);
    const m = p.maps
    let keys = Object.keys(p.maps).filter(ends_with('A'));
    const not_ends_with_Z = negate(ends_with('Z'));
    while (keys.some(not_ends_with_Z)) {
      const d = w.next();
      const new_keys = keys.map(key => {
        const [l, r] = m[key]; 
        return d === 'L' ? l : r
      })
      keys = new_keys;
      
    }
    console.log(`Required steps from 'AAA' to 'ZZZ': ${w.steps()}`);
  });
