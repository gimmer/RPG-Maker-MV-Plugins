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
 * Add the following note tag to assign an AI profile:
 * <actionProfile:[aggressor|defender|chaotic|coward]> Which of the four provided templates do you want your enemy to be.
 *
 * ===Profiles===
 * Aggressor:
 *      Aggressors will follow the player for X chase distance when aggro'd.
 *      They will attack (or ram into) on cool down
 *      They will back off slowly when on cool down, but stay near the player
 *
 * Defender:
 *      Defenders will follow the player to a make distance from their original position.
 *      Defenders will stay aggro'd in their defensive position, facing the player, until the player goes far enough away
 *      Defenders will back away slowly from the player during attack cool down
 *      Defenders will move back to their patrol area, even when aggro'd if they are pulled too far from where they started
 *
 * Coward:
 *      Cowards will run from the player if they can
 *      Cowards will attack on cooldown if the player is in their range and they can
 *      If cowards cannot attack, they'll just run away.
 *
 * Chaotic:
 *      Chaotics will run towards the player, but with bouts of randomness based on settings
 *      Chaotics will attack when in range and not on cool down
 *      Chaotics will stay within a certain range of the player on cool down, but mostly run around randomly
 *
 *
 *
 * The following tags can be set on the Event's, or the enemies that are associated with the event's "<isEnemy:x>" tag.
 * The plugin will load the tag from the event first, then the enemy, and then finally the default as set in the parameters.
 *
 * Optionally add these note tags to override the defaults on anything that has canAggro set:
 * <aggroDistance:x> where x is how far in squares from the player that aggro will start. Set this to 0 to prevent proximity based aggro.
 * <aggroDistanceReturnMod:x> Where x is what percent to divide the aggro range by when returning. Defaults to 50. Assumes that monster returning to their home base are harder to aggro again
 * <chaseDistance:x> where x is how many steps the npc will chase the player before rubber banding back to their starting position
 * <aggroBalloonId:x> where x is the id of the balloon you want to go over their head. -1 to suppress if you want to not have balloons
 * <aggroMoveSpeed:x> Where x is the move speed you want when aggro. You don't really want this to be faster than your character can move, especially if an enemy has a self hit box.
 * <aggroMoveFrequency:x> Where x is the move frequency you want when aggro. 5 is a good choice, but it may depend on how fast your character can move.
 * <hpRegenPulseFrequency:x> Where x is the number of frames to fire a regen pulse when un-aggro'd. Set to -1 to prevent regeneration of un-aggro'd enemies.
 * <hpRegenPulsePercentage:x> Where x is the percentage of max hp to fire per regen pulse.
 * <attackCoolDownMin:x> Where x is the minimum number of frames the enemy will wait before attacking again.
 * <attackCoolDownMax:x> Where x is the maximum number of frames the enemy will wait before attacking again. Used with it's minimum to randomly refresh attacks.
 * <aggroSe:x> Where where x is the name of the file (e.g. Absorb1, Attack3, etc.) that you want when aggro occurs.
 *
 * You can also tweak the default ai parameters with the following note tags:
 * <minPuttyDistance:x> Where x is the minimum distance a chaotic will try to stay away from the player (in tiles) while on cool down
 * <maxPuttyDistance:x> Where x is the maximum distance a chaotic will try to stay away from the player (in tiles) while on cool down
 * <chaosPercent:x> Where x is the percent of the time a chaotic will move randomly instead of towards a player during a chase
 * <backOffDistance:x> Where x is how many tiles an aggressor will try to back off during cool down.
 * <defenderDistance:x> Where x is how many tiles a defender will go away from their starting position.
 * <defenderAggroDistanceMod:x> Where x is how many tiles a player has to be from the defender before the defender will disengage.

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
 * @param Default Aggro Distance Return Mod
 * @parent ---Defaults---
 * @desc A number between 0 and 100 percent for how much to reduce aggro range by when a monster is returning to their starting position after aggro
 * @type Number
 * Default 50
 * @default 50
 * @min 0
 * @max 100
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
 * @param Default Action Profile
 * @desc What action profile to use for all monsters unless specified elsewhere?
 * @type select
 * @parent ---Defaults---
 * @option aggressor
 * @option defender
 * @option coward
 * @option chaotic
 * @default aggressor
 * Default aggressor
 *
 * @param ---Chaotic Defaults---
 * @parent ---Defaults---
 *
 * @param Default Min Putty Distance
 * @parent ---Chaotic Defaults---
 * @desc Min number of squares that a chaotic monster hopping around will try to stay away from the player
 * @type Number
 * Default 2
 * @default 2
 *
 * @param Chaos Percent
 * @parent ---Chaotic Defaults---
 * @desc What percentage of the time should chaotic enemies run around randomly versus actually trying to reach the player?
 * @type Number
 * Default 50
 * @default 50
 * @min 1
 * @min 100
 *
 * @param Default Max Putty Distance
 * @parent ---Chaotic Defaults---
 * @desc Max number of squares that a chaotic monster hopping around will be allowed to be from the player
 * @type Number
 * Default 3
 * @default 3
 *
 * @param ---Aggressor Defaults---
 * @parent ---Defaults---
 *
 * @param Default Backoff Distance
 * @parent ---Aggressor Defaults---
 * @desc How many squares will an attacker attempt to keep away while attacks are recharging
 * @type Number
 * Default 2
 * @default 2
 *
 * @param ---Defender Defaults---
 * @parent ---Defaults---
 *
 * @param Default Max Chase Distance
 * @parent ---Defender Defaults---
 * @desc How many squares will a defender be willing to go from their starting position?
 * @type Number
 * Default 2
 * @default 2
 *
 *
 * @param Default Defender Aggro Distance Mod
 * @parent ---Defender Defaults---
 * @desc Aggro distance times this number is how many squares away from a defender's max range that a player needs to be to break aggro
 * @type Number
 * Default 2
 * @default 2
 *
 *
 */

//todo: retreating phase when low on health (at percent, and speed when retreating)

Gimmer_Core.FightySmarts.ActionProfileKeys = {
    AGGRESSOR: "aggressor",
    DEFENDER: "defender",
    COWARD: "coward",
    CHAOTIC: "chaotic"
}

var FightySmartParams = PluginManager.parameters('Gimmer_FightySmarts');
Gimmer_Core.FightySmarts.DefaultAggroDistance = Number(FightySmartParams['Default Aggro Distance'] || 3);
Gimmer_Core.FightySmarts.DefaultAggroDistanceReturnMod = Number(FightySmartParams['Default Aggro Distance Return Mod'] || 50)
Gimmer_Core.FightySmarts.DefaultChaseDistance = Number(FightySmartParams['Default Chase Distance'] || 10);
Gimmer_Core.FightySmarts.DefaultAggroBalloonId = Number(FightySmartParams['Default Aggro Balloon Id'] || 1);
Gimmer_Core.FightySmarts.DefaultAggroMoveFrequency = Number(FightySmartParams['Default Aggro Move Frequency'] || 1);
Gimmer_Core.FightySmarts.DefaultHpRegenPulseFrequency = Number(FightySmartParams['Default Hp Regen Pulse Frequency'] || 60);
Gimmer_Core.FightySmarts.DefaultHpRegenPulsePercentage = Number(FightySmartParams['Default Hp Regen Pulse Frequency'] || 5);
Gimmer_Core.FightySmarts.DefaultAggroMoveSpeed = Number(FightySmartParams['Default Aggro Move Speed'] || 3);
Gimmer_Core.FightySmarts.DefaultAttackCoolDownMin = Number(FightySmartParams['Default Attack Cooldown Min'] || 60);
Gimmer_Core.FightySmarts.DefaultAttackCoolDownMax = Number(FightySmartParams['Default Attack Cooldown Max'] || 90);
Gimmer_Core.FightySmarts.UseDefaultAggroSound = (FightySmartParams['Use Default Aggro Sound Effect'] === "true");
Gimmer_Core.FightySmarts.DefaultActionProfile = (FightySmartParams['Default Action Profile'] || Gimmer_Core.FightySmarts.ActionProfileKeys.AGGRESSOR);
Gimmer_Core.FightySmarts.DefaultMinPuttyDistance = Number(FightySmartParams['Default Min Putty Distance'] || 2);
Gimmer_Core.FightySmarts.DefaultMaxPuttyDistance = Number(FightySmartParams['Default Max Putty Distance'] || 3);
Gimmer_Core.FightySmarts.DefaultBackoffDistance = Number(FightySmartParams['Default Backoff Distance'] || 2);
Gimmer_Core.FightySmarts.DefaultMaxChaseDistance = Number(FightySmartParams['Default Max Chase Distance'] || 2);
Gimmer_Core.FightySmarts.DefaultDefenderAggroDistanceReturnMod = Number(FightySmartParams['Default Defender Aggro Distance Mod'] || 2);
Gimmer_Core.FightySmarts.DefaultChaosPercent = Number(FightySmartParams['Chaos Percent'] || 50);

Gimmer_Core.FightySmarts.getDefaultAggroSound = function(){
    return $dataSystem.sounds[7];
}

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
    this._minimumPuttyDistance = false;
    this._maximumPuttyDistance = false;
    this._aggroDistanceReturnMod = 1;
    this._actionProfile = false;
    this._aggroPhase = Gimmer_Core.FightySmarts.AggroPhases.NEUTRAL;
    this._tempMoveSpeed = false;
    this._backoffDistance = 0;
    this._defenderDistance = 0;
    this._defenderAggroDistanceMod = 0;
    this._chaosPercent = 0;
    if(this._enemy){
        let meta = this.getObjectData().meta;
        let enemyMeta = this._enemy.getObjectData().meta;
        this._canAggro = Gimmer_Core.Fighty.getMetaKey([meta,enemyMeta],'canAggro',false);
        if(this._canAggro){
            this._aggroDistance = Number(Gimmer_Core.Fighty.getMetaKey([meta,enemyMeta],'aggroDistance',Gimmer_Core.FightySmarts.DefaultAggroDistance));
            this._aggroDistanceReturnMod = (100 - (Number(Gimmer_Core.Fighty.getMetaKey([meta,enemyMeta],'aggroDistanceReturnMod',Gimmer_Core.FightySmarts.DefaultAggroDistanceReturnMod)) / 100)).clamp(0,1);
            this._chaseDistance = Number(Gimmer_Core.Fighty.getMetaKey([meta,enemyMeta],'chaseDistance',Gimmer_Core.FightySmarts.DefaultChaseDistance));
            this._aggroBalloonId = Number(Gimmer_Core.Fighty.getMetaKey([meta,enemyMeta],'aggroBalloonId',(Gimmer_Core.FightySmarts.DefaultAggroBalloonId > 0 ? Gimmer_Core.FightySmarts.DefaultAggroBalloonId : -1)));
            this._aggroMoveFrequency = Number(Gimmer_Core.Fighty.getMetaKey([meta,enemyMeta],'aggroMoveFrequency',Gimmer_Core.FightySmarts.DefaultAggroMoveFrequency));
            this._aggroMoveSpeed = Number(Gimmer_Core.Fighty.getMetaKey([meta,enemyMeta],'aggroMoveSpeed',Gimmer_Core.FightySmarts.DefaultAggroMoveSpeed));
            this._hpRegenPulseFrequency = Number(Gimmer_Core.Fighty.getMetaKey([meta,enemyMeta],'hpRegenPulseFrequency',Gimmer_Core.FightySmarts.DefaultHpRegenPulseFrequency));
            this._hpRegenPulsePercentage = Number(Gimmer_Core.Fighty.getMetaKey([meta,enemyMeta],'hpRegenPulsePercentage',Gimmer_Core.FightySmarts.DefaultHpRegenPulsePercentage));
            this._attackCoolDownMin = Number(Gimmer_Core.Fighty.getMetaKey([meta,enemyMeta],'attackCoolDownMin',Gimmer_Core.FightySmarts.DefaultAttackCoolDownMin));
            this._attackCoolDownMax = Number(Gimmer_Core.Fighty.getMetaKey([meta,enemyMeta],'attackCoolDownMax',Gimmer_Core.FightySmarts.DefaultAttackCoolDownMax));

            //Se handling
            let customSe =  Gimmer_Core.Fighty.getMetaKey([meta,enemyMeta],'aggroSe',false);
            if(customSe){
                this._aggroSe.name = customSe;
            }

            if(!customSe && !Gimmer_Core.FightySmarts.UseDefaultAggroSound){
                this._aggroSe = false;
            }

            //AI Profile Parameters
            this._actionProfile = Gimmer_Core.Fighty.getMetaKey([meta,enemyMeta],'actionProfile', Gimmer_Core.FightySmarts.DefaultActionProfile);

            //Aggressor Parameters
            this._backoffDistance = Gimmer_Core.Fighty.getMetaKey([meta,enemyMeta],'backOffDistance', Gimmer_Core.FightySmarts.DefaultBackoffDistance);

            //Defender Parameters
            this._defenderDistance = Gimmer_Core.Fighty.getMetaKey([meta,enemyMeta],'defenderDistance',Gimmer_Core.FightySmarts.DefaultMaxChaseDistance);
            this._defenderAggroDistanceMod = Gimmer_Core.Fighty.getMetaKey([meta,enemyMeta],'defenderAggroDistanceMod',Gimmer_Core.FightySmarts.DefaultDefenderAggroDistanceReturnMod);

            //Chaotic Parameters
            this._chaosPercent = Gimmer_Core.Fighty.getMetaKey([meta,enemyMeta], 'chaosPercent',Gimmer_Core.FightySmarts.DefaultChaosPercent);
            this._minimumPuttyDistance = Gimmer_Core.Fighty.getMetaKey([meta,enemyMeta],'minPuttyDistance', Gimmer_Core.FightySmarts.DefaultMinPuttyDistance);
            this._maximumPuttyDistance = Gimmer_Core.Fighty.getMetaKey([meta,enemyMeta],'maxPuttyDistance', Gimmer_Core.FightySmarts.DefaultMaxPuttyDistance);
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
            this.updateCooldown();
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

Game_Event.prototype.executeReturnAction = function(){
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
}


//Update aggro triggers and trigger aggro if need be
Game_Event.prototype.updateAggro = function(){
    let aggroDistance = this._aggroDistance;
    if(this._isReturning){ //If they've given up, you have to get closer to them
        aggroDistance = aggroDistance * this._aggroDistanceReturnMod;
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
    if (!this._locked && this.isNearTheScreen() && this.checkStop(this.stopCountThreshold())) {
        if (this._isAggro) {
            this.executeAggroAction();
        } else if (this._isReturning) {
            this.executeReturnAction();
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

//Returns nan if you're on a diagonal, which is what it's supposed to do honest
Game_Event.prototype.straightOnlyDistanceToPlayer = function(){
    let playerX = Math.round($gamePlayer.x);
    let playerY = Math.round($gamePlayer.y);
    let sameX = Math.round(this.x) === playerX;
    let sameY = Math.round(this.y) === playerY;

    if(sameX && !sameY){
        return Math.abs($gameMap.deltaY(this.y, playerY));
    }
    if(sameY && !sameX){
        return Math.abs($gameMap.deltaX(this.x, playerX));
    }
}

//Profiles that map to specific actions
Gimmer_Core.FightySmarts.ActionProfiles = {
    //Profiles for enemies with attacks
    aggressor: {
        "chasing" : function(that){
            that.chasePlayer();
        },
        "attacking": function(that){
            if(!that._isAttacking){
                that.turnTowardPlayer();
                that.queueAttack();
                that.setAttackCoolDown();
            }
            else{
                that.turnTowardPlayer();
            }
        },
        "recharging": function(that){
            if(that.distanceToPlayer() < this._backOffDistance) {
                that.moveSlowly("moveAwayFromPlayer",undefined, 0.75, 0.25); //params
            }
            else{
                that.increaseSteps();
            }
        },
        "retreating": function(that){
            that.moveAwayFromPlayer();
        },
        "onAggroPhaseChange": () => {}
    },
    defender: {
        "chasing" : function(that){
            if($gameMap.distance(that.x, that.y, that._startingX, that._startingY) === that._defenderDistance){
                that.turnTowardPlayer();
                that.increaseSteps();
            }
            else if($gameMap.distance(that.x, that.y, that._startingX, that._startingY) > that._defenderDistance){
                that.moveTowardCharacter({x: that._startingX, y: that._startingY});
            }
            else{
                that.chasePlayer();
            }
            this.onAggroPhaseChange(that);
        },
        "attacking": function(that){
            if(!that._isAttacking){
                that.turnTowardPlayer();
                that.queueAttack();
                that.setAttackCoolDown();
            }
            else{
                that.turnTowardPlayer();
            }
        },
        "recharging": function(that){
            that.moveSlowly('moveTowardCharacter',{x: that._startingX, y: that._startingY},0.75,0.25);
        },
        "retreating": function(that){
            that.moveAwayFromPlayer();
        },
        "onAggroPhaseChange": function(that) {
            //Defenders go back
            if(that.distanceToPlayer() > (that._aggroDistance * that._defenderAggroDistanceMod)){
                that.queueReturn();
            }
        }
    },
    coward: {
        "chasing" : function(that){
            that.moveAwayFromPlayer();
        },
        "attacking": function(that){
            if(!that._isAttacking){
                that.turnTowardPlayer();
                that.queueAttack();
                that.setAttackCoolDown();
            }
            else{
                that.turnTowardPlayer();
            }
        },
        "recharging": function(that){
            that.moveAwayFromPlayer();
        },
        "retreating": function(that){
            that.moveAwayFromPlayer();
        },
        "onAggroPhaseChange": () => {}
    },
    chaotic: {
        "chasing" : function(that){
            if(Math.randomInt(100) > that._chaosPercent){
                that.moveRandom();
            }
            else{
                that.chasePlayer();
            }

        },
        "attacking": function(that){
            if(!that._isAttacking){
                that.turnTowardPlayer();
                that.queueAttack();
                that.setAttackCoolDown();
            }
            else{
                that.turnTowardPlayer();
            }
        },
        "recharging": function(that){
            that.puttyAround();
        },
        "retreating": function(that){
            that.moveAwayFromPlayer();
        },
        "onAggroPhaseChange": () => {}
    }
}

Gimmer_Core.FightySmarts.AggroPhases = {
    NEUTRAL: "neutral", //doing their regular route
    CHASING: "chasing", //chasing the player
    ATTACKING: "attacking", //chasing and able to do an attack
    RECHARGING: "recharging", // waiting for an attack to recharge
    RETREATING: "retreating" //running away
}

Game_Event.prototype.doAggroAction = function(){
    if(this._aggroPhase !== Gimmer_Core.FightySmarts.AggroPhases.NEUTRAL){
        Gimmer_Core.FightySmarts.ActionProfiles[this._actionProfile][this._aggroPhase](this);
    }
}


//maybe
Game_Event.prototype.setAggroPhase = function(){
    let oldPhase = this._aggroPhase;
    if(!this._isAggro){
        this._aggroPhase = Gimmer_Core.FightySmarts.AggroPhases.NEUTRAL;
    }
    else{
        if(this._canAttack || this._selfHitBox){
            if(this._currentAttackCoolDown > 0 && !this._isAttacking){
                this._aggroPhase = Gimmer_Core.FightySmarts.AggroPhases.RECHARGING;
            }
            else{
                let screenDistance = this.screenDistanceToPlayer();
                if(this._canAttack){
                    let attackRange = this.getAttackRange();
                    if(this._isAttacking || screenDistance <= attackRange){
                        this._aggroPhase = Gimmer_Core.FightySmarts.AggroPhases.ATTACKING;
                    }
                    else{
                        this._aggroPhase = Gimmer_Core.FightySmarts.AggroPhases.CHASING;
                    }
                }
                else if(this._selfHitBox.engaged){
                    this._aggroPhase = Gimmer_Core.FightySmarts.AggroPhases.RECHARGING;
                }
                else{
                    this._aggroPhase = Gimmer_Core.FightySmarts.AggroPhases.CHASING;
                }
            }
        }
        else{
            //If you can't hurt the enemy, you are retreating always
            this._aggroPhase = Gimmer_Core.FightySmarts.AggroPhases.RETREATING;
        }
    }

    if(oldPhase !== this._aggroPhase){
        this.onAggroPhaseChange();
    }
}

Game_Event.prototype.onAggroPhaseChange = function(){
    //Reset any changes to speed
    if(this._tempMoveSpeed){
        this.setMoveSpeed(this._tempMoveSpeed);
        this._tempMoveSpeed = false;
    }
    Gimmer_Core.FightySmarts.ActionProfiles[this._actionProfile].onAggroPhaseChange(this);
}

//Update the attack cooldown
Game_Event.prototype.updateCooldown = function(){
    if(!this._canAttack && this._selfHitBox && this._selfHitBox.engaged && this._currentAttackCoolDown === 0){
        this.setAttackCoolDown();
    }
    if(this._currentAttackCoolDown > 0 && !this._isAttacking){
        this._currentAttackCoolDown--;
    }
    if(this._currentAttackCoolDown === 0 && this._selfHitBox){
        this._selfHitBox.engaged = false;
    }
}

Game_Event.prototype.queueAttack = function(){
    this._pendingAttack = true;
}

Game_Event.prototype.queueReturn = function(){
    this._isReturning = true;
    this._isAggro = false;
    this.setMoveFrequency(this._oldMoveFrequency);
    this.setMoveSpeed(this._oldMoveSpeed)
    this._oldMoveFrequency = -1;
    this._oldMoveSpeed = -1;
}

Game_Event.prototype.setAttackCoolDown = function(){
    this._currentAttackCoolDown = this.getAttackCoolDown();
    this._chasedCount = 0;
}


//figure out what you should do, and then do it
Game_Event.prototype.executeAggroAction = function(){
    this.setAggroPhase();
    this.doAggroAction();
}

//Function to randomly move around the character. Like a putty from power rangers? https://www.youtube.com/watch?v=PhCiue3INIw
Game_Event.prototype.puttyAround = function(){
    if(this._minimumPuttyDistance > 0 && this._maximumPuttyDistance > 0){
        if(this.distanceToPlayer() < this._minimumPuttyDistance){
            this.moveAwayFromPlayer();
        }
        else if(this.distanceToPlayer() > this._maximumPuttyDistance){
            this.moveTowardPlayer();
        }
        else{
            this.moveRandom();
        }
    }
}

Game_Event.prototype.moveSlowly = function(movementFunction, moveParams, speedPercentReduction, minMoveSpeedPercent){
    if(!this._tempMoveSpeed){
        this._tempMoveSpeed = this.moveSpeed();
    }
    let speedForNow = this.moveSpeed() * speedPercentReduction;
    speedForNow.clamp(this._tempMoveSpeed * minMoveSpeedPercent, speedForNow);
    this.setMoveSpeed(speedForNow);
    this.setDirectionFix(true);
    if(moveParams){
        this[movementFunction](moveParams);
    }
    else{
        this[movementFunction]();
    }

    this.setDirectionFix(false);
}

Game_Event.prototype.getAttackCoolDown = function(){
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
        this.queueReturn();
    }
}