const roleTower = require('role.tower');
const statsConsole = require("statsConsole");
const memoryHandler = require("memory-handler");
const creepSpawner = require("creep-spawner");


const tower1 = Game.getObjectById('587555c0ff22ce385737f1c7');
const tower2 = Game.getObjectById('58791fd9fcfae81e151c2793');

module.exports.loop = function () {
  
  // try {
  memoryHandler.clearMemory();
  memoryHandler.fillMemory();
  creepSpawner.prepareCreepsAmounts();
  creepSpawner.logStats();
  creepSpawner.respawnCreeps();
  roleTower.run(tower1);
  roleTower.run(tower2);
  creepSpawner.handleCreeps();
  
  let myStats = creepSpawner.getCreepStats();
  printStatsConsole(myStats);
  // } catch (error) {console.log(error)}
  
};

const printStatsConsole = (myStats) => {
  statsConsole.run(myStats); // Run Stats collection
  if ((Game.time % 5) === 0) {
    console.log(statsConsole.displayHistogram(200, 20));
    console.log(statsConsole.displayStats({
        totalWidth: 240,
        cpuTitle: ' CPU '
      }
    ));
    console.log(statsConsole.displayLogs(undefined, {width: 240})); // width must be greater than the longest 1 liner message
  }
};
