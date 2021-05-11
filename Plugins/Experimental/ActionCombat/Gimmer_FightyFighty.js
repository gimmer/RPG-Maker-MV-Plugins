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
 * This plugin attempts to use as many in engine systems as possible to enable action combat on the map.
 * This is done by tying hurtboxes to players and events (to represent what parts of them are hurt when touched)
 * And hitboxes to weapon animations / enemies themselves (to represent the things that hurt the player or the enemies).
 *
 * This mod assumes one player only!
 * This mod assumes 4 way atack only! (Other modes can be used to move around in 8 directions, but attacks only work four way for now)
 *
 * Setup:
 * 1) Enable the mod (enable the debug flags to be able to see hitboxes and hurt boxes)
 *
 * 2) The hurt box for a player will default to one tile. Tweak the hurtbox of the player by adding the following tags:
 * <modLeft:x>
 * <modRight:x>
 * <modTop:x>
 * <modBottom:x>
 * Where x is positive or negative modifiers.
 * This lets you wrap the hurt box of the player to better fit his / her animation
 *
 * 3) Choose a weapon for the player
 *
 * 4) Add to that weapon the following tags:
 * <animationRight:animationData,AttackType>
 * <animation[Up|Down|Left]:animationData,AttackType>
 * <pushback:x>
 * <impactSe:seName>
 *
 * animation[Right|Left|Up|Down] controls what animation plays when an attack is done in that direction.
 * Parameters:
 * - AttackType:
 * -- Can either be "Shoot", "Stab", or "Slash". This is used to control what player animation to play during the attack
 * (more on that later)
 *
 * - animationData: There are a few formats you can put in:
 * -- attackAnimationId
 * -- attackAnimationId|finishedAnimationId
 * -- attackAnimationId|projectileAnimationId|finishedAnimationId (only works if attack type is Shoot)
 *
 * In each case, an animationId is the numerical id from the database of the animation to play.
 *
 * attackAnimationId is the animation for the attack itself
 * finishedAnimationId is the animation to play if there is an impact with an enemy
 *
 * projectileAnimationId is the animation that plays to represent a shooting projectile.
 *
 * - pushback
 * -- number of squares for an attack to push back on successful damage.
 *
 * - impactSe
 * -- optional impact sound to make if the weapon hits not an enemy. Just put the name of the se file without the extension
 *
 * ===
 * Note: Projectiles
 * ===
 * Projectiles have three stages of animation so that the first can be used to animate the weapon firing
 * The second is the animation of the projectile flying
 * and the third is the impact (explosions, yay!)
 * If you don't WANT to animate the weapon, just make the first animationId -1, the projectile will just fire.
 *
 * 5) Create Hit Boxes for the animation frames (also known as "The Hard Part")
 * Included with the plugin is an example Hitboxes.json file.
 * This is a database of the hitbox frames that play along side any animations
 * The basic form looks like this:
 *
 *   [
 *      {"121": [
 *          {modX: 0, modY: 0, width:50, height:25, angle: 0},
 *          {modX: 0, modY: 0, width:100, height:0, angle: 0}
 *      ]}
 *  ]
 *
 *  This shows for animationId 121, there are two hitboxes. One in frame 1, and one in frame 2.
 *  If the animation is any number of frames more than 2, the most recently drawn hitbox will stay valid until the animation finishes
 *  All hitboxes are rectangles going to the right of the player/event by default.
 *  You use the variables to manipulate their height, width, angle, and position on screen
 *  Parameters:
 * - modX: a positive or negative number showing how much to move the rectangle left or right for that frame
 * - modY: a positive or negative number showing how much to move the rectangle up or down/
 * - width: how wide is the hitbox
 * - height: how high is the hitbox
 * - angle: how much to rotate the hitbox (0 through 359, going clockwise with 0 meaning "straight to the right")
 *
 * With the debug parameter on you can see each frame of the hitbox animated as the animation plays.
 * You will need to test these a great deal to get them right with your animations.
 *
 * ===
 * For Projectiles:
 * ===
 * Projectile hitboxes are different, because they move the animation along with them.
 * See the example:
 *
 * [
 *  {'126': [
 *       {
 *           modXright: -6.5, modYright: -12.5,
 *           modXleft: -15, modYleft: -12.5,
 *           modXup: -12, modYup: -16,
 *           modXdown: -12, modYdown: -10,
 *           width: 25, height: 25, angle: 0, moveSpeed: 6
 *       },
 *          {width: 25, height: 25, angle: 0, moveSpeed: 6}
 *       ]}
 *  ]
 *
 * Additional Parameters:
 * - modX[right|left|up|down]: how much to tweak the x value of the hitbox when it was fired to the right|left|up|down.
 * - modY[right|left|up|down]: how much to tweak the y value of the hitbox when it was fired to the right|left|up|down.
 * - moveSpeed: needed for every frame of the animation: how many pixels to move per frame.
 *   If you want it to move less consistently, you can omit this from some of the frames
 *
 * 7) (optional) Add action sprites to the character
 *
 * Action sprites are set by adding the following tags to the actor's note page:
 * <actionSprite:characterName>
 * <actionSprite[Swing|Shoot|Stab]:characterName>
 * The sheets are stored in the img/characters folder and follow the same dimensions as the walking sprites:
 * Down, left, right, up
 * With three attack frames in each.
 * These frames will be played left to right during an attack.
 * If your attack animation has more than three frames, the third frame from the sprite will persist until the animation is over
 * ===
 * Note: You can use plugins that increase the number of walking frames for actionSprites instead.
 *      Just make sure to remember they are read left to right
 * ===
 * if you define actionSprite on it's on, that will be the action sprite used for all attacks
 * You can override this for individual attack types using actionSpriteShoot, actionSpriteStab, and actionSpriteSlash
 * respectively.
 *
 * 8) Add something to fight
 *
 * Create an event with the following properties in the note tag:
 *
 * ===
 * Note: Yes the note field is really small for events, but it still works
 * ===
 *
 * <isEnemy:x>
 * - This tag will make that event have a hurt box and have all the hp and attack power of enemy with enemyId x
 *
 * You can also modify the hurt box in the same way you could with the player:
 * <modLeft:x>
 * <modRight:x>
 * <modTop:x>
 * <modBottom:x>
 *
 * This enemy can now be attacked and killed.
 *
 * Optionally:
 * Add the tag <deathSe:seName> to the event OR the enemy customize what this thing sounds like when it dies.
 *
 * 9) Make the enemy able to hurt you
 *
 * Add the tag:
 * <selfHurtBox> to the event
 *
 * Add the tag:
 * <pushback:x> to the enemy associated with the event to add pushback to the selfHurtBox attack
 *
 * This will make the enemy's hurt box become a hitbox as well, and if the enemy bumps into you, you'll get hurt
 *
 * 10) Make the enemy able to hurt you more
 *
 * Add the tag:
 * <canAttack> to the event. This means the enemy will be able to process incoming attack requests and do them.
 *
 * Add the following tags to the enemy:
 * <animation[Right|Up|Down|Left]:animationData,AttackType>
 * These tags work the same way as the player.
 *
 * ===
 * Note: The enemy can be made via the event page script command: this.character()._pendingAttack = true;
 * This is not an ideal thing to do, unless you want via scripted enemies.
 * See the optional AI plugin for help
 * ===
 *
 * Cascading Parameters:
 *
 * Some parameters (deathSe, impactSe) can be set on both the event AND the enemy notes.
 * In all cases, the order of priority is:
 * 1) Event
 * 2) Enemy
 * 3) Custom Default from Parameters
 * 4) System Default (if enabled)
 *
 *
 * @param ---Parameters---
 * @default
 *
 * @param ---Debug Parameters---
 * @parent ---Parameters---
 *
 * @param Debug Player Hitboxes
 * @parent ---Debug Parameters---
 * @type Boolean
 * @desc Show Player attack hitboxes on the screen
 * Default False
 * @default false
 *
 * @param Debug Hurtboxes
 * @parent ---Debug Parameters---
 * @type Boolean
 * @desc Show hurtboxes around players and enemies
 * Default False
 * @default false
 *
 *
 * @param Debug Enemy Hitboxes
 * @parent ---Debug Parameters---
 * @type Boolean
 * @desc Show enemy attack hitboxes on the screen
 * Default False
 * @default false
 *
 * @param Use Ok For Attack
 * @parent ---Parameters---
 * @type boolean
 * @desc Use the same button for ok as for attack? If false, you need to bind a specific keyboard button to attack
 * Default true
 * @default true
 *
 * @param Button Id for Attack
 * @parent ---Parameters---
 * @type Number
 * @desc If not using Ok for attack, choose the id of the button you want to use for an attack. See https://keycode.info/ to find button ids
 *
 *
 * @param Enable Permadeath
 * @parent ---Parameters---
 * @type boolean
 * @desc Should enemies die forever? Set to false and enemies will repawn when maps reload.
 * Default true
 * @default true
 *
 * @param Player Invincibility Frames
 * @parent ---Parameters---
 * @type Number
 * @desc How many frames should a player be invincible for after being hit? (assume 60 frames per second)
 * Default 60
 * @default 60
 *
 * @param Enemy Invincibility Frames
 * @parent ---Parameters---
 * @type Number
 * @desc How many frames should an enemy be invincible for after being hit? (assume 60 frames per second)
 * Default 60
 * @default 60
 *
 * @param Flash Damage For Player
 * @parent ---Parameters---
 * @type boolean
 * @desc Should the "Perform map damage flash" occur when the player is hit?
 * Default true
 * @default true
 *
 * @param Death Common Event
 * @parent ---Parameters---
 * @type common_event
 * @desc What common event should run on player death? The map will keep running, so this event will need to cover anything you want to happen
 *
 * @param ---Sound Parameters---
 * @parent ---Parameters---
 *
 * @param Use Default Player Damage Sound
 * @parent ---Sound Parameters---
 * @type boolean
 * @desc Play the sound associated with "Actor Damage" when the player is hit? Set this to false to have no sound play
 * Default true
 * @default true
 *
 * @param Custom Player Damage Sound Effect
 * @parent ---Sound Parameters---
 * @type struct<se>
 * @desc Custom sound to play on player being damaged. Overwrites the default one, even if that's set to true
 *
 * @param Use System Default Enemy Damage Sound
 * @parent ---Sound Parameters---
 * @type boolean
 * @desc Play the sound associated with "Enemy Damage" when enemies are hit? Will be overwritten by customer SEs set in the parameters, or the meta tags for an event or enemy
 * Default true
 * @default true
 *
 * @param Custom Default Enemy Damage Sound Effect
 * @parent ---Sound Parameters---
 * @type struct<se>
 * @desc Custom sound to play on enemies being damaged. Can be overwritten on the event, and enemy note pages with the tag <damageSe:NAME_OF_SE>
 *
 * @param Use System Default Enemy Death Sound
 * @parent ---Sound Parameters---
 * @type boolean
 * @desc Play the sound associated with "Enemy Collapse" when enemies die? Will be overwritten by custom SEs set in the parameters, or the meta tags for an event or enemy
 * Default true
 * @default true
 *
 * @param Custom Default Enemy Death Sound Effect
 * @parent ---Sound Parameters---
 * @type struct<se>
 * @desc Custom sound to play on enemies dying. Can be overwritten on the event and enemy note pages with the tag <deathSe:NAME_OF_SE>
 *
 * @param Use System Default Impact Sound Effect
 * @parent ---Sound Parameters---
 * @type boolean
 * @desc Play the sound associated with "Magic Reflection" when attacks hit walls? Set <impactSe:NAME_OF_SE> in the weapon note, or event / enemy note tag to control individual impact sounds
 * Default true
 * @default true
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

//Movement
//todo: allow movement during attacks, just not directional change.

//Other plugins
//Todo: Other skills to attack with? This will take some restructuring, but not necessarily? <-- separate plugin

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
Gimmer_Core.Fighty.DebugAllyHitboxes = (FightyParams['Debug Player Hitboxes'] === "true");
Gimmer_Core.Fighty.DebugEnemyHitboxes = (FightyParams['Debug Enemy Hitboxes'] === "true");
Gimmer_Core.Fighty.DebugHurtBoxes = (FightyParams['Debug Hurtboxes'] === "true");

//Master Switch
Gimmer_Core.Fighty.Enabled = true;

//Params
Gimmer_Core.Fighty.PermaDeath = (FightyParams['Enable Permadeath'] === "true");
Gimmer_Core.Fighty.InvincibilityFramesPlayer = Number(FightyParams['Player Invincibility Frames'] || 60);
Gimmer_Core.Fighty.InvincibilityFramesEnemy = Number(FightyParams['Enemy Invincibility Frames'] || 60);
Gimmer_Core.Fighty.FlashDamageForPlayer = (FightyParams['Flash Damage For Player'] === "true");
Gimmer_Core.Fighty.DeathCommonEventId = Number(FightyParams['Death Common Event'] || 0);
Gimmer_Core.Fighty.UseOkForAttack = (FightyParams['Use Ok For Attack'] === "true");
if(Gimmer_Core.Fighty.UseOkForAttack){
    Gimmer_Core.Fighty.AttackButton = 'ok';
}
else{
    Gimmer_Core.Fighty.AttackButton = 'attack';
    Input.keyMapper[Number(FightyParams['Button Id for Attack'])] = 'attack';
}


//Sounds
Gimmer_Core.Fighty.UseDefaultPlayerDamageSound = (FightyParams['Use Default Player Damage Sound'] === "true");
Gimmer_Core.Fighty.PlayerHitSoundEffect = (FightyParams['Custom Player Damage Sound Effect'].length ? JSON.parse(FightyParams['Custom Player Damage Sound Effect']) : false);
Gimmer_Core.Fighty.UseSystemDefaultEnemyHitSoundEffect = (FightyParams['Use System Default Enemy Damage Sound'] === "true");
Gimmer_Core.Fighty.DefaultEnemyHitSoundEffect = (FightyParams['Custom Default Enemy Damage Sound Effect'].length ? JSON.parse(FightyParams['Custom Default Enemy Damage Sound Effect']) : false);
Gimmer_Core.Fighty.UseSystemDefaultEnemyDeathSoundEffect = (FightyParams['Use System Default Enemy Death Sound'] === "true");
Gimmer_Core.Fighty.DefaultEnemyDeathSound = (FightyParams['Custom Default Enemy Death Sound Effect'].length ? JSON.parse(FightyParams['Custom Default Enemy Death Sound Effect']) : false);
Gimmer_Core.Fighty.UseDefaultImpactSoundEffect = (FightyParams['Use System Default Impact Sound Effect'] === "true");

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

DataManager._databaseFiles.push({name:'$dataHitboxes',src:'Hitboxes.json'});
//$dataHitboxes = Gimmer_Core.Fighty.HitBoxAnimations;

//Helper Functions
Gimmer_Core.Fighty.getDefaultEnemyHitSoundEffect = function(){
    //playEnemyDamage
    return $dataSystem.sounds[10];
}

Gimmer_Core.Fighty.getSystemDefaultEnemyDeathSoundEffect = function(){
    //playEnemyDamage
    return $dataSystem.sounds[11];
}


Gimmer_Core.Fighty.getDefaultPlayerHitSoundEffect = function(){
    //playActorDamage
    return $dataSystem.sounds[14];
}

Gimmer_Core.Fighty.getDefaultImpactSoundEffect = function(){
    //playReflection
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


//Extend Scene Boot
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

//SPRITE ANIMATION AREA

//Extend Sprite Animation to hold a lot more stuff, potentially be static, have hitboxes, trigger character animation frames, etc.
Gimmer_Core.Fighty._Sprite_Animation_prototype_setup = Sprite_Animation.prototype.setup;
Sprite_Animation.prototype.setup = function(target, animation, mirror, delay) {
    Gimmer_Core.Fighty._Sprite_Animation_prototype_setup.call(this,target,animation,mirror,delay);
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
        if(newCharacterName && this.getShootingStage() < 2 && !this._target._character._actionAnimationInUse){
            this._target._character._oldCharacterName = this._target._character.characterName();
            this._target._character._oldCharacterIndex = this._target._character.characterIndex();
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
    else {
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
            let newMapX = Math.floor($gameMap.canvasToMapX(hitboxX));
            let newMapY = Math.floor($gameMap.canvasToMapY(hitboxY));

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

        if(this._target._character._oldCharacterName){
            this._target._character.setImage(this._target._character._oldCharacterName,this._target._character._oldCharacterIndex);
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
        //If by chance the enemy has died during this, the object might be gone
        if(this._target._character._enemy){
            let meta = this._target._character.getObjectData().meta;
            let enemyMeta = this._target._character._enemy.getObjectData().meta;
            seName = Gimmer_Core.Fighty.getMetaKey([meta,enemyMeta],'impactSe', seName);
        }

    }
    else{
        let meta = this._target._character.getActionHero().weapons()[0].meta;
        seName = Gimmer_Core.Fighty.getMetaKey([meta],'impactSe',seName);
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


//GAME PLAYER AREA
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
    return $gameParty.leader();
}

Game_Event.prototype.getActionHero = function(){
    return this._enemy || new Game_Enemy();
}

//SCENE MAP AREA
Gimmer_Core.Fighty.Scene_Map_prototype_createAllWindows = Scene_Map.prototype.createAllWindows;
Scene_Map.prototype.createAllWindows = function(){
    Gimmer_Core.Fighty.Scene_Map_prototype_createAllWindows.call(this);
    if(Gimmer_Core.Fighty.DebugAllyHitboxes || Gimmer_Core.Fighty.DebugEnemyHitboxes || Gimmer_Core.Fighty.DebugHurtBoxes){
        this.addDebugHitBoxWindow();
    }
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
    if(!$gameMap.isEventRunning() && Input.isTriggered(Gimmer_Core.Fighty.AttackButton) && $gameMap.hasEnemies() && !this._isAttacking){
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
        let actor = this.getActionHero();
        let damage = hitbox.applyDamage(actor);
        if($gameParty.isAllDead()){
            Gimmer_Core.Fighty.Enabled = false;
        }
        else{
            if (damage > 0) {
                // Shake the screen when you get hit
                Shaker.shake(2.6, 1, 30);
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
            if(hitbox.direction === 'self' && Gimmer_Core.FightySmarts === undefined){
                hitbox.engaged = false;
            }
            this._invincibilityCount = Gimmer_Core.Fighty.InvincibilityFramesPlayer;
            this._originalOpacity = this.opacity();
        }
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
        let seTemplate = Gimmer_Core.Fighty.getSystemDefaultEnemyDeathSoundEffect();
        let meta = this.getObjectData().meta;
        let enemyMeta = this._enemy.getObjectData().meta;
        let customSeName = Gimmer_Core.Fighty.getMetaKey([meta,enemyMeta],'deathSe', false);
        if(customSeName){
            seTemplate.name = customSeName;
            se = seTemplate;
        }

        if(!se && Gimmer_Core.Fighty.DefaultEnemyDeathSound){
            se = Gimmer_Core.Fighty.DefaultEnemyDeathSound;
        }

        if(!se && Gimmer_Core.Fighty.UseSystemDefaultEnemyDeathSoundEffect){
            se = seTemplate;
        }

        if(se){
            AudioManager.playSe(se);
        }

        //Do you die forever? If so die forever.
        if(this._permaDeathKey){
            $gameSelfSwitches.setValue(this._permaDeathKey, true);
        }

        //Is there a death common event? Play it and then do the death stuff. Otherwise do the death stuff now
        let deathCommonEvent = Gimmer_Core.Fighty.getMetaKey([meta,enemyMeta],'deathCommonEvent', false);
        this._canAttack = false;
        this._locked = true;
        if(Gimmer_Core.FightySmarts){
            this._canAggro = false;
        }
        if(deathCommonEvent > 0){
            let that = this;
            Gimmer_Core.reserveCommonEventWithCallback(deathCommonEvent, function(){
                $gameMap.eraseEvent(that._eventId);
                $gamePlayer.getActionHero().gainExp(that._enemy.exp());
                that._enemy = false;
            });
        }
        else{
            $gameMap.eraseEvent(this._eventId);
            $gamePlayer.getActionHero().gainExp(this._enemy.exp());
            this._enemy = false;
        }
    }
    Gimmer_Core.Fighty._Game_Event_prototype_update.call(this);
    if(Gimmer_Core.Fighty.Enabled){
        if(this._canAttack){
            this.updateAttacks();
        }
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
    let victimDirection = Gimmer_Core.directionsToWords(this.direction());
    let attackerMoving = hitbox.source.isMoving();

    let hitboxDirection = hitbox.direction;
    if(hitbox.direction === "self"){
        if(victimMoving && !attackerMoving){
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

    let origMoveSpeed = this.moveSpeed();
    let pushMoveSpeed = 6;
    let list = [];

    for(let i=0; i < hitbox.pushback; i++){
        switch(hitboxDirection){
            case 'left':
            case 'right':
                if(this.canPass(this._x, this._y, d)){
                    let move = (hitboxDirection === "left" ? Game_Character.ROUTE_MOVE_LEFT : Game_Character.ROUTE_MOVE_RIGHT);
                    list.push({code:35});
                    list.push({code:29, parameters:[pushMoveSpeed]});
                    list.push({code:move,indent:null});
                    list.push({code:29,parameters: [origMoveSpeed]});
                    list.push({code:36});
                    list.push({code:0});
                }

                break;
            case 'up':
            case 'down':
                if(this.canPass(this._x, this._y, d)){
                    let move = (hitboxDirection === "up" ? Game_Character.ROUTE_MOVE_UP : Game_Character.ROUTE_MOVE_DOWN);
                    list.push({code:35});
                    list.push({code:29, parameters:[pushMoveSpeed]});
                    list.push({code:move,indent:null});
                    list.push({code:29,parameters: [origMoveSpeed]});
                    list.push({code:36});
                    list.push({code:0});
                }
                break;
        }
    }

    if(list.length){
        let moveRoute = {
            list: list,
            repeat: false,
            skippable: false,
            wait: false
        }
        this.forceMoveRoute(moveRoute);
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
        let customSeName = Gimmer_Core.Fighty.getMetaKey([meta,enemyMeta],'damageSe',false);

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
    let leader = $gameParty.leader();
    if(leader){
        return $dataActors[leader._actorId]
    }
    else{
        return {};
    }

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
    this._oldCharacterName = false;
    this._oldCharacterIndex = false;

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

//We override the walking animation to animate the character/event attacking. If they are attacking, ignore that they are stopped
//Unless they are shooting.
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


// GAME MAP AREA

Game_Map.prototype.hasEnemies = function (){
    let enemyCount = 0;
    $dataMap.events.forEach(function(event){
        if(event && event.meta && event.meta.isEnemy && !$gameMap._events[event.id]._erased){
            enemyCount++;
        }
    });
    return (enemyCount > 0);
}

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
        let x = Math.floor($gameMap.canvasToMapX(pointObj.x));
        let y = Math.floor($gameMap.canvasToMapY(pointObj.y));
        if(!$gameMap.isPassable(x, y, Gimmer_Core.wordsToDirections(hitbox.direction)) && width > 0 && height > 0){
            impacts.push(x+","+y);
        }
    }, this);

    //potentialImpacts = [...new Set(potentialImpacts)];
    impacts = [...new Set(impacts)];

    return impacts.length;
}

//CUSTOM CLASSES

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