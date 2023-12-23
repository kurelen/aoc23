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
    return 'high card'
  } else if (entries.length === 4) {
    return 'one pair'
  } else if (entries.length === 3) {
    return entries.some(([_, c]) => c === 3)
      ? 'three of a kind'
      : 'two pair'; 
  } else if (entries.length === 2) {
    return entries.some(([_, c]) => c === 4)
      ? 'four of a kind'
      : 'full house'; 
  } else {
    return 'five of a kind';
  }
  throw new Error('Unknown hand', { cause: hand });
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
  throw new Error('Unknown hand type', { cause: hand_type })
}

function face_value(face) {
  switch (face) {
    case '2':
      return 2;
    case '3':
      return 3;
    case '4':
      return 4;
    case '5':
      return 5;
    case '6':
      return 6;
    case '7':
      return 7;
    case '8':
      return 8;
    case '9':
      return 9;
    case 'T':
      return 10;
    case 'J':
      return 11;
    case 'Q':
      return 12;
    case 'K':
      return 13;
    case 'A':
      return 14;
  }
  throw new Error('Unknown card face', { cause: face })
}

function face_sort(hand1, hand2) {
  for (let i=0; i < hand1.length; i++) {
    const fv1 = face_value(hand1[i]);
    const fv2 = face_value(hand2[i]);
    if (fv1 !== fv2) {
      return fv2 - fv1;
    }
  }
  return 0;
}

function hand_sort([hand1], [hand2]) {
  const a = type_value(hand_type(hand1));
  const b = type_value(hand_type(hand2));

  if (a === b) {
    return face_sort(hand1, hand2);
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
    const result = p.hands
      .toSorted(hand_sort)
      .reverse()
      .map(([_, rank]) => rank)
      .reduce((acc, cur, idx) => acc + (idx + 1) * cur);
    console.log(result);
  });
