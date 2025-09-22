if(!('Gimmer_Core' in window)){
    Gimmer_Core = {};
}
Gimmer_Core.SCS = {
    'cameraStopped': false
};

//=============================================================================
// RPG Maker MZ - Stop Camera Scroll
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Stop Camera Scroll with a plugin command
 * @author Gimmer_
 *
 * @help Gimmer_StopCameraScroll.js
 *
 * This plugin provides a command to stop camera scroll
 *
 * Instructions
 *   1. Call the plugin command "Stop Camera Scroll".
 *   2. Do whatever manual camera movement you want to do
 *   3. Call the plugin command "Start Camera Movement"
 *
 * @command stop
 * @text Stop Camera Scroll
 * @desc Stops the Camera from scrolling
 *
 * @command start
 * @text Start Camera Scroll
 * @desc Starts the Camera Scroll
 */

Gimmer_Core.SCS.Game_Player_prototype_updateScroll = Game_Player.prototype.updateScroll;
Game_Player.prototype.updateScroll = function(){
    if(!Gimmer_Core.SCS.cameraStopped){
        Gimmer_Core.SCS.Game_Player_prototype_updateScroll.apply(this, arguments);
    }
}

PluginManager.registerCommand("Gimmer_StopCameraScroll", "stop", () => {
    Gimmer_Core.SCS.cameraStopped = true;
});

PluginManager.registerCommand("Gimmer_StopCameraScroll", "start", () => {
    Gimmer_Core.SCS.cameraStopped = false;
});