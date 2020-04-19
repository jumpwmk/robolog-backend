import { slice_2d_array } from '../utils/utils';
import { basic_commands, reverse_basic_commands } from './basicCommands';
import { for_loop_commands } from './loopCommands';
import { if_else_tile_condition_commands_with_loop } from './decisionMakingCommands';
import { if_else_path_condition_commands_with_loop } from './decisionMakingCommands';

import { mapW_real, mapH_real, mapW, mapH } from '../config/constant';

const { PriorityQueue } = require('../utils/priority_queue');
const { UnionFind } = require('../utils/union_find');

let probs_of_actions = [0.4, 0.2, 0.2, 0, 0.2]; // 0: go ahead, 1: turn right, 2: turn left, 3: do action I, 4: do action II
let type_of_actions = 5;

function add_enemies(obj) {
  let { mapData, x, y } = obj;

  var direction = Math.floor(Math.random() * 4);
  var direction_to_word = ['xb', 'yf', 'xf', 'yb'];

  var enemies_type = 'bot';
  // var enemies_facing = direction_to_word[direction];
  var enemies_facing = 'xf';
  mapData.enemies[x][y] = { enemytype: enemies_type, facing: enemies_facing };
}

function add_floatingobj(obj) {
  var mapData = obj.mapData;
  var x = obj.x;
  var y = obj.y;
  var objtype = 'gem';
  var objvari = 1;
  mapData.floatingobj[x][y] = { objtype: objtype, objvari: objvari, visible: true };
}

function add_tileoverlay(obj) {
  const { mapData, x, y, overlaytype } = obj;
  mapData.tileoverlay[x][y] = { overlaytype: overlaytype };
}

function add_wall(obj) {
  var mapData = obj.mapData;
  var x = obj.x;
  var y = obj.y;
  var facing = obj.facing;
  var overlaytype = 1;

  mapData.wall[x][y][facing] = { walltype: overlaytype };
}

function remove_wall(obj) {
  var mapData = obj.mapData;
  var final = obj.final;
  if (final === undefined) final = true;

  var x = obj.x;
  var y = obj.y;
  var facing = obj.facing;
  // console.log('in remove wall function', x, y, facing, mapData.wall[x][y][facing]);
  if (mapData.wall[x][y][facing] === undefined) return true;
  // console.log(mapData.wall[x][y][facing]["permanent"]);
  if ('permanent' in mapData.wall[x][y][facing]) return false;
  delete mapData.wall[x][y][facing];
}

function build_permanent_wall(obj) {
  let { mapData, condition } = obj;

  let bot = mapData.bot;
  let word_to_direction = { ahead: 0, left: 3, right: 1 };
  let directions = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1],
  ];
  let x = bot.x;
  let y = bot.y;
  let direction = (bot.facing + word_to_direction[condition]) % 4;
  let overlaytype = 1;

  mapData.wall[x][y][direction] = { walltype: overlaytype, permanent: true };
  x = x + directions[direction];
  y = y + directions[direction];
  direction = (direction + 2) % 4;
  if (x >= 0 && y >= 0 && x < mapW && y < mapH)
    mapData.wall[x][y][direction] = { walltype: overlaytype, permanent: true };
}

function init_mapData() {
  var direction = Math.floor(Math.random() * 4);
  var mapData = {
    start: { x: 25, y: 25, facing: direction },
    bot: { x: 25, y: 25, facing: direction, state: 1 },
    check: new Array(mapW_real).fill().map(() => new Array(mapH_real).fill(0)),
    count: new Array(mapW_real).fill().map(() => new Array(mapH_real).fill(0)),
    check_object: new Array(mapW_real).fill().map(() => new Array(mapH_real).fill(false)),
    platform: new Array(mapW_real).fill().map(() => new Array(mapH_real).fill(0)),
    wall: new Array(mapW_real).fill().map(() => new Array(mapH_real).fill(undefined)),
    enemies: new Array(mapW_real).fill().map(() => new Array(mapH_real).fill(undefined)),
    tileoverlay: new Array(mapW_real).fill().map(() => new Array(mapH_real).fill(undefined)),
    floatingobj: new Array(mapW_real).fill().map(() => new Array(mapH_real).fill(undefined)),
    walloverlay: new Array(mapW_real).fill().map(() => new Array(mapH_real).fill(undefined)),
    tiles: new Array(mapW_real).fill().map(() => new Array(mapH_real).fill(0)),
  };
  for (var i = 0; i < mapW_real; i++) {
    for (var j = 0; j < mapH_real; j++) {
      mapData.wall[i][j] = { 0: { walltype: 1 }, 1: { walltype: 1 }, 2: { walltype: 1 }, 3: { walltype: 1 } };
    }
  }
  mapData.platform[mapData.bot.x][mapData.bot.y] = 1;
  mapData.check_object[mapData.bot.x][mapData.bot.y] = true;
  mapData.count[mapData.bot.x][mapData.bot.y] = 1;
  return mapData;
}

function cal_position(x, y) {
  return x * mapH + y;
}

function generate_distraction(obj) {
  var directions = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1],
  ];
  var mapData = obj.mapData;
  var number_of_distractions = obj.number_of_distractions;
  var pq = new PriorityQueue();
  var uf = new UnionFind(mapW * mapH);

  // console.log(mapData[0]);

  for (var i = 0; i < mapW; i++) {
    for (var j = 0; j < mapH; j++) {
      for (var k = 0; k < 4; k++) {
        if (mapData.platform[i][j] === 1) {
          if (
            i + directions[k][0] < 0 ||
            i + directions[k][0] >= mapW ||
            j + directions[k][1] < 0 ||
            j + directions[k][1] >= mapH
          )
            continue;
          if (k in mapData.wall[i][j] && 'permanent' in mapData.wall[i][j][k]) continue;
          if (mapData.platform[i + directions[k][0]][j + directions[k][1]]) {
            uf.union(cal_position(i, j), cal_position(i + directions[k][0], j + directions[k][1]));
            if (k in mapData.wall[i][j]) {
              mapData.wall[i][j][k].permanent = true;
              mapData.wall[i + directions[k][0]][j + directions[k][1]][(k + 2) % 4].permanent = true;
            }
            continue;
          }
          if (k in mapData.wall[i][j]) pq.push({ x: i, y: j, dir: k }, Math.random());
        }
      }
    }
  }

  while (number_of_distractions-- && !pq.isEmpty()) {
    var obj = pq.pop().element;
    var x = obj.x,
      y = obj.y,
      dir = obj.dir;
    var pos1 = cal_position(x, y);
    var pos2 = cal_position(x + directions[dir][0], y + directions[dir][1]);

    var h1 = uf.find(pos1);
    var h2 = uf.find(pos2);

    if (h1 !== h2) {
      remove_wall({ x: x, y: y, mapData: mapData, facing: dir });

      uf.union(pos1, pos2);
      x = obj.x + directions[dir][0];
      y = obj.y + directions[dir][1];

      remove_wall({ x: x, y: y, mapData: mapData, facing: (dir + 2) % 4 });
      mapData.platform[x][y] = 1;

      for (var k = 0; k < 4; k++) {
        if (
          x + directions[k][0] < 0 ||
          x + directions[k][0] >= mapW ||
          y + directions[k][1] < 0 ||
          y + directions[k][1] >= mapH
        )
          continue;
        if (mapData.wall[x][y][k] === undefined || 'permanent' in mapData.wall[x][y][k]) continue;
        if (mapData.count[x + directions[k][0]][y + directions[k][1]]) {
          // console.log('create permanent wall', x + directions[k][0], y + directions[k][1]);
          mapData.wall[x][y][k].permanent = true;
          mapData.wall[x + directions[k][0]][y + directions[k][1]][(k + 2) % 4].permanent = true;
          continue;
        }
        if (mapData.platform[x][y]) continue;
        var x2 = x + directions[k][0];
        var y2 = y + directions[k][1];
        if (uf.find(cal_position(x2, y2)) !== uf.find(cal_position(x, y))) {
          pq.push({ x: x, y: y, dir: k }, Math.random());
        }
      }
    } else {
      console.log('cannot remove walls');
      mapData.wall[x][y][dir].permanent = true;
      mapData.wall[x + directions[dir][0]][y + directions[dir][1]][(dir + 2) % 4].permanent = true;
      number_of_distractions++;
    }
  }

  for (var i = 0; i < mapW; i++) {
    for (var j = 0; j < mapH; j++) {
      for (var k = 0; k < 4; k++) {
        if (mapData.platform[i][j] === 1) {
          if (
            i + directions[k][0] < 0 ||
            i + directions[k][0] >= mapW ||
            j + directions[k][1] < 0 ||
            j + directions[k][1] >= mapH
          )
            continue;
          if (k in mapData.wall[i][j] && mapData.count[i][j]) {
            console.log('create permanent at', i, j);
            console.log(mapData.wall[i][j]);
            console.log(i + directions[k][0], j + directions[k][1], (k + 2) % 4);
            console.log(mapData.wall[i + directions[k][0]][j + directions[k][1]]);
            mapData.wall[i][j][k].permanent = true;
            mapData.wall[i + directions[k][0]][j + directions[k][1]][(k + 2) % 4].permanent = true;
          }
        }
      }
    }
  }
}

function generate_map(obj) {
  var directions = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1],
  ];

  var commands = obj.commands;
  var mapData = obj.mapData;
  var bot = obj.mapData.bot;
  var check = obj.mapData.check;
  var count = obj.mapData.count;
  const prop_walk = 0.65;

  var type = commands.type;

  console.log(commands);

  if (type === 'basic') {
    commands = commands.commands;
    for (var i = 0; i < commands.length; i++) {
      check[bot.x][bot.y] = bot.state;
      mapData.platform[bot.x][bot.y] = 1;
      if (commands[i] instanceof Object) {
        if (generate_map({ commands: commands[i], mapData: mapData }) === false) return false;
      } else if (commands[i] === 0) {
        if (remove_wall({ x: bot.x, y: bot.y, mapData: mapData, facing: bot.facing }) === false) return false;
        bot.x = bot.x + directions[bot.facing][0];
        bot.y = bot.y + directions[bot.facing][1];
        if (bot.x < 0 || bot.x >= mapW_real || bot.y < 0 || bot.y >= mapH_real || check[bot.x][bot.y] === bot.state)
          return false;
        if (mapData.floatingobj[bot.x][bot.y] !== undefined) return false;
        if (mapData.tileoverlay[bot.x][bot.y] !== undefined) return false;
        check[bot.x][bot.y] = bot.state;
        count[bot.x][bot.y]++;
        if (remove_wall({ x: bot.x, y: bot.y, mapData: mapData, facing: (bot.facing + 2) % 4 }) === false) return false;
      } else if (commands[i] === 1) {
        bot.facing = (bot.facing + 1) % 4;
      } else if (commands[i] === 2) {
        bot.facing = (bot.facing + 3) % 4;
      } else if (commands[i] === 3) {
        if (mapData.check_object[bot.x][bot.y] === true || count[bot.x][bot.y] > 1) return false;
        mapData.check_object[bot.x][bot.y] = true;
        add_enemies({ x: bot.x, y: bot.y, mapData: mapData });
        bot.state += 1;
        check[bot.x][bot.y] = bot.state;
      } else if (commands[i] === 4) {
        if (mapData.check_object[bot.x][bot.y] === true || count[bot.x][bot.y] > 1) return false;
        mapData.check_object[bot.x][bot.y] = true;
        add_floatingobj({ x: bot.x, y: bot.y, mapData: mapData });
        bot.state += 1;
        check[bot.x][bot.y] = bot.state;
      }
    }
  } else if (type === 'for') {
    var iteration = commands.iteration;
    var tmp_commands = { ...commands };
    tmp_commands.type = 'basic';
    for (var loop = 0; loop < iteration; loop++) {
      if (generate_map({ commands: tmp_commands, mapData: mapData }) === false) return false;
    }
  } else if (type === 'if') {
    if (commands.condition.includes('on')) {
      // not done yet
      let overlaytype = 1;
      if (commands.condition === 'on red tile') {
        overlaytype = 1;
      } else if (commands.condition === 'on grey tile') {
        overlaytype = 2;
      }
      if (Math.random() < prop_walk) {
        console.log('=..=');
        return true;
      }
      if (overlaytype === 1) {
        console.log('test pass');
      }
      if (mapData.check_object[bot.x][bot.y] === true) return false;
      mapData.check_object[bot.x][bot.y] = true;
      var tmp_commands = { ...commands };
      tmp_commands.type = 'basic';
      add_tileoverlay({ mapData: mapData, x: bot.x, y: bot.y, overlaytype });
      if (generate_map({ mapData: mapData, commands: tmp_commands }) === false) return false;
    } else {
      if (Math.random() < prop_walk) {
        build_permanent_wall({ mapData: mapData, condition: commands.condition });
        return true;
      }
      var tmp_commands = { ...commands };
      tmp_commands.type = 'basic';
      if (generate_map({ mapData: mapData, commands: tmp_commands }) === false) return false;
    }
  } else if (type === 'if_else') {
    /// not done yet
    if (commands.condition.includes('on')) {
      // not done yet
      let overlaytype = 1;
      if (commands.condition === 'on red tile') {
        overlaytype = 1;
      } else if (commands.condition === 'on grey tile') {
        overlaytype = 2;
      }

      if (Math.random() < prop_walk) {
        console.log('Math.random() < prop_walk');
        var tmp_commands = { ...commands };
        tmp_commands.commands = tmp_commands.commands_else;
        tmp_commands.type = 'basic';
        if (generate_map({ mapData: mapData, commands: tmp_commands }) === false) return false;
      } else {
        if (mapData.check_object[bot.x][bot.y] === true) return false;
        mapData.check_object[bot.x][bot.y] = true;
        var tmp_commands = { ...commands };
        tmp_commands.type = 'basic';
        add_tileoverlay({ mapData: mapData, x: bot.x, y: bot.y, overlaytype });
        if (generate_map({ mapData: mapData, commands: tmp_commands }) === false) return false;
      }
    } else {
      if (Math.random() < prop_walk) {
        build_permanent_wall({ mapData: mapData, condition: commands.condition });
        // do commands else
        var tmp_commands = { ...commands };
        tmp_commands.commands = tmp_commands.commands_else;
        tmp_commands.type = 'basic';
        if (generate_map({ mapData: mapData, commands: tmp_commands }) === false) return false;
      } else {
        var tmp_commands = { ...commands };
        tmp_commands.type = 'basic';
        if (generate_map({ mapData: mapData, commands: tmp_commands }) === false) return false;
      }
    }
  } else if (type === 'nested_if') {
    /// not done yet
    if (commands.condition.includes('on')) {
    } else {
      if (Math.random() < prop_walk) {
        build_permanent_wall({ mapData: mapData, condition: commands.condition });
        // do commands else
        var tmp_commands = { ...commands };
        tmp_commands.commands = tmp_commands.commands_else;
        tmp_commands.type = 'basic';
        if (generate_map({ mapData: mapData, commands: tmp_commands }) === false) return false;
      } else {
        var tmp_commands = { ...commands };
        tmp_commands.type = 'basic';
        if (generate_map({ mapData: mapData, commands: tmp_commands }) === false) return false;
      }
    }
  }
  mapData.platform[bot.x][bot.y] = 1;
  return true;
}

function count_blocks(commands) {
  let res = 0;
  console.log('---');
  console.log(commands);
  if (commands.type !== 'basic') res = 1;
  const { commands_else } = commands;
  commands = commands.commands;
  for (let i = 0; i < commands.length; i++) {
    if (commands[i] instanceof Object) {
      res += count_blocks(commands[i]);
    } else {
      res += 1;
    }
  }
  if (commands_else) {
    for (let i = 0; i < commands_else.length; i++) {
      if (commands_else[i] instanceof Object) {
        res += count_blocks(commands_else[i]);
      } else {
        res += 1;
      }
    }
  }
  return res;
}

function get_commands(commands) {
  let res = [];
  const { commands_else } = commands;
  if (commands.type === 'for') {
    res.push('for');
    res.push('while_inf');
  }
  commands = commands.commands;
  for (let i = 0; i < commands.length; i++) {
    if (commands[i] instanceof Object) {
      if (commands[i].type === 'if') {
        if (
          commands[i].condition === 'ahead' ||
          commands[i].condition === 'left' ||
          commands[i].condition === 'right'
        ) {
          res.push('if_path');
        } else {
          res.push('if_tile');
        }
      } else if (commands[i].type === 'if_else') {
        if (
          commands[i].condition === 'ahead' ||
          commands[i].condition === 'left' ||
          commands[i].condition === 'right'
        ) {
          res.push('if_path');
          res.push('if_else_path');
        } else {
          res.push('if_tile');
          res.push('if_else_tile');
        }
      } else {
        res.push('for');
        res.push('while_inf');
      }
      res.push(...get_commands(commands[i]));
    } else if (commands[i] === 0) {
      res.push('go_ahead');
    } else if (commands[i] === 1) {
      res.push('turn_left');
      res.push('turn_right');
    } else if (commands[i] === 2) {
      res.push('turn_left');
      res.push('turn_right');
    } else if (commands[i] === 3) {
      res.push('IDK');
    } else if (commands[i] === 4) {
      res.push('collect');
    }
  }
  if (commands_else) {
    for (let i = 0; i < commands_else.length; i++) {
      if (commands_else[i] instanceof Object) {
        if (commands_else[i].type === 'if') {
          if (
            commands_else[i].condition === 'ahead' ||
            commands_else[i].condition === 'left' ||
            commands_else[i].condition === 'right'
          ) {
            res.push('if_path');
          } else {
            res.push('if_tile');
          }
        } else if (commands_else[i].type === 'if_else') {
          if (
            commands_else[i].condition === 'ahead' ||
            commands_else[i].condition === 'left' ||
            commands_else[i].condition === 'right'
          ) {
            res.push('if_path');
            res.push('if_else_path');
          } else {
            res.push('if_tile');
            res.push('if_else_tile');
          }
        } else {
          res.push('for');
          res.push('while_inf');
        }
        res.push(...get_commands(commands_else[i]));
      } else if (commands_else[i] === 0) {
        res.push('go_ahead');
      } else if (commands_else[i] === 1) {
        res.push('turn_left');
        res.push('turn_right');
      } else if (commands_else[i] === 2) {
        res.push('turn_left');
        res.push('turn_right');
      } else if (commands_else[i] === 3) {
        res.push('IDK');
      } else if (commands_else[i] === 4) {
        res.push('collect');
      }
    }
  }
  let unique = [...new Set(res)];
  return unique;
}

function generate_tiles(mapData) {
  // const direction_to_word = ['xb', 'yf', 'xf', 'yb'];
  const DIRECTION_TO_NUM = [1, 2, 4, 8];

  const NXT = { 0: [-1, 0], 1: [0, 1], 2: [1, 0], 3: [0, -1] };

  const TILEOVERLAY = { 1: 128, 2: 256, 3: 512 };

  const FINAL = 1024;
  const FLOATING_OBJ = 16;

  for (var i = 0; i < mapW; i++) {
    for (var j = 0; j < mapH; j++) {
      if (!mapData.platform[i][j]) {
        continue;
      }
      if (mapData.floatingobj[i][j] !== undefined) {
        mapData.tiles[i][j] += FLOATING_OBJ;
      }
      if (mapData.tileoverlay[i][j] !== undefined) {
        mapData.tiles[i][j] += TILEOVERLAY[mapData.tileoverlay[i][j].overlaytype];
      }
      for (var k = 0; k < 4; k++) {
        if (mapData.wall[i][j] !== undefined && k in mapData.wall[i][j] && 'permanent' in mapData.wall[i][j][k]) {
          mapData.tiles[i][j] += DIRECTION_TO_NUM[k];
        } else {
          let nx_ii = i + NXT[k][0];
          let nx_jj = j + NXT[k][1];
          if (nx_ii < 0 || nx_ii >= mapW || nx_jj < 0 || nx_jj >= mapH) {
            mapData.tiles[i][j] += DIRECTION_TO_NUM[k];
          } else if (mapData.platform[i][j] === 1 && mapData.platform[nx_ii][nx_jj] === 0) {
            mapData.tiles[i][j] += DIRECTION_TO_NUM[k];
          }
        }
      }
    }
  }

  mapData.tiles[mapData.end.x][mapData.end.y] += FINAL;

  return;
}

function transform_map(obj) {
  let { mapData, number_of_distractions } = obj;

  var bot = mapData.bot;

  if (number_of_distractions === undefined) number_of_distractions = 10;

  var directions = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1],
  ];

  if (mapData.check_object[bot.x][bot.y] === true || mapData.count[bot.x][bot.y] > 1) return false;

  var direction_to_word = ['xb', 'yf', 'xf', 'yb'];
  mapData.end = { x: bot.x, y: bot.y };

  var mnX = 500,
    mnY = 500,
    mxX = -1,
    mxY = -1;
  for (var i = 0; i < mapW_real; i++) {
    for (var j = 0; j < mapH_real; j++) {
      if (mapData.platform[i][j] == 1) {
        mnX = Math.min(mnX, i);
        mxX = Math.max(mxX, i);
        mnY = Math.min(mnY, j);
        mxY = Math.max(mxY, j);
      }
    }
  }

  if (mxX - mnX + 1 > mapW || mxY - mnY + 1 > mapH) return false;

  let stX = mnX - Math.floor((mapW - (mxX - mnX + 1)) / 2);
  let stY = mnY - Math.floor((mapH - (mxY - mnY + 1)) / 2);

  // console.log(mapData.start.facing);
  mapData.player = {
    position: [mapData.start.x - stX, mapData.start.y - stY],
    beginPosition: [mapData.start.x - stX, mapData.start.y - stY],
    facing: direction_to_word[mapData.start.facing],
    beginFacing: direction_to_word[mapData.start.facing],
  };
  mapData.end = { x: mapData.end.x - stX, y: mapData.end.y - stY };
  mapData.platform = slice_2d_array(mapData.platform, stX, stX + mapW, stY, stY + mapH);
  mapData.wall = slice_2d_array(mapData.wall, stX, stX + mapW, stY, stY + mapH);
  mapData.enemies = slice_2d_array(mapData.enemies, stX, stX + mapW, stY, stY + mapH);
  mapData.tileoverlay = slice_2d_array(mapData.tileoverlay, stX, stX + mapW, stY, stY + mapH);
  mapData.floatingobj = slice_2d_array(mapData.floatingobj, stX, stX + mapW, stY, stY + mapH);
  mapData.count = slice_2d_array(mapData.count, stX, stX + mapW, stY, stY + mapH);
  mapData.check = slice_2d_array(mapData.check, stX, stX + mapW, stY, stY + mapH);
  mapData.check_object = slice_2d_array(mapData.check_object, stX, stX + mapW, stY, stY + mapH);
  mapData.walloverlay = slice_2d_array(mapData.walloverlay, stX, stX + mapW, stY, stY + mapH);
  mapData.tiles = slice_2d_array(mapData.tiles, stX, stX + mapW, stY, stY + mapH);

  generate_distraction({ mapData: mapData, number_of_distractions: number_of_distractions });

  // console.log('change walls');

  for (var i = -1; i <= mapW; i++) {
    for (var j = -1; j <= mapH; j++) {
      if (i < 0 || j < 0 || i >= mapW || j >= mapH) {
        for (var k = 0; k < 4; k++) {
          var new_i = i + directions[k][0];
          var new_j = j + directions[k][1];
          if (new_i < 0 || new_j < 0 || new_i >= mapW || new_j >= mapH) continue;
          if (mapData.wall[new_i][new_j] !== undefined && (k + 2) % 4 in mapData.wall[new_i][new_j]) {
            delete mapData.wall[new_i][new_j][(k + 2) % 4];
          }
        }
      } else if (mapData.platform[i][j] === 0) {
        mapData.wall[i][j] = undefined;
        for (let k = 0; k < 4; k++) {
          let new_i = i + directions[k][0];
          let new_j = j + directions[k][1];
          if (new_i < 0 || new_j < 0 || new_i >= mapW || new_j >= mapH) continue;
          if (mapData.wall[new_i][new_j] !== undefined && (k + 2) % 4 in mapData.wall[new_i][new_j]) {
            delete mapData.wall[new_i][new_j][(k + 2) % 4];
          }
        }
      }
    }
  }

  generate_tiles(mapData);

  for (let i = 0; i < mapW; i++) {
    for (let j = 0; j < mapH; j++) {
      for (let k = 0; k < 4; k++) {
        if (mapData.wall[i][j] !== undefined && k in mapData.wall[i][j]) {
          if ((k === 0 || k === 1) && 'permanent' in mapData.wall[i][j][k])
            mapData.wall[i][j][direction_to_word[k]] = mapData.wall[i][j][k];
          delete mapData.wall[i][j][k];
        }
      }
    }
  }

  delete mapData.check;
  delete mapData.check_object;
  delete mapData.bot;
  delete mapData.count;
  delete mapData.start;
}

function get_gems(mapData) {
  let res = 0;
  for (let i = 0; i < mapW; i++) {
    for (let j = 0; j < mapH; j++) {
      if (mapData.floatingobj[i][j] && mapData.floatingobj[i][j].objtype === 'gem') {
        res++;
      }
    }
  }
  return res;
}

export function get_map(obj) {
  // console.log(obj);
  let {
    commandLength,
    commandLengthInCondition,
    numIteration,
    numTurnInLoop,
    numberOfDistractions,
    is_reversed,
    condition_type,
    condition_cate,
    probs_of_actions,
    type_of_actions,
  } = obj;

  if (commandLength === undefined) commandLength = 5;
  if (commandLengthInCondition === undefined) commandLengthInCondition = 0;
  if (numIteration === undefined) numIteration = 0;
  if (numTurnInLoop === undefined) numTurnInLoop = 0;
  if (numberOfDistractions === undefined) numberOfDistractions = 0;
  if (is_reversed === undefined) is_reversed = false;
  if (probs_of_actions === undefined) probs_of_actions = [0.5, 0.25, 0.25, 0, 0];
  if (type_of_actions === undefined) type_of_actions = 3;
  if (condition_type === undefined) condition_type = 'if';

  console.log(obj);

  var numberOfTries = 2000;
  var commands;
  while (numberOfTries--) {
    var chk = false;
    if (condition_cate) {
      if (numIteration === 0) {
        numIteration = 8;
      }
      if (condition_cate === 'tile') {
        commands = if_else_tile_condition_commands_with_loop({
          condition_type,
          number_of_commands: commandLengthInCondition,
          number_of_iterations: numIteration,
          is_reversed: is_reversed,
          probs_of_actions,
          type_of_actions,
        });
      } else if (condition_cate === 'path') {
        commands = if_else_path_condition_commands_with_loop({
          condition_type,
          number_of_iterations: numIteration,
        });
      } else {
        console.log('condition_cate is not defined');
        return;
      }
    } else if (numIteration > 0) {
      if (numTurnInLoop === '0') {
        commands = for_loop_commands({
          number_of_turns: 2,
          number_of_commands: commandLength,
          number_of_iterations: numIteration,
          probs_of_actions,
          type_of_actions,
        });
      } else {
        commands = for_loop_commands({
          number_of_turns: numTurnInLoop,
          number_of_commands: commandLength,
          number_of_iterations: numIteration,
          probs_of_actions,
          type_of_actions,
        });
      }
    } else {
      commands = basic_commands({ number_of_commands: commandLength, probs_of_actions, type_of_actions });
    }

    console.log(commands);

    console.log('generate map');

    // commands = for_loop_commands({number_of_turns: 3, number_of_commands: 6, number_of_iterations: 3});
    // commands = basic_commands({number_of_commands: 6});
    // commands = if_else_tile_condition_commands_with_loop({condition_type: "if", number_of_commands: 1, number_of_iterations: 20, is_reversed: false});
    let numberOfTriesGenerateMap = 10;
    while (numberOfTriesGenerateMap--) {
      var mapData = init_mapData();
      if (generate_map({ commands, mapData }) === false) continue;
      if (transform_map({ mapData, number_of_distractions: numberOfDistractions }) === false) continue;
      chk = true;
      break;
    }
    if (chk) {
      const gems = get_gems(mapData);
      mapData.blocks = {
        maxBlocks: count_blocks(commands) + 1,
        maxGems: gems,
        cntGems: 0,
        cntBlocks: 0,
        command_blocks: get_commands(commands),
        commands: commands,
      };
      console.log(mapData.blocks);
      break;
    }
  }
  // console.log(commands);
  if (chk) return mapData;
}
