const taskManager = require('task-manager');
const roleBase = require('role.base');
var statsConsole = require("statsConsole");


var roleCollector = {
    creep: null,
    droppedSources: null,


    run: function (creep) {
        this.init(creep);
        roleBase.decideTask(creep);
        this.handleTask(creep);
    },

    init(creep){
        this.creep = creep;
        this.droppedSources = this.creep.room.find(FIND_DROPPED_RESOURCES,
            {
                filter: dropped => {
                    // consoleStats.log('coll: '+this.creep.name +' '+dropped.energy + '/' + this.creep.carryCapacity);
                    // consoleStats.log('coll: '+this.creep.name +' ' +(dropped.energy > this.creep.carryCapacity));
                    return dropped.energy > this.creep.carryCapacity/2;
                }
            });
        roleBase.init(this.creep, this.droppedSources);

    },

    /** @param {Creep} creep **/
    handleTask() {
        if (!roleBase.willGoHome(this.creep)) {
            switch (this.creep.memory.task) {
                case 0: {
                    roleBase.handleCollect(this.creep);
                    this.creep.say('c');
                    break;
                }
                case 1: {
                    roleBase.handleTransfer(this.creep);
                    this.creep.say('t');
                    break;
                }
                case 2: {
                    roleBase.handleBuild(this.creep);
                    this.creep.say('b');
                    break;
                }

                case 3: {
                    roleBase.handleUpgrade(this.creep);
                    this.creep.say('u');
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

module.exports = roleCollector;
