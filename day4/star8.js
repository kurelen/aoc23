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
      const [card_nr] = toNumbers(card)
      rounds.push({
        card: card_nr,
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
    const cards = new Array(p.rounds.length).fill(1);
    const winnings = p.rounds
          .map(({card, winning, having}) => intersection(winning, having));

    for (let i = 0; i < cards.length; i++) {
      const c = cards[i];
      const w = winnings[i];
      for (let j = 1; j <= w; j++) {
        cards[i + j] += c;
      }
    }

    const result = cards.reduce((a, b) => a + b, 0);

    console.log(`Total number of scratch cards: ${result}`);
  });
