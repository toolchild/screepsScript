const statsConsole = require("consoleStats");

const roleBuilder = {

    /** @param {Creep} creep **/
    run: function (creep) {

        if (creep.memory.isBusy && creep.carry.energy == 0) {
            creep.memory.isBusy = false;
        }
        if (!creep.memory.isBusy && creep.carry.energy == creep.carryCapacity) {
            creep.memory.isBusy = true;
        }

        if (creep.memory.isBusy) {
            let targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if (targets.length) {
                creep.say('isBusy');
                if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0])
                    creep.say('move');
                }
            } else {
                creep.moveTo(20, 20);
                statsConsole.log('builder ' + creep.name + ' is full and has no valid target.')
                creep.say('standby')
            }
        }
        else {
            let sources = creep.room.find(FIND_SOURCES);
            if (creep.memory.targetIndex == null) {
                creep.memory.targetIndex = 0;
            }
            statsConsole.log(creep.name + ' sources: ' + sources[creep.memory.targetIndex] + ' index: ' + creep.memory.targetIndex);
            if (creep.harvest(sources[creep.memory.targetIndex]) != 0) {
                if (creep.moveTo(sources[creep.memory.targetIndex]) != 0) {
                    creep.memory.targetIndex++;
                    if (creep.memory.targetIndex >= sources.length) {
                        creep.memory.targetIndex = null;
                        statsConsole.log(creep.name + ' targetIndex reset');
                    } else {
                        statsConsole.log(creep.name + ' targetIndex changed: ' + creep.memory.targetIndex);
                    }
                }
            }
        }
    }
};

module.exports = roleBuilder;


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}