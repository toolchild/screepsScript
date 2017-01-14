var taskManager = require('task-manager');
var statsConsole = require("statsConsole");

const roleBase = {
  wallRepairPerOne: 0.0001, // 0,0001 = 30k
  creep: null, sources: null, droppedSources: null,
  
  // tasks
  // 0 : handleHarvest
  // 1 : handleTransfer
  // 2 : handleBuild
  // 3 : handleUpgrade
  
  /** @param {Creep} creep **/
  
  init(creep, droppedSources){
    this.creep = creep;
    this.sources = _.map(this.creep.memory.home.roomSources, roomSource => Game.getObjectById(roomSource));
    this.droppedSources = droppedSources;
    
  },
  
  initDistance(creep, droppedSources){
    this.creep = creep;
    this.sources = _.sortBy(this.creep.room.find(FIND_SOURCES), (source) => source.pos.y);
    this.droppedSources = droppedSources;
    
  },
  
  decideTask() {
    this.creep.memory.task = taskManager.decideTask(this.creep);
  },
  
  willGoHome(){
    if (this.creep.room.name != this.creep.memory.home.room.name) {
      let exit = this.creep.room.findExitTo(this.creep.memory.home.room.name);
      this.creep.moveTo(this.creep.pos.findClosestByPath(exit));
      return true;
    } else {
      return false;
    }
  },
  
  willGoTargetRoom(){
    if (this.creep.room.name != this.creep.memory.targetRoomName) {
      let exit = this.creep.room.findExitTo(this.creep.memory.targetRoomName);
      statsConsole.log('base: ' + this.creep.name + ' go to exit: ' + exit + ' to: ' + this.creep.memory.targetRoomName);
      let moveError = this.creep.moveTo(this.creep.pos.findClosestByPath(exit));
      if (moveError != OK) {
        this.handleMoveErrorCollect(moveError);
      }
      return true;
    } else {
      return false;
    }
  },
  
  handleHarvest(prioTargetIndex){
    // statsConsole.log('base: prio: ' + prioTargetIndex)
    if (this.creep.memory.targetIndex == null) {
      this.creep.memory.targetIndex = prioTargetIndex == null ? 0 : prioTargetIndex;
    }
    // statsConsole.log('base: target index: ' + this.creep.memory.targetIndex);
    // statsConsole.log('base: this.sources: ' + this.sources);
    let harvestError = this.creep.harvest(this.sources[this.creep.memory.targetIndex]);
    if (harvestError != OK) {
      let moveError = this.creep.moveTo(this.sources[this.creep.memory.targetIndex]);
      if (moveError != OK) {
        this.handleMoveError(moveError, prioTargetIndex);
      }
    }
  },
  
  handleDistanceHarvest(prioTargetIndex){
    if (this.creep.pos.y < 48) {
      this.handleHarvest(prioTargetIndex);
    } else {
      this.creep.move(TOP);
    }
  },
  
  handleCollect(){
    if (this.droppedSources && this.droppedSources.length > 0) {
      // statsConsole.log('base: ' + this.creep.name + ' droppedSources: ' + this.droppedSources);
      let closest = this.creep.pos.findClosestByRange(this.droppedSources);
      let gatherError = this.creep.pickup(closest);
      if (gatherError != OK) {
        let moveError = this.creep.moveTo(closest);
        if (moveError != OK) {
          this.handleMoveErrorCollect(moveError);
        }
      } else {
        // statsConsole.log('base: ' + this.creep.name + ' gathering');
      }
    } else {
      // var log = 'base: ' + this.creep.name + ' found no droppedSources to collect';
      let bufferStructures = this.findBufferStructures();
      // statsConsole.log(bufferStructures)
      let containers = _.filter(bufferStructures, structure => structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > this.creep.carryCapacity / 2);
      // statsConsole.log('base' + this.creep.name + ' containers: ' + containers)
      let closest = containers && containers.length > 0 ? this.creep.pos.findClosestByRange(containers) : this.creep.pos.findClosestByRange(bufferStructures);
      
      if (this.creep.withdraw(closest, RESOURCE_ENERGY) != OK) {
        let moveError = this.creep.moveTo(closest);
        if (moveError != OK) {
          this.handleMoveErrorCollect(moveError);
        }
      } else {
        // statsConsole.log('base: ' + this.creep.name + ' gathering from strcuture ' + closest);
      }
    }
    
    if (this.creep.carry.energy > 0) {
      // log += (' switch to busy');
      this.creep.memory.isBusy = true;
    }
    // statsConsole.log(log);
    
  },
  
  handleSweeperCollect(){
    if (this.droppedSources && this.droppedSources.length > 0) {
      let gatherError = this.creep.pickup(this.droppedSources[0]);
      if (gatherError != OK) {
        let moveError = this.creep.moveTo(this.droppedSources[0]);
        if (moveError != OK) {
          this.handleMoveErrorCollect(moveError);
        }
      } else {
        // statsConsole.log('base: ' + this.creep.name + ' gathering');
      }
    } else {
      // let log = 'base: ' + this.creep.name + ' found no droppedSources to collect';
      if (this.creep.carry.energy > 0) {
        log += (' switch to busy');
        this.creep.memory.isBusy = true;
      }
      // statsConsole.log(log);
    }
  },
  
  handleTransfer()
  {
    this.creep.memory.isBusy = true;
    let targets = this.creep.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return (structure.structureType == STRUCTURE_EXTENSION
          || structure.structureType == STRUCTURE_SPAWN
          || structure.structureType == STRUCTURE_TOWER
          || structure.structureType == STRUCTURE_STORAGE) && (structure.energy < structure.energyCapacity || structure.store < structure.storeCapacity);
      }
    });
    // let storage = Game.getObjectById('5876f85b253a1daf341e47bf');
    // statsConsole.log(storage.store[RESOURCE_ENERGY] + '/'+ storage.storeCapacity);
    // statsConsole.log(navigation.storageNeedsEnergy(this.creep));
    // statsConsole.log('base ' + this.creep.name + ' transfer targets ' + targets);
    if (targets.length > 0) {
      this.handleTransferTargets(targets);
    } else {
      this.creep.memory.isBusy = false;
    }
  },
  
  handleBuild(){
    this.creep.memory.isBusy = true;
    var targets = this.creep.room.find(FIND_CONSTRUCTION_SITES);
    // statsConsole.log('base: ' + this.creep.name + ' constructionSites: ' + targets);
    if (targets.length > 0) {
      let closest = this.creep.pos.findClosestByRange(targets);
      // statsConsole.log('base: ' + this.creep.name + ' closest: ' + closest);
      let buildError = this.creep.build(closest);
      // statsConsole.log('base: ' + this.creep.name + ' build Error: ' + buildError);
      if (buildError == ERR_NOT_IN_RANGE) {
        let moveError = this.creep.moveTo(closest);
        this.handleMoveError(moveError);
      }
    } else {
      this.creep.memory.isBusy = false;
    }
  },
  
  handleUpgrade()
  {
    this.creep.memory.isBusy = true;
    if (this.creep.room.controller) {
      let rangeToController = this.creep.pos.getRangeTo(this.creep.room.controller);
      // statsConsole.log(rangeToController);
      if (rangeToController <= 2) {
        if (rangeToController === 1 || this.creep.moveTo(this.creep.room.controller) == ERR_NO_PATH) {
          this.creep.upgradeController(this.creep.room.controller);
        }
      } else {
        this.creep.moveTo(this.creep.room.controller);
      }
    } else if (this.creep.energy === 0) {
      this.creep.memory.isBusy = false;
    }
  },
  
  handleRepair()
  {
    this.creep.memory.isBusy = true;
    var closestDamagedStructure = this.creep.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: (structure) => {
        // statsConsole.log('structure.type = ' + structure.structureType);
        return (structure.structureType != STRUCTURE_WALL && structure.hits < structure.hitsMax) || (structure.structureType == STRUCTURE_WALL && structure.hits < structure.hitsMax * wallRepairPerOne);
      }
    });
    
    // statsConsole.log('base: ' + this.creep.name + " closest Target:" + closestDamagedStructure);
    if (closestDamagedStructure) {
      if (this.creep.repair(closestDamagedStructure) == ERR_NOT_IN_RANGE) {
        this.creep.moveTo(closestDamagedStructure)
      }
    } else {
      this.creep.memory.isBusy = false;
    }
  },
  
  handleMoveError(moveError, prioTargetIndex){
    switch (moveError) {
      case -11: { // tired
        // statsConsole.log('base: ' + this.creep.name + ' is tired.');
        break;
      }
      case -4: { // spawning
        // statsConsole.log('base: ' + this.creep.name + ' is spawning.');
        break;
      }
      case -7: {
        statsConsole.log('base: ' + this.creep.name + ' invalid target');
        break;
      }
      default : {
        statsConsole.log('base: ' + this.creep.name + ' moveError: ' + moveError);
        // statsConsole.log('base: ' + this.creep.name + ' targetIndex: ' + this.creep.memory.targetIndex + ' prioTargetIndex is null: ' + (prioTargetIndex == null));
        this.creep.memory.targetIndex = prioTargetIndex == null ? this.creep.memory.targetIndex + 1 : this.creep.memory.targetIndex - 1;
        if (this.creep.memory.targetIndex > this.sources.length || this.creep.memory.targetIndex < 0) {
          this.creep.memory.targetIndex = null;
          // statsConsole.log('base: ' + this.creep.name + ' targetIndex reset');
          
        } else {
          // statsConsole.log('base: ' + this.creep.name + ' targetIndex changed: ' + this.creep.memory.targetIndex + ' source: ' + this.sources[this.creep.memory.targetIndex]);
        }
      }
    }
  },
  
  handleMoveErrorCollect(moveError){
    switch (moveError) {
      case -11: { // tired
        // statsConsole.log('base: ' + this.creep.name + ' is tired.');
        break;
      }
      case -4: { // spawning
        // statsConsole.log('base: ' + this.creep.name + ' is spawning.');
        break;
      }
      case -7: {
        // handled by caller TODO: this should return a piece of a log message?
        break;
      }
      default : {
        // statsConsole.log('base: ' + this.creep.name + ' moveError: ' + moveError);
        if (this.creep.memory.targetIndex > this.droppedSources.length) {
          this.creep.memory.targetIndex = null;
          // statsConsole.log('base: ' + this.creep.name + ' targetIndex reset');
          
        } else {
          // statsConsole.log('base: ' + this.creep.name + ' targetIndex changed: ' + this.droppedSources[this.creep.memory.targetIndex]);
        }
      }
    }
  },
  
  handleTransferTargets(targets){
    let prioStructures = _.filter(targets, (target) => target.structureType == STRUCTURE_EXTENSION || target.structureType == STRUCTURE_SPAWN);
    if (prioStructures.length > 0) {
      let closestTarget = this.creep.pos.findClosestByRange(prioStructures);
      if (this.creep.transfer(closestTarget, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        this.creep.moveTo(closestTarget);
      }
    } else {
      let creep = this.creep;
      let closestTarget = this.creep.pos.findClosestByRange(targets, {
        filter: (target) => {
          return (target.structureType == STRUCTURE_TOWER && taskManager.towerNeedsEnergy(creep));
        }
      });
      
      if (!closestTarget) {
        targets.push(this.creep.room.storage);
        let creep = this.creep;
        closestTarget = this.creep.pos.findClosestByRange(targets, {
          filter: function (target) {
            return (target.structureType == STRUCTURE_STORAGE && taskManager.storageNeedsEnergy(creep));
          }
        });
      }
      if (this.creep.transfer(closestTarget, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        this.creep.moveTo(closestTarget);
      }
    }
  },
  
  findBufferStructures(){
    return this.creep.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return (structure.structureType == STRUCTURE_STORAGE || structure.structureType == STRUCTURE_CONTAINER) && (structure.energy > 0 || structure.store[RESOURCE_ENERGY] > 0);
      }
    });
  }
  
};

module.exports = roleBase;
