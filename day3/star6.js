const fs = require('node:fs');
const readline = require('node:readline')

function generate_parser() {
  const map = [];
  const special_character = [];
  let row_nr = 0;

  return {
    parse_line(line) {
      const row = [];
      let o;
      for (let column_nr = 0; column_nr < line.length; column_nr++) {
        const ch = line.charAt(column_nr);
        if (ch === '.') {
          o = undefined;
          continue;
        } else if ('0' <= ch && ch <= '9') {
          const digit = parseInt(ch);
          if (!o || o.type !== 'number' ) {
            o = { type: 'number', value: digit };
          } else {
            o.value = o.value * 10 + digit;
          }
        } else {
          o = { type: 'special_character', value: ch };
          special_character.push([ch, row_nr, column_nr]);
        }
        row[column_nr] = o;
      }
      map.push(row);
      row_nr = row_nr + 1;
    },
    finish() {
      Object.freeze(map);
      Object.freeze(special_character);
    },
    map,
    special_character,
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
    const offsets = [
      [-1, -1], [-1, 0], [-1, 1],
      [ 0, -1],          [ 0, 1],
      [ 1, -1], [ 1, 0], [ 1, 1],
    ];
    const result = p.special_character
      .filter(([ch]) => ch === '*')
      .map(([ch, row, column]) => {
        const part_numbers = new Set();
        offsets.forEach(([i, j]) => {
          const o = p.map[row + i][column + j];
          if (o && o.type === 'number') {
            part_numbers.add(o);
          }
        })
        return part_numbers;
      })
      .filter(s => s.size === 2)
      .reduce((acc, s) => {
        const [a, b] = Array.from(s);
        return acc + a.value * b.value;
      }, 0);

    console.log(`The gear ratio number is ${result}`)
    return result;
  });
