const fs = require('node:fs');
const readline = require('node:readline')

const count_color_r = /(\d+) ([a-z]+)/g;

function collect_round(round) {
  return Object.fromEntries(
    [...round.matchAll(count_color_r)].map(([_, value, key]) => [key, parseInt(value)])
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

function minimal_cubes(rounds) {
  return rounds.reduce((current_minimum, {red = 0, blue = 0, green = 0}) => {
    return {
      red: Math.max(current_minimum.red, red),
      blue: Math.max(current_minimum.blue, blue),
      green: Math.max(current_minimum.green, green),
    }
  }, {red: 0, blue: 0, green: 0});
}

function cube_power_set({red = 0, blue = 0, green = 0}) {
  return red * blue * green;
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

  return res.map(({rounds}) => minimal_cubes(rounds)).reduce((acc, cube) => acc + cube_power_set(cube), 0) 
}

process_input()
  .then(result => console.log(`Parsed input`, result));

