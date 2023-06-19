var Gimmer_Core = Gimmer_Core || {};
Gimmer_Core.idle = {'loaded':true}

var Imported = Imported || {};
Imported.Gimmer_Idle = true;



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
 * Version 1.2.3
 *
 * For any actor / follower you want to go idle, put in <idleImage:characterName,characterIndex> in the note section of the actor.
 * Set the number of idle frames, and it will go to a stepping frames
 *
 * @param Idle Frames
 * @text Idle Frames
 * @desc Number of frames before you go to the idle animation
 * @type Number
 * @default 120
 *
 * @param Switch To Enable Party Idle Frames
 * @type switch
 * @text Switch to Enable Party Idle Frames
 * @desc What switch needs to be on so party members will go into idle mode? Leave blank for no switch
 *
 * @param Switch To Enable Event Idle Frames
 * @type switch
 * @text Switch to Enable Event Idle Frames
 * @desc What switch needs to be on so events will go into idle mode? Leave blank for no switch
 *
 */

Gimmer_Core.idle.stopFrames = Number(PluginManager.parameters('Gimmer_Idle')['Idle Frames']);
Gimmer_Core.idle.partySwitchId = Number(PluginManager.parameters('Gimmer_Idle')['Switch To Enable Party Idle Frames']);
Gimmer_Core.idle.eventSwitchId = Number(PluginManager.parameters('Gimmer_Idle')['Switch To Enable Event Idle Frames']);

Gimmer_Core.idle.ACTOR_CACHE = {};
Gimmer_Core.idle.EVENT_CACHE = {};

Gimmer_Core.idle.Game_CharacterBase_prototype_initMembers = Game_CharacterBase.prototype.initMembers
Game_CharacterBase.prototype.initMembers = function(){
    Gimmer_Core.idle.Game_CharacterBase_prototype_initMembers.call(this);
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

Game_CharacterBase.prototype.setIdle = function(){};

Game_Event.prototype.setIdle = function(){
    if(this._idleImage !== "" && this.characterName() !== this._idleImage  && (Gimmer_Core.idle.eventSwitchId === 0 || $gameSwitches.value(Gimmer_Core.idle.eventSwitchId))){
        this.setStepAnime(true);
        let index = this.characterIndex();
        let mod = 0;
        if(Imported.Galv_DiagonalMovement && Galv.DM.diagGraphic && this._diagDir && index > 4){
            mod = 4;
        }
        Gimmer_Core.idle.EVENT_CACHE[this.eventId().toString()+'-'+this._mapId.toString()] = {
            'preIdleCharacterIndex': index - mod,
            'preIdleCharacterName': this.characterName()
        }
        this.setImage(this._idleImage, this._idleIndex + mod);
    }
}

Game_Player.prototype.setIdle = function(){
    if(this._idleImage !== "" && this.characterName() !== this._idleImage && (Gimmer_Core.idle.partySwitchId === 0 || $gameSwitches.value(Gimmer_Core.idle.partySwitchId))){
        this.setStepAnime(true);
        let index = this.characterIndex();
        let mod = 0;
        if(Imported.Galv_DiagonalMovement && Galv.DM.diagGraphic && this._diagDir && index > 4){
            mod = 4;
        }
        Gimmer_Core.idle.ACTOR_CACHE[$gameParty.leader().actorId().toString()] = {
            'preIdleCharacterIndex': index - mod,
            'preIdleCharacterName': this.characterName()
        }

        this.setImage(this._idleImage, this._idleIndex + mod);
    }
}


Game_Follower.prototype.setIdle = function(){
    if(this.actor() && this._idleImage !== "" && this.characterName() !== this._idleImage && (Gimmer_Core.idle.partySwitchId === 0 || $gameSwitches.value(Gimmer_Core.idle.partySwitchId))){
        this.setStepAnime(true);
        let index = this.characterIndex();
        let mod = 0;
        if(Imported.Galv_DiagonalMovement && Galv.DM.diagGraphic && this._diagDir && index > 4){
            mod = 4;
        }
        Gimmer_Core.idle.ACTOR_CACHE[this.actor().actorId().toString()] = {
            'preIdleCharacterIndex': index - mod,
            'preIdleCharacterName': this.characterName()
        }

        this.setImage(this._idleImage, this._idleIndex + mod);
    }
}

Game_CharacterBase.prototype.stopIdle = function (){
    if(this._idleImage !== "" && this.characterName() === this._idleImage){
        this.setStepAnime(false);
        const preIdleImage = this.getPreIdleImage();
        let index = preIdleImage.preIdleCharacterIndex;
        this.setImage(preIdleImage.preIdleCharacterName, index);
    }
}

Game_CharacterBase.prototype.getPreIdleImage = function(){
    return {};
}

Game_Event.prototype.getPreIdleImage = function(){
    return Gimmer_Core.idle.EVENT_CACHE[this.eventId().toString()+"-"+this._mapId];
}

Game_Player.prototype.getPreIdleImage = function(){
    const actor = $gameParty.leader();
    return Gimmer_Core.idle.ACTOR_CACHE[actor.actorId().toString()];
}

Game_Follower.prototype.getPreIdleImage = function(){
    const actor = this.actor();
    return Gimmer_Core.idle.ACTOR_CACHE[actor.actorId().toString()];
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