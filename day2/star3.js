const fs = require('node:fs');
const readline = require('node:readline')

const count_color_r = /(\d+) ([a-z]+)/g;

function collect_round(round) {
  return Object.fromEntries(
    [...round.matchAll(count_color_r)]
      .map(([_, value, key]) => [key, parseInt(value)])
  )
}

const number_r = /(\d+)/g;

function game_number(game) {
  return parseInt(game.match(number_r));
}

function parse_line(line) {
  const [gameString, roundsString] = line.split(':');
  const rounds = roundsString.split(';').map(collect_round);
  const game = game_number(gameString);
  return {
    game,
    rounds
  };
}

function valid_round({red = 0, blue = 0, green = 0}) {
  return red <= 12 && green <= 13 && blue <= 14;
}

function validate({rounds}) {
  return rounds.every(valid_round)
}

async function process_input() {
  const rl = readline.createInterface({
    input: fs.createReadStream('input.txt'),
    crlfDelay: Infinity,
  });

  const res = []

  for await (const line of rl) {
    res.push(parse_line(line));
  }

  return res.filter(validate).reduce((acc, {game}) => game + acc, 0);
}

process_input()
  .then(result => console.log(`Parsed input`, result));

