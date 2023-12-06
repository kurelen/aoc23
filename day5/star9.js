const fs = require('node:fs');
const readline = require('node:readline')

const number_r = /(\d+)/g;
const new_map_r = /.* map:$/g;

function to_numbers(list) {
  return [...list.matchAll(number_r)]
    .map(([first, ..._]) => parseInt(first));
}

function generate_mapper() {
  const rules = [];

  return {
    add_rule(rule) {
      rules.push(rule);
    },
    eval(n) {
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
  return {
    parse_line(line) {
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
