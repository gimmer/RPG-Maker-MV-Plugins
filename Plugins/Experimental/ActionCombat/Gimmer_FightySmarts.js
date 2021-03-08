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
 * The following tags can be set on the Event's, or the enemies that are associated with the event's "<isEnemy:x>" tag.
 * The plugin will load the tag from the event first, then the enemy, and then finally the default as set in the parameters.
 *
 * Optionally add these note tags to override the defaults on anything that has canAggro set:
 * <aggroDistance:x> where x is how far in squares from the player that aggro will start. Set this to 0 to prevent proximity based aggro.
 * <chaseDistance:x> where x is how many steps the npc will chase the player before rubber banding back to their starting position
 * <aggroBalloonId:x> where x is the id of the balloon you want to go over their head. -1 to suppress if you want to not have balloons
 * <aggroMoveSpeed:x> Where x is the move speed you want when aggro. You don't really want this to be faster than your character can move, especially if an enemy has a self hit box.
 * <aggroMoveFrequency:x> Where x is the move frequency you want when aggro. 5 is a good choice, but it may depend on how fast your character can move.
 * <hpRegenPulseFrequency:x> Where x is the number of frames to fire a regen pulse when un-aggro'd. Set to -1 to prevent regeneration of un-aggro'd enemies.
 * <hpRegenPulsePercentage:x> Where x is the percentage of max hp to fire per regen pulse.
 * <attackCoolDownMin:x> Where x is the minimum number of frames the enemy will wait before attacking again.
 * <attackCoolDownMax:x> Where x is the maximum number of frames the enemy will wait before attacking again. Used with it's minimum to randomly refresh attacks.
 *
 * @param ---Defaults---
 *
 * @param Default Aggro Distance
 * @parent ---Defaults---
 * @desc How many squares away do enemies aggro?
 * @type Number
 * Default 3
 * @default 3
 *
 * @param Default Chase Distance
 * @parent ---Defaults---
 * @desc How many frames to spend chasing the player before returning where you come from
 * @type Number
 * Default 10
 * @default 10
 *
 * @param Default Aggro Balloon Id
 * @parent ---Defaults---
 * @desc What balloon animationId do you want when aggro occurs? set to -1 to never have an aggro balloon
 * @type Number
 * Default 1
 * @default 1
 *
 * @param Default Aggro Move Frequency
 * @parent ---Defaults---
 * @desc What move frequency to have when monsters aggro?
 * @type Number
 * Default 5
 * @default 5
 *
 * @param Default Hp Regen Pulse Frequency
 * @parent ---Defaults---
 * @desc How many frames between hp regen pulses for enemies when they are not aggro'd and are doing their regular route. Make 0 to prevent regeneration
 * @type Number
 * Default 60
 * @default 60
 *
 * @param Default Hp Regen Pulse Percentage
 * @parent ---Defaults---
 * @desc What percent of hps to regenerate per pulse?
 * @type Number
 * Default 5
 * @default 5
 *
 * @param Default Aggro Move Speed
 * @parent ---Defaults---
 * @desc What move speed to be when aggro'd? Best not to be faster than the player
 * @type Number
 * Default 4
 * @default 4
 *
 * @param Default Attack Cooldown Min
 * @parent ---Defaults---
 * @desc Min Number of frames to wait before monsters can attack again
 * @type Number
 * Default 60
 * @default 60
 *
 * @param Default Attack Cooldown Max
 * @parent ---Defaults---
 * @desc Max Number of frames to wait before monsters can attack again
 * @type Number
 * Default 90
 * @default 90
 *
 * @param Use Default Aggro Sound Effect
 * @parent ---Defaults---
 * @desc Use Default Aggro Sound Effect? This will be the sound associted with "Battle Start" in the system menu
 * @type Boolean
 * Default true
 * @default true
 *
 */

var FightySmartParams = PluginManager.parameters('Gimmer_FightySmarts');
Gimmer_Core.FightySmarts.DefaultAggroDistance = Number(FightySmartParams['Default Aggro Distance'] || 3);
Gimmer_Core.FightySmarts.DefaultChaseDistance = Number(FightySmartParams['Default Chase Distance'] || 10);
Gimmer_Core.FightySmarts.DefaultAggroBalloonId = Number(FightySmartParams['Default Aggro Balloon Id'] || 1);
Gimmer_Core.FightySmarts.DefaultAggroMoveFrequency = Number(FightySmartParams['Default Aggro Move Frequency'] || 1);
Gimmer_Core.FightySmarts.DefaultHpRegenPulseFrequency = Number(FightySmartParams['Default Hp Regen Pulse Frequency'] || 60);
Gimmer_Core.FightySmarts.DefaultHpRegenPulsePercentage = Number(FightySmartParams['Default Hp Regen Pulse Frequency'] || 5);
Gimmer_Core.FightySmarts.DefaultAggroMoveSpeed = Number(FightySmartParams['Default Aggro Move Speed'] || 3);
Gimmer_Core.FightySmarts.DefaultAttackCoolDownMin = Number(FightySmartParams['Default Attack Cooldown Min'] || 60);
Gimmer_Core.FightySmarts.DefaultAttackCoolDownMax = Number(FightySmartParams['Default Attack Cooldown Max'] || 90);
Gimmer_Core.FightySmarts.UseDefaultAggroSound = (FightySmartParams['Use Default Aggro Sound Effect'] === "true");

Gimmer_Core.FightySmarts.getDefaultAggroSound = function(){
    return $dataSystem.sounds[7];
}

//Todo update aggro range logic to include distance to player

//Add parameters unique to FightySmarts events
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
    this._oldMoveSpeed = -1;
    this._aggroBalloonId = -1;
    this._aggroMoveFrequency = 0;
    this._hpRegenPulseFrequency = -1;
    this._hpRegenPulsePercentage = 0;
    this._hpRegenPulseWait = 0;
    this._attackCoolDownMin = 0;
    this._attackCoolDownMax = 0;
    this._currentAttackCoolDown = 0;
    this._balloonFired = false;
    this._soundPlayed = false;
    this._aggroSe = Gimmer_Core.FightySmarts.getDefaultAggroSound();
    if(this._enemy){
        let meta = this.getObjectData().meta;
        let enemyMeta = this._enemy.getObjectData().meta;
        this._canAggro = Gimmer_Core.Fighty.getMetaKey([meta,enemyMeta],'canAggro',false);
        if(this._canAggro){
            this._aggroDistance = Number(Gimmer_Core.Fighty.getMetaKey([meta,enemyMeta],'aggroDistance',Gimmer_Core.FightySmarts.DefaultAggroDistance));
            this._chaseDistance = Number(Gimmer_Core.Fighty.getMetaKey([meta,enemyMeta],'chaseDistance',Gimmer_Core.FightySmarts.DefaultChaseDistance));
            this._aggroBalloonId = Number(Gimmer_Core.Fighty.getMetaKey([meta,enemyMeta],'aggroBalloonId',(Gimmer_Core.FightySmarts.DefaultAggroBalloonId > 0 ? Gimmer_Core.FightySmarts.DefaultAggroBalloonId : -1)));
            this._aggroMoveFrequency = Number(Gimmer_Core.Fighty.getMetaKey([meta,enemyMeta],'aggroMoveFrequency',Gimmer_Core.FightySmarts.DefaultAggroMoveFrequency));
            this._aggroMoveSpeed = Number(Gimmer_Core.Fighty.getMetaKey([meta,enemyMeta],'aggroMoveSpeed',Gimmer_Core.FightySmarts.DefaultAggroMoveSpeed));
            this._hpRegenPulseFrequency = Number(Gimmer_Core.Fighty.getMetaKey([meta,enemyMeta],'hpRegenPulseFrequency',Gimmer_Core.FightySmarts.DefaultHpRegenPulseFrequency));
            this._hpRegenPulsePercentage = Number(Gimmer_Core.Fighty.getMetaKey([meta,enemyMeta],'hpRegenPulsePercentage',Gimmer_Core.FightySmarts.DefaultHpRegenPulsePercentage));
            this._attackCoolDownMin = Number(Gimmer_Core.Fighty.getMetaKey([meta,enemyMeta],'attackCoolDownMin',Gimmer_Core.FightySmarts.DefaultAttackCoolDownMin));
            this._attackCoolDownMax = Number(Gimmer_Core.Fighty.getMetaKey([meta,enemyMeta],'attackCoolDownMax',Gimmer_Core.FightySmarts.DefaultAttackCoolDownMax));

            //Se handling
            let customSe =  Gimmer_Core.Fighty.getMetaKey([meta,enemyMeta],'AggroSe',false);
            if(customSe){
                this._aggroSe.name = customSe;
            }

            if(!customSe && !Gimmer_Core.FightySmarts.UseDefaultAggroSound){
                this._aggroSe = false;
            }
        }
    }
}

//Update Aggro and regen
Gimmer_Core.FightySmarts._Game_Event_prototype_update = Game_Event.prototype.update;
Game_Event.prototype.update = function(){
    Gimmer_Core.FightySmarts._Game_Event_prototype_update.call(this);
    if(Gimmer_Core.Fighty.Enabled){
        if(!this._erased){
            this.updateAggro();
            this.updateInvadingPersonalSpace();
            this.updateRegen();
        }
    }
}

Game_Event.prototype.updateInvadingPersonalSpace = function(){
    if(this._selfHitBox && this._realX === $gamePlayer.x && this._realY === $gamePlayer.y){
        //Ooops, you are crowding the player
        this.setDirectionFix(true);
        this.moveTowardCharacter({x:this._startingX, y: this._startingY});
        this.setDirectionFix(false);
    }
}

Gimmer_Core.FightySmarts.Game_Character_prototype_moveTowardCharacter = Game_Character.prototype.moveTowardCharacter;
Game_Character.prototype.moveTowardCharacter = function(character){
    Gimmer_Core.FightySmarts.Game_Character_prototype_moveTowardCharacter.call(this, character);
    if(!this.isMovementSucceeded()){
        //Ok, the default pathing isn't working, build a better path.
        let newDirection = this.findDirectionTo(character.x, character.y);
        if(newDirection > 0){
            this.moveStraight(newDirection);
        }
    }
}


//Update aggro triggers and trigger aggro if need be
Game_Event.prototype.updateAggro = function(){
    let aggroDistance = this._aggroDistance;
    if(this._isReturning){ //If they've given up, you have to get closer to them
        aggroDistance = aggroDistance / 2; //todo param?
    }

    if(!this._isAggro && this.distanceToPlayer() < aggroDistance){
        this.setupAggro();
    }
}

//If regen is configured
Game_Event.prototype.updateRegen = function(){
    if(this._hpRegenPulseFrequency > 0 && this._hpRegenPulsePercentage > 0 && !this._isAggro && !this._isReturning){
        if(this._hpRegenPulseWait > 0){
            this._hpRegenPulseWait--;
        }
        else{
            this._enemy.gainHp(this._enemy.mhp * (this._hpRegenPulsePercentage / 100));
            this._hpRegenPulseWait = this._hpRegenPulseFrequency;
        }
    }
}

//Do aggro starting
Game_Event.prototype.setupAggro = function (){
    if(!this._isAggro && this._aggroBalloonId > 0 && !this._balloonFired){
        this.requestBalloon(this._aggroBalloonId);
        this._balloonFired = true;
    }

    if(!this._isAggro && this._aggroSe && !this._soundPlayed){
        AudioManager.playSe(this._aggroSe);
        this._soundPlayed = true;
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
    if(this._oldMoveSpeed === -1){
        this._oldMoveSpeed = this.moveSpeed();
    }
    this.setMoveSpeed(this._aggroMoveSpeed);
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
                this._balloonFired = false;
                this._soundPlayed = false;
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
    return this.straightOnlyDistanceToPlayer() * $gameMap.tileWidth();
}

Game_Event.prototype.straightOnlyDistanceToPlayer = function(){
    let playerX = $gamePlayer.x;
    let playerY = $gamePlayer.y;
    let sameX = this.x === playerX;
    let sameY = this.y === playerY;

    if(sameX && !sameY){
        return Math.abs($gameMap.deltaY(this.y, playerY));
    }
    if(sameY && !sameX){
        return Math.abs($gameMap.deltaX(this.x, playerX));
    }
}

Game_Event.prototype.executeAggroAction = function(){
    let screenDistance = this.screenDistanceToPlayer();

    if(this._canAttack){
        let attackRange = this.getAttackRange();
        if(this._currentAttackCoolDown > 0){
            //What to do on attack cooldown and you are in combat range
            if(screenDistance <= attackRange && !this._pendingAttack && !this._isAttacking){
                //RETREAT randomly?
                this.turnTowardPlayer();
                this.setDirectionFix(true);
                //this.moveAwayFromPlayer();
                this.setDirectionFix(false);
            }
        }
        else{
            if(attackRange > 0){
                if(screenDistance <= attackRange){
                    if(this._currentAttackCoolDown <= 0){
                        this.turnTowardPlayer();
                        this._pendingAttack = true;
                        this._currentAttackCoolDown = this.setAttackCoolDown();
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

Game_Event.prototype.setAttackCoolDown = function(){
    return Math.floor(Math.random() * (this._attackCoolDownMax - this._attackCoolDownMin + 1) + this._attackCoolDownMin);
}

//Function to chase the player
Game_Event.prototype.chasePlayer = function (){
    //Chase the player
    if(!this.isMoving()){
        this.moveTowardPlayer();
        this._chasedCount++;
    }

    //If you've chased for long enough, go home.
    if (this._chasedCount >= this._chaseDistance) {
        this._isReturning = true;
        this._isAggro = false;
        this.setMoveFrequency(this._oldMoveFrequency);
        this.setMoveSpeed(this._oldMoveSpeed)
        this._oldMoveFrequency = -1;
        this._oldMoveSpeed = -1;
    }
}