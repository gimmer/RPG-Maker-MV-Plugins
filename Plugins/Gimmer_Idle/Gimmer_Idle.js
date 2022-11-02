var Gimmer_Core = Gimmer_Core || {};
Gimmer_Core.idle = {'loaded':true}

//=============================================================================
// Idle Frames
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Idle Character Images
 * @author Gimmer_
 *
 * @help Gimmer_Idle.js
 *
 * Version 1.1
 *
 * For any actor / follower you want to go idle, put in <idleImage:characterName,characterIndex> in the note section of the actor.
 * Set the number of idle frames, and it will go to a stepping frames
 *
 * @param Idle Frames
 * @text Idle Frames
 * @desc Number of frames before you go to the idle animation
 * @type Number
 * @default 120
 */

Gimmer_Core.idle.stopFrames = Number(PluginManager.parameters('Gimmer_Idle')['Idle Frames']);

Gimmer_Core.idle.Game_CharacterBase_prototype_initMembers = Game_CharacterBase.prototype.initMembers
Game_CharacterBase.prototype.initMembers = function(){
    Gimmer_Core.idle.Game_CharacterBase_prototype_initMembers.call(this);
    this._preIdleCharacterName = "";
    this._preIdleCharacterIndex = 0;
    this._idleImage = "";
    this._idleIndex = 0;
}

Gimmer_Core.Game_CharacterBase_prototype_updateStop = Game_CharacterBase.prototype.updateStop
Game_CharacterBase.prototype.updateStop = function(){
    Gimmer_Core.Game_CharacterBase_prototype_updateStop.call(this);
    if(this._stopCount >= Gimmer_Core.idle.stopFrames){
        this.setIdle();
    }
}

Gimmer_Core.Game_CharacterBase_prototype_setDirection = Game_CharacterBase.prototype.setDirection;
Game_CharacterBase.prototype.setDirection = function(d){
    this.stopIdle();
    Gimmer_Core.Game_CharacterBase_prototype_setDirection.call(this,d);
}

Gimmer_Core.Game_CharacterBase_prototype_moveStraight = Game_CharacterBase.prototype.moveStraight
Game_CharacterBase.prototype.moveStraight = function(d){
    this.stopIdle();
    Gimmer_Core.Game_CharacterBase_prototype_moveStraight.call(this, d);
}

Gimmer_Core.Game_CharacterBase_prototype_moveDiagonally = Game_CharacterBase.prototype.moveDiagonally;
Game_CharacterBase.prototype.moveDiagonally = function (horz, vert){
    this.stopIdle();
    Gimmer_Core.Game_CharacterBase_prototype_moveDiagonally.call(this, horz, vert);
}

Gimmer_Core.idle.Game_CharacterBase_prototype_jump = Game_CharacterBase.prototype.jump;
Game_CharacterBase.prototype.jump = function(xPlus, yPlus){
    this.stopIdle();
    Gimmer_Core.idle.Game_CharacterBase_prototype_jump.call(this,xPlus, yPlus);
}


Game_CharacterBase.prototype.setIdle = function(){
    if(this._idleImage !== "" && this.characterName() !== this._idleImage){
        this.setStepAnime(true);
        this._preIdleCharacterIndex = this.characterIndex();
        this._preIdleCharacterName = this.characterName();
        this.setImage(this._idleImage, this._idleIndex);
    }
}

Game_CharacterBase.prototype.stopIdle = function (){
    if(this._idleImage !== "" && this.characterName() === this._idleImage){
        this.setStepAnime(false);
        this.setImage(this._preIdleCharacterName, this._preIdleCharacterIndex);
    }
}

Game_Actor.prototype.getIdleImage = function(){
    const actor = this.actor();
    if(actor.meta.hasOwnProperty('idleImage')){
       return actor.meta.idleImage.split(',');
    }
    return [];
}

Game_Event.prototype.getIdleImage = function(){
    const event = this.event();
    if(event.meta.hasOwnProperty('idleImage')){
        return event.meta.idleImage.split(',');
    }
    return [];
}

Gimmer_Core.idle.Game_Event_prototype_refresh = Game_Event.prototype.refresh;
Game_Event.prototype.refresh = function (){
    Gimmer_Core.idle.Game_Event_prototype_refresh.call(this);
    const idle = this.getIdleImage();
    if(idle.length){
        this._idleImage = idle[0];
        this._idleIndex = idle[1];
    }
}

Gimmer_Core.idle.Game_Player_prototype_refresh = Game_Player.prototype.refresh;
Game_Player.prototype.refresh = function(){
    Gimmer_Core.idle.Game_Player_prototype_refresh.call(this);
    const actor = $gameParty.leader();
    if(actor){
        const idle = actor.getIdleImage();
        if(idle.length){
            this._idleImage = idle[0];
            this._idleIndex = idle[1];
        }
    }
    this._followers.refresh();
}

Gimmer_Core.idle.Game_Follower_prototype_refresh = Game_Follower.prototype.refresh;
Game_Follower.prototype.refresh = function(){
    Gimmer_Core.idle.Game_Follower_prototype_refresh.call(this);
    const actor = this.actor();
    if(actor){
        const idle = actor.getIdleImage();
        if(idle.length){
            this._idleImage = idle[0];
            this._idleIndex = idle[1];
        }
    }
}