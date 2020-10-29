var Gimmer_Core = Gimmer_Core || {'debug':false, 'pluginCommands':{}};

Gimmer_Core.pendingCallbacks = {};
Gimmer_Core.areEventsStopped = false;
Gimmer_Core.isPlayerStopped = false;
//=============================================================================
/*:
 * @plugindesc General plugin framework for my other plugins
 * @author Gimmer
 * @help
 * ===========
 * Gimmer_Core
 * ===========
 *
 * Currently this plugin doesn't do very much beyond letting you toggle on some debug console output, and some frameworking for plugin commands.

 * @param debug
 * @parent ---Parameters---
 * @type Boolean
 * @desc Debug messages in console for all Gimmer plugins
 * Default: False
 * @default false
 *
 * Terms of Use:
 * =======================================================================
 * Free for both commercial and non-commercial use, with credit.
 * More Gimmer_ plugins at: https://github.com/gimmer/RPG-Maker-MV-Plugins
 * =======================================================================
 */

var parameters = PluginManager.parameters('Gimmer_Core');
Gimmer_Core.debug = (parameters['debug'] === "true");

//Function for debugging. Uses the DD name because my muscle memory types that when I want to figure out what's broken
function dd(something){
    if(Gimmer_Core.debug){
        console.log(something);
    }
}

//Support for common events to have callbacks
var Gimmer_Core_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    Gimmer_Core_Interpreter_pluginCommand.call(this, command, args)
    command = command.toUpperCase();
    if(command in Gimmer_Core.pluginCommands){
        Gimmer_Core.pluginCommands[command](args);
    }
};

Gimmer_Core.reserveCommonEventWithCallback = function(commentEventId, callback){
    Gimmer_Core.pendingCallbacks[commentEventId.toString()] = callback;
    $gameTemp.reserveCommonEvent(commentEventId);
}

Game_Interpreter.prototype.setupReservedCommonEvent = function() {
    if ($gameTemp.isCommonEventReserved()) {
        this.setup($gameTemp.reservedCommonEvent().list, 0, $gameTemp.reservedCommonEvent().id);
        $gameTemp.clearCommonEvent();
        return true;
    } else {
        return false;
    }
};
Gimmer_Core.Game_Interpreter_prototype_setup = Game_Interpreter.prototype.setup;
Game_Interpreter.prototype.setup = function(list, eventId, commonEventId) {
    Gimmer_Core.Game_Interpreter_prototype_setup.call(this,list,eventId);
    this._commonEventId = commonEventId || 0;
};


Gimmer_Core.Game_Interpreter_prototype_terminate = Game_Interpreter.prototype.terminate;
Game_Interpreter.prototype.terminate = function() {
    if(this._commonEventId.toString() in Gimmer_Core.pendingCallbacks && typeof Gimmer_Core.pendingCallbacks[this._commonEventId.toString()] === 'function'){
        Gimmer_Core.pendingCallbacks[this._commonEventId.toString()]();
        delete Gimmer_Core.pendingCallbacks[this._commonEventId];
    }
    Gimmer_Core.Game_Interpreter_prototype_terminate.call(this);
};

//Quick functionality to stop players and events from moving. Similar to functionality from a no longer available YEP Plugin, but watered down for my needs only
Gimmer_Core.stopEventMovement = function(){
    this.areEventsStopped = true;
}

Gimmer_Core.startEventMovement = function(){
    this.areEventsStopped = false;
}

Gimmer_Core.stopPlayerMovement = function(){
    this.isPlayerStopped = true;
}

Gimmer_Core.startPlayerMovement = function(){
    this.isPlayerStopped = false;
}

//Stop players
Gimmer_Core.Game_Player_prototype_canMove = Game_Player.prototype.canMove;
Game_Player.prototype.canMove = function() {
    if (Gimmer_Core.isPlayerStopped) return false;
    return Gimmer_Core.Game_Player_prototype_canMove.call(this);
};

//Stop Events
Gimmer_Core.Game_Event_prototype_updateSelfMovement = Game_Event.prototype.updateSelfMovement;
Game_Event.prototype.updateSelfMovement = function() {
    if (Gimmer_Core.areEventsStopped || this._moveType === 0) return;
    Gimmer_Core.Game_Event_prototype_updateSelfMovement.call(this);
};