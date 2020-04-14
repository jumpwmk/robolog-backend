import { basic_commands_for_tile_condition } from './basicCommands';
import { shuffle } from '../utils/utils';

export function if_path_condition_commands(obj) {
  let { commands, condition, commands_else, condition_type } = obj;

  if (commands === undefined) commands = [0];
  if (condition === undefined) condition = 'ahead';
  if (condition_type === undefined) condition_type = 'if';

  if (condition_type === 'if') {
    commands = { commands: commands, condition: condition, type: condition_type };
  } else if (condition_type === 'if_else') {
    commands = { commands: commands, commands_else: commands_else, condition: condition, type: condition_type };
  }
  return commands;
}

export function if_else_path_condition_commands(obj) {
  let { condition_type } = obj;

  if (condition_type === undefined) condition_type = 'if';

  // console.log(condition_type);

  let commands = [];

  if (condition_type === 'if') {
    var pool_of_commands = [
      [[2], 'left'],
      [[1], 'right']
    ];
    shuffle(pool_of_commands);
    commands = if_path_condition_commands({
      commands: pool_of_commands[0][0],
      condition: pool_of_commands[0][1],
      condition_type
    });
  } else if (condition_type === 'if_else') {
    var pool_of_commands = [
      [[2], 'left'],
      [[1], 'right']
    ];
    shuffle(pool_of_commands);
    commands = [
      if_path_condition_commands({ commands: pool_of_commands[1][0], condition: pool_of_commands[1][1], type: 'if' })
    ];
    commands = if_path_condition_commands({
      commands: pool_of_commands[0][0],
      condition: pool_of_commands[0][1],
      commands_else: commands,
      condition_type
    });
  } else if (condition_type === 'nested_if') {
    var pool_of_commands = [
      [[2, 0], 'left'],
      [[1, 0], 'right'],
      [[0], 'ahead']
    ];
    while (true) {
      shuffle(pool_of_commands);
      if (pool_of_commands[2][0][0] > 0) {
        break;
      }
    }
    commands = [
      if_path_condition_commands({
        commands: pool_of_commands[1][0],
        condition: pool_of_commands[1][1],
        commands_else: pool_of_commands[2][0],
        condition_type: 'if_else'
      })
    ];
    commands = if_path_condition_commands({
      commands: pool_of_commands[0][0],
      condition: pool_of_commands[0][1],
      commands_else: commands,
      condition_type: 'if_else'
    });
  } else {
    console.log('error in condition type in if_else_path_condition_commands function');
  }

  return commands;
}

export function if_else_path_condition_commands_with_loop(obj) {
  let { condition_type, number_of_iterations } = obj;

  if (condition_type === undefined) condition_type = 'if';
  if (number_of_iterations === undefined) number_of_iterations = 5;

  let commands = if_else_path_condition_commands({ condition_type: condition_type });
  if (condition_type === 'if' || condition_type === 'if_else') {
    commands = [commands, 0];
  } else {
    commands = [commands];
  }
  commands = { commands: commands, iteration: number_of_iterations, type: 'for' };
  return commands;
}

export function if_tile_condition_commands(obj) {
  let { commands, commands_else, condition, condition_type } = obj;

  if (commands === undefined) commands = [2, 0, 3, 2, 2, 0, 0, 2];
  if (condition === undefined) condition = 'on red tile';
  if (condition_type === undefined) condition_type = 'if';

  if (condition_type === 'if') commands = { commands: commands, condition: condition, type: condition_type };
  else if (condition_type === 'if_else')
    commands = { commands: commands, commands_else: commands_else, condition: condition, type: condition_type };
  return commands;
}

export function if_else_tile_condition_commands(obj) {
  let {
    condition_type,
    commands,
    commands_else,
    condition,
    number_of_commands,
    is_reversed,
    type_of_actions,
    probs_of_actions
  } = obj;

  if (condition_type === undefined) condition_type = 'if';
  if (condition === undefined) condition = 'on red tile';
  if (number_of_commands === undefined) number_of_commands = 1;
  if (is_reversed === undefined) is_reversed = true;

  if (condition_type === 'if') {
    commands = basic_commands_for_tile_condition({
      number_of_commands: number_of_commands,
      commands: commands,
      is_reversed: is_reversed,
      type_of_actions,
      probs_of_actions
    });
    commands = if_tile_condition_commands({ commands: commands, condition: condition, condition_type: condition_type });
  } else if (condition_type === 'if_else') {
    commands = basic_commands_for_tile_condition({
      number_of_commands: number_of_commands,
      commands: commands,
      is_reversed: is_reversed,
      type_of_actions,
      probs_of_actions
    });
    commands = if_tile_condition_commands({
      commands: commands,
      commands_else: commands_else,
      condition: condition,
      condition_type: condition_type
    });
  }
  return commands;
}

export function if_else_tile_condition_commands_with_loop(obj) {
  let {
    condition_type,
    number_of_commands,
    number_of_iterations,
    is_reversed,
    type_of_actions,
    probs_of_actions
  } = obj;

  if (condition_type === undefined) condition_type = 'if';
  if (number_of_commands === undefined) number_of_commands = 2;
  if (number_of_iterations === undefined) number_of_iterations = 5;
  if (is_reversed === undefined) is_reversed = false;

  let conditions = ['on grey tile', 'on red tile'];
  shuffle(conditions);
  let commands = {};
  if (condition_type === 'if') {
    commands = if_else_tile_condition_commands({
      condition_type: condition_type,
      condition: conditions[0],
      number_of_commands: number_of_commands,
      is_reversed,
      type_of_actions,
      probs_of_actions
    });
    commands = [commands, 0];
  } else if (condition_type === 'if_else') {
    const commands_else = [
      if_else_tile_condition_commands({
        condition_type: 'if',
        condition: conditions[1],
        number_of_commands: number_of_commands,
        is_reversed,
        type_of_actions,
        probs_of_actions
      })
    ];
    commands = if_else_tile_condition_commands({
      condition_type,
      commands_else,
      condition: conditions[0],
      number_of_commands: number_of_commands,
      is_reversed,
      type_of_actions,
      probs_of_actions
    });
    commands = [commands, 0];
  } else if (condition_type === 'nested_if') {
    /// not done yet
  }
  commands = { commands: commands, iteration: number_of_iterations, type: 'for' };
  return commands;
}
