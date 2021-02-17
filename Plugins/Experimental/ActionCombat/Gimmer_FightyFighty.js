if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

Imported = Imported || {};

Gimmer_Core['Fighty'] = {'loaded':true};

//=============================================================================
/*:
 * @plugindesc Support for active battle with hit and hurt boxes on players npc.
 * @author Gimmer
 * @help
 * ================
 * Gimmer_FightyFighty
 * ================
 *
 * tbd
 *
 *
 */

//Todo: Enemies attacking <-- probably number 1
//Todo: Preload enemies attack animations when entering a map

//todo: .. enemy ai? <-- Separate plugin
//Todo: enemy health meters <-- separate plugin to interface with VisualMeters

//todo: reorganize the code so all extensions of classes are grouped together instead of being random
//Todo: button bind for attack button, shouldn't just be "ok"

//Todo: Other skills to attack with? This will take some restructuring, but not necessarily?

//todo: plugin command / note tag level disable attack / hitboxes
//todo: params

//Todo: fix projectile hitbox weirdness with left, up, down


Gimmer_Core.Fighty.HitBoxAnimations = {
    '121': [{width:50, height:25, angle: 0},{width:100, height: 25, angle: 0}],
    '122': [{width:50, height:25, angle: 270},{width:100, height: 25, angle: 270}],
    '123': [{modY: -12.5, width:50, height:25, angle: 180},{width:100, height: 25, angle: 180}],
    '124': [{width:50, height:25, angle: 90},{width:100, height: 25, angle: 90}],
    '125': [
        {modX: 0, modY: 0, width:35, height:10, angle: 225},
        {modX: 25, modY: 0, width:35, height:10, angle: 315},
        {modX: 0, modY: 0, width:35, height:10, angle: 270},
        {modX: 0, modY: 0, width:35, height:10, angle: 257.5},
        {modX: 0, modY: 0, width:35, height:10, angle: 245},
        {modX: 0, modY: 0, width:35, height:10, angle: 230}
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

Gimmer_Core.Fighty.DebugAllyHitboxes = true; //param
Gimmer_Core.Fighty.DebugEnemyHitboxes = true; //param
Gimmer_Core.Fighty.DebugHurtBoxes = true; //param
Gimmer_Core.Fighty.PermaDeath = true; //param
Gimmer_Core.Fighty.CanPassThroughEnemiesWhenHurt = true; //param
Gimmer_Core.Fighty.InvincibilityFrames = 60; //param

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

//DataManager._databaseFiles.push({name:'$dataHitboxes',src:'Hitboxes.json'});
$dataHitboxes = Gimmer_Core.Fighty.HitBoxAnimations;

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
    this._staticAnimation = false;
    if(this._target._character._nextStaticAnimation && this._target._character._nextStaticAnimation.id === this._animation.id){
        this.x = this._target._character._nextStaticAnimation.x;
        this.y = this._target._character._nextStaticAnimation.y;
        this._staticAnimation = true;
        this._target._character._nextStaticAnimation = false;
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
    this._hitbox = new Hitbox(type,new Polygon('rectangle',0,0,0,0, 0),direction, this._target._character, 0);
    $gameScreen._allyHitBoxes.push(this._hitbox);
}

Sprite_Animation.prototype.getShootingStage = function(){
    let stage = -1;
    if(this._target._character._isAttacking === Gimmer_Core.Fighty.actionTypes[2]){
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
    if(this._staticAnimation){
        return;
    }
    let isProjectile = (this.getShootingStage() === 2);
    if(isProjectile){
        if(this._startingX < 0 || this._startingY < 0){
            Gimmer_Core.Fighty._Sprite_Animation_prototype_updatePosition.call(this);
            this._startingX = this.x;
            this._startingY = this.y;
            this._startingDirection = Gimmer_Core.directionsToWords(this._target._character.direction());
        }
    }
    else{
        Gimmer_Core.Fighty._Sprite_Animation_prototype_updatePosition.call(this);
    }
    if(this._hitbox.shape.height > 0 && this._hitbox.shape.width > 0){
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
            let newMapX = hitboxX / $gameMap.tileWidth();
            let newMapY = hitboxY / $gameMap.tileHeight();

            //Disabled Galv's Pixelmove, as for some reason it thinks the wall is passable
            let flippedGalv = false;
            let oldMove;
            if(Imported.Galv_PixelMove) {
                oldMove = $gamePlayer._normMove;
                $gamePlayer._normMove = true;
                flippedGalv = true;
            }

            //If the shooter can't pass something, the projectile can't either, end it
            if(this._target._character.canPass(newMapX, newMapY, Gimmer_Core.wordsToDirections(direction))){
                this.x = hitboxX;
                this.y = hitboxY;
                if(flippedGalv){
                    $gamePlayer._normMove = oldMove;
                }
            }
            else{
                this._canBeForcedToLiveForever = false;
                this._duration = 0;
                if(this._target._character._finishedAnimationId > 0){
                    this._target._character._nextStaticAnimation = {id: this._target._character._finishedAnimationId, x: hitboxX, y:hitboxY}
                    this._target._character.requestAnimation(this._target._character._finishedAnimationId);
                }

                if(flippedGalv){
                    $gamePlayer._normMove = oldMove;
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
            dd(this._lastModX);
            dd(this._lastModY);
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
                if(!this._hitbox.engaged){
                    this._target._character._isAttacking = false; //you missed
                }
            }
        }
        if(this._hitbox.engaged && this._target._character._finishedAnimationId > 0){
            this._hitbox.engaged._nextStaticAnimation = {id:this._target._character._finishedAnimationId, x: this.x, y: this.y};
            this._hitbox.engaged.requestAnimation(this._target._character._finishedAnimationId);
            this._target._character._isAttacking = false;
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
    if(this._isAttacking && this._isAttacking !== Gimmer_Core.Fighty.actionTypes[2]){
        return false;
    }
    else{
        return Gimmer_Core.Fighty._Game_Player_prototype_canMove.call(this);
    }
}

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
            if(this.getShootingStage() === -1 || this.getShootingStage() === 3){
                this._target._character._isAttacking = false;
            }
        }

        if(this.getShootingStage() === 1){// You did the shooting one, now do the projectile
            this._target._character.requestAnimation(this._target._character._projectileAnimationId);
        }

        if(this._oldCharacterName){
            this._target._character.setImage(this._oldCharacterName,this._oldCharacterIndex);
            this._target._character._actionAnimationInUse = false;
        }
    }
}


Gimmer_Core.Fighty._Sprite_Animation_prototype_updateFrame = Sprite_Animation.prototype.updateFrame;
Sprite_Animation.prototype.updateFrame = function(){
    Gimmer_Core.Fighty._Sprite_Animation_prototype_updateFrame.call(this);
    if(this._duration > 0){
        var frameIndex = this.currentFrameIndex();
        if(this._hitbox && this._hitboxFrames[frameIndex]){
            this._hitbox.updatePosition(false, false, this._hitboxFrames[frameIndex].width, this._hitboxFrames[frameIndex].height, this._hitboxFrames[frameIndex].angle )
        }
        if(this._target._character._actionAnimationInUse){
            this._target._character._attackAnimationFrame = frameIndex;
        }
    }
    //Todo: make this delay a parameter of the plugin? The animation? i dunno
    if(this._delay === 0){
        this._delay = 1;
    }
}



//HACK FOR DEBUGGING
Gimmer_Core.Fighty.Scene_Map_prototype_createAllWindows = Scene_Map.prototype.createAllWindows;
Scene_Map.prototype.createAllWindows = function(){
    Gimmer_Core.Fighty.Scene_Map_prototype_createAllWindows.call(this);
    this.addDebugHitBoxWindow();
}

Scene_Map.prototype.addDebugHitBoxWindow = function(){
    this._debugHitBoxWindow = new Window_Plain(-18,-18,Graphics.width,Graphics.height);
    this.addChild(this._debugHitBoxWindow);
}
Gimmer_Core.Fighty._Scene_Map_prototype_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function(){
    this._debugHitBoxWindow.contents.clear();
    Gimmer_Core.Fighty._Scene_Map_prototype_update.call(this);
}


Gimmer_Core.Fighty._Game_Character_prototype_update = Game_Character.prototype.update;
Game_Character.prototype.update = function(sceneActive){
    Gimmer_Core.Fighty._Game_Character_prototype_update.call(this,sceneActive);
    if(this._needsHurtBox){
        if(Gimmer_Core.Fighty.DebugHurtBoxes && '_debugHitBoxWindow' in SceneManager._scene){
            this.getHurtBox().render(SceneManager._scene._debugHitBoxWindow.contents,'#FFFFFF',1);
        }
        this.resolveHitBoxes();
        if('_selfHitBox' in this){
            let rectangle = this.getHurtBox();
            this._selfHitBox.updatePosition(rectangle.startingX, rectangle.startingY);
        }
    }
}


Gimmer_Core.Fighty._Game_Player_prototype_update = Game_Player.prototype.update;
Game_Player.prototype.update = function(sceneActive){
    Gimmer_Core.Fighty._Game_Player_prototype_update.call(this,sceneActive);
    this.updateAttacks();
    this.updateInvincibility();
}

Game_Player.prototype.updateInvincibility = function(){
    //TOdo add somekind of flash effect;
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
    if(Input.isTriggered('ok')  && !this._isAttacking){
        let direction = Gimmer_Core.directionsToWords(this.direction()).capitalize();
        let weapon = this.getActionHero().weapons()[0];
        let animationData= ('animation'+direction in weapon.meta ? weapon.meta['animation'+direction] : false);
        if(animationData){
            //Structure: animationId|finishedAnimationId,PlayerAnimation, Range ~OR~ animationId|FinishedAnimationId,PlayerAnimation
            animationData = animationData.split(",");
            let animationIds = animationData[0].split("|");
            if(animationIds.length === 3){
                this._attackAnimationId = Number(animationIds[0]);
                this._projectileAnimationId = Number(animationIds[1]);
                this._finishedAnimationId = Number(animationIds[2]);

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
        }
    }
}

//Todo: fix to evaluate the first hitbox at location based on some kind of timestamp of creation time
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
            actor.performMapDamage();
        }
        if(hitbox.pushback > 0){
            for(let i = 0; i < hitbox.pushback; i++){
                this.resolvePushback(hitbox);
            }
        }
        if(hitbox.direction === 'self'){
            hitbox.engaged = false;
        }
        this._invincibilityCount = Gimmer_Core.Fighty.InvincibilityFrames;
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

Gimmer_Core.Fighty._Game_Event_prototype_update = Game_Event.prototype.update;
Game_Event.prototype.update = function(){
    if(this._needsHurtBox && this._enemy.hp <= 0){
        this._needsHurtBox = false;
        if('_selfHitBox' in this){
            this._selfHitBox.finished = true;
        }
        if(this._permaDeathKey){
            $gameSelfSwitches.setValue(this._permaDeathKey, true);
        }
        $gameMap.eraseEvent(this._eventId); //temp death, will respawn on next page load.
        $gamePlayer.getActionHero().gainExp(this._enemy.exp());

    }
    Gimmer_Core.Fighty._Game_Event_prototype_update.call(this);
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
}

Game_Event.prototype.resolveHitBox = function(hitbox){
    if(!hitbox.engaged){
        hitbox.engaged = this;
        let damage = hitbox.applyDamage(this._enemy);
        if (damage > 0) {
            //Todo animation for getting hurt
            SoundManager.playActorDamage();
        }

        if(hitbox.pushback > 0){
            for(let i = 0; i < hitbox.pushback; i++){
                this.resolvePushback(hitbox);
            }
        }
    }
}


//Helper function to get the get based on which game character you are
Game_Player.prototype.getObjectData = function(){
    return $dataActors[$gameParty._actors[this.characterIndex()]];
}

Game_Event.prototype.getObjectData = function(){
    return $dataMap.events[this._eventId];
}

Gimmer_Core.Fighty._Game_Character_prototype_initialize = Game_Character.prototype.initialize;
Game_Character.prototype.initialize = function(){
    Gimmer_Core.Fighty._Game_Character_prototype_initialize.call(this);
    this._needsHurtBox = false;
    this._permaDeathKey = false;
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

    this._actionAnimationInUse = false;
    this._attackAnimationFrame = 0;

    this._nextStaticAnimation = false;

}

Gimmer_Core.Fighty._Game_Event_prototype_initialize = Game_Event.prototype.initialize;
Game_Event.prototype.initialize = function(mapId, eventId){
    Gimmer_Core.Fighty._Game_Event_prototype_initialize.call(this,mapId, eventId);
    let data = this.getObjectData();
    //This event is something to battle
    if('isEnemy' in data.meta && data.meta.isEnemy){
        if(Gimmer_Core.Fighty.PermaDeath || 'permadeath' in data.meta){
            //Already dead;
            this._permaDeathKey = [mapId, eventId, "D"]
            if($gameSelfSwitches.value(this._permaDeathKey)){
                this.erase();
                return;
            }
        }

        this._needsHurtBox = true;
        this._enemy = new Game_Enemy(data.meta.isEnemy);

        //Modify local hurtbox to go around the sprite, instead of being the tile
        this._hurtBoxModLeft = ('modLeft' in data.meta ? parseInt(data.meta.modLeft) : 0);
        this._hurtBoxModRight = ('modRight' in data.meta ? parseInt(data.meta.modRight) : 0);
        this._hurtBoxModTop = ('modTop' in data.meta ? parseInt(data.meta.modTop) : 0);
        this._hurtBoxModBottom = ('modBottom' in data.meta ? parseInt(data.meta.modBottom) : 0);

        //Self Hitbox means the npc will hurt players by walking into them, or if walked into, use same dimensions as hurtbox
        if('selfHitbox' in data.meta && data.meta.selfHitbox){
            let rectangle = this.getHurtBox();
            this._selfHitBox = new Hitbox(Gimmer_Core.Fighty.hitboxTypes.EVENT,rectangle,'self',this);
            $gameScreen._enemyHitBoxes.push(this._selfHitBox);
        }
    }
}

Gimmer_Core.Fighty._Game_Player_prototype_refresh = Game_Player.prototype.refresh;
Game_Player.prototype.refresh = function(){
    Gimmer_Core.Fighty._Game_Player_prototype_refresh.call(this);
    let actor = this.getObjectData();
    this._hurtBoxModLeft = ('modLeft' in actor.meta ? parseInt(actor.meta.modLeft) : 0);
    this._hurtBoxModRight = ('modRight' in actor.meta ? parseInt(actor.meta.modRight) : 0);
    this._hurtBoxModTop = ('modTop' in actor.meta ? parseInt(actor.meta.modTop) : 0);
    this._hurtBoxModBottom = ('modBottom' in actor.meta ? parseInt(actor.meta.modBottom) : 0);
}

Gimmer_Core.Fighty._Game_Player_prototype_initialize = Game_Player.prototype.initialize;
Game_Player.prototype.initialize = function(){
    Gimmer_Core.Fighty._Game_Player_prototype_initialize.call(this);
    this._needsHurtBox = true;
    this._invincibilityCount = 0;
}

Game_Player.prototype.isCollidedWithEvents = function(x, y){
    let isCollided = Game_Character.prototype.isCollidedWithEvents.call(this,x,y)
    if(!isCollided && this._invincibilityCount > 0 && !Gimmer_Core.Fighty.CanPassThroughEnemiesWhenHurt){
        //If you can pass, check to see if there is a "through" event in the spot that has a hurtBox
        let events = $gameMap.eventsXy(x,y);
        isCollided = events.some(function(event){
            return ('_selfHitBox' in event);
        });
    }
    return isCollided;
}

Game_Character.prototype.getHurtBox = function(){
    let tw = $gameMap.tileWidth();
    let th = $gameMap.tileHeight()
    let x = this.screenX() - (tw / 2);
    let y = this.screenY() - th + this.shiftY();
    return new Polygon('rectangle',x + this._hurtBoxModLeft, y + this._hurtBoxModTop, tw + this._hurtBoxModRight, th + this._hurtBoxModBottom);
}

Gimmer_Core.Fighty._Game_Screen_prototype_clear = Game_Screen.prototype.clear;
Game_Screen.prototype.clear = function() {
    Gimmer_Core.Fighty._Game_Screen_prototype_clear.call(this);
    this.clearHitBoxes();
};

Game_Screen.prototype.clearHitBoxes = function(){
    this._enemyHitBoxes = [];
    this._allyHitBoxes = [];
}

Gimmer_Core.Fighty._Game_Screen_prototype_update = Game_Screen.prototype.update;
Game_Screen.prototype.update = function(){
    Gimmer_Core.Fighty._Game_Screen_prototype_update.call(this);
    this.updateHitBoxes();
}

Game_Screen.prototype.updateHitBoxes = function(){
    this._allyHitBoxes.forEach(function(hitbox, k){
        if(hitbox.finished){
            delete this._allyHitBoxes[k];
        }
        if(Gimmer_Core.Fighty.DebugAllyHitboxes && '_debugHitBoxWindow' in SceneManager._scene){
            hitbox.shape.render(SceneManager._scene._debugHitBoxWindow.contents, '#FF0000', 1);
        }
    }, this);


    this._enemyHitBoxes.forEach(function(hitbox, k){
        if(hitbox.finished){
            delete this._enemyHitBoxes[k];
        }
        if(Gimmer_Core.Fighty.DebugEnemyHitboxes && '_debugHitBoxWindow' in SceneManager._scene){
            hitbox.shape.render(SceneManager._scene._debugHitBoxWindow.contents, '#FF0000', 1);
        }
    }, this);
}


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

//Extend Game_action
Gimmer_Core.Fighty._Game_Action_prototype_initialize = Game_Action.prototype.initialize;
Game_Action.prototype.initialize = function(subject, forcing){
    this._cachedSubject = false;
    //cached the subject you were given and return that
    if(!subject.isActor() && subject.index() === -1){
        this._cachedSubject = subject;
    }
    Gimmer_Core.Fighty._Game_Action_prototype_initialize.call(this,subject,forcing);
}

Gimmer_Core.Fighty._Game_Action_prototype_subject = Game_Action.prototype.subject;
Game_Action.prototype.subject = function(){
    //If you have a cached subject, return that. Don't get it from $gameTroop, because it's not there
    if(this._cachedSubject){
        return this._cachedSubject;
    }
    else{
        return Gimmer_Core.Fighty._Game_Action_prototype_subject.call(this);
    }
}

//Animations
Gimmer_Core.Fighty._Game_CharacterBase_prototype_updatePattern = Game_CharacterBase.prototype.updatePattern;
Game_Character.prototype.updatePattern = function() {
    if(this._isAttacking && this._isAttacking !== Gimmer_Core.Fighty.actionTypes[2]){
        this._stopCount = 0;
    }
    Gimmer_Core.Fighty._Game_CharacterBase_prototype_updatePattern.call(this);
};

Gimmer_Core.Fighty._Game_CharacterBase_prototype_updateAnimationCount = Game_CharacterBase.prototype.updateAnimationCount;
Game_Character.prototype.updateAnimationCount = function(){
    if(this._isAttacking){
        this._animationCount++;
    }
    else{
        Gimmer_Core.Fighty._Game_CharacterBase_prototype_updateAnimationCount.call(this);
    }
}

Gimmer_Core.Fighty._Game_Character_prototype_pattern =  Game_Character.prototype.pattern;
Game_Character.prototype.pattern = function(){
    if(this._isAttacking && this._actionAnimationInUse){
        return this._attackAnimationFrame;
    }
    else{
        return Gimmer_Core.Fighty._Game_Character_prototype_pattern.call(this);
    }
}

Gimmer_Core.Fighty._Sprite_Character_prototype_characterPatternX =  Sprite_Character.prototype.characterPatternX;
Sprite_Character.prototype.characterPatternX = function(){
    let characterPatternX = Gimmer_Core.Fighty._Sprite_Character_prototype_characterPatternX.call(this);
    characterPatternX = characterPatternX.clamp(0,this.determineMaxPatternX());
    return characterPatternX;
}

Sprite_Character.prototype.determineMaxPatternX = function (){
    return (this.bitmap.width / this.patternWidth()) -1;
}

Game_Enemy.prototype.getObjectData = function(){
    return $dataEnemies[this._enemyId]
}

//Gimmer_Core.Fighty._Game_CharacterBase_prototype_updateAnimation = Game_CharacterBase.prototype.updateAnimation;
//Prevent animations if the character is attacking
/*Game_Player.prototype.updateAnimation = function() {
    if(this._isAttacking){

    }
    else{
        Game_CharacterBase.prototype.updateAnimation.call(this);
    }
};*/


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