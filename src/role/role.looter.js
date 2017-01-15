var taskManager = require('task-manager');
var statsConsole = require("consoleStats");


var roleLooter = {

    /** @param {Creep} creep **/
    run: function (creep) {

        this.decideTask(creep);
        // consoleStats.log('loot: ' + creep.name + ' home ' + creep.home + ' targetRoom: ' + creep.memory.targetRoomName + ' home: ' + creep.memory.home.home.name);

        switch (creep.memory.task) {
            case 0: {
                // consoleStats.log('loot: ' + creep.name + ' is home');
                // consoleStats.log(creep.home.name == creep.memory.home.home.name);

                if (creep.room.name == creep.memory.home.room.name) {

                    let exit = creep.room.findExitTo(creep.memory.targetRoomName);
                    statsConsole.log('loot: ' + creep.name + ' go to target: ' + exit);
                    creep.moveTo(creep.pos.findClosestByPath(exit));

                } else {
                    this.gather(creep);
                }
                creep.say('g');
                break;
            }
            case 1: {
                if (creep.room.name != creep.memory.home.room.name) {
                    let exit = creep.room.findExitTo(creep.memory.home.room.name);
                    statsConsole.log('loot: ' + creep.name + ' go home: ' + exit);
                    creep.moveTo(creep.pos.findClosestByPath(exit));
                } else {
                    this.harvest(creep);
                }
                creep.say('h');
                break;
            }

            case 2: {
                if (creep.room.name != creep.memory.home.room.name) {
                    this.build(creep);
                    if (!creep.memory.isBusy) {
                        this.goHome(creep);
                    }
                } else {
                    this.build(creep);
                }
                creep.say('b');
                break;
            }

            case 3: {
                if (creep.room.name != creep.memory.home.room.name) {
                    let exit = creep.room.findExitTo(creep.memory.home.room.name);
                    statsConsole.log('loot: ' + creep.name + ' go home: ' + exit);
                    creep.moveTo(creep.pos.findClosestByRange(exit));
                } else {
                    this.upgrade(creep);
                }

                creep.say('u');
                break;
            }

            default: {
                creep.memory.task = 0;
                creep.say('reset');
                break;
            }
        }

    },
    gather(creep){

        var sources = creep.room.find(FIND_SOURCES);
        if (creep.memory.targetIndex == null) {
            creep.memory.targetIndex = 1;
        }
        let moveError;
        if (creep.handleHarvest(sources[creep.memory.targetIndex]) != 0) {
            moveError = creep.moveTo(sources[creep.memory.targetIndex]);
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

    decideTask(creep) {
        creep.memory.task = taskManager.decideTask(creep);

    },

    build(creep)    {
        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        if (targets.length > 0) {

            let closestTarget = creep.pos.findClosestByRange(targets)

            if (creep.handleBuild(closestTarget) == ERR_NOT_IN_RANGE) {
                creep.moveTo(closestTarget)
            }
        }
        else {
            creep.memory.isBusy = false;
        }
    },

    goHome(creep){
        let exit = creep.room.findExitTo(creep.memory.home.room.name);
        statsConsole.log('loot: ' + creep.name + ' go home: ' + exit);
        creep.moveTo(creep.pos.findClosestByPath(exit));
    }
};

module.exports = roleLooter;


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}