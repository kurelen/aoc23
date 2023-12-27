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
    index() {
      return i;
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

function orbit(maps, dirs, key) {
  let step = 0;
  let index = 0;
  const visited = {};
  const start_key = key;
  const ends_with_z = ends_with('Z');
  const result = { start_key };

  while (true) {
    if (ends_with_z(key)) {
      result.goal = { key, step, index }
    }
    if (Object.hasOwn(visited, key)) {
      if (Object.hasOwn(visited[key], index)) {
        result.beginning = { key, step, index };
        result.period = visited[key]
        return result
      } else {
        visited[key][index] = step;
      }
    } else {
      visited[key] = { [index]: step } ;
    }
    step++;
    index++;
    if (index == dirs.length) {
      index = 0;
    }
    const d = dirs[index];
    const [l, r] = maps[key]; 
    key = d === 'L' ? l : r;
  }
}

process_file('input', parser)
  .then((p) => {
    // SLA AAA LVA NPA GDA RCA
    const w = walker(p.directions);
    const m = p.maps
    const ends_with_z = ends_with('Z');
    let keys = Object.keys(p.maps).filter(ends_with('A'));
    const orbs = keys
      .map(key => orbit(p.maps, p.directions, key))
     // .map(([_k, i, step]) => step)
    console.log(orbs);
    return;

    while (!keys.every(ends_with_z)) {
      return
      const d = w.next();
      const new_keys = keys.map(key => {
        const [l, r] = m[key]; 
        return d === 'L' ? l : r;
      });
      keys = new_keys;
    }
    console.log(`Period of '${fix}': ${w.steps()}`);
  });
