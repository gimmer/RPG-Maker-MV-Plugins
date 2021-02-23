if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

Imported = Imported || {};

if(Gimmer_Core.Fighty === undefined){
    throw "Gimmer_FightyFighty is needed for this plugin.";
}

Gimmer_Core['FightySmarts'] = {'loaded':true};

//=============================================================================
/*:
 * @plugindesc Support for basic enemy aggro and attacking
 * @author Gimmer
 * @help
 * ================
 * Gimmer_FightySmarts
 * ================
 * Add the following note tags to an event to make them aggro, so long as isEnemy is defined on the event as per the FightyFighty Plugin:
 * <canAggro>
 *
 * Optionally add these note tags to override the defaults on anything that has canAggro set:
 * <aggroDistance:x> where x is how far in squares from the player that aggro will start
 * <chaseDistance:x> where x is how many steps the npc will chase the player before rubber banding back to their starting position
 * <aggroBalloonId:x> where x is the id of the balloon you want to go over their head. -1 to suppress if you want to not have balloons
 * <aggroMoveFrequency:x> Where x is the move frequency you want when aggro. 5 is a good choice, but it may depend on how fast your character can move.
 * <hpRegenPulseFrequency:x> Where x is the number of frames to fire a regen pulse when unaggroed
 * <hpRegenPulsePercentage:x> Where x is the percentage of max hp to fire per regen pulse
 *
 */

//Todo: add attack frequency

//Todo make into parameters
Gimmer_Core.FightySmarts.DefaultAggroDistance = 3;
Gimmer_Core.FightySmarts.DefaultChaseDistance = 10;
Gimmer_Core.FightySmarts.DefaultAggroBalloonId = 1;
Gimmer_Core.FightySmarts.DefaultAggroMoveFrequency = 5;
Gimmer_Core.FightySmarts.DefaultHpRegenPulseFrequency = 60;
Gimmer_Core.FightySmarts.DefaultHpRegenPulsePercentage = 5;

Gimmer_Core.FightySmarts._Game_Event_prototype_initialize = Game_Event.prototype.initialize;
Game_Event.prototype.initialize = function(mapId, eventId){
    Gimmer_Core.FightySmarts._Game_Event_prototype_initialize.call(this,mapId, eventId);
    this._canAggro = false;
    this._isAggro = false;
    this._aggroDistance = 0;
    this._chaseDistance = 0;
    this._chasedCount = 0;
    this._isReturning = false;
    this._startingX = -1;
    this._startingY = -1;
    this._oldMoveFrequency = -1;
    this._aggroBalloonId = -1;
    this._aggroMoveFrequency = 0;
    this._hpRegenPulseFrequency = -1;
    this._hpRegenPulsePercentage = 0;
    this._hpRegenPulseWait = 0;
    this._attackCoolDown = 60;
    this._currentAttackCoolDown = 0;
    if(this._enemy){
        let meta = this.getObjectData().meta;
        this._canAggro = ('canAggro' in meta);
        if(this._canAggro){
            this._aggroDistance = ('aggroDistance' in meta ? Number(meta.aggroDistance) : Gimmer_Core.FightySmarts.DefaultAggroDistance);
            this._chaseDistance = ('chaseDistance' in meta ? Number(meta.chaseDistance) : Gimmer_Core.FightySmarts.DefaultChaseDistance);
            this._aggroBalloonId = ('aggroBalloonId' in meta ? Number(meta.aggroBalloonId) : (Gimmer_Core.FightySmarts.DefaultAggroBalloonId > 0 ? Gimmer_Core.FightySmarts.DefaultAggroBalloonId : -1))
            this._aggroMoveFrequency = ('aggroMoveFrequency' in meta ? Number(meta.aggroMoveFrequency) : Gimmer_Core.FightySmarts.DefaultAggroMoveFrequency);
            this._hpRegenPulseFrequency = ('hpRegenPulseFrequency' in meta ? Number(meta.hpRegenPulseFrequency) : Gimmer_Core.FightySmarts.DefaultHpRegenPulseFrequency);
            this._hpRegenPulsePercentage = ('hpRegenPulsePercentage ' in meta ? Number(meta.hpRegenPulsePercentage) : Gimmer_Core.FightySmarts.DefaultHpRegenPulsePercentage);
        }
    }
}

Gimmer_Core.FightySmarts._Game_Event_prototype_update = Game_Event.prototype.update;
Game_Event.prototype.update = function(){
    Gimmer_Core.FightySmarts._Game_Event_prototype_update.call(this);
    if(!this._erased){
        this.updateAggro();
        if(this._hpRegenPulseFrequency > 0 && this._hpRegenPulsePercentage > 0 && !this._isAggro && !this._isReturning){
            this.updateRegen();
        }
    }
}

Game_Event.prototype.updateAggro = function(){
    let aggroDistance = this._aggroDistance;
    if(this._isReturning){
        aggroDistance = aggroDistance / 2;
    }

    if(!this._isAggro && this.distanceToPlayer() < aggroDistance){
        this.setupAggro();
    }
}

Game_Event.prototype.updateRegen = function(){
    if(this._hpRegenPulseWait > 0){
        this._hpRegenPulseWait--;
    }
    else{
        this._enemy.gainHp(this._enemy.mhp * (this._hpRegenPulsePercentage / 100));
        this._hpRegenPulseWait = this._hpRegenPulseFrequency;
    }
}

Game_Event.prototype.setupAggro = function (){
    if(!this._isAggro && this._aggroBalloonId > 0){
        this.requestBalloon(this._aggroBalloonId);
    }

    this._chasedCount = 0;
    this._isAggro = true;
    this._isReturning = false;
    if(this._startingX < 0 || this._startingY < 0){
        this._startingX = this.x;
        this._startingY = this.y;
    }
    if(this._oldMoveFrequency === -1){
        this._oldMoveFrequency = this.moveFrequency();
    }
    this.setMoveFrequency(this._aggroMoveFrequency);
}


//If you hit a bad guy, he aggros on you again
Gimmer_Core.FightySmarts._Game_Event_prototype_resolveHitBox = Game_Event.prototype.resolveHitBox;
Game_Event.prototype.resolveHitBox = function (hitbox){
    if(!hitbox.engaged && this._canAggro){
       this.setupAggro();
    }
    Gimmer_Core.FightySmarts._Game_Event_prototype_resolveHitBox.call(this,hitbox);
}

Gimmer_Core.FightySmarts._Game_Event_prototype_updateSelfMovement = Game_Event.prototype.updateSelfMovement;
Game_Event.prototype.updateSelfMovement = function (){
    if (!this._locked && this.isNearTheScreen() &&
        this.checkStop(this.stopCountThreshold())) {
        if (this._isAggro) {
            this.executeAggroAction();
        } else if (this._isReturning) {
            this.moveTowardCharacter({x: this._startingX, y: this._startingY});
            if (this.x === this._startingX && this.y === this._startingY) {
                this._isReturning = false;
                this._startingX = -1;
                this._startingX = -1;
                this._chasedCount = 0;
                this._hpRegenPulseWait = this._hpRegenPulseFrequency;
            }
        } else {
            Gimmer_Core.FightySmarts._Game_Event_prototype_updateSelfMovement.call(this);
        }
    }
}

Game_Event.prototype.distanceToPlayer = function(){
    return $gameMap.distance(this.x, this.y, $gamePlayer.x, $gamePlayer.y);
}

Game_Event.prototype.screenDistanceToPlayer = function(){
    return this.distanceToPlayer() * $gameMap.tileWidth();
}

Game_Event.prototype.executeAggroAction = function(){
    let distance = this.distanceToPlayer();
    let screenDistance = this.screenDistanceToPlayer();
    if(this._canAttack){
        if(this._currentAttackCoolDown > 0){
            //What to do on attack cooldown and you are in combat range
            if(distance <= 2){
                //RETREAT
                this.turnTowardPlayer();
                this.setDirectionFix(true);
                this.moveAwayFromPlayer();
                this.setDirectionFix(false);
            }
        }
        else{
            let attackRange = this.getAttackRange();
            dd(screenDistance+" "+attackRange);

            if(attackRange > 0){
                if(screenDistance <= attackRange){
                    if(this._currentAttackCoolDown <= 0){
                        this._pendingAttack = true;
                        this._currentAttackCoolDown = this._attackCoolDown;
                        this._chasedCount = 0;
                    }
                }
                else{
                    this.chasePlayer();
                }
            }
            else if(this._selfHitBox){
                //Hurts to be bumped into? they're going to run into you
                this.chasePlayer();
            }
            else{
                //They can't hurt you even though they have _canAttack set
                this.moveAwayFromPlayer();
            }
        }
        if(this._currentAttackCoolDown > 0){
            this._currentAttackCoolDown--;
        }
    }
    else if(this._selfHitBox){
        this.chasePlayer();
    }
    else{
        //They can't attack and they have aggro, run for it
        this.moveAwayFromPlayer();
    }
}

Game_Event.prototype.chasePlayer = function (){
    //Chase the player
    this.moveTowardPlayer();
    this._chasedCount++;
    //If you've chased for long enough, go home.
    if (this._chasedCount >= this._chaseDistance) {
        this._isReturning = true;
        this._isAggro = false;
        this.setMoveFrequency(this._oldMoveFrequency);
        this._oldMoveFrequency = -1;
    }
}