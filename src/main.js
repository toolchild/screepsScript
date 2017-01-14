const roleCollector = require('role.collector');
const roleMiner = require('role.miner');
const roleUpgrader = require('role.upgrader');
const roleClaimer = require('role.claimer');
const roleHarvester = require('role.harvester');
const roleSweeper = require('role.sweeper');
const roleDistanceHarvester = require('role.distance-harvester');
const roleRepairer = require('role.repairer');
const roleTower = require('role.tower');
const settings = require('settings');
const consts = require('constants');
const statsConsole = require("statsConsole");

let targetRoom = 'E73N89';

const memoryNeedsUpdate = false;

const roomCapacity = Memory.home == null ? Game.spawns['Spawn1'].room.energyCapacityAvailable : Memory.home.room.energyCapacityAvailable;
const numS100 = settings.NUM_S100;
const numR200 = settings.NUM_R200;
const numH200 = settings.NUM_H200;

const numH300 = roomCapacity >= consts.E_LEVEL_300 && roomCapacity < consts.E_LEVEL_550 ? settings.NUM_H300 : 0;
const numH550 = roomCapacity >= consts.E_LEVEL_550 && roomCapacity < consts.E_LEVEL_800 ? settings.NUM_H550 : 0;
const numH800 = roomCapacity >= consts.E_LEVEL_800 ? settings.NUM_H800 : 0;

const numM0250 = roomCapacity >= consts.E_LEVEL_250 && roomCapacity < consts.E_LEVEL_550 ? settings.NUM_M0250 : 0;
const numM1250 = roomCapacity >= consts.E_LEVEL_250 && roomCapacity < consts.E_LEVEL_550 ? settings.NUM_M1250 : 0;
const numM0550 = roomCapacity >= consts.E_LEVEL_550 ? settings.NUM_M0550 : 0;
const numM1550 = roomCapacity >= consts.E_LEVEL_550 ? settings.NUM_M1550 : 0;

const numC250 = roomCapacity >= consts.E_LEVEL_250 && roomCapacity < consts.E_LEVEL_550 ? settings.NUM_Col250 : 0;
const numC550 = roomCapacity >= consts.E_LEVEL_550 && roomCapacity < consts.E_LEVEL_750 ? settings.NUM_Col550 : 0;
const numC750 = roomCapacity >= consts.E_LEVEL_750 && roomCapacity < consts.E_LEVEL_1300 ? settings.NUM_Col750 : 0;
const numC1300 = roomCapacity >= consts.E_LEVEL_1300 ? settings.NUM_Col1300 : 0;

const numUp200 = 0;
const numUp550 = roomCapacity >= consts.E_LEVEL_550 && roomCapacity < consts.E_LEVEL_750 ? settings.NUM_Up550 : 0;
const numUp750 = roomCapacity >= consts.E_LEVEL_750 ? settings.NUM_Up750 : 0;

const numDH800 = settings.NUM_DH800;
const numCl100 = settings.NUM_Cl100;

let s100;
let r200;

let h200;
let h300;
let h550;
let h800;

let m0250;
let m1250;
let m0550;
let m1550;

let c250;
let c550;
let c750;
let c1300;

let dH800;
let cl100;

let up200;
let up550;
let up750;

const tower1 = Game.getObjectById('587555c0ff22ce385737f1c7');
const tower2 = Game.getObjectById('58791fd9fcfae81e151c2793');

module.exports.loop = function () {
  
  // statsConsole.warn('warning');
  
  let loopCPUStart = Game.cpu.getUsed();
  //
  // var stringified = JSON.stringify(Memory);
  // var startCpu = Game.cpu.getUsed();
  // JSON.parse(stringified);
  // var value = Game.cpu.getUsed() - startCpu;
  // statsConsole.log('CPU parse:', value + ' of: ' + Game.cpu.tickLimit + ' which is: ' + value / Game.cpu.tickLimit * 100 + '% and: ' + value / Game.cpu.limit * 100 +'% of the limit: ' + Game.cpu.limit);
  fillMemory();
  prepareCreepsAmounts();
  logStats();
  clearMemory();
  respawnCreeps();
  roleTower.run(tower1);
  roleTower.run(tower2);
  handleCreeps();
  
  handleStats();
  // let totalTime= Game.cpu.getUsed() - loopCPUStart;
  // statsConsole.log('\tCPU loop:', value.toFixed(1) + ' of: ' + Game.cpu.tickLimit + ' which is: ' + (value / Game.cpu.tickLimit * 100).toFixed(1) + '% ' +
  //   'and: ' + (value / Game.cpu.limit * 100).toFixed(1) + '% of the limit: ' + Game.cpu.limit + ' of: ' + Game.cpu.bucket);
  
};

const fillMemory = () => {
  if (!Memory.home || !Memory.home.roomSources || !Memory.home.room || memoryNeedsUpdate) {
    this.Game = Game;
    statsConsole.log('filling memory');
    Memory.home = {
      room: Game.spawns['Spawn1'].room,
      roomSources: _.map(_.sortBy(Game.spawns['Spawn1'].room.find(FIND_SOURCES), (source) => source.id), (source) => source.id),
    };
  } else {
    Memory.home.room = Game.spawns['Spawn1'].room;
    // statsConsole.log('main memory: roomSources: ' + Memory.home.roomSources);
  }
  
};

const prepareCreepsAmounts = function () {
  s100 = _.filter(Game.creeps, (creep) => creep.name.startsWith('s100'));
  r200 = _.filter(Game.creeps, (creep) => creep.memory.role == 'r200');
  h200 = _.filter(Game.creeps, (creep) => creep.memory.role == 'h200');
  h300 = _.filter(Game.creeps, (creep) => creep.memory.role == 'h300');
  h550 = _.filter(Game.creeps, (creep) => creep.memory.role == 'h550');
  h800 = _.filter(Game.creeps, (creep) => creep.memory.role == 'h800');
  m0250 = _.filter(Game.creeps, (creep) => creep.memory.role == 'm0250');
  m1250 = _.filter(Game.creeps, (creep) => creep.memory.role == 'm1250');
  m0550 = _.filter(Game.creeps, (creep) => creep.memory.role == 'm0550');
  m1550 = _.filter(Game.creeps, (creep) => creep.memory.role == 'm1550');
  c250 = _.filter(Game.creeps, (creep) => creep.memory.role == 'c250');
  c550 = _.filter(Game.creeps, (creep) => creep.memory.role == 'c550');
  c750 = _.filter(Game.creeps, (creep) => creep.memory.role == 'c750');
  c1300 = _.filter(Game.creeps, (creep) => creep.memory.role == 'c1300');
  
  up200 = _.filter(Game.creeps, (creep) => creep.memory.role == 'up200');
  up550 = _.filter(Game.creeps, (creep) => creep.memory.role == 'up550');
  up750 = _.filter(Game.creeps, (creep) => creep.memory.role == 'up750');
  
  cl100 = _.filter(Game.creeps, (creep) => creep.memory.role == 'cl100');
  dH800 = _.filter(Game.creeps, (creep) => creep.memory.role == 'dH800');
};
const logStats = function () {
  statsConsole.log('main:Energy:' + Memory.home.room.energyAvailable + '/' + Memory.home.room.energyCapacityAvailable
    + ' s100:' + s100.length + '/' + numS100
    + ' r200:' + h200.length + '/' + numR200
    + ' h200:' + h200.length + '/' + numH200
    + ' h300:' + h300.length + '/' + numH300
    + ' h550:' + h550.length + '/' + numH550
    + ' h800:' + h800.length + '/' + numH800
    
    + ' m0250:' + m0250.length + '/' + numM0250
    + ' m1250:' + m1250.length + '/' + numM1250
    + ' m0550:' + m0550.length + '/' + numM0550
    + ' m1550:' + m1550.length + '/' + numM1550
    
    + ' c250:' + c250.length + '/' + numC250
    + ' c550:' + c550.length + '/' + numC550
    + ' c750:' + c750.length + '/' + numC750
    + ' c1300:' + c1300.length + '/' + numC1300
    
    + ' u200:' + up200.length + '/' + numUp200
    + ' u550:' + up550.length + '/' + numUp550
    + ' u750:' + up750.length + '/' + numUp750
    
    + ' cl100:' + cl100.length + '/' + numCl100
    + ' dH800:' + dH800.length + '/' + numDH800
  );
  if (Game.spawns['Spawn1'].spawning) {
    statsConsole.log('base: spawning: ' + Game.spawns['Spawn1'].spawning.name);
  }
  
  // statsConsole.log('home:  ' + Memory.home.room.find(FIND_SOURCES) + ' roomSources: ' + Memory.home.roomSources);
  
};

const clearMemory = function () {
  for (var name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
      statsConsole.log('main: clearing non-existing creep memory:', name);
    }
  }
};

const respawnCreeps = function () {
  let spawnError = 0;
  
  // ----- sweeper -----
  if (spawnError.length == null && s100.length < numS100) {
    let role = 's100';
    spawnError = spawnCreep([CARRY, MOVE], role, role, targetRoom);
    handleSpawnError(spawnError, role);
  }
  
  // ----- sweeper -----
  if (spawnError.length == null && r200.length < numR200) {
    let role = 'r200';
    spawnError = spawnCreep([WORK, CARRY, MOVE], role, role, targetRoom);
    handleSpawnError(spawnError, role);
  }
  // ----- harvesters -----
  spawnError = spawnHarvester(spawnError);
  
  // ----- miner -----
  spawnError = spawnMiner(spawnError);
  
  // ----- collectors -----
  spawnError = spawnCollectors(spawnError);
  
  // ----- looter -----
  if (spawnError.length == null && dH800.length < numDH800) {
    let role = 'dH800';
    spawnError = spawnCreep([WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], role, role, targetRoom);
    handleSpawnError(spawnError, role);
  }
  // ----- claimer -----
  if (spawnError.length == null && cl100.length < numCl100) {
    let role = 'cl100';
    spawnError = spawnCreep([CLAIM, MOVE], role, role, targetRoom);
    handleSpawnError(spawnError, role);
  }
  // ---- upgrader -----
  spawnError = spawnUpgraders(spawnError);
  
};

const spawnHarvester = (spawnError) => {
  if (spawnError.length == null && h200.length < numH200) {
    let role = 'h200';
    spawnError = spawnCreep([WORK, CARRY, MOVE], role, role, targetRoom);
    handleSpawnError(spawnError, role);
    
  }
  if (spawnError.length == null && h300.length < numH300) {
    let role = 'h300';
    spawnError = spawnCreep([WORK, WORK, CARRY, MOVE], role, role, targetRoom);
    handleSpawnError(spawnError, role);
    
  }
  if (spawnError.length == null && h550.length < numH550) {
    let role = 'h550';
    spawnError = spawnCreep([WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], role, role, targetRoom);
    handleSpawnError(spawnError, role);
    
  }
  if (spawnError.length == null && h800.length < numH800) {
    let role = 'h800';
    spawnError = spawnCreep([WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], role, role, targetRoom);
    handleSpawnError(spawnError, role);
    
  }
  return spawnError;
}

const spawnMiner = (spawnError) => {
  if (spawnError.length == null && m0250.length < numM0250) {
    let role = 'm0250';
    spawnError = spawnCreep([WORK, WORK, MOVE], role, role, targetRoom);
    handleSpawnError(spawnError, role);
  }
  if (spawnError.length == null && m1250.length < numM1250) {
    let role = 'm1250';
    spawnError = spawnCreep([WORK, WORK, MOVE], role, role, targetRoom);
    handleSpawnError(spawnError, role);
  }
  if (spawnError.length == null && m0550.length < numM0550) {
    let role = 'm0550';
    spawnError = spawnCreep([WORK, WORK, WORK, WORK, WORK, MOVE], role, role, targetRoom);
    handleSpawnError(spawnError, role);
  }
  if (spawnError.length == null && m1550.length < numM1550) {
    let role = 'm1550';
    spawnError = spawnCreep([WORK, WORK, WORK, WORK, WORK, MOVE], role, role, targetRoom);
    handleSpawnError(spawnError, role);
  }
  
  return spawnError;
}

const spawnCollectors = function (spawnError) {
  if (spawnError.length == null && c250.length < numC250) {
    let role = 'c250';
    spawnError = spawnCreep([WORK, CARRY, MOVE, MOVE], role, role, targetRoom);
    handleSpawnError(spawnError, role);
  }
  
  if (spawnError.length == null && c550.length < numC550) {
    let role = 'c550';
    spawnError = spawnCreep([WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], role, role, targetRoom);
    handleSpawnError(spawnError, role);
  }
  if (spawnError.length == null && c750.length < numC750) {
    let role = 'c750';
    spawnError = spawnCreep([WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], role, role, targetRoom);
    handleSpawnError(spawnError, role);
  }
  
  if (spawnError.length == null && c1300.length < numC1300) {
    let role = 'c1300';
    spawnError = spawnCreep([WORK, WORK, WORK, WORK, WORK,
                             CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
                             MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], role, role, targetRoom);
    handleSpawnError(spawnError, role);
  }
  return spawnError;
  
};

const spawnUpgraders = (spawnError) => {
  if (spawnError.length == null && up200.length < numUp200) {
    let role = 'up200';
    spawnError = spawnCreep([WORK, CARRY, MOVE], role, role, targetRoom);
    handleSpawnError(spawnError, role);
    
  }
  if (spawnError.length == null && up550.length < numUp550) {
    let role = 'up550';
    spawnError = spawnCreep([WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], role, role, targetRoom);
    handleSpawnError(spawnError, role);
    
  }
  if (spawnError.length == null && up750.length < numUp750) {
    let role = 'up750';
    spawnError = spawnCreep([WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], role, role, targetRoom);
    handleSpawnError(spawnError, role);
  }
  return spawnError;
};

const spawnCreep = function (body, role, name, targetRoomName) {
  return Game.spawns['Spawn1'].createCreep(body, name + '-' + Math.floor(Math.random() * 100), {
    auto: true,
    role: role,
    targetRoomName: targetRoomName,
    home: Memory.home
  });
};

const handleCreeps = function () {
  for (let name in Game.creeps) {
    let creep = Game.creeps[name];
    if (creep.memory.auto) {
      
      if (creep.memory.role == 'up200' || creep.memory.role == 'up550' || creep.memory.role == 'up750') {
        roleUpgrader.run(creep);
      } else if (creep.memory.role == 'r200') {
        roleRepairer.run(creep);
      } else if (creep.memory.role == 'h200' || creep.memory.role == 'h300' || creep.memory.role == 'h550' || creep.memory.role == 'h800') {
        roleHarvester.run(creep);
      } else if (creep.memory.role == 's100') {
        roleSweeper.run(creep);
      } else if (creep.memory.role == 'claimer') {
        roleClaimer.run(creep);
      } else if (creep.memory.role == 'dH800') {
        roleDistanceHarvester.run(creep);
      } else if (creep.memory.role == 'c250' || creep.memory.role == 'c550' || creep.memory.role == 'c750' || creep.memory.role == 'c1300') {
        roleCollector.run(creep);
      } else if (creep.memory.role == 'm0250' || creep.memory.role == 'm1250') {
        roleMiner.run(creep);
      } else if (creep.memory.role == 'm0550' || creep.memory.role == 'm1550') {
        roleMiner.run(creep);
      }
    }
  }
};

const handleSpawnError = function (spawnError, role) {
  if (role != null && spawnError.name && spawnError.name.startsWith(role)) {
    switch (spawnError) {
      case ERR_BUSY: {
        statsConsole.log('main: ' + role + ' cannot spawn because spawn is busy')
        break;
      }
      case ERR_NOT_ENOUGH_ENERGY: {
        statsConsole.log('main: ' + role + ' waiting for energy to spawn');
        break;
      }
      default: {
        statsConsole.log('main: spawn new: ' + role + ' spanwnError: ' + spawnError);
        break;
      }
    }
  }
};

const handleStats = () => {
  // sample data format ["Name for Stat", variableForStat]
  let myStats = [
    ["c1300", c1300.length]
    // ["Towers", towersCPUUsage],
    // ["Links", linksCPUUsage],
    // ["Setup Roles", SetupRolesCPUUsage],
    // ["Creeps", CreepsCPUUsage],
    // ["Init", initCPUUsage],
    // ["Stats", statsCPUUsage],
    // ["Total", totalCPUUsage]
  ];
  
  statsConsole.run(myStats); // Run Stats collection
  if ((Game.time % 5) === 0) {
  }
  console.log(statsConsole.displayHistogram(200, 20));
  console.log(statsConsole.displayStats({
    totalWidth: 240,
    cpuTitle: ' CPU '
  }));
  console.log(statsConsole.displayLogs(undefined, {width: 240})); // width must be greater than the longest 1 liner message
};