var Gimmer_Core = Gimmer_Core || {};
Gimmer_Core.bore = {'loaded':true}

//=============================================================================
// Ya Boring
//=============================================================================

/*:
 * @target MZ
 * @plugindesc v1.0 - Walk away from boring events
 * @author Gimmer_
 *
 * @help Gimmer_YaBoring.js
 *
 * Version 1.0
 *
 * For any event that contains only dialogue, the player is free to walk away. Doing so will end the event.
 *
 * @param Distance Before Closing
 * @text Distance Before Closing
 * @desc Number of grid positions you can walk from the event before it closes
 * @type Number
 * @default 3
 *
 */


Gimmer_Core.bore.DISTANCE_THRESHOLD = Number(PluginManager.parameters('Gimmer_YaBoring')['Distance Before Closing']);;

/**
 * =======================
 * Game Interpreter Mods
 * =======================
 */

Gimmer_Core.bore.Game_Interpreter_prototype_initialize = Game_Interpreter.prototype.initialize;
Game_Interpreter.prototype.initialize = function (depth){
    Gimmer_Core.bore.Game_Interpreter_prototype_initialize.call(this, depth);
    this._eventBoring = false;
}

Gimmer_Core.bore.Game_Interpreter_prototype_clear = Game_Interpreter.prototype.clear;
Game_Interpreter.prototype.clear = function() {
    Gimmer_Core.bore.Game_Interpreter_prototype_clear.call(this);
    this._eventBoring = false;
}

Gimmer_Core.bore.Game_Interpreter_prototype_setup = Game_Interpreter.prototype.setup;
Game_Interpreter.prototype.setup = function (list, eventId){
    Gimmer_Core.bore.Game_Interpreter_prototype_setup.call(this, list, eventId);
    this.determineIfYaBoring();
}
/**
 * Checks to see if a given events page only consists of dialogue, with no switches or changes.
 * If the event is boring, flip the flag
 */
Game_Interpreter.prototype.determineIfYaBoring = function(){
    let boring = true;
    if(this._list && this._list.length){
        this._list.forEach((item) => {
            if(item.code !== 101 && item.code !== 401 && item.code !==0){
                boring = false;
            }
        })
    }
    else{
        boring = false;
    }
    this._eventBoring = boring;
}

Game_Interpreter.prototype.isEventBoring = function(){
    return this._eventBoring;
}

Game_Interpreter.prototype.didPlayerWanderOff = function(){
    if(this._eventId > -1){
        const event = $gameMap.event(this._eventId);
        const distance = $gameMap.distance($gamePlayer.x, $gamePlayer.y, event.x, event.y);
        if(distance > Gimmer_Core.bore.DISTANCE_THRESHOLD){
            return true;
        }
    }
    return false;
}

Gimmer_Core.bore.Game_Interpreter_prototype_update = Game_Interpreter.prototype.update
Game_Interpreter.prototype.update = function (){
    if(SceneManager._scene.constructor === Scene_Map && this.isRunning() && this.isEventBoring() && this.didPlayerWanderOff()){
        this.clear();
        $gameMessage.clear();
        SceneManager._scene._messageWindow.close();
        SceneManager._scene._messageWindow.pause = false;
    }
    Gimmer_Core.bore.Game_Interpreter_prototype_update.call(this);
}

/**
 * =========================
 * Game_Player Mods
 * =========================
 */

Gimmer_Core.bore.Game_Player_prototype_canMove = Game_Player.prototype.canMove;
Game_Player.prototype.canMove = function(){
    if (($gameMap.isEventRunning() || $gameMessage.isBusy()) && $gameMap._interpreter.isEventBoring()) {
        return true;
    }

    return Gimmer_Core.bore.Game_Player_prototype_canMove.call(this);
}