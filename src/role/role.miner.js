var roleBase = require('role.base');
var statsConsole = require("statsConsole");

var roleMiner = {
  
  role: null, sources: null,
  
  /** @param {Creep} creep **/
  run: function (creep) {
    this.init(creep);
    if (!roleBase.willGoHome(this.creep)) {
      this.handleMine();
      this.creep.say('m');
    }
    
  },
  
  init(creep){
    this.creep = creep;
    this.sources = _.map(creep.memory.home.roomSources, roomSource => Game.getObjectById(roomSource));
    roleBase.init(this.creep);
  },
  
  handleMine(){
    let targetIndex = this.creep.memory.role.startsWith('m0') ? 0 : 1;
    let container = this.findOwnFreeBufferStructures(targetIndex)[0];
    if (container != null) {
      // statsConsole.log('mine: ' + this.creep.name + ' container: ' + container);
      let moveError = this.creep.moveTo(container);
      if (moveError != OK) {
        this.handleMoveError(moveError);
      } else {
        // statsConsole.log('mine: ' + this.creep.name + ' moving to container.');
      }
    } else {
      let harvestError = this.creep.harvest(this.sources[targetIndex]);
      if (harvestError != OK) {
        let moveError = this.creep.moveTo(this.sources[targetIndex]);
        if (moveError != OK) {
          this.handleMoveError(moveError);
        }
      } else {
        // consoleStats.log('mine: ' + this.creep.name + ' gathering');
      }
      // consoleStats.log('mine: ' + this.creep.name + ' targetIndex: '+ targetIndex + ' source: ' + this.sources[targetIndex]);
    }
  },
  
  findOwnFreeBufferStructures(targetIndex){
    let targets = this.creep.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return structure.structureType == STRUCTURE_CONTAINER && structure.pos.inRangeTo(this.sources[targetIndex], 1) && !this.creep.pos.isEqualTo(structure.pos);
      }
    });
    // consoleStats.log('mine: ' + this.creep.name + ' containerTarget: ' + targets)
    return targets;
  },
  
  handleMoveError(moveError){
    switch (moveError) {
      case -11: // tired
        // consoleStats.log('mine: ' + this.creep.name + ' tired');
        break;
      case -4: // spawning
        statsConsole.log('mine: ' + this.creep.name + ' spawning');
        break;
      default : {
        statsConsole.log('mine: ' + this.creep.name + ' moveError: ' + moveError);
      }
    }
    
  }
};

module.exports = roleMiner;
