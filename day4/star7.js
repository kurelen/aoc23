const fs = require('node:fs');
const readline = require('node:readline')

const number_r = /(\d+)/g;

function toNumbers(list) {
  return [...list.matchAll(number_r)]
    .map(([first, ..._]) => parseInt(first));
}

function generate_parser() {
  const rounds = [];

  return {
    parse_line(line) {
      const [card, ns] = line.split(":");
      const [winning, having] = ns.split("|");
      rounds.push({
        card,
        winning: toNumbers(winning),
        having: toNumbers(having)
      });
    },
    finish() {
      Object.freeze(rounds);
    },
    rounds,
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

function intersection(xs, ys) {
  const x_set = new Set(xs);
  const y_set = new Set(ys);
  let result = 0;
  x_set.forEach(x => {
    if (y_set.has(x)) {
      result = result + 1;
    }
  });
  return result;
}

process_file('input.txt', parser)
  .then((p) => {
    const result = p.rounds
          .map(({winning, having}) => intersection(winning, having))
          .map(n => n === 0 ? 0 : 2 ** (n - 1))
          .reduce((a, b) => a + b, 0);
    console.log(`Total points: ${result}`);
  });
