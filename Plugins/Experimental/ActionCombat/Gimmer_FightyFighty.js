if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

if(Gimmer_Core.AnimateAnywhere === undefined){
    throw "Gimmer_AnimateAnywhere is required for this plugin";
}

Imported = Imported || {};

Gimmer_Core['Fighty'] = {'loaded':true};

//=============================================================================
/*:
 * @plugindesc Support for active battle with hit and hurt boxes on players and npcs.
 * @author Gimmer
 * @help
 * ================
 * Gimmer_FightyFighty
 * ================
 *
 * @param ---Parameters---
 *
 * @param Use Ok For Attack
 * @parent ---Parameters---
 * @desc Use the same button for ok as for attack? If false, you need to bind a specific keyboard button to attack
 * @type boolean
 * Default true
 * @default true
 *
 * @param Button Id for Attack
 * @parent ---Parameters---
 * @desc If not using Ok for attack, choose the id of the button you want to use for an attack. See https://keycode.info/ to find button ids
 * @type Number
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

//Todo:: function to get meta variables from sources in priority order, with a key

//Other plugins
//Todo: enemy health meters <-- separate plugin to interface with VisualMeters
//Todo: Other skills to attack with? This will take some restructuring, but not necessarily? <-- seperate plugin

//Stupid crap I have to do eventually
//todo: params
//todo: reorganize the code so all extensions of classes are grouped together instead of being random

//Experimentation
//todo: try to dynamically generate hitboxes based on animation frames: fuck me if this is even possible.


//temp until json solution
Gimmer_Core.Fighty.HitBoxAnimations = {
    '121': [{width:50, height:25, angle: 0},{width:100, height: 25, angle: 0}],
    '122': [{width:50, height:25, angle: 270},{width:100, height: 25, angle: 270}],
    '123': [{modY: -12.5, width:50, height:25, angle: 180},{width:100, height: 25, angle: 180}],
    '124': [{width:50, height:25, angle: 90},{width:100, height: 25, angle: 90}],
    '125': [
        {modX: 0, modY: 0, width:0, height:0, angle: 0},
        {modX: 0, modY: 0, width:0, height:0, angle: 0},
        {modX: 0, modY: 0, width:0, height:0, angle: 0},
        {modX: 0, modY: 9, width:50, height:11, angle: 340},
        {modX: 0, modY: 0, width:0, height:0, angle: 0},
        {modX: 0, modY: 0, width:0, height:0, angle: 0}
    ],
    '126': [
        {
            modXright: -6.5, modYright: -12.5,
            modXleft: -15, modYleft: -12.5,
            modXup: -12, modYup: -16,
            modXdown: -12, modYdown: -10,
            width: 25, height: 25, angle: 0, moveSpeed: 6
        },
        {width: 25, height: 25, angle: 0, moveSpeed: 6}
    ]
};

var FightyParams = PluginManager.parameters('Gimmer_FightyFighty');

//Debug
Gimmer_Core.Fighty.DebugAllyHitboxes = true; //param
Gimmer_Core.Fighty.DebugEnemyHitboxes = true; //param
Gimmer_Core.Fighty.DebugHurtBoxes = true; //param

//Master Switch
Gimmer_Core.Fighty.Enabled = true;

//Params
Gimmer_Core.Fighty.PermaDeath = true; //param
Gimmer_Core.Fighty.InvincibilityFramesPlayer = 60; //param
Gimmer_Core.Fighty.InvincibilityFramesEnemy = 60; //param
Gimmer_Core.Fighty.FlashDamageForPlayer = true; //param
Gimmer_Core.Fighty.DeathCommonEventId = 2; //param
Gimmer_Core.Fighty.UseOkForAttack = (FightyParams['Use Ok For Attack'] === "true");
if(Gimmer_Core.Fighty.UseOkForAttack){
    Gimmer_Core.Fighty.AttackButton = 'ok';
}
else{
    Gimmer_Core.Fighty.AttackButton = 'attack';
    Input.keyMapper[Number(FightyParams['Button Id for Attack'])] = 'attack';
}


//Sounds
Gimmer_Core.Fighty.UseDefaultPlayerDamageSound = true;
Gimmer_Core.Fighty.PlayerHitSoundEffect = false; //param of type se
Gimmer_Core.Fighty.DefaultEnemyHitSoundEffect = false; //Param of type se
Gimmer_Core.Fighty.UseSystemDefaultEnemyHitSoundEffect = true; //param
Gimmer_Core.Fighty.DefaultEnemyDeathSound = false; //param
Gimmer_Core.Fighty.UseDefaultImpactSoundEffect = false;

//Constants
Gimmer_Core.Fighty.hitboxTypes = {
    EVENT: 'event',
    PLAYER: 'player'
}

//Action type 0 = swing, 1 = stab, 2 = shoot
Gimmer_Core.Fighty.actionTypes = [
    "Swing",
    "Stab",
    "Shoot"
]

//Plugin commands
Gimmer_Core.pluginCommands["RESPAWN"] = function(params){
    if(params.length > 0){
        $gameSelfSwitches.setValue([params[0],params[1],"D"], false);
    }
}

Gimmer_Core.pluginCommands["DISABLEFIGHTY"] = function (){
    Gimmer_Core.Fighty.Enabled = false;
}

Gimmer_Core.pluginCommands["ENABLEFIGHTY"] = function (){
    Gimmer_Core.Fighty.Enabled = true;
}

//todo: move data into json
//DataManager._databaseFiles.push({name:'$dataHitboxes',src:'Hitboxes.json'});
$dataHitboxes = Gimmer_Core.Fighty.HitBoxAnimations;

Gimmer_Core.Fighty.getDefaultEnemyHitSoundEffect = function(){
    return $dataSystem.sounds[14];
}

Gimmer_Core.Fighty.getDefaultPlayerHitSoundEffect = function(){
    return $dataSystem.sounds[14];
}

Gimmer_Core.Fighty.getDefaultImpactSoundEffect = function(){
    return $dataSystem.sounds[20];
}

Gimmer_Core.Fighty.getMetaKey = function(metaObjectArray, key, defaultReturn){
    let returnVal = defaultReturn;
    metaObjectArray.some(function(object){
        if(key in object){
            returnVal = object[key];
            return true;
        }
        return false;
    });

    return returnVal;
}

Gimmer_Core.Fighty._Scene_Boot_loadSystemImages = Scene_Boot.loadSystemImages;
Scene_Boot.loadSystemImages = function(){
    Gimmer_Core.Fighty._Scene_Boot_loadSystemImages.call(this);
    $dataActors.forEach(function(actor){
        if(actor && actor.meta){
            Gimmer_Core.Fighty.actionTypes.forEach(function(type){
                //Get individual action sprites
                if('actionSprite'+type in actor.meta){
                    ImageManager.reserveCharacter(actor.meta['actionSprite'+type]);
                }
            });
            //Get global action sprite
            if('actionSprite' in actor.meta){
                ImageManager.reserveCharacter(actor.meta.actionSprite);
            }
        }
    });
}

//Extend Sprite Animation to hold a lot more stuff, potentially be static, have hitboxes, trigger character animation frames, etc.
Gimmer_Core.Fighty._Sprite_Animation_prototype_setup = Sprite_Animation.prototype.setup;
Sprite_Animation.prototype.setup = function(target, animation, mirror, delay) {
    Gimmer_Core.Fighty._Sprite_Animation_prototype_setup.call(this,target,animation,mirror,delay);
    this._oldCharacterName = false;
    this._oldCharacterIndex = false;
    this._hitbox = false;
    this._hitboxFrames = [];
    this._startingX = -1;
    this._startingY = -1;
    this._muteSounds = false;
    if(this.getShootingStage() === 2){
        this._startingDirection = this._target._character._projectileLastDirection;
    }
    this._canBeForcedToLiveForever = true;
    if(SceneManager._scene.constructor === Scene_Map){
        if(this._animation && this._animation.id.toString() in $dataHitboxes){
            this.setupHitboxes($dataHitboxes[this._animation.id.toString()]);
        }
        else{
            this.setupHitboxes([]);
        }
        let objectData = this._target._character.getObjectData();
        let newCharacterName = this.getNewCharacterName(objectData);
        if(newCharacterName && this.getShootingStage() < 2){
            this._oldCharacterName = this._target._character._characterName;
            this._oldCharacterIndex = this._target._character._characterIndex;
            this._target._character.setImage(newCharacterName,this._target._character._characterIndex);
            this._target._character._actionAnimationInUse = true;
        }
    }
}

//Helper function to get the character name needed to load action sprites for the character doing the thing
Sprite_Animation.prototype.getNewCharacterName = function(objectData){
    let attackType = this._target._character._isAttacking;
    let newCharacterName =  false;
    if('meta' in objectData){
        if('actionSprite'+attackType in objectData.meta){
            newCharacterName = objectData.meta['actionSprite'+attackType];
        }
        else if('actionSprite' in objectData.meta){
            newCharacterName = objectData.meta.actionSprite;
        }
    }
    return newCharacterName;
}

Sprite_Animation.prototype.setupHitboxes = function(hitboxes){
    this._hitboxFrames = hitboxes;
    this._lastModX = 0;
    this._lastModY = 0;
    let type = (this._target._character._eventId > 0 ? Gimmer_Core.Fighty.hitboxTypes.EVENT : Gimmer_Core.Fighty.hitboxTypes.PLAYER);
    let direction = this._target._character.direction();
    this._hitbox = new Hitbox(type,new Polygon('rectangle',0,0,0,0, 0),direction, this._target._character);
    if(type === Gimmer_Core.Fighty.hitboxTypes.EVENT){
        $gameScreen._enemyHitBoxes.push(this._hitbox);
    }
    else{
        $gameScreen._allyHitBoxes.push(this._hitbox);
    }

}

Sprite_Animation.prototype.getShootingStage = function(){
    let stage = -1;
    if(this._animation && this._target._character){
        switch(this._animation.id){
            case this._target._character._attackAnimationId:
                stage = 1;
                break;
            case this._target._character._projectileAnimationId:
                stage = 2;
                break;
            case this._target._character._finishedAnimationId:
                stage = 3;
                break;
        }
    }

    return stage;
}

Gimmer_Core.Fighty._Sprite_Animation_prototype_updatePosition = Sprite_Animation.prototype.updatePosition;
Sprite_Animation.prototype.updatePosition = function(){
    let isProjectile = (this.getShootingStage() === 2);
    if(isProjectile){
        if(this._startingX < 0 || this._startingY < 0){
            Gimmer_Core.Fighty._Sprite_Animation_prototype_updatePosition.call(this);
            this._startingX = this.x;
            this._startingY = this.y;
        }
    }
    else{
        Gimmer_Core.Fighty._Sprite_Animation_prototype_updatePosition.call(this);
    }

    let widthToBe = this._hitbox.width;
    if(this._hitboxFrames[this.currentFrameIndex()] && 'width' in this._hitboxFrames[this.currentFrameIndex()]){
        widthToBe = this._hitboxFrames[this.currentFrameIndex()].width;
    }

    let heightToBe = this._hitbox.height;
    if(this._hitboxFrames[this.currentFrameIndex()] && 'height' in this._hitboxFrames[this.currentFrameIndex()]){
        heightToBe = this._hitboxFrames[this.currentFrameIndex()].height;
    }


    if(this._hitbox && heightToBe > 0 && widthToBe > 0){
        let hitboxX = this.x;
        let hitboxY = this.y;

        if(isProjectile){
            //If you are shooting, the animation has to move with the hitboxes, using movement and the starting direction
            let movement = this.getMoveSpeed();

            let direction = this._startingDirection;

            if(direction === "left" || direction === "up"){
                movement *= -1;
            }

            if(direction === "up" || direction === "down"){
                hitboxY += movement;
            }
            else{
                hitboxX += movement;
            }

            //Check where on the map the projectile is.
            let newMapX = Math.floor(hitboxX / $gameMap.tileWidth());
            let newMapY = Math.floor(hitboxY / $gameMap.tileHeight());

            //Hit walls
            if($gameMap.isPassable(newMapX, newMapY, Gimmer_Core.wordsToDirections(direction))){
                this.x = hitboxX;
                this.y = hitboxY;
            }
            else{
                this._canBeForcedToLiveForever = false;
                this._duration = 0;
                if(this._target._character._finishedAnimationId > 0 && SceneManager._scene.constructor === Scene_Map){
                    SceneManager._scene.addAnimation(this._target._character._finishedAnimationId, this._target._character,false,hitboxX, hitboxY, 0);
                }

                return;
            }
        }


        if(!isProjectile){
            this._lastModX = this.getModX();
            this._lastModY = this.getModY();
        }
        else{
            this._lastModX = this.getModX(this._startingDirection);
            this._lastModY = this.getModY(this._startingDirection);
        }
        //modify hitbox position based on it's size, frame dependent
        hitboxY += this._lastModY;
        hitboxX += this._lastModX;

        this._hitbox.updatePosition(hitboxX, hitboxY);
        if(isProjectile){
            let distance = Math.sqrt(Math.pow((this._startingX - this.x),2) + Math.pow((this._startingY - this.y),2));
            if(distance > this._target._character._projectileAttackRange || this._hitbox.engaged){
                this._canBeForcedToLiveForever = false;
                this._duration = 0;
            }
        }
        if(this._hitbox.engaged){
            this._target._character._isAttacking = false;
            if(this._target._character._finishedAnimationId > 0 && SceneManager._scene.constructor === Scene_Map){
                dd(this._hitbox.engaged);
                let box = this._hitbox.engaged.getHurtBox();
                SceneManager._scene.addAnimation(this._target._character._finishedAnimationId, this._target._character,false,this._hitbox.engaged.screenX() + (box.width / 2), this._hitbox.engaged.screenY() - (box.height / 2), 0);
            }
        }
    }
}


Sprite_Animation.prototype.getModY = function(startingDirection){
    let field = 'modY';
    if(startingDirection){
        field = 'modY'+startingDirection;
    }
    return (this._hitboxFrames[this.currentFrameIndex()] && field in this._hitboxFrames[this.currentFrameIndex()] ? this._hitboxFrames[this.currentFrameIndex()][field] : this._lastModY);
}

Sprite_Animation.prototype.getMoveSpeed = function(){
    return (this._hitboxFrames[this.currentFrameIndex()] && 'moveSpeed' in this._hitboxFrames[this.currentFrameIndex()] ? this._hitboxFrames[this.currentFrameIndex()].moveSpeed : 0);
}

Sprite_Animation.prototype.getModX = function(startingDirection){
    let field = 'modX';
    if(startingDirection){
        field = 'modX'+startingDirection;
    }
    return (this._hitboxFrames[this.currentFrameIndex()] && field in this._hitboxFrames[this.currentFrameIndex()] ? this._hitboxFrames[this.currentFrameIndex()][field] : this._lastModX);
}

Gimmer_Core.Fighty._Game_Player_prototype_canMove = Game_Player.prototype.canMove;
Game_Player.prototype.canMove = function(){
    if(this._isAttacking){
        return false;
    }
    else{
        return Gimmer_Core.Fighty._Game_Player_prototype_canMove.call(this);
    }
}

//Prevent moving during attacks even on forced movement routes
Gimmer_Core.Fighty._Game_Character_prototype_updateRoutineMove = Game_Character.prototype.updateRoutineMove;
Game_Character.prototype.updateRoutineMove = function() {
    if(!this._isAttacking){
        Gimmer_Core.Fighty._Game_Character_prototype_updateRoutineMove.call(this)
    }
};

Game_Player.prototype.getActionHero = function(){
    return $gameActors._data[$gameParty._actors[$gamePlayer._characterIndex]];
}

Game_Event.prototype.getActionHero = function(){
    return this._enemy;
}

Gimmer_Core.Fighty._Sprite_Animation_prototype_updateMain = Sprite_Animation.prototype.updateMain;
Sprite_Animation.prototype.updateMain = function(){
    Gimmer_Core.Fighty._Sprite_Animation_prototype_updateMain.call(this);
    if(this.getShootingStage() === 2){
        if(this._duration === 0 && this._canBeForcedToLiveForever){
            this.setupDuration();
        }
    }
    if(!this.isPlaying() && this.isReady()){
        if(this._hitbox){
            this._hitbox.finished = true;
        }

        if(this._target._character){
            this._target._character._isAttacking = false;
        }

        if(this.getShootingStage() === 1 && SceneManager._scene.constructor === Scene_Map){// You did the shooting one, now do the projectile
            SceneManager._scene.addAnimation(this._target._character._projectileAnimationId, this._target._character,false,this.x, this.y,0);
        }

        if(this._oldCharacterName){
            this._target._character.setImage(this._oldCharacterName,this._oldCharacterIndex);
            this._target._character._actionAnimationInUse = false;
        }
    }
}


Gimmer_Core.Fighty._Sprite_Animation_prototype_updateFrame = Sprite_Animation.prototype.updateFrame;
Sprite_Animation.prototype.updateFrame = function(){
    var frameIndex = this.currentFrameIndex();
    if(this.visible && this._hitbox && this._hitboxFrames[frameIndex] && $gameMap.willHitboxHitWall(this._hitbox,this._hitboxFrames[frameIndex].width, this._hitboxFrames[frameIndex].height, this._hitboxFrames[frameIndex].angle)){
        this.playImpactSound();
        this.visible = false; //hide the animation, no more hitboxes
        this._muteSounds = true;
        this._hitbox.finished = true;
    }

    Gimmer_Core.Fighty._Sprite_Animation_prototype_updateFrame.call(this);
    if(this._duration > 0 && this.visible){
        if(this._hitbox && this._hitboxFrames[frameIndex]){
            this._hitbox.updatePosition(false, false, this._hitboxFrames[frameIndex].width, this._hitboxFrames[frameIndex].height, this._hitboxFrames[frameIndex].angle )
        }

        if(this._target._character && this._target._character._actionAnimationInUse){
            this._target._character._attackAnimationFrame = frameIndex;
        }
    }
}

Gimmer_Core.Fighty._Sprite_Animation_prototype_processTimingData = Sprite_Animation.prototype.processTimingData;
Sprite_Animation.prototype.processTimingData = function(timing){
    if(!this._muteSounds){
        Gimmer_Core.Fighty._Sprite_Animation_prototype_processTimingData.call(this, timing);
    }
}

Sprite_Animation.prototype.playImpactSound = function (){
    let seTemplate = Gimmer_Core.Fighty.getDefaultImpactSoundEffect();
    let seName = false;
    let se = false;
    if(this._target._character._eventId > 0){
        let meta = this._target._character.getObjectData().meta;
        let enemyMeta = this._target._character._enemy.getObjectData().meta;
        seName = Gimmer_Core.Fighty.getMetaKey([meta,enemyMeta],'ImpactSe', seName);
    }
    else{
        let meta = this._target._character.getActionHero().weapons()[0].meta;
        seName = Gimmer_Core.Fighty.getMetaKey([meta],'ImpactSe',seName);
    }

    if(seName){
        seTemplate.name = seName;
        se = seTemplate;
    }
    else if(Gimmer_Core.Fighty.UseDefaultImpactSoundEffect){
        se = seTemplate;
    }

    if(se){
        AudioManager.playSe(se);
    }
}


//HACK FOR DEBUGGING
Gimmer_Core.Fighty.Scene_Map_prototype_createAllWindows = Scene_Map.prototype.createAllWindows;
Scene_Map.prototype.createAllWindows = function(){
    Gimmer_Core.Fighty.Scene_Map_prototype_createAllWindows.call(this);
    this.addDebugHitBoxWindow();
}

Scene_Map.prototype.addDebugHitBoxWindow = function(){
    let temp = new Window_Base();
    this._debugHitBoxWindow = new Window_Plain(-temp.standardPadding(),-temp.standardPadding(),Graphics.width + temp.standardPadding() * 2,Graphics.height + temp.standardPadding() * 2);
    this.addChild(this._debugHitBoxWindow);
}
Gimmer_Core.Fighty._Scene_Map_prototype_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function(){
    if(this._debugHitBoxWindow){
        this._debugHitBoxWindow.contents.clear();
    }
    Gimmer_Core.Fighty._Scene_Map_prototype_update.call(this);
}


Gimmer_Core.Fighty._Game_Character_prototype_update = Game_Character.prototype.update;
Game_Character.prototype.update = function(sceneActive){
    Gimmer_Core.Fighty._Game_Character_prototype_update.call(this,sceneActive);
    if(Gimmer_Core.Fighty.Enabled){
        if(this._needsHurtBox){
            if(Gimmer_Core.Fighty.DebugHurtBoxes && '_debugHitBoxWindow' in SceneManager._scene){
                this.getHurtBox().render(SceneManager._scene._debugHitBoxWindow.contents,'#FFFFFF',1);
            }
            this.resolveHitBoxes();
            if(this._selfHitBox){
                let rectangle = this.getHurtBox();
                this._selfHitBox.updatePosition(rectangle.startingX, rectangle.startingY);
            }
        }
        this.updateInvincibility();
    }
}


Gimmer_Core.Fighty._Game_Player_prototype_update = Game_Player.prototype.update;
Game_Player.prototype.update = function(sceneActive){
    Gimmer_Core.Fighty._Game_Player_prototype_update.call(this,sceneActive);
    if(Gimmer_Core.Fighty.Enabled){
        this.updateAttacks();
    }

}

Game_Character.prototype.updateInvincibility = function(){
    if(this._invincibilityCount > 0){
        this._invincibilityCount--;
        if(this._invincibilityCount === 0){
            this.setOpacity(this._originalOpacity);
        }
        else{
            this.setOpacity((this._invincibilityCount % 2 ? this._originalOpacity / 2 : this._originalOpacity));
        }
    }
}

Game_Player.prototype.updateAttacks = function(){
    let buttonIsDoingSomething = (!$gameMap.isEventRunning() && Gimmer_Core.Fighty.UseOkForAttack);
    if(!$gameMap.isEventRunning() && Input.isTriggered(Gimmer_Core.Fighty.AttackButton)  && !this._isAttacking){
        let weapon = this.getActionHero().weapons()[0];
        if(weapon){
            this.resolveAttackAnimation(weapon);
        }
    }
}

Game_Character.prototype.resolveHitBoxes = function(){
    var hitboxes = $gameScreen.enemyHitBoxesAtLocation(this.getHurtBox());
    if(hitboxes.length){
        hitboxes.forEach(function(hitbox){
            this.resolveHitBox(hitbox);
        }, this);
    }
}

Game_Event.prototype.resolveHitBoxes = function(){
    var hitboxes = $gameScreen.allyHitBoxesAtLocation(this.getHurtBox());
    if(hitboxes.length){
        hitboxes.forEach(function(hitbox){
            this.resolveHitBox(hitbox);
        }, this);
    }
}

Game_Player.prototype.resolveHitBox = function(hitbox){
    if(this._invincibilityCount === 0 && !hitbox.engaged){
        hitbox.engaged = this;
        let actor = $gameActors._data[$gameParty._actors[this.characterIndex()]];
        let damage = hitbox.applyDamage(actor);
        if (damage > 0) {
            if(Gimmer_Core.Fighty.FlashDamageForPlayer){
                actor.performMapDamage();
            }
            if(Gimmer_Core.Fighty.PlayerHitSoundEffect){
                AudioManager.playSe(Gimmer_Core.Fighty.PlayerHitSoundEffect)
            }
            else if(Gimmer_Core.Fighty.UseDefaultPlayerDamageSound){
                SoundManager.playActorDamage();
            }

        }
        if(hitbox.pushback > 0){
            for(let i = 0; i < hitbox.pushback; i++){
                this.resolvePushback(hitbox);
            }
        }
        if(hitbox.direction === 'self'){
            hitbox.engaged = false;
        }
        this._invincibilityCount = Gimmer_Core.Fighty.InvincibilityFramesPlayer;
        this._originalOpacity = this.opacity();
    }
}

Gimmer_Core.Fighty._Scene_Map_prototype_updateTransferPlayer = Scene_Map.prototype.updateTransferPlayer;
Scene_Map.prototype.updateTransferPlayer = function(){
    Gimmer_Core.Fighty._Scene_Map_prototype_updateTransferPlayer.call(this);
    if ($gamePlayer.isTransferring()) {
        $gameScreen.clearHitBoxes();
        $gamePlayer._isAttacking = false;
    }
}

Gimmer_Core.Fighty._SceneManager_push = SceneManager.push;
SceneManager.push = function(sceneClass){
    Gimmer_Core.Fighty._SceneManager_push.call(this,sceneClass);
    $gameScreen.clearHitBoxes();
}

Gimmer_Core.Fighty._Game_Event_prototype_update = Game_Event.prototype.update;
Game_Event.prototype.update = function(){
    if(Gimmer_Core.Fighty.Enabled && this._needsHurtBox && this._enemy.hp <= 0){
        this._needsHurtBox = false;
        if(this._selfHitBox){
            this._selfHitBox.finished = true;
        }

        //Sound handling
        let se = false;
        let seTemplate = Gimmer_Core.Fighty.getDefaultEnemyHitSoundEffect();

        let meta = this.getObjectData().meta;
        let enemyMeta = this._enemy.getObjectData().meta;
        let seName = Gimmer_Core.Fighty.getMetaKey([meta,enemyMeta],'DeathSe', Gimmer_Core.Fighty.DefaultEnemyDeathSound);
        if(seName){
            seTemplate.name = seName;
            se = seTemplate;
        }

        if(se){
            AudioManager.playSe(se);
        }

        //Do you die forever? If so die forever.
        if(this._permaDeathKey){
            $gameSelfSwitches.setValue(this._permaDeathKey, true);
        }
        $gameMap.eraseEvent(this._eventId);
        $gamePlayer.getActionHero().gainExp(this._enemy.exp());
        this._enemy = false;
        this._canAttack = false;
        if(Gimmer_Core.FightySmarts){
            this._canAggro = false;
        }
    }
    Gimmer_Core.Fighty._Game_Event_prototype_update.call(this);
    if(this._canAttack && Gimmer_Core.Fighty.Enabled){
        this.updateAttacks();
    }
}

//Allow events to walk into players if they have self hurt boxs, but cannot attack
Gimmer_Core.Fighty._Game_Event_prototype_isCollidedWithPlayerCharacters = Game_Event.prototype.isCollidedWithPlayerCharacters
Game_Event.prototype.isCollidedWithPlayerCharacters = function(x, y) {
    if(this._selfHitBox && !this._canAttack && $gamePlayer._invincibilityCount <= 0){
        return false;
    }
    else{
        return Gimmer_Core.Fighty._Game_Event_prototype_isCollidedWithPlayerCharacters.call(this,x,y);
    }
};

Game_Event.prototype.updateAttacks = function(){
    if(this._enemy && this._pendingAttack && !this._isAttacking){
        this._pendingAttack = false;
        this.resolveAttackAnimation(this._enemy.getObjectData());
    }
}

Game_Event.prototype.getAttackRange = function(){
    let weapon = this._enemy.getObjectData();
    let direction = Gimmer_Core.directionsToWords(this.direction()).capitalize();
    let animationData= ('animation'+direction in weapon.meta ? weapon.meta['animation'+direction] : false);
    if(animationData){
        animationData = animationData.split(",");
        if(animationData.length >= 3){
            return Number(animationData[2]);
        }
    }
    return 0;
}

Game_Character.prototype.resolveAttackAnimation = function(metasource){
    let direction = Gimmer_Core.directionsToWords(this.direction()).capitalize();
    let weapon = metasource;
    let animationData= ('animation'+direction in weapon.meta ? weapon.meta['animation'+direction] : false);
    if(animationData){
        //Structure: animationId|finishedAnimationId,PlayerAnimation, Range ~OR~ animationId|FinishedAnimationId,PlayerAnimation, Range
        animationData = animationData.split(",");
        let animationIds = animationData[0].split("|");
        if(animationIds.length === 3){
            this._attackAnimationId = Number(animationIds[0]);
            this._projectileAnimationId = Number(animationIds[1]);
            this._finishedAnimationId = Number(animationIds[2]);
            this._projectileLastDirection = Gimmer_Core.directionsToWords(this.direction());
        }
        else{
            this._attackAnimationId = Number(animationIds[0]);
            if(animationIds.length > 1){
                this._finishedAnimationId = Number(animationIds[1]);
            }
        }

        //If the first animation for a projectile is false, just shoot the projectile: there's no windup
        if(this._attackAnimationId > 0){
            this.requestAnimation(this._attackAnimationId);
        }
        else if(this._projectileAnimationId > 0){
            this.requestAnimation(this._projectileAnimationId);
        }

        this._isAttacking = animationData[1];
        if(animationData[1] === Gimmer_Core.Fighty.actionTypes[2]){
            this._projectileAttackRange = (animationData.length >= 3 ? Number(animationData[2]) : Math.max(Graphics.boxWidth, Graphics.boxHeight));
        }
        else{
            if(animationData.length >= 3){
                this._regularAttackRange = Number(animationData[2]);
            }
        }
    }
}

Game_Character.prototype.resolvePushback = function(hitbox){
    let victimMoving = this.isMoving();

    let hitboxDirection = hitbox.direction;
    if(hitbox.direction === "self"){
        if(victimMoving){
            hitboxDirection = Gimmer_Core.directionsToWords(this.reverseDir(this.direction()));
        }
        else{
            hitboxDirection = Gimmer_Core.directionsToWords(hitbox.source.direction())
        }
    }
    let d = Gimmer_Core.wordsToDirections(hitboxDirection);
    let flippedGalv = false;
    let oldMove;
    if(this === $gamePlayer && Imported.Galv_PixelMove){
        //Disabled Galv's Pixelmove, as for some reason it thinks the wall is passable
        oldMove = $gamePlayer._normMove;
        $gamePlayer._normMove = true;
        flippedGalv = true;
    }

    switch(hitboxDirection){
        case 'left':
        case 'right':
            if(this.canPass(this._x, this._y, d)){
                this._x = $gameMap.roundXWithDirection(this._x, d);
                if(!victimMoving){
                    this._realX = $gameMap.xWithDirection(this._x, this.reverseDir(d));
                }
            }
            break;
        case 'up':
        case 'down':
            if(this.canPass(this._x, this._y, d)){
                this._y = $gameMap.roundYWithDirection(this._y, d);
                if(!victimMoving){
                    this._realY = $gameMap.yWithDirection(this._y, this.reverseDir(d));
                }
            }
            break;
    }
    if(flippedGalv){
        $gamePlayer._normMove = oldMove;
    }
}

Game_Event.prototype.resolveHitBox = function(hitbox){
    if(this._invincibilityCount === 0 && !hitbox.engaged){
        hitbox.engaged = this;
        let damage = hitbox.applyDamage(this._enemy);
        let meta = this.getObjectData().meta;
        let enemyMeta = this._enemy.getObjectData().meta;
        let seTemplate = Gimmer_Core.Fighty.getDefaultEnemyHitSoundEffect();
        let customSe = false;
        let customSeName = Gimmer_Core.Fighty.getMetaKey([meta,enemyMeta],'DamageSe',false);

        if(customSeName){
            seTemplate.name = customSeName;
            customSe = seTemplate;
        }
        if (damage > 0) {
            if(customSe){
                AudioManager.playSe(customSe);
            }
            else if(Gimmer_Core.Fighty.DefaultEnemyHitSoundEffect){
                AudioManager.playSe(Gimmer_Core.Fighty.DefaultEnemyHitSoundEffect);
            }
            else if(Gimmer_Core.Fighty.UseSystemDefaultEnemyHitSoundEffect){
                AudioManager.playSe(Gimmer_Core.Fighty.getDefaultEnemyHitSoundEffect());
            }
        }

        if(hitbox.pushback > 0){
            for(let i = 0; i < hitbox.pushback; i++){
                this.resolvePushback(hitbox);
            }
        }
        this._invincibilityCount = Gimmer_Core.Fighty.InvincibilityFramesEnemy;
        this._originalOpacity = this.opacity();
    }
}


//Helper function to get the data for the character object that contains meta information
Game_Player.prototype.getObjectData = function(){
    return $dataActors[$gameParty._actors[this.characterIndex()]];
}

//Helper function to get the data for the event object that contains meta information
Game_Event.prototype.getObjectData = function(){
    return $dataMap.events[this._eventId];
}

//General extention to game_character to contain a variety of fighting stuff
Gimmer_Core.Fighty._Game_Character_prototype_initialize = Game_Character.prototype.initialize;
Game_Character.prototype.initialize = function(){
    Gimmer_Core.Fighty._Game_Character_prototype_initialize.call(this);
    this._needsHurtBox = false;
    this._selfHitBox = false;
    this._permaDeathKey = false;
    this._invincibilityCount = 0;
    this._originalOpacity = this.opacity();
    this._hurtBoxModLeft = 0;
    this._hurtBoxModRight = 0;
    this._hurtBoxModTop = 0;
    this._hurtBoxModBottom = 0;

    //attack variables
    this._isAttacking = false;
    this._attackAnimationId = 0;
    this._projectileAnimationId = 0;
    this._finishedAnimationId = 0;
    this._projectileAttackRange = 0;
    this._regularAttackRange = 0;
    this._projectileLastDirection = false;

    this._actionAnimationInUse = false;
    this._attackAnimationFrame = 0;
}

//Blank function for characters that aren't events or players so the code doesn't crash
Game_Character.prototype.getObjectData = function(){
    return {meta:{}};
}

Gimmer_Core.Fighty._Game_Event_prototype_initialize = Game_Event.prototype.initialize;
Game_Event.prototype.initialize = function(mapId, eventId){
    Gimmer_Core.Fighty._Game_Event_prototype_initialize.call(this,mapId, eventId);
    let data = this.getObjectData();
    //This event is something to battle
    this._canAttack = !!('canAttack' in data.meta && data.meta.canAttack);
    this._enemy = false;
    if('isEnemy' in data.meta && data.meta.isEnemy > 0){
        //Rig permadeath
        if(Gimmer_Core.Fighty.PermaDeath || 'permadeath' in data.meta){
            //Already dead;
            this._permaDeathKey = [mapId, eventId, "D"]
            if($gameSelfSwitches.value(this._permaDeathKey)){
                this.erase();
                return;
            }
        }
        //Rig Variables
        this._pendingAttack = false;
        this._needsHurtBox = true;
        this._hurtBoxModLeft = (data && 'modLeft' in data.meta ? parseInt(data.meta.modLeft) : 0);
        this._hurtBoxModRight = (data && 'modRight' in data.meta ? parseInt(data.meta.modRight) : 0);
        this._hurtBoxModTop = (data && 'modTop' in data.meta ? parseInt(data.meta.modTop) : 0);
        this._hurtBoxModBottom = (data && 'modBottom' in data.meta ? parseInt(data.meta.modBottom) : 0);

        this._enemy = new Game_Enemy(data.meta.isEnemy);

        //Reserve action sprites to prevent load in lag
        Gimmer_Core.Fighty.actionTypes.forEach(function(type){
            //Get individual action sprites per fight action
            if('actionSprite'+type in data.meta){
                ImageManager.reserveCharacter(data.meta['actionSprite'+type]);
            }
        });
        //Get global action sprite
        if('actionSprite' in data.meta){
            ImageManager.reserveCharacter(data.meta.actionSprite);
        }

        //Self Hitbox means the npc will hurt players by walking into them, or if walked into, use same dimensions as hurtbox
        if('selfHitbox' in data.meta && data.meta.selfHitbox){
            let rectangle = this.getHurtBox();
            this._selfHitBox = new Hitbox(Gimmer_Core.Fighty.hitboxTypes.EVENT,rectangle,'self',this);
            $gameScreen._enemyHitBoxes.push(this._selfHitBox);
        }
    }
}

Gimmer_Core.Fighty._Game_Player_prototype_initialize = Game_Player.prototype.initialize;
Game_Player.prototype.initialize = function(){
    Gimmer_Core.Fighty._Game_Player_prototype_initialize.call(this);
    //Modify local hurtbox to go around the sprite, instead of being the tile
    let data = this.getObjectData();
    this._needsHurtBox = true;
}


Gimmer_Core.Fighty._Game_Player_prototype_refresh = Game_Player.prototype.refresh;
Game_Player.prototype.refresh = function(){
    Gimmer_Core.Fighty._Game_Player_prototype_refresh.call(this);
    let data = this.getObjectData();
    this._hurtBoxModLeft = (data && 'modLeft' in data.meta ? parseInt(data.meta.modLeft) : 0);
    this._hurtBoxModRight = (data && 'modRight' in data.meta ? parseInt(data.meta.modRight) : 0);
    this._hurtBoxModTop = (data && 'modTop' in data.meta ? parseInt(data.meta.modTop) : 0);
    this._hurtBoxModBottom = (data && 'modBottom' in data.meta ? parseInt(data.meta.modBottom) : 0);
}


//Players can walk into events if they have a self hit box, because they gonna get punished
Game_Player.prototype.isCollidedWithEvents = function(x, y){
    var events = $gameMap.eventsXyNt(x, y);
    return events.some(function(event) {
        return (event.isNormalPriority() && !event._selfHitBox);
    });
}

//Get the area around you that you'll get hurt if a hitbox touches
Game_Character.prototype.getHurtBox = function(){
    let tw = $gameMap.tileWidth();
    let th = $gameMap.tileHeight()
    let x = this.screenX() - (tw / 2);
    let y = this.screenY() - th + this.shiftY();
    return new Polygon('rectangle',x + this._hurtBoxModLeft, y + this._hurtBoxModTop, tw + this._hurtBoxModRight, th + this._hurtBoxModBottom);
}

//Clear hitboxes when you clear the screen
Gimmer_Core.Fighty._Game_Screen_prototype_clear = Game_Screen.prototype.clear;
Game_Screen.prototype.clear = function() {
    Gimmer_Core.Fighty._Game_Screen_prototype_clear.call(this);
    this.clearHitBoxes();
};

//Clear hitboxes
Game_Screen.prototype.clearHitBoxes = function(){
    this._enemyHitBoxes = [];
    this._allyHitBoxes = [];
}

//Update Hitboxes when you update the screen
Gimmer_Core.Fighty._Game_Screen_prototype_update = Game_Screen.prototype.update;
Game_Screen.prototype.update = function(){
    Gimmer_Core.Fighty._Game_Screen_prototype_update.call(this);
    this.updateHitBoxes();
}

//Update hitboxes, removing them if they are done. In Debug mode, this will show the hitboxes
Game_Screen.prototype.updateHitBoxes = function(){
    this._allyHitBoxes.forEach(function(hitbox, k){
        if(hitbox.finished){
            this._allyHitBoxes.splice(k,1);
        }

        if(Gimmer_Core.Fighty.DebugAllyHitboxes && '_debugHitBoxWindow' in SceneManager._scene){
            hitbox.shape.render(SceneManager._scene._debugHitBoxWindow.contents, '#FF0000', 1);
        }

    }, this);


    this._enemyHitBoxes.forEach(function(hitbox, k){
        if(hitbox.finished){
            this._enemyHitBoxes.splice(k,1);
        }
        if(Gimmer_Core.Fighty.DebugEnemyHitboxes && '_debugHitBoxWindow' in SceneManager._scene){
            hitbox.shape.render(SceneManager._scene._debugHitBoxWindow.contents, '#FF0000', 1);
        }
    }, this);
}

//Find hitboxes of the enemies that intersect with the player's hurt box
Game_Screen.prototype.enemyHitBoxesAtLocation = function(playerHurtBox){
    let hittingBoxes = [];
    if(!playerHurtBox){
        return hittingBoxes;
    }
    this._enemyHitBoxes.forEach(function(hitbox){
        if(!hitbox.engaged && hitbox.shape.intersects(playerHurtBox)){
            hittingBoxes.push(hitbox);
        }
    });
    return hittingBoxes;
}

//Find hitboxes of the player / allies that inersect with the enemy's hurtbox
Game_Screen.prototype.allyHitBoxesAtLocation = function(enemyHurtBox){
    let hittingBoxes = [];
    if(!enemyHurtBox){
        return hittingBoxes;
    }
    this._allyHitBoxes.forEach(function(hitbox){
        if(!hitbox.engaged && hitbox.shape.intersects(enemyHurtBox)){
            hittingBoxes.push(hitbox);
        }
    });
    return hittingBoxes;
}

// Extend Game_action to support caching a game object.
// This is done because for some reason, Game_Action takes a "subject" object,
// but then extracts it's id and later uses that to reload the same subject
// Game_Actions are meant for troops, and gets enemy info from a troop, rather than from a game_enemy directly
Gimmer_Core.Fighty._Game_Action_prototype_initialize = Game_Action.prototype.initialize;
Game_Action.prototype.initialize = function(subject, forcing){
    this._cachedSubject = false;
    //cached the subject you were given and return that
    if(!subject.isActor() && subject.index() === -1){
        this._cachedSubject = subject;
    }
    Gimmer_Core.Fighty._Game_Action_prototype_initialize.call(this,subject,forcing);
}

//If you have a cached subject, return that. Don't get it from $gameTroop, because it's not there
Gimmer_Core.Fighty._Game_Action_prototype_subject = Game_Action.prototype.subject;
Game_Action.prototype.subject = function(){
    if(this._cachedSubject){
        return this._cachedSubject;
    }
    else{
        return Gimmer_Core.Fighty._Game_Action_prototype_subject.call(this);
    }
}

//We override the walking animation to animate the character/event attacking. If they are attack, ignore that they are stopped
//Unless they are shooting.
//Todo may need to fix this so it's taking into account he stage of the shot, as the character may not animation holding a weapon
Gimmer_Core.Fighty._Game_CharacterBase_prototype_updatePattern = Game_CharacterBase.prototype.updatePattern;
Game_Character.prototype.updatePattern = function() {
    if(this._isAttacking && this._isAttacking !== Gimmer_Core.Fighty.actionTypes[2]){
        this._stopCount = 0;
    }
    Gimmer_Core.Fighty._Game_CharacterBase_prototype_updatePattern.call(this);
};

//If you are attacking, always update the animation count
Gimmer_Core.Fighty._Game_CharacterBase_prototype_updateAnimationCount = Game_CharacterBase.prototype.updateAnimationCount;
Game_Character.prototype.updateAnimationCount = function(){
    if(this._isAttacking){
        this._animationCount++;
    }
    else{
        Gimmer_Core.Fighty._Game_CharacterBase_prototype_updateAnimationCount.call(this);
    }
}

// When asked for the pattern of the walk, which is a funky calculated form of "which of the three frames of walking am I on"
// If you are attacking, return our own cheeky animation frame.
// This lets's animation sprite pages be made left to right in the frames of animation, instead of the resting frame being in the middle
Gimmer_Core.Fighty._Game_Character_prototype_pattern =  Game_Character.prototype.pattern;
Game_Character.prototype.pattern = function(){
    if(this._isAttacking && this._actionAnimationInUse){
        return this._attackAnimationFrame;
    }
    else{
        return Gimmer_Core.Fighty._Game_Character_prototype_pattern.call(this);
    }
}

//Don't allow animation to go past the max number of frames.
//This prevents a crash in the event that you have three frames of player animation (the default max)
//And more than three frames of an attack animation.
Gimmer_Core.Fighty._Sprite_Character_prototype_characterPatternX =  Sprite_Character.prototype.characterPatternX;
Sprite_Character.prototype.characterPatternX = function(){
    let characterPatternX = Gimmer_Core.Fighty._Sprite_Character_prototype_characterPatternX.call(this);
    characterPatternX = characterPatternX.clamp(0,this.determineMaxPatternX());
    return characterPatternX;
}

//Helper math function to figure out how many frames are in the currently loaded file
//Works with extended animation frames like Shaz_MoreCharacterFrames and probably others
Sprite_Character.prototype.determineMaxPatternX = function (){
    return (this.bitmap.width / this.patternWidth()) -1;
}

//Helper function to get the thing with meta information for the Game_Enemy object
Game_Enemy.prototype.getObjectData = function(){
    return $dataEnemies[this._enemyId]
}

Gimmer_Core.Fighty._Scene_Base_prototype_checkGameover = Scene_Base.prototype.checkGameover;
Scene_Base.prototype.checkGameover = function() {
    if($gameParty.isAllDead() && Gimmer_Core.Fighty.DeathCommonEventId > 0){
        Gimmer_Core.reserveCommonEventWithCallback(Gimmer_Core.Fighty.DeathCommonEventId, function(){
            Gimmer_Core.Fighty._Scene_Base_prototype_checkGameover.call(this);
        })
    }
    else{
        Gimmer_Core.Fighty._Scene_Base_prototype_checkGameover.call(this);
    }
};

Game_Map.prototype.willHitboxHitWall = function(hitbox, width, height, angle){
    if(width === 0 || height === 0){
        return false;
    }
    let shape = hitbox.shape;
    let pretendShape = shape.cloneBase();

    width = width || pretendShape.width;
    height = height || pretendShape.height;
    angle = angle || pretendShape.angle;

    pretendShape.updatePosition(false,false,width,height);
    let minX = false;
    let minY = false;
    let maxX = false;
    let maxY = false;
    pretendShape.points.forEach(function(pointObj){
        let x = pointObj.x;
        let y = pointObj.y;
        if(!minX || x < minX){
            minX = x;
        }
        if(!minY || y < minY){
            minY = y;
        }

        if(!maxY || y > maxY){
            maxY = y;
        }

        if(!maxX || x > maxX){
            maxX = x;
        }


    }, this);

    pretendShape.points = [];
    for(let newX = minX; newX <= maxX; newX++){
        for(let newY = minY; newY <= maxY; newY++){
            pretendShape.points.push({x:newX, y:newY})
        }
    }

    pretendShape.angle = angle;
    pretendShape.rotate();

    let impacts = [];
    //let potentialImpacts = [];
    pretendShape.points.forEach(function(pointObj){
        let x = Math.floor(pointObj.x / this.tileWidth());
        let y = Math.floor(pointObj.y / this.tileHeight());
        //potentialImpacts.push(x+","+y);
        if(!$gameMap.isPassable(x, y, Gimmer_Core.wordsToDirections(hitbox.direction)) && width > 0 && height > 0){
            impacts.push(x+","+y);
        }
    }, this);

    //potentialImpacts = [...new Set(potentialImpacts)];
    impacts = [...new Set(impacts)];

    return impacts.length;
}

//Polygon class to be used inside of hitboxes. Can be created, and then rotated using math
//The math is provided with the disclaimer that it came from the internet rather than my brain
class Polygon {
    constructor(type, startingX, startingY, width, height, angle) {
        this.type = type;
        this.startingX = startingX;
        this.startingY = startingY;
        this.width = width;
        this.height = height;
        this.angle = angle;
        this.updatePosition();
    }

    cloneBase(){
        return new Polygon(this.type, this.startingX, this.startingY, this.width, this.height, 0);
    }

    createPoints(){
        let x = this.startingX;
        let y = this.startingY;
        let width = this.width;
        let height = this.height;
        this.points = [];
        switch(this.type){
            case 'triangle':
                break;
            case 'rectangle':
                //Basic points
                this.points.push({x:x, y:y});
                this.points.push({x:x + width,y:y});
                this.points.push({x:x + width,y:y + height});
                this.points.push({x:x, y: y + height});
                break;
        }
    }

    updatePosition(x,y, width, height, angle){
        x = x || this.startingX;
        y = y || this.startingY;
        width = width || this.width;
        height = height || this.height;
        angle = angle || this.angle;
        this.startingX = x;
        this.startingY = y;
        this.width = width;
        this.height = height;
        this.angle = angle;
        this.pivotPoint = {x:this.startingX, y: this.startingY + (this.height / 2)}
        this.createPoints();
        this.rotate();
    }

    rotate(){
        if(this.angle > 0){
            this.points.forEach(function(point, k){
                this.points[k] = this.rotatePoint(point.x, point.y, this.pivotPoint.x, this.pivotPoint.y, this.angle);
            }, this);
        }
    }

    rotatePoint(pointX, pointY, originX, originY, angle) {
        angle = angle * Math.PI / 180.0;
        return {
            x: Math.cos(angle) * (pointX-originX) - Math.sin(angle) * (pointY-originY) + originX,
            y: Math.sin(angle) * (pointX-originX) + Math.cos(angle) * (pointY-originY) + originY
        };
    }

    //Flat out copied this from stack overflow
    intersects(otherPolygon){
        //this is always the hit box, otherPolygon is the hurt box

        //If the box has no width or height, it can't hit anything
        if(this.width === 0 || this.height === 0){
            return false;
        }

        let a = this.points;
        let b = otherPolygon.points;

        var polygons = [a, b];
        var minA, maxA, projected, i, i1, j, minB, maxB;

        for (i = 0; i < polygons.length; i++) {

            // for each polygon, look at each edge of the polygon, and determine if it separates
            // the two shapes
            var polygon = polygons[i];
            for (i1 = 0; i1 < polygon.length; i1++) {

                // grab 2 vertices to create an edge
                var i2 = (i1 + 1) % polygon.length;
                var p1 = polygon[i1];
                var p2 = polygon[i2];

                // find the line perpendicular to this edge
                var normal = { x: p2.y - p1.y, y: p1.x - p2.x };

                minA = maxA = undefined;
                // for each vertex in the first shape, project it onto the line perpendicular to the edge
                // and keep track of the min and max of these values
                for (j = 0; j < a.length; j++) {
                    projected = normal.x * a[j].x + normal.y * a[j].y;
                    if (Gimmer_Core.isUndefined(minA) || projected < minA) {
                        minA = projected;
                    }
                    if (Gimmer_Core.isUndefined(maxA) || projected > maxA) {
                        maxA = projected;
                    }
                }

                // for each vertex in the second shape, project it onto the line perpendicular to the edge
                // and keep track of the min and max of these values
                minB = maxB = undefined;
                for (j = 0; j < b.length; j++) {
                    projected = normal.x * b[j].x + normal.y * b[j].y;
                    if (Gimmer_Core.isUndefined(minB) || projected < minB) {
                        minB = projected;
                    }
                    if (Gimmer_Core.isUndefined(maxB) || projected > maxB) {
                        maxB = projected;
                    }
                }

                // if there is no overlap between the projects, the edge we are looking at separates the two
                // polygons, and we know there is no overlap
                if (maxA < minB || maxB < minA) {
                    return false;
                }
            }
        }
        return true;
    }

    //Helper function to render the polygon on the page. This is only used in debug mode
    render(bitmap, color, thickness){
        let context = bitmap._context;
        context.save();
        context.strokeStyle = color;
        context.lineWidth = thickness;
        context.beginPath();
        context.moveTo(this.points[0].x, this.points[0].y);

        for (var j = 1; j < this.points.length; j++) {
            context.lineTo(this.points[j].x, this.points[j].y);
        }

        context.lineTo(this.points[0].x, this.points[0].y);
        context.closePath();
        context.stroke();
        context.restore();
        bitmap._setDirty();
    }
}


//Helper class that makes up the hitbox. Handles the appropriate game_action (although can only do basic attacks so far)
class Hitbox {
    constructor(type, shape, direction, source){
        this.type = type;
        this.direction = (direction === "self" ? direction : Gimmer_Core.directionsToWords(direction));
        this.source = source
        this.engaged = false;
        this.finished = false;
        this.shape = shape;
        this.setupPushBack();
    }

    setupPushBack(){
        if(this.type === Gimmer_Core.Fighty.hitboxTypes.PLAYER){
            this.pushback = Number(this.source.getActionHero().weapons()[0].meta['pushback'] || 0);
        }
        else{
            this.pushback = Number(this.source.getActionHero().getObjectData().meta['pushback'] || 0);
        }
    }

    applyDamage(target){
        let action = new Game_Action(this.source.getActionHero());
        action.setAttack();
        action.apply(target);
        return target._result.hpDamage;
    }

    updatePosition(x,y, width, height, angle) {
        this.shape.updatePosition(x, y, width, height, angle);
    }
}