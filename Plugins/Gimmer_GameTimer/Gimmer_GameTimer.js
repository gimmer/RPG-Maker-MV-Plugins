if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

Gimmer_Core['GameTimer'] = {'loaded':true};

//=============================================================================
/*:
 * @plugindesc Support for a real time game timer
 * @author Gimmer
 * @help
 * ================
 * Gimmer_GameTimer
 * ================
 *
 * Use the system clock to keep time of how long a player takes to do something. Pauses when the menu is called and starts again when closed
 * Includes a plugin command to snapshot the length of time at any point into a variable to be used in other places
 *
 * Terms of Use:
 * =======================================================================
 * Free for both commercial and non-commercial use, with credit.
 * More Gimmer_ plugins at: https://github.com/gimmer/RPG-Maker-MV-Plugins
 * =======================================================================

 * @param Snapshot Variable
 * @parent ---Parameters---
 * @type variable
 * @desc What variable do you want snapshots to go to?
 *
 * @param Include Milliseconds
 * @parent ---Parameters---
 * @type Boolean
 * @desc Do you want the timer to include milliseconds?
 *
 */

Gimmer_Core.GameTimer.startTime = '';
Gimmer_Core.GameTimer.currentTime = '';
Gimmer_Core.GameTimer.timerMS = 0;
Gimmer_Core.GameTimer.paused = true; //Start paused
let GameTimerParameters = PluginManager.parameters('Gimmer_GameTimer');
Gimmer_Core.GameTimer.snapshotVariableId = Number(GameTimerParameters['Snapshot Variable']);
Gimmer_Core.GameTimer.IncludeMilliseconds = (GameTimerParameters['Include Milliseconds'] === "true");

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
Gimmer_Core.GameTimer._Scene_Menu_prototype_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
Scene_Menu.prototype.createCommandWindow = function() {
    Gimmer_Core.GameTimer._Scene_Menu_prototype_createCommandWindow.call(this);
    this._commandWindow.setHandler('cancel',    this.commandCancelMenu.bind(this));
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

Gimmer_Core.GameTimer.getTimeString = function(includeMS){
    // 1- Convert to seconds:
    let seconds = Gimmer_Core.GameTimer.timerMS / 1000;
    // 2- Extract hours:
    let hours = parseInt( seconds / 3600 ); // 3,600 seconds in 1 hour
    seconds = seconds % 3600; // seconds remaining after extracting hours
    // 3- Extract minutes:
    let minutes = parseInt( seconds / 60 ); // 60 seconds in 1 minute
    // 4- Keep only seconds not extracted to minutes:
    seconds = seconds % 60;
    let milliseconds = (seconds % 1 * 1000).toFixed();
    seconds = seconds.toFixed();
    hours = hours.toString().padStart(2,"0");
    minutes = minutes.toString().padStart(2,"0");
    seconds = seconds.toString().padStart(2,"0");
    let output = hours+":"+minutes+":"+seconds;
    if(includeMS){
        milliseconds = milliseconds.toString().padStart(3,"0");
        output += ":"+milliseconds;
    }
    return output;
}

Gimmer_Core.pluginCommands['GAMETIMERPAUSE'] = function(){
    Gimmer_Core.GameTimer.pause();
}

Gimmer_Core.pluginCommands['GAMETIMERUNPAUSE'] = function(){
    Gimmer_Core.GameTimer.unpause();
}

Gimmer_Core.pluginCommands['GAMETIMERSNAPSHOT'] = function(){
    $gameVariables.setValue(Gimmer_Core.GameTimer.snapshotVariableId,Gimmer_Core.GameTimer.getTimeString(Gimmer_Core.GameTimer.IncludeMilliseconds));
}

Gimmer_Core.pluginCommands['GAMETIMERRESET'] = function(){
    Gimmer_Core.GameTimer.reset();
}