if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

Gimmer_Core['ActorSpeed'] = {'loaded':true};

//=============================================================================
/*:
 * @plugindesc v1.1 - Control the actor speed more finely in the game.
 * @author Gimmer_
 * @help This plugin gives you more control over the actor speed.
 *
 * ================
 * Gimmer_ActorSpeed
 * ================
 *
 * Control the actor speed more finely by using a decimal.
 *
 * Terms of Use:
 * =======================================================================
 * Free for both commercial and non-commercial use, with credit.
 * More Gimmer_ plugins at: https://github.com/gimmer/RPG-Maker-MV-Plugins
 * =======================================================================*
 *
 * @param ---Parameters---
 * @default
 *
 * @param Actor Speed
 * @parent ---Parameters---
 * @type number
 * @min 3
 * @max 6
 * @desc Adjusts the movement of the main party
 * Default: 3.75
 * @default 3.75
 *
 * @param Return Actor Speed
 * @parent ---Parameters---
 * @type boolean
 * @desc After an event moves the player along a route at a specific speed, return to the default speed without requiring another event line
 * Default: False
 * @default false
 *
 */

var gActorSpeedParams = PluginManager.parameters('Gimmer_ActorSpeed');
Gimmer_Core.ActorSpeed.ActorSpeed = parseFloat(gActorSpeedParams['Actor Speed']);
Gimmer_Core.ActorSpeed.ReturnToOriginalSpeed = (gActorSpeedParams === "true");

//Set the movement at initialization of the Game Player.
Gimmer_Core.ActorSpeed._Game_Player_prototype_initialize = Game_Player.prototype.initialize;
Game_Player.prototype.initialize = function() {
    Gimmer_Core.ActorSpeed._Game_Player_prototype_initialize.call(this);
    this.setMoveSpeed(Gimmer_Core.ActorSpeed.ActorSpeed);
};


if(Gimmer_Core.ActorSpeed.ReturnToOriginalSpeed){
//Movement should reset to previously set movement after an event with movement that specifies a speed
    Gimmer_Core.ActorSpeed._Game_Character_initMembers_prototype = Game_Character.prototype.initMembers
    Game_Character.prototype.initMembers = function() {
        Gimmer_Core.ActorSpeed._Game_Character_initMembers_prototype.call(this);
        this._originalMoveSpeed = 0;
    };

    Gimmer_Core.ActorSpeed._Game_Character_memorizeMoveRoute_prototype = Game_Character.prototype.memorizeMoveRoute
    Game_Character.prototype.memorizeMoveRoute = function() {
        Gimmer_Core.ActorSpeed._Game_Character_memorizeMoveRoute_prototype.call(this);
        this._originalMoveSpeed = this._moveSpeed;
    };

    Gimmer_Core.ActorSpeed.Game_Character_restoreMoveRoute_prototype = Game_Character.prototype.restoreMoveRoute;
    Game_Character.prototype.restoreMoveRoute = function() {
        Gimmer_Core.ActorSpeed.Game_Character_restoreMoveRoute_prototype.call(this);
        this._moveSpeed = this._originalMoveSpeed;
        this._originalMoveSpeed  = 0;
    };
}