var Gimmer_Core = Gimmer_Core || {'debug':false, 'pluginCommands':{}};

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

//Function for debuging. Uses the DD name because my muscle memory types that when I want to figure out what's broken
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