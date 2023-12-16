const races = [
  {
    time: 58,
    record: 434
  },
  {
    time: 81,
    record: 1041
  },
  {
    time: 96,
    record: 2219
  },
  {
    time: 76,
    record: 1218
  },
];


function distance(time, button_pressed) {
  return button_pressed * (time - button_pressed);
}

function beat_race({ time, record }) {
  let result = 0;
  for (let i = 0; i <= time; i++) {
    if (distance(time, i) > record) {
      result++;
    }
  }
  return result;
}

const result = races.map(beat_race).reduce((a, b) => a * b, 1);

console.log(result);
