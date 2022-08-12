var Imported = Imported || {};
Imported['DblClick'] = "1.2";
let DblClick = {};

//=============================================================================
/*:
 * @plugindesc v1.2 - Plugin that allows you to double click / tap to run to a space
 * @author Gimmer
 * @help
 * ===========
 * Gimmer_DoubleClickRun
 * ===========
 *
 * No options, just install this and you'll double click to run to stuff
 *
 *
 */


DblClick.TouchInput_clear = TouchInput.clear;
TouchInput.clear = function(){
    DblClick.TouchInput_clear.call(this);
    this._isDoubleClicked = false;
    this._triggeredX = 0;
    this._triggeredY = 0;
}
DblClick.TouchInput_onTrigger = TouchInput._onTrigger;
TouchInput._onTrigger = function(x, y){
    if(SceneManager._scene.constructor === Scene_Map){
        let localX = $gameMap.canvasToMapX(x);
        let localY = $gameMap.canvasToMapY(y);
        this._isDoubleClicked = localX === $gameMap.canvasToMapX(this._triggeredX) && localY === $gameMap.canvasToMapY(this._triggeredY);
    }
    this._triggeredX = x;
    this._triggeredY = y;

    DblClick.TouchInput_onTrigger.call(this,x,y);
}

TouchInput.isDoubleClicked = function(){
    return this._isDoubleClicked;
}

DblClick.Game_Player_prototype_updateDashing = Game_Player.prototype.updateDashing;
Game_Player.prototype.updateDashing = function (){
    DblClick.Game_Player_prototype_updateDashing.call(this);
    if (this.canMove() && !this.isInVehicle() && !$gameMap.isDashDisabled()) {
        this._dashing = this.isDashButtonPressed() || TouchInput.isDoubleClicked();
    } else {
        this._dashing = false;
    }
}

DblClick.Game_Temp_prototype_clearDestination = Game_Temp.prototype.clearDestination
Game_Temp.prototype.clearDestination = function (){
    DblClick.Game_Temp_prototype_clearDestination.call(this);
    TouchInput._isDoubleClicked = false;
}
