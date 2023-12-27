const fs = require('node:fs');
const readline = require('node:readline')

function all_zeroes(xs) {
  return xs.every(x => x === 0);
}

function difference(xs) {
  const result = [];
  for (let i = 0; i < xs.length - 1; i++) {
    result.push(xs[i+1] - xs[i]);
  }
  return result;
}

function generate_parser() {
  const measurements = [];
  let finished = false;
  return {
    parse_line(line) {
      if (finished) {
        throw new Error("parser finished");
      }
      measurements.push(
        line.split(" ").map(s => parseInt(s)));
    },
    finish() {
      finished = true;
      Object.freeze(measurements);
    },
    measurements
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

function last(xs) {
  return xs[xs.length - 1];
}

function extend(xs) {
  const stack = build_stack(xs);
  return build_stack(xs)
    .map(last)
    .reduce((a,b) => a + b, 0);
}

function build_stack(xs) {
  const stack = [xs]
  while (!all_zeroes(xs)) {
    xs = difference(xs);
    stack.unshift(xs);
  }
  return stack;
}

process_file('input', parser)
  .then((p) => {
    const result = p.measurements
      .map(extend)
      .reduce((a,b) => a + b, 0);
    console.log(result);
  });
