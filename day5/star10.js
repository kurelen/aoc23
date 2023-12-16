const fs = require('node:fs');
const readline = require('node:readline')

const number_r = /(\d+)/g;
const new_map_r = /.* map:$/g;

function to_numbers(list) {
  return [...list.matchAll(number_r)]
    .map(([first, ..._]) => parseInt(first));
}

function ranges_disjoint(r1, r2) {
  const [[x,l], [y,k]] = r1[0] <= r2[0]
    ? [r1, r2] : [r2, r1];
  return x + l <= y
}

function range_contains(outer, inner) {
  const [x, l] = outer;
  const [y, k] = inner;
  return x <= y && x+l <= y+k;
}

function cut(range, stencil) {
  const [x, l] = range;
  const [y, k] = stencil;
  if (ranges_disjoint(range, stencil)) {
    return [range];
  }
  if (range_contains(stencil, range)) {
    return [range];
  }
  if (range_contains(range, stencil)) {
    return [[x, y-x], [y,k ], [y+k, x+l-y-k]];
  }
  if (x <= y) {
    return [[x, y-x], [y, x+l-k]];
  }
  return [[x, y+k-x], [y+k, x+l]];
}

function generate_mapper() {
  const rules = [];

  return {
    add_rule(rule) {
      rules.push(rule);
    },
    eval(ranges) {
      for (const [destination, source, length] of rules) {
        if (source <= n && n < source + length) {
          return n + destination - source;
        }
      }
      return n;
    },
  };
}

function generate_parser() {
  const seeds = [];
  const mapper = [];
  let current_mapper;
  let finished = false;
  return {
    parse_line(line) {
      if (finished) {
        throw new Error('Parser finished');
      }
      if (line.length === 0) {
        return;
      }
      if (seeds.length === 0) {
        seeds.push(...to_numbers(line));
        return;
      }
      if (line.match(new_map_r)) {
        current_mapper = generate_mapper();
        mapper.push(current_mapper);
        return;
      }
      current_mapper.add_rule(to_numbers(line));
    },
    finish() {
      Object.freeze(mapper);
      finished = true;
    },
    seeds,
    mapper,
    eval(seed) {
      return mapper.reduce((v, m) => m.eval(v), seed);
    }
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

process_file('input.txt', parser)
  .then((p) => {
    const result = p.seeds
          .map(p.eval)
          .reduce((a, b) => Math.min(a,b), Infinity)

    console.log(`Lowest location number of all seeds is ${result}`);
  });
