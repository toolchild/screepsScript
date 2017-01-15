const taskManager = require('task-manager');
const roleBase = require('role.base');
var statsConsole = require("consoleStats");


var roleSweeper = {
    creep: null,
    droppedSources: null,


    run: function (creep) {
        this.init(creep);
        roleBase.decideTask();
        this.handleTask();
    },

    init(creep){
        this.creep = creep;
        this.droppedSources = this.creep.room.find(FIND_DROPPED_RESOURCES,
            {
                filter: dropped => {
                    // consoleStats.log('coll: '+this.creep.name +' '+dropped.energy + '/' + this.creep.carryCapacity);
                    // consoleStats.log('coll: '+this.creep.name +' ' +(dropped.energy > this.creep.carryCapacity));
                    return (dropped.energy > this.creep.carryCapacity && !_.contains(_.map(dropped.pos.look(), object => object.type), 'creep')) || dropped.energy > 250;
                }
            });
        roleBase.init(this.creep, this.droppedSources);

    },

    /** @param {Creep} creep **/
    handleTask() {
        if (!roleBase.willGoHome()) {
            switch (this.creep.memory.task) {
                case 0: {
                    roleBase.handleCollect();
                    this.creep.say('c');
                    break;
                }
                case 1: {
                    roleBase.handleTransfer();
                    this.creep.say('t');
                    break;
                }
                case 2: {
                    roleBase.handleTransfer();
                    this.creep.say('t');
                    break;
                }

                case 3: {
                    roleBase.handleTransfer();
                    this.creep.say('t');
                    break;
                }

                default: {
                    this.creep.memory.task = 0;
                    this.creep.say('reset');
                    break;
                }
            }
        }
    },

}

module.exports = roleSweeper;
