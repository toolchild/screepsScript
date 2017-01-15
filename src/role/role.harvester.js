var roleBase = require('role.base');
var statsConsole = require("statsConsole");


const roleWorker = {

    role: null,
    sources: null,

    // tasks
    // 0 : handleHarvest
    // 1 : handleTransfer
    // 2 : handleBuild
    // 3 : handleUpgrade

    /** @param {Creep} creep **/
    run(creep){
        this.init(creep);
        roleBase.decideTask(this.creep);
        this.handleTask()
    },

    init(creep){
        this.creep = creep;
        this.sources = _.map(creep.memory.home.roomSources, roomSource => Game.getObjectById(roomSource));
        roleBase.init(this.creep);

    },

    handleTask(){
        if (!roleBase.willGoHome(this.creep)) {
            switch (this.creep.memory.task) {
                case 0: {
                    roleBase.handleHarvest(this.creep);
                    this.creep.say('h');
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
};

module.exports = roleWorker;
