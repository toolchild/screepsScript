var roleBase = require('role.base');

var roleUpgrader = {

    role: null,
    droppedSources: null,

    /** @param {Creep} creep **/
    run: function (creep) {
        this.init(creep);
        this.decideAndHandleTask()

    },

    init(creep){
        this.creep = creep;
        this.droppedSources = this.creep.room.find(FIND_DROPPED_RESOURCES,
            {
                filter: dropped => {
                    // console.log('coll: '+this.creep.name +' '+dropped.energy + '/' + this.creep.carryCapacity);
                    // console.log('coll: '+this.creep.name +' ' +(dropped.energy > this.creep.carryCapacity));
                    return dropped.energy > this.creep.carryCapacity/3;
                }
            });
        roleBase.init(this.creep, this.droppedSources);
    },

    decideAndHandleTask(){
        if (!roleBase.willGoHome()) {
            if (this.creep.carry.energy === 0) {
                this.creep.memory.isBusy = false;
            }

            if (this.creep.carry.energy < this.creep.carryCapacity && !this.creep.memory.isBusy) {
                roleBase.handleCollect();
                this.creep.say('c');
            } else {
                roleBase.handleUpgrade();
                this.creep.say('u');
            }
        }
    }


};

module.exports = roleUpgrader;
