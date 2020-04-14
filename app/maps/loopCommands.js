import { random_by_choice, slice_2d_array, shuffle } from '../utils/utils';
import { basic_for_loop_commands } from './basicCommands';

export function for_loop_commands(obj) {
  let { number_of_turns, number_of_commands, number_of_iterations, probs_of_actions, type_of_actions } = obj;

  if (number_of_turns === undefined) number_of_turns = 2;
  if (number_of_commands === undefined) number_of_commands = 4;
  if (number_of_iterations === undefined) number_of_iterations = 4;

  var commands = basic_for_loop_commands({
    number_of_turns: number_of_turns,
    number_of_commands: number_of_commands,
    number_of_iterations: number_of_iterations,
    probs_of_actions,
    type_of_actions
  });
  commands = { commands: commands, iteration: number_of_iterations, type: 'for' };
  return commands;
}

// generate commands for nested loop commands

export function nested_for_loop_commands(obj) {
  let {
    number_of_outer_loop_turns,
    number_of_outer_loop_commands,
    number_of_outer_loop_iterations,
    number_of_inner_loop_turns,
    number_of_inner_loop_commands,
    number_of_inner_loop_iterations,
    type_of_actions,
    probs_of_actions
  } = obj;

  if (number_of_outer_loop_turns === undefined) number_of_outer_loop_turns = 1;
  if (number_of_outer_loop_commands === undefined) number_of_outer_loop_commands = 2;
  if (number_of_outer_loop_iterations === undefined) number_of_outer_loop_iterations = 3;
  if (number_of_inner_loop_turns === undefined) number_of_inner_loop_turns = 1;
  if (number_of_inner_loop_commands === undefined) number_of_inner_loop_commands = 2;
  if (number_of_inner_loop_iterations === undefined) number_of_inner_loop_iterations = 2;

  let inner_commands = for_loop_commands({
    number_of_turns: number_of_inner_loop_turns,
    number_of_commands: number_of_inner_loop_commands,
    number_of_iterations: number_of_inner_loop_iterations,
    type_of_actions,
    probs_of_actions
  });
  let outter_commands = basic_for_loop_commands({
    number_of_turns: number_of_outer_loop_turns,
    number_of_commands: number_of_outer_loop_commands,
    number_of_iterations: number_of_outer_loop_iterations,
    probs_of_actions,
    type_of_actions
  });
  let commands = [inner_commands, ...outter_commands];

  commands = { commands: commands, iteration: number_of_outer_loop_iterations, type: 'for' };

  return commands;
}
