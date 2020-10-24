var Gimmer_Core = Gimmer_Core || {'debug':false, 'pluginCommands':{}};

Gimmer_Core.pendingCallbacks = {};
//=============================================================================
/*:
 * @plugindesc General plugin framework for my other plugins
 * @author Gimmer
 * @help Currently this plugin doesn't do very much beyond letting you toggle on some debug console output, and some frameworking for plugin commands

 * @param debug
 * @parent ---Parameters---
 * @type Boolean
 * @desc Debug messages in console for all Gimmer plugins
 * Default: False
 * @default false
 */

var parameters = PluginManager.parameters('Gimmer_Core');
Gimmer_Core.debug = (parameters['debug'] === "true");

//Function for debugging. Uses the DD name because my muscle memory types that when I want to figure out what's broken
function dd(something){
    if(Gimmer_Core.debug){
        console.log(something);
    }
}

var Gimmer_Core_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    Gimmer_Core_Interpreter_pluginCommand.call(this, command, args)
    command = command.toUpperCase();
    if(command in Gimmer_Core.pluginCommands){
        Gimmer_Core.pluginCommands[command](args);
    }
};

Gimmer_Core.reserveCommonEventWithCallback = function(commentEventId, callback){
    dd('callabck added for commoneventId '+ commentEventId);
    Gimmer_Core.pendingCallbacks[commentEventId.toString()] = callback;
    $gameTemp.reserveCommonEvent(commentEventId);
}

Game_Interpreter.prototype.setupReservedCommonEvent = function() {
    if ($gameTemp.isCommonEventReserved()) {
        dd($gameTemp.reservedCommonEvent());
        dd('pending comment event: '+$gameTemp.reservedCommonEvent().id);
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
        dd('calling callback');
        Gimmer_Core.pendingCallbacks[this._commonEventId.toString()]();
        delete Gimmer_Core.pendingCallbacks[this._commonEventId];
    }
    Gimmer_Core.Game_Interpreter_prototype_terminate.call(this);
};