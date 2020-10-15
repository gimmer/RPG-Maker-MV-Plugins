if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

Gimmer_Core['GameTimer'] = {'loaded':true};

//=============================================================================
/*:
 * @plugindesc Support for a real time game timer
 * @author Gimmer
 * @help Use the system clock to keep time of how long a player takes to do something. Pauses when the menu is called and starts again when closed
 * Includes a plugin command to snapshot the length of time at any point into a variable to be used in other places

 * @param Snapshot Variable
 * @parent ---Parameters---
 * @type variable
 * @desc What variable do you want snapshots to go to?
 */

Gimmer_Core.GameTimer.startTime = '';
Gimmer_Core.GameTimer.currentTime = '';
Gimmer_Core.GameTimer.timerMS = 0;
Gimmer_Core.GameTimer.paused = true; //Start paused
let GameTimerParameters = PluginManager.parameters('Gimmer_GameTimer');
Gimmer_Core.GameTimer.snapshotVariableId = Number(GameTimerParameters['Snapshot Variable']);

//Upgrade main loop to record real time
Gimmer_Core.GameTimer.Scene_Map_prototype_updateMain = Scene_Map.prototype.updateMain;
Scene_Map.prototype.updateMain = function() {
    Gimmer_Core.GameTimer.Scene_Map_prototype_updateMain.call(this);
    Gimmer_Core.GameTimer.currentTime = new Date();
    if(!Gimmer_Core.GameTimer.paused){
        Gimmer_Core.GameTimer.timerMS += Gimmer_Core.GameTimer.currentTime - Gimmer_Core.GameTimer.startTime;
    }
    Gimmer_Core.GameTimer.startTime = new Date();
};

//Extend Call Menu to pause the menu
Gimmer_Core.GameTimer.Scene_Map_prototype_callMenu = Scene_Map.prototype.callMenu;
Scene_Map.prototype.callMenu = function() {
    Gimmer_Core.GameTimer.Scene_Map_prototype_callMenu.call(this);
    Gimmer_Core.GameTimer.pause();
};

//Extend Menu so cancelling it unpauses the timer
Scene_Menu.prototype.createCommandWindow = function() {
    this._commandWindow = new Window_MenuCommand(0, 0);
    this._commandWindow.setHandler('item',      this.commandItem.bind(this));
    this._commandWindow.setHandler('skill',     this.commandPersonal.bind(this));
    this._commandWindow.setHandler('equip',     this.commandPersonal.bind(this));
    this._commandWindow.setHandler('status',    this.commandPersonal.bind(this));
    this._commandWindow.setHandler('formation', this.commandFormation.bind(this));
    this._commandWindow.setHandler('options',   this.commandOptions.bind(this));
    this._commandWindow.setHandler('save',      this.commandSave.bind(this));
    this._commandWindow.setHandler('gameEnd',   this.commandGameEnd.bind(this));
    this._commandWindow.setHandler('cancel',    this.commandCancelMenu.bind(this));
    this.addWindow(this._commandWindow);
};

//Cancelling menu will unpause the timer
Scene_Menu.prototype.commandCancelMenu = function() {
    Gimmer_Core.GameTimer.unpause();
    this.popScene();
}

//Quitting to title will reset the timer
Gimmer_Core.GameTimer.Scene_GameEnd_prototype_commandToTitle = Scene_GameEnd.prototype.commandToTitle;
Scene_GameEnd.prototype.commandToTitle = function() {
    Gimmer_Core.GameTimer.pause();
    Gimmer_Core.GameTimer.reset();
    Gimmer_Core.GameTimer.Scene_GameEnd_prototype_commandToTitle.call(this);
};

//Helper Methods
Gimmer_Core.GameTimer.pause = function(){
    this.paused = true;
}

Gimmer_Core.GameTimer.unpause = function(){
    this.paused = false;
}

Gimmer_Core.GameTimer.reset = function(){
    this.timerMS = 0;
}

Gimmer_Core.GameTimer.getTimeString = function(){
    // 1- Convert to seconds:
    let seconds = Gimmer_Core.GameTimer.timerMS / 1000;
    // 2- Extract hours:
    let hours = parseInt( seconds / 3600 ); // 3,600 seconds in 1 hour
    seconds = seconds % 3600; // seconds remaining after extracting hours
    // 3- Extract minutes:
    let minutes = parseInt( seconds / 60 ); // 60 seconds in 1 minute
    // 4- Keep only seconds not extracted to minutes:
    seconds = seconds % 60;
    seconds = seconds.toFixed();
    hours = hours.toString().padStart(2,"0");
    minutes = minutes.toString().padStart(2,"0");
    seconds = seconds.toString().padStart(2,"0");
    return hours+":"+minutes+":"+seconds;
}

Gimmer_Core.pluginCommands['GAMETIMERPAUSE'] = function(){
    Gimmer_Core.GameTimer.pause();
}

Gimmer_Core.pluginCommands['GAMETIMERUNPAUSE'] = function(){
    Gimmer_Core.GameTimer.unpause();
}

Gimmer_Core.pluginCommands['GAMETIMERSNAPSHOT'] = function(){
    $gameVariables.setValue(Gimmer_Core.GameTimer.snapshotVariableId,Gimmer_Core.GameTimer.getTimeString());
}

Gimmer_Core.pluginCommands['GAMETIMERRESET'] = function(){
    Gimmer_Core.GameTimer.reset();
}