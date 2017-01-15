var taskManager = require('task-manager');
var statsConsole = require("statsConsole");

const roleMulti = {

    // tasks
    // 0 : gather
    // 1 : deposit
    // 2 : build
    // 3 : upgrade

    /** @param {Creep} creep **/
    run(creep){
        this.decideTask(creep);
        switch (creep.memory.task) {
            case 0: {
                // statsConsole.log('multi: ' + creep.name + ' is home');
                if (creep.room.name != creep.memory.home.name) {
                    let exit = creep.room.findExitTo(creep.memory.home.name);
                    // statsConsole.log('multi: exit: ' + exit);
                    creep.moveTo(creep.pos.findClosestByPath(exit));
                } else {
                    this.gather(creep);
                }
                creep.say('g');
                break;
            }
            case 1: {
                if (creep.room.name != creep.memory.home.name) {
                    let exit = creep.room.findExitTo(creep.memory.home.name);
                    // statsConsole.log('multi: exit: ' + exit);
                    creep.moveTo(creep.pos.findClosestByPath(exit));
                } else {
                    this.harvest(creep);
                }
                creep.say('h');
                break;
            }

            case 2: {
                if (creep.room.name != creep.memory.home.name) {
                    let exit = creep.room.findExitTo(creep.memory.home.name);
                    // statsConsole.log('multi: exit: ' + exit);
                    creep.moveTo(creep.pos.findClosestByPath(exit));
                } else {
                    this.build(creep);
                }
                creep.say('b');
                break;
            }

            case 3: {
                if (creep.room.name != creep.memory.home.name) {
                    let exit = creep.room.findExitTo(creep.memory.home.name);
                    // statsConsole.log('multi: exit: ' + exit);
                    creep.moveTo(creep.pos.findClosestByPath(exit));
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

    decideTask(creep) {
        creep.memory.task = taskManager.decideTask(creep);

    },

    gather(creep){
        var sources = creep.room.find(FIND_SOURCES);
        if (creep.memory.targetIndex == null) {
            creep.memory.targetIndex = 1;
        }
        let moveError;
        let gatherError = creep.deposit(sources[creep.memory.targetIndex]);
        if (gatherError != OK) {
            moveError = creep.moveTo(sources[creep.memory.targetIndex]);
            if (moveError != OK) {
                switch (moveError) {

                    case -11: {
                        // tired
                        statsConsole.log('multi:' + creep.name + ' tired');
                        break;
                    }
                    case -4: {
                        // spawning
                        statsConsole.log('multi:' + creep.name + ' spawning');
                        break;
                    }
                    default : {
                        statsConsole.log('multi: ' + creep.name + ' moveError: ' + moveError);
                        creep.memory.targetIndex--;
                        if (creep.memory.targetIndex < 0) {
                            creep.memory.targetIndex = null;
                            statsConsole.log('multi:' + creep.name + ' targetIndex reset');

                        } else {
                            statsConsole.log('multi:' + creep.name + ' targetIndex changed: ' + creep.memory.targetIndex);
                        }
                    }
                }
            }
        } else {
            // statsConsole.log('multi: ' + creep.name + ' gathering');
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

    build(creep)
    {

        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        if (targets.length > 0) {

            let closestTarget = creep.pos.findClosestByRange(targets)

            if (creep.build(closestTarget) == ERR_NOT_IN_RANGE) {
                creep.moveTo(closestTarget)
            }

        }else {
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


    arraysEqual(arr1, arr2){
        if (arr1.length !== arr2.length)
            return false;
        for (var i = arr1.length; i--;) {
            if (arr1[i] !== arr2[i])
                return false;
        }

        return true;
    },


};

module.exports = roleMulti;
