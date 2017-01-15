var taskManager = require('task-manager');
var statsConsole = require("statsConsole");
const settings = require('settings');

const roleBase = {
  sources: null,
  droppedSources: null,
  
  /** @param {Creep} creep **/
  
  init(creep, droppedSources){
    this.sources = _.map(creep.memory.home.roomSources, roomSource => Game.getObjectById(roomSource));
    this.droppedSources = droppedSources;
  },
  
  initDistance(creep, droppedSources){
    this.sources = _.sortBy(creep.room.find(FIND_SOURCES), (source) => source.pos.y);
    this.droppedSources = droppedSources;
  },
  
  /**
   * tasks
   * 0 : need energy
   * 1 : transfer energy
   * 2 : build
   * 3 : upgrade
   * @param creep {Creep}
   */
  decideTask(creep){
    creep.memory.task = taskManager.decideTask(creep);
  },
  
  /**
   * @param creep {Creep}
   * @returns {boolean}
   */
  willGoHome(creep){
    if (creep.room.name != creep.memory.home.room.name) {
      let exit = creep.room.findExitTo(creep.memory.home.room.name);
      creep.moveTo(creep.pos.findClosestByPath(exit));
      return true;
    } else {
      return false;
    }
  },
  
  /**
   * @param creep {Creep}
   * @returns {boolean}
   */
  willGoTargetRoom(creep)  {
    if (creep.room.name != creep.memory.targetRoomName) {
      let exit = creep.room.findExitTo(creep.memory.targetRoomName);
      statsConsole.log('base: ' + creep.name + ' go to exit: ' + exit + ' to: ' + creep.memory.targetRoomName);
      let moveError = creep.moveTo(creep.pos.findClosestByPath(exit));
      if (moveError != OK && moveError != ERR_BUSY) {
        this.handleMoveErrorCollect(moveError);
      }
      return true;
    } else {
      return false;
    }
  },
  
  /**
   * @param creep {Creep}
   */
  handleHarvest(creep, prioTargetIndex)
  {
    // consoleStats.log('base: prio: ' + prioTargetIndex)
    if (creep.memory.targetIndex == null) {
      creep.memory.targetIndex = prioTargetIndex == null ? 0 : prioTargetIndex;
    }
    // consoleStats.log('base: target index: ' + creep.memory.targetIndex);
    // consoleStats.log('base: this.sources: ' + this.sources);
    let harvestError = creep.harvest(this.sources[creep.memory.targetIndex]);
    if (harvestError != OK) {
      let moveError = creep.moveTo(this.sources[creep.memory.targetIndex]);
      if (moveError != OK) {
        this.handleMoveError(moveError, prioTargetIndex);
      }
    }
  },
  
  /**
   * @param creep {Creep}
   */
  handleDistanceHarvest(creep, prioTargetIndex)
  {
    if (creep.pos.y < 48) {
      this.handleHarvest(prioTargetIndex);
    } else {
      creep.move(TOP);
    }
  }
  ,
  
  /**
   * @param creep {Creep}
   */
  handleCollect(creep)  {
    creep.memory.hasCollectedFromStorage = false;
    if (this.droppedSources && this.droppedSources.length > 0) {
      // consoleStats.log('base: ' + creep.name + ' droppedSources: ' + this.droppedSources);
      let closest = creep.pos.findClosestByRange(this.droppedSources);
      let gatherError = creep.pickup(closest);
      if (gatherError != OK) {
        let moveError = creep.moveTo(closest);
        if (moveError != OK) {
          this.handleMoveErrorCollect(creep, moveError);
        }
      } else {
        // consoleStats.log('base: ' + creep.name + ' gathering');
      }
    } else {
      // var log = 'base: ' + creep.name + ' found no droppedSources to collect';
      let bufferStructures = this.findBufferStructures(creep);
      // consoleStats.log(bufferStructures)
      let containers = _.filter(bufferStructures, structure => structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > creep.carryCapacity / 2);
      // consoleStats.log('base' + creep.name + ' containers: ' + containers)
      let closest;
      if (containers && containers.length > 0) {
        closest = creep.pos.findClosestByRange(containers);
        if (creep.withdraw(closest, RESOURCE_ENERGY) != OK) {
          let moveError = creep.moveTo(closest);
          if (moveError != OK) {
            this.handleMoveErrorCollect(creep, moveError);
          }
        }
      } else {
        closest = creep.pos.findClosestByRange(bufferStructures);
        if (creep.withdraw(closest, RESOURCE_ENERGY) != OK) {
          let moveError = creep.moveTo(closest);
          if (moveError != OK) {
            this.handleMoveErrorCollect(creep, moveError);
          }
        } else {
          creep.memory.hasCollectedFromStorage = true;
        }
      }
    }
    
    if (creep.carry.energy > 0) {
      // log += (' switch to busy');
      creep.memory.isBusy = true;
    }
    // consoleStats.log(log);
    
  },
  
  /**
   * @param creep {Creep}
   */
  handleSweeperCollect(creep)  {
    creep.memory.hasCollectedFromStorage = false;
    if (this.droppedSources && this.droppedSources.length > 0) {
      let gatherError = creep.pickup(this.droppedSources[0]);
      if (gatherError != OK) {
        let moveError = creep.moveTo(this.droppedSources[0]);
        if (moveError != OK) {
          this.handleMoveErrorCollect(creep, moveError);
        }
      } else {
        // consoleStats.log('base: ' + creep.name + ' gathering');
      }
    } else {
      // let log = 'base: ' + creep.name + ' found no droppedSources to collect';
      if (creep.carry.energy > 0) {
        log += (' switch to busy');
        creep.memory.isBusy = true;
      }
      // consoleStats.log(log);
    }
  },
  
  /**
   * @param creep {Creep}
   */
  handleTransfer(creep)  {
    creep.memory.isBusy = true;
    let targets = creep.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return (structure.structureType == STRUCTURE_EXTENSION
          || structure.structureType == STRUCTURE_SPAWN
          || structure.structureType == STRUCTURE_TOWER
          || structure.structureType == STRUCTURE_STORAGE) && (structure.energy < structure.energyCapacity || structure.store < structure.storeCapacity);
      }
    });
    // let storage = Game.getObjectById('5876f85b253a1daf341e47bf');
    // consoleStats.log(storage.store[RESOURCE_ENERGY] + '/'+ storage.storeCapacity);
    // consoleStats.log(memoryHandler.storageNeedsEnergy(creep));
    // consoleStats.log('base ' + creep.name + ' transfer targets ' + targets);
    if (targets.length > 0) {
      this.handleTransferTargets(creep, targets);
    } else {
      creep.memory.isBusy = false;
    }
  },
  
  /**
   * @param creep {Creep}
   */
  handleBuild(creep)  {
    creep.memory.isBusy = true;
    var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
    // consoleStats.log('base: ' + creep.name + ' constructionSites: ' + targets);
    if (targets.length > 0) {
      let closest = creep.pos.findClosestByRange(targets);
      // consoleStats.log('base: ' + creep.name + ' closest: ' + closest);
      let buildError = creep.build(closest);
      // consoleStats.log('base: ' + creep.name + ' build Error: ' + buildError);
      if (buildError == ERR_NOT_IN_RANGE) {
        let moveError = creep.moveTo(closest);
        this.handleMoveError(creep, moveError);
      }
    } else {
      creep.memory.isBusy = false;
    }
  },
  
  /**
   * @param creep {Creep}
   */
  handleUpgrade(creep)  {
    creep.memory.isBusy = true;
    if (creep.room.controller) {
      let rangeToController = creep.pos.getRangeTo(creep.room.controller);
      // consoleStats.log(rangeToController);
      if (rangeToController <= 2) {
        if (rangeToController === 1 || creep.moveTo(creep.room.controller) == ERR_NO_PATH) {
          creep.upgradeController(creep.room.controller);
        }
      } else {
        creep.moveTo(creep.room.controller);
      }
    } else if (creep.energy === 0) {
      creep.memory.isBusy = false;
      creep.memory.hasCollectedFromStorage = false;
    }
  },
  
  /**
   * @param creep {Creep}
   */
  handleRepair(creep)  {
    creep.memory.isBusy = true;
    var closestDamagedStructure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: (structure) => {
        // consoleStats.log('structure.type = ' + structure.structureType);
        return (structure.structureType != STRUCTURE_WALL && structure.hits < structure.hitsMax) || (structure.structureType == STRUCTURE_WALL && structure.hits < structure.hitsMax * settings.WALL_REPAIR_PER_ONE);
      }
    });
    
    // consoleStats.log('base: ' + creep.name + " closest Target:" + closestDamagedStructure);
    if (closestDamagedStructure) {
      if (creep.repair(closestDamagedStructure) == ERR_NOT_IN_RANGE) {
        creep.moveTo(closestDamagedStructure)
      }
    } else {
      creep.memory.isBusy = false;
    }
  },
  
  /**
   * @param creep {Creep}
   * @param moveError {Number}
   * @param prioTargetIndex {Number}
   */
  handleMoveError(creep, moveError, prioTargetIndex)  {
    switch (moveError) {
      case -11: { // tired
        // consoleStats.log('base: ' + creep.name + ' is tired.');
        break;
      }
      case -4: { // spawning
        // consoleStats.log('base: ' + creep.name + ' is spawning.');
        break;
      }
      case -7: {
        statsConsole.log('base: ' + creep.name + ' invalid target');
        break;
      }
      default : {
        statsConsole.log('base: ' + creep.name + ' moveError: ' + moveError);
        // consoleStats.log('base: ' + creep.name + ' targetIndex: ' + creep.memory.targetIndex + ' prioTargetIndex is null: ' + (prioTargetIndex == null));
        creep.memory.targetIndex = prioTargetIndex == null ? creep.memory.targetIndex + 1 : creep.memory.targetIndex - 1;
        if (creep.memory.targetIndex > this.sources.length || creep.memory.targetIndex < 0) {
          creep.memory.targetIndex = null;
          // consoleStats.log('base: ' + creep.name + ' targetIndex reset');
          
        } else {
          // consoleStats.log('base: ' + creep.name + ' targetIndex changed: ' + creep.memory.targetIndex + ' source: ' + this.sources[creep.memory.targetIndex]);
        }
      }
    }
  },
  
  /**
   * @param creep {Creep}
   * @param moveError {Number}
   */
  handleMoveErrorCollect(creep, moveError){
    switch (moveError) {
      case -11: { // tired
        // consoleStats.log('base: ' + creep.name + ' is tired.');
        break;
      }
      case -4: { // spawning
        // consoleStats.log('base: ' + creep.name + ' is spawning.');
        break;
      }
      case -7: {
        // handled by caller TODO: this should return a piece of a log message?
        break;
      }
      default : {
        // consoleStats.log('base: ' + creep.name + ' moveError: ' + moveError);
        if (creep.memory.targetIndex > this.droppedSources.length) {
          creep.memory.targetIndex = null;
          // consoleStats.log('base: ' + creep.name + ' targetIndex reset');
          
        } else {
          // consoleStats.log('base: ' + creep.name + ' targetIndex changed: ' + this.droppedSources[creep.memory.targetIndex]);
        }
      }
    }
  },
  
  /**
   * @param creep {Creep}
   * @param targets {[]}
   */
  handleTransferTargets(creep, targets){
    let prioStructures = _.filter(targets, (target) => target.structureType == STRUCTURE_EXTENSION || target.structureType == STRUCTURE_SPAWN);
    if (prioStructures.length > 0) {
      let closestTarget = creep.pos.findClosestByRange(prioStructures);
      if (creep.transfer(closestTarget, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(closestTarget);
      }
    } else {
      let closestTarget = creep.pos.findClosestByRange(targets, {
        filter: (target) => {
          return (target.structureType == STRUCTURE_TOWER && taskManager.towerNeedsEnergy(creep));
        }
      });
      
      if (!closestTarget && !creep.memory.hasCollectedFromStorage) {
        targets.push(creep.room.storage);
        closestTarget = creep.pos.findClosestByRange(targets, {
          filter: function (target) {
            return (target.structureType == STRUCTURE_STORAGE && taskManager.storageNeedsEnergy(creep));
          }
        });
        
      } else {
        statsConsole.log('base: ' + creep.name + ' collected from storage and will wait for a target to transport to.');
        
      }
      if (creep.transfer(closestTarget, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(closestTarget);
      }
    }
  },
  
  /**
   * @param creep {Creep}
   */
  findBufferStructures(creep){
    return creep.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return (structure.structureType == STRUCTURE_STORAGE || structure.structureType == STRUCTURE_CONTAINER) && (structure.energy > 0 || structure.store[RESOURCE_ENERGY] > 0);
      }
    });
  }
};

module.exports = roleBase;
