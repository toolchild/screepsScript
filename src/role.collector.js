const taskManager = require('task-manager');
const roleBase = require('role.base');


var roleCollector = {
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
                    // console.log('coll: '+this.creep.name +' '+dropped.energy + '/' + this.creep.carryCapacity);
                    // console.log('coll: '+this.creep.name +' ' +(dropped.energy > this.creep.carryCapacity));
                    return dropped.energy > this.creep.carryCapacity/2;
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
                    roleBase.handleBuild();
                    this.creep.say('b');
                    break;
                }

                case 3: {
                    roleBase.handleUpgrade();
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
