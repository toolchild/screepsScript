/**
 * Created by Bob on 15.01.2017.
 */
var statsConsole = require("statsConsole");

var memoryHandler = {
  
  memoryNeedsUpdate: false,
  
  clearMemory() {
    for (var name in Memory.creeps) {
      if (!Game.creeps[name]) {
        delete Memory.creeps[name];
        statsConsole.log('main: clearing non-existing creep memory:', name);
      }
    }
  },
  
  fillMemory(){
    if (!Memory.home || !Memory.home.roomSources || !Memory.home.room || this.memoryNeedsUpdate) {
      this.Game = Game;
      statsConsole.log('filling memory');
      Memory.home = {
        room: Game.spawns['Spawn1'].room,
        roomSources: _.map(_.sortBy(Game.spawns['Spawn1'].room.find(FIND_SOURCES), (source) => source.id), (source) => source.id),
      };
    } else {
      // Memory.home.room = Game.spawns['Spawn1'].room;
      // statsConsole.log('main memory: roomSources: ' + Memory.home.roomSources);
    }
    
  }
};

module.exports = memoryHandler;

