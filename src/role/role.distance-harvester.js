var roleBase = require('role.base');
var taskManager = require('task-manager');
var statsConsole = require("consoleStats");



var roleLooter = {

    role: null,
    sources: null,

    /** @param {Creep} creep **/


    run(creep){
        this.init(creep);
        roleBase.decideTask();
        this.handleTask()
    },

    init(creep){
        this.creep = creep;
        roleBase.initDistance(this.creep);
    },


    handleTask(){
        // consoleStats.log(Game.map.getTerrainAt(this.creep.pos));
        // _.forEach(Game.map.describeExits(this.creep.pos.roomName), (exit => consoleStats.log(exit)));
        switch (this.creep.memory.task) {
            case 0: {
                // consoleStats.log('loot: ' + creep.name + ' is home');
                // consoleStats.log(creep.home.name == creep.memory.home.home.name);
                if (!roleBase.willGoTargetRoom()) {
                    roleBase.handleDistanceHarvest(1);
                    this.creep.say('h');
                } else {
                    this.creep.say('cr')
                }
                break;
            }
            case 1: {
                if (this.creep.room.name != this.creep.memory.home.room.name) {
                    roleBase.handleTransfer();
                    if (!this.creep.memory.isBusy) {
                        roleBase.willGoHome();
                        this.creep.say('cr');
                    } else {
                        this.creep.say('t')
                    }
                } else {
                    roleBase.handleTransfer();
                    this.creep.say('t');
                }
                break;
            }

            case 2: {
                if (this.creep.room.name != this.creep.memory.home.room.name) {
                    roleBase.handleBuild();
                    if (!this.creep.memory.isBusy) {
                        roleBase.willGoHome();
                        this.creep.say('cr');
                    } else {
                        this.creep.say('b')
                    }
                } else {
                    roleBase.handleBuild();
                    this.creep.say('b');
                }
                break;

            }

            case 3: {
                if (this.creep.room.name != this.creep.memory.home.room.name) {
                    roleBase.handleUpgrade();
                    if (!this.creep.memory.isBusy) {
                        roleBase.willGoHome();
                        this.creep.say('cr');
                    } else {
                        this.creep.say('u')
                    }
                } else {
                    roleBase.handleUpgrade();
                    this.creep.say('u');
                }
                break;
            }

            default: {
                this.creep.memory.task = 0;
                this.creep.say('reset');
                break;
            }
        }

    },


    gather(creep){

        var sources = creep.room.find(FIND_SOURCES);
        if (creep.memory.targetIndex == null) {
            creep.memory.targetIndex = 1;
        }
        if (creep.harvest(sources[creep.memory.targetIndex]) != 0) {
            let moveError = creep.moveTo(sources[creep.memory.targetIndex]);
            if (moveError != 0) {
                switch (moveError) {

                    case -11: {
                        // tired
                        statsConsole.log('loot:' + creep.name + ' tired');
                        break;
                    }
                    case -4: {
                        // spawning
                        statsConsole.log('loot:' + creep.name + ' spawning');
                        break;
                    }
                    default : {
                        statsConsole.log('loot: ' + creep.name + ' moveError: ' + moveError);
                        creep.memory.targetIndex--;
                        if (creep.memory.targetIndex < 0) {
                            creep.memory.targetIndex = null;
                            statsConsole.log('loot:' + creep.name + ' targetIndex reset');

                        } else {
                            statsConsole.log('loot:' + creep.name + ' targetIndex changed: ' + creep.memory.targetIndex);
                        }
                    }
                }
            }
        }
    },

    harvest(creep){
        var targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION ||
                    structure.structureType == STRUCTURE_SPAWN ||
                    structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
            }
        });
        if (targets.length > 0) {
            let closestTarget = creep.pos.findClosestByRange(targets)

            if (creep.transfer(closestTarget, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(closestTarget);
            }
        } else {
            creep.memory.isBusy = false;
        }
    },

    upgrade(creep)
    {
        if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller);
        }
        else if (creep.energy === 0) {
            creep.memory.isBusy = false;
        }
    },

};

module.exports = roleLooter;


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}