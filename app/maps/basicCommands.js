import { random_by_choice, slice_2d_array, shuffle } from '../utils/utils';

export function basic_commands(obj) {
  let { number_of_commands, type_of_actions, probs_of_actions } = obj;

  if (number_of_commands === undefined) number_of_commands = 5;

  const excepted_commands = [
    [1, 2],
    [1, 3],
    [1, 4],
    [2, 1],
    [2, 3],
    [2, 4],
    [3, 3],
    [3, 4],
    [4, 3],
    [4, 4],
  ];

  let command = random_by_choice(type_of_actions, probs_of_actions);
  while (command > 2) command = random_by_choice(type_of_actions, probs_of_actions);
  let commands = [command];

  for (let i = 0; i < number_of_commands - 2; i++) {
    let chk = true;
    while (chk) {
      chk = false;
      command = random_by_choice(type_of_actions, probs_of_actions);
      for (let excepted_command = 0; excepted_command < excepted_commands.length; excepted_command++) {
        if (
          commands[commands.length - 1] === excepted_commands[excepted_command][0] &&
          command === excepted_commands[excepted_command][1]
        ) {
          chk = true;
        }
      }
      if (
        commands.length >= 2 &&
        commands[commands.length - 1] > 0 &&
        commands[commands.length - 1] == commands[commands.length - 2] &&
        commands[commands.length - 1] === command
      )
        chk = true;
    }
    commands.push(command);
  }
  commands.push(0);
  commands = { commands: commands, type: 'basic' };
  return commands;
}

export function reverse_basic_commands(obj) {
  var { commands } = obj;
  if (commands === undefined) commands = [0, 1, 0, 2, 0];

  var new_commands = [...commands, ...[2, 2]];
  for (var i = commands.length - 1; i > 0; i--) {
    if (commands[i] == 0) {
      new_commands.push(0);
    } else if (commands[i] == 1) {
      new_commands.push(2);
    } else if (commands[i] == 2) {
      new_commands.push(1);
    }
  }
  new_commands.push(commands[0]);
  return new_commands;
}

// generate commands for loop commands

export function basic_for_loop_commands(obj) {
  let { number_of_turns, number_of_commands, number_of_iterations, type_of_actions, probs_of_actions } = obj;

  if (number_of_turns === undefined) number_of_turns = 2;
  if (number_of_commands === undefined) number_of_commands = 5;
  if (number_of_iterations === undefined) number_of_iterations = 4;

  const excepted_commands = [
    [1, 1],
    [1, 2],
    [2, 1],
    [2, 2],
    [3, 3],
    [3, 4],
    [4, 3],
    [4, 4],
  ];

  let commands = [];
  if (number_of_commands - 2 * number_of_turns + 1 < 0) {
    console.log('cannot generate basic commands');
    return commands;
  }

  number_of_commands = number_of_commands - (2 * number_of_turns - 1);
  if (number_of_commands > 0 && Math.random() < 1 / number_of_turns) {
    commands.push(0);
    number_of_commands--;
  }
  for (var i = 0; i < number_of_turns; i++) {
    while (commands.length > 0 && number_of_commands > 0 && Math.random() < 1 / (number_of_turns - i + 0.5)) {
      var chk = true;
      var command = random_by_choice(type_of_actions, probs_of_actions);
      while (chk) {
        chk = false;
        command = random_by_choice(type_of_actions, probs_of_actions);
        if (command === 1 || command === 2) chk = true;
        for (var excepted_command = 0; excepted_command < excepted_commands.length; excepted_command++) {
          if (
            commands[commands.length - 1] === excepted_commands[excepted_command][0] &&
            command === excepted_commands[excepted_command][1]
          ) {
            chk = true;
          }
        }
      }
      number_of_commands--;
      commands.push(command);
    }
    if (Math.random() < 0.5) commands.push(1);
    else commands.push(2);

    if (i !== number_of_turns - 1) commands.push(0);
  }
  if (commands.length === 0) {
    commands.push(0);
    number_of_commands--;
  }
  while (number_of_commands) {
    var chk = true;
    var command = random_by_choice(type_of_actions, probs_of_actions);
    while (chk) {
      chk = false;
      command = random_by_choice(type_of_actions, probs_of_actions);
      if (command === 1 || command === 2) chk = true;
      for (var excepted_command = 0; excepted_command < excepted_commands.length; excepted_command++) {
        if (
          commands[commands.length - 1] === excepted_commands[excepted_command][0] &&
          command === excepted_commands[excepted_command][1]
        ) {
          chk = true;
        }
      }
    }
    number_of_commands--;
    commands.push(command);
  }
  return commands;
}

export function basic_commands_for_tile_condition(obj) {
  let { number_of_commands, commands, is_reversed, type_of_actions, probs_of_actions } = obj;

  let command;

  if (number_of_commands === undefined) number_of_commands = 1;
  number_of_commands = parseInt(number_of_commands);
  if (commands === undefined) {
    commands = [];
    if (number_of_commands < 1) number_of_commands = 1;
    else if (number_of_commands === 1) {
      command = Math.floor(Math.random() * 2) + 1;
    } else if (number_of_commands === 2) {
      commands = [0, Math.floor(Math.random() * 2) + 1];
    } else {
      command = random_by_choice(type_of_actions, probs_of_actions);
      while (command > 2) command = random_by_choice(type_of_actions, probs_of_actions);
      commands.push(command);
    }
  }
  if (is_reversed === undefined) is_reversed = false;

  const excepted_commands = [
    [1, 1],
    [1, 2],
    [1, 3],
    [1, 4],
    [2, 1],
    [2, 2],
    [2, 3],
    [2, 4],
    [3, 3],
    [3, 4],
    [4, 3],
    [4, 4],
  ];
  for (var i = 0; i < number_of_commands - 3; i++) {
    var chk = true;
    while (chk) {
      chk = false;
      command = random_by_choice(type_of_actions, probs_of_actions);
      for (var excepted_command = 0; excepted_command < excepted_commands.length; excepted_command++) {
        if (
          commands[commands.length - 1] === excepted_commands[excepted_command][0] &&
          command === excepted_commands[excepted_command][1]
        ) {
          chk = true;
        }
      }
    }
    commands.push(command);
  }
  commands.push(0);
  command = random_by_choice(type_of_actions, probs_of_actions);
  while (command === 0) command = random_by_choice(type_of_actions, probs_of_actions);
  commands.push(command);

  if (is_reversed) {
    if (Math.random() < 0.5) commands = [...commands, ...[0, 4]];
    else commands = [...commands, ...[0, 4]];
    commands = reverse_basic_commands({ commands: commands });
  }
  return commands;
}
