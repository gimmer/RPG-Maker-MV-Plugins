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
 * <aggroMoveSpeed:x> Where x is the move speed you want when aggro. You don't really want this to be faster than your character can move, especially if an enemy has a self hit box.
 * <aggroMoveFrequency:x> Where x is the move frequency you want when aggro. 5 is a good choice, but it may depend on how fast your character can move.
 * <hpRegenPulseFrequency:x> Where x is the number of frames to fire a regen pulse when unaggroed
 * <hpRegenPulsePercentage:x> Where x is the percentage of max hp to fire per regen pulse
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
 */

/*~struct~se:
* @param name
* @type file
* @dir audio/se/
* @require 1
* @desc What filename?
*
* @param volume
* @type Number
* @min 1
* @max 100
* Default 90
* @default 90
* @desc What volume to play at?
*
* @param pitch
* @type Number
* @min 50
* @max 150
* @default 100
* Default 100
* @desc What pitch to play at?
*
* @param pan
* @type Text
* @min -100
* @max 100
* @default 0
* Default 0
* @desc Where to pan left or right?
*
*/

var FightySmartParams = PluginManager.parameters('Gimmer_FightySmarts');
Gimmer_Core.FightySmarts.DefaultAggroDistance = Number(FightySmartParams['Default Aggro Distance'] || 3);
Gimmer_Core.FightySmarts.DefaultChaseDistance = Number(FightySmartParams['Default Chase Distance'] || 10);
Gimmer_Core.FightySmarts.DefaultAggroBalloonId = Number(FightySmartParams['Default Aggro Balloon Id'] || 1);
Gimmer_Core.FightySmarts.DefaultAggroMoveFrequency = Number(FightySmartParams['Default Aggro Move Frequency'] || 1);
Gimmer_Core.FightySmarts.DefaultHpRegenPulseFrequency = Number(FightySmartParams['Default Hp Regen Pulse Frequency'] || 60);
Gimmer_Core.FightySmarts.DefaultHpRegenPulsePercentage = Number(FightySmartParams['Default Hp Regen Pulse Frequency'] || 5);
Gimmer_Core.FightySmarts.DefaultAggroMoveSpeed = Number(FightySmartParams['Default Aggro Move Speed'] || 4);
Gimmer_Core.FightySmarts.DefaultAttackCoolDownMin = Number(FightySmartParams['Default Attack Cooldown Min'] || 60);
Gimmer_Core.FightySmarts.DefaultAttackCoolDownMax = Number(FightySmartParams['Default Attack Cooldown Max'] || 90);

//Todo:: sound effects for aggro?

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
    if(this._enemy){
        let meta = this.getObjectData().meta;
        let enemyMeta = this._enemy.getObjectData().meta;
        this._canAggro = ('canAggro' in meta);
        if(this._canAggro){
            //Event Meta
            this._aggroDistance = ('aggroDistance' in meta ? Number(meta.aggroDistance) : Gimmer_Core.FightySmarts.DefaultAggroDistance);
            this._chaseDistance = ('chaseDistance' in meta ? Number(meta.chaseDistance) : Gimmer_Core.FightySmarts.DefaultChaseDistance);
            this._aggroBalloonId = ('aggroBalloonId' in meta ? Number(meta.aggroBalloonId) : (Gimmer_Core.FightySmarts.DefaultAggroBalloonId > 0 ? Gimmer_Core.FightySmarts.DefaultAggroBalloonId : -1))
            this._aggroMoveFrequency = ('aggroMoveFrequency' in meta ? Number(meta.aggroMoveFrequency) : Gimmer_Core.FightySmarts.DefaultAggroMoveFrequency);
            this._aggroMoveSpeed = ('aggroMoveSpeed' in meta ? Number(meta.aggroMoveSpeed) : Gimmer_Core.FightySmarts.DefaultAggroMoveSpeed);
            this._hpRegenPulseFrequency = ('hpRegenPulseFrequency' in meta ? Number(meta.hpRegenPulseFrequency) : Gimmer_Core.FightySmarts.DefaultHpRegenPulseFrequency);
            this._hpRegenPulsePercentage = ('hpRegenPulsePercentage ' in meta ? Number(meta.hpRegenPulsePercentage) : Gimmer_Core.FightySmarts.DefaultHpRegenPulsePercentage);

            //Enemy Meta
            this._attackCoolDownMin = ('attackCoolDownMin' in enemyMeta ? Number(enemyMeta.attackCoolDownMin) : Gimmer_Core.FightySmarts.DefaultAttackCoolDownMin);
            this._attackCoolDownMax = ('attackCoolDownMax' in enemyMeta ? Number(enemyMeta.attackCoolDownMax) : Gimmer_Core.FightySmarts.DefaultAttackCoolDownMax);
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
            this.updateRegen();
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
                //RETREAT
                this.turnTowardPlayer();
                this.setDirectionFix(true);
                this.moveAwayFromPlayer();
                this.setDirectionFix(false);
            }
        }
        else{
            if(attackRange > 0){
                if(screenDistance <= attackRange){
                    if(this._currentAttackCoolDown <= 0){
                        this.turnTowardPlayer();
                        this._pendingAttack = true;
                        this._currentAttackCoolDown = this.setAttackCoolDown()
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
    this.moveTowardPlayer();
    this._chasedCount++;
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