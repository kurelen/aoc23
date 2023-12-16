const fs = require('node:fs');
const readline = require('node:readline')

const line_r = /(\w+) (\d+)/g;

function frequencies(strings) {
  const result = {};
  strings.forEach(s => {
    if (result.hasOwnProperty(s)) {
      result[s]++;
    } else {
      result[s] = 1;
    }
  });

  return result;
}

function hand_type(hand) {
  const entries = Object.entries(frequencies([...hand]));
  if (entries.length === 5) {
    // High card
    return 'high card'
    return 0;
  } else if (entries.length === 4) {
    // One Pair
    return 'one pair'
    return 1;
  } else if (entries.length === 3) {
    // two pair or three of a kind
    return entries.some(([_, c]) => c === 3)
      ? 'three of a kind'
      : 'two pair'; 
  } else if (entries.length === 2) {
    return entries.some(([_, c]) => c === 4)
      ? 'four of a kind'
      : 'full house'; 
  } else {
    // five of a kind
    return 'five of a kind';
  }
}

function type_value(hand_type) {
  switch (hand_type) {
    case 'high card':
      return 0;
    case 'one pair':
      return 1;
    case 'two pair':
      return 2;
    case 'three of a kind':
      return 3;
    case 'full house':
      return 4;
    case 'four of a kind':
      return 5;
    case 'five of a kind':
      return 6;
  }
}

function hand_sort([hand1], [hand2]) {
  const a = type_value(hand_type(hand1));
  const b = type_value(hand_type(hand2));

  if (a === b) {
    // TODO: Add this sorting case
    return 1
  }
  return b - a;
}

function generate_parser() {
  const hands = [];
  let finished = false;
  return {
    parse_line(line) {
      if (finished) {
        throw new Error("parser finished");
      }
      const [hand, score] = line.split(" ");
      hands.push([hand, parseInt(score)]);
    },
    finish() {
      finished = true;
      Object.freeze(hands);
    },
    hands,
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

process_file('input', parser)
  .then((p) => {
    console.log(p.hands.toSorted(hand_sort));
  });
