const race = {
  time: 58819676,
  record: 434104122191218
};


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

const result = beat_race(race);

console.log(result);
