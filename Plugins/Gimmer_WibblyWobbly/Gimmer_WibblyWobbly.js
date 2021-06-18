if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

Gimmer_Core['WibblyWobbly'] = {'loaded':true};

//=============================================================================
/*:
 * @plugindesc v1.5 - Apply a filter to the map layer to make the player seem wasted.
 * @author Gimmer_
 * @help Use the following plugin commands to drunken up your characters on the Map Screen
 *
 * ===================
 * Gimmer_WibblyWobbly
 * ===================
 *
 * GetDrunk:
 * Arg1: How long to stay drunk for (can be a number, or "forever")
 * Arg2: If you chose a number for how long to stay drunk for, you can optionally set another number for all long to wait when sober again to become drunk again. This lets you weave in and out of being drunk
 *
 * SoberUp: Become sober again.
 * Arg1: Optionally include a number for how long to wait before sobering up
 *
 * Terms of Use:
 * =======================================================================
 * Free for both commercial and non-commercial use, with credit.
 * More Gimmer_ plugins at: https://github.com/gimmer/RPG-Maker-MV-Plugins
 * =======================================================================
 *
 * @param ---Parameters---
 * @default
 *
 * @param Drunk Max
 * @parent ---Parameters---
 * @type String
 * @desc Blur value to be used when fully drink. can be from 1 to 5 including fractions (1.25, etc.) (More than 5 looks pretty rough)
 * Default 5
 * @default 5
 *
 * @param Drunk Per Frame
 * @parent ---Parameters---
 * @type String
 * @desc Blue value to increase per frame while becoming drunk. Can be a fraction (1, 0.24, etc.)
 * @default 0.1
 * Default 0.1
 *
 * @param Muffle Music When Drunk
 * @parent ---Parameters---
 * @type Boolean
 * @desc Muffle the music when the player is drunk?
 * Default: False
 * @default false
 *
 * @param Target Music Volume
 * @parent Muffle Music When Drunk
 * @type Number
 * @desc What Percentage (1-100) do you want the music to muffle when drunk
 * @min 1
 * @max 100
 * Default: 25
 * @default 25
 *
 * @param Target Music Slowdown
 * @parent Muffle Music When Drunk
 * @type Number
 * @desc What Percentage (1-100) do you want the music to slow down when drunk
 * @min 0
 * @max 80
 * Default: 50
 * @default 50
 *
 * @param Stumble While Drunk
 * @parent ---Parameters---
 * @type Boolean
 * @desc Do you want the character to stumble around while drunk?
 * Default: False
 * @default false
 *
 * @param Stumble Percent
 * @parent Stumble While Drunk
 * @type Number
 * @desc Percentage change to random turn to face the left or right while walking. This is just animation and won't change direction
 * @min 1
 * @max 100
 * Default: 50
 * @default 50
 *
 * @param Stumble Limit
 * @parent Stumble While Drunk
 * @type Number
 * @desc Number of Stumbles (random turning left and right) the player will do before their next move forward will go the wrong way.
 * Default: 4
 * @default 4
 *
 * @param Sway While Drunk
 * @parent ---Parameters---
 * @type Boolean
 * @desc Do you want the character to sway while drunk?
 * Default: False
 * @default false
 *
 * @param Sway Limit
 * @parent Sway While Drunk
 * @type Number
 * @desc Number of pixels to sway left and right
 * @min 1
 * @max 32
 * Default: 10
 * @default 10
 *
 * @param Sway Per Frame
 * @parent Sway While Drunk
 * @type String
 * @desc How much of a pixel to sway left and right per frame?
 * Default: 0.25
 * @default 0.25
 *
 * @param Drunk Walking Speed
 * @parent ---Parameters---
 * @type Boolean
 * @desc Do you want the character to randomize their walking speed while drunk?
 * Default: False
 * @default false
 *
 * @param Walking Min
 * @parent Drunk Walking Speed
 * @type String
 * @desc How slow can you go while drunk? (1 to 3, can be a fraction e.g. 2.75)
 * Default: 3
 * @default 3
 *
 * @param Walking Max
 * @parent Drunk Walking Speed
 * @type String
 * @desc How fast can you go while drunk? (3 to 5, can be a fraction e.g. 3.5)
 * Default: 4
 * @default 4
 *
 */

var drunkParams = PluginManager.parameters('Gimmer_WibblyWobbly');
Gimmer_Core.WibblyWobbly.MuffleMusic = (drunkParams['Muffle Music When Drunk'] === "true");
Gimmer_Core.WibblyWobbly.MufflePercent = Number(drunkParams['Target Music Volume']) / 100;
Gimmer_Core.WibblyWobbly.MuffleSlowDown =Number(drunkParams['Target Music Slowdown']) / 100;
Gimmer_Core.WibblyWobbly.DrunkWalking = (drunkParams['Stumble While Drunk'] === "true");
Gimmer_Core.WibblyWobbly.DrunkTurningPercent = Number(drunkParams['Stumble Percent']);
Gimmer_Core.WibblyWobbly.StumbleLimit = Number(drunkParams['Stumble Limit']);
Gimmer_Core.WibblyWobbly.DrunkenSway = (drunkParams['Sway While Drunk'] === "true");
Gimmer_Core.WibblyWobbly.DrunkenSwayMax =  Number(drunkParams['Sway Limit']);
Gimmer_Core.WibblyWobbly.SwayPerFrame = parseFloat(drunkParams['Sway Per Frame']);
Gimmer_Core.WibblyWobbly.DrunkWalkSpeed = (drunkParams['Drunk Walking Speed'] === "true");
Gimmer_Core.WibblyWobbly.DrunkWalkingSpeedMin = parseFloat(drunkParams['Walking Min']);
Gimmer_Core.WibblyWobbly.DrunkWalkingSpeedMax = parseFloat(drunkParams['Walking Max']);
Gimmer_Core.WibblyWobbly.DrunkMax = parseFloat(drunkParams['Drunk Max']);
Gimmer_Core.WibblyWobbly.DrunkPerFrame = parseFloat(drunkParams['Drunk Per Frame']);

Gimmer_Core.WibblyWobbly.DrunkLevelSnapShot = {
    snapShot: false,
    drunkAmount: 0,
    drunkCount: 0,
    gettingDrunk: false,
    soberingUp: false,
    stayDrunk:false,
    targetVol: 0,
    initialVol: 0,
    volPerFrame: 0,
    playbackPerFrame: 0,
    soberWait: -1,
    initialSoberWait: -1,
    targetDrunkCount: 0,
    stillMuffling: false,
    initialPlaybackRate: -1
};
//Make a snapshot of current drunk variables
Gimmer_Core.WibblyWobbly.snapShot = function (spriteset){
    this.DrunkLevelSnapShot.snapShot = true;
    this.DrunkLevelSnapShot.soberingUp = spriteset._soberingUp;
    this.DrunkLevelSnapShot.gettingDrunk = spriteset._gettingDrunk;
    this.DrunkLevelSnapShot.drunkAmount = spriteset._drunkAmount;
    this.DrunkLevelSnapShot.drunkCount = spriteset._drunkCount;
    this.DrunkLevelSnapShot.stayDrunk = spriteset._stayDrunk;
    this.DrunkLevelSnapShot.targetVol = spriteset._targetVol;
    this.DrunkLevelSnapShot.initialVol = spriteset._initialVol;
    this.DrunkLevelSnapShot.volPerFrame = spriteset._volPerFrame;
    this.DrunkLevelSnapShot.playbackPerFrame = spriteset._playbackPerFrame;
    this.DrunkLevelSnapShot.targetDrunkCount = spriteset._targetDrunkCount;
    this.DrunkLevelSnapShot.soberWait = spriteset._soberWait;
    this.DrunkLevelSnapShot.initialSoberWait = spriteset._initialSoberWait;
    this.DrunkLevelSnapShot.stillMuffling = spriteset._stillMuffling;
    this.DrunkLevelSnapShot.initalPlaybackRate = spriteset._initialPlaybackRate;
}

//Helper function to see if you are still drunk. Is the screen currently blurry, or going to be blurry again soon?
Gimmer_Core.WibblyWobbly.isDrunk = function(){
    let Scene = SceneManager._scene;
    if(!Scene || !('_spriteset' in Scene)){
        return false;
    }
    let SpriteSet = Scene._spriteset;
    return (SpriteSet._drunkAmount > 0 || SpriteSet._soberWait > -1);
}

Gimmer_Core.WibblyWobbly.ForceSobriety = function(){
    if(Gimmer_Core.WibblyWobbly.DrunkWalkSpeed){
        $gamePlayer.setMoveSpeed($gamePlayer._soberWalkingSpeed);
    }
    if(this.DrunkLevelSnapShot.snapShot && Gimmer_Core.WibblyWobbly.MuffleMusic){
        AudioManager.bgmVolume = this.DrunkLevelSnapShot.initialVol
        if(AudioManager._bgmBuffer){
            AudioManager._bgmBuffer._sourceNode.playbackRate.value = this.DrunkLevelSnapShot.initalPlaybackRate;
        }

    }
    this.DrunkLevelSnapShot.snapShot = false;
}

/*
* Extend Spriteset_Map to support the map being drunk
*
 */
Gimmer_Core.WibblyWobbly._Spriteset_Map_prototype_initialize = Spriteset_Map.prototype.initialize
Spriteset_Map.prototype.initialize = function(){
    Gimmer_Core.WibblyWobbly._Spriteset_Map_prototype_initialize.call(this);
    this.createDrunkFilters();
}

Spriteset_Map.prototype.createDrunkFilters = function(){
    this._drunkCount = 0;
    this._drunkAmount = 0;
    this._targetDrunkCount = 0;
    this._drunkMax = Gimmer_Core.WibblyWobbly.DrunkMax;
    this._drunkPerFrame = Gimmer_Core.WibblyWobbly.DrunkPerFrame;
    this._gettingDrunk = false;
    this._soberingUp = false;
    this._stayDrunk = false;
    this._soberWait = -1;
    this._initialSoberWait = -1;
    this._filter = new PIXI.filters.BlurFilter();
    this._muffleMusic = Gimmer_Core.WibblyWobbly.MuffleMusic;
    this._stillMuffling = false;
    this._initialPlaybackRate = -1;
    //use the snapshot of status
    if(Gimmer_Core.WibblyWobbly.DrunkLevelSnapShot.snapShot){
        this._drunkAmount = Gimmer_Core.WibblyWobbly.DrunkLevelSnapShot.drunkAmount;
        this._drunkCount = Gimmer_Core.WibblyWobbly.DrunkLevelSnapShot.drunkCount;
        this._gettingDrunk = Gimmer_Core.WibblyWobbly.DrunkLevelSnapShot.gettingDrunk;
        this._soberingUp = Gimmer_Core.WibblyWobbly.DrunkLevelSnapShot.soberingUp;
        this._initialVol = Gimmer_Core.WibblyWobbly.DrunkLevelSnapShot.initialVol;
        this._volPerFrame = Gimmer_Core.WibblyWobbly.DrunkLevelSnapShot.volPerFrame;
        this._playbackPerFrame = Gimmer_Core.WibblyWobbly.DrunkLevelSnapShot.playbackPerFrame;
        this._targetVol = Gimmer_Core.WibblyWobbly.DrunkLevelSnapShot.targetVol;
        this._stayDrunk = Gimmer_Core.WibblyWobbly.DrunkLevelSnapShot.stayDrunk;
        this._soberWait = Gimmer_Core.WibblyWobbly.DrunkLevelSnapShot.soberWait;
        this._initialSoberWait = Gimmer_Core.WibblyWobbly.DrunkLevelSnapShot.initialSoberWait;
        this._targetDrunkCount = Gimmer_Core.WibblyWobbly.DrunkLevelSnapShot.targetDrunkCount;
        this._stillMuffling = Gimmer_Core.WibblyWobbly.DrunkLevelSnapShot.stillMuffling
        this._initialPlaybackRate = Gimmer_Core.WibblyWobbly.DrunkLevelSnapShot.initalPlaybackRate;
        Gimmer_Core.WibblyWobbly.DrunkLevelSnapShot.snapShot = false;
    }
    this._filter.blur = this._drunkAmount;
    if(this._baseSprite.filters.length){
        this._baseSprite.filters = [this._toneFilter, this._filter];
    }
    else{
        this._baseSprite.filters = [this._filter];
    }
}

Gimmer_Core.WibblyWobbly._Spriteset_Map_prototype_update = Spriteset_Map.prototype.update;
Spriteset_Map.prototype.update = function (){
    Gimmer_Core.WibblyWobbly._Spriteset_Map_prototype_update.call(this);
    if(this._filter){
        this.updateDrunk();
    }
}

Spriteset_Map.prototype.updateDrunk = function(){
    if(this._gettingDrunk || this._stillMuffling){
        if(this._gettingDrunk){
            this._drunkAmount += this._drunkPerFrame;
            if(this._drunkAmount >= this._drunkMax){
                this._drunkAmount = this._drunkMax;
                this._drunkCount = this._targetDrunkCount;
                this._gettingDrunk = false;
            }
        }
        if(this._muffleMusic){
            if(AudioManager.bgmVolume > this._targetVol) {
                let tempVol = AudioManager.bgmVolume;
                if (tempVol > this._targetVol) {
                    tempVol -= this._volPerFrame;
                    AudioManager.bgmVolume = tempVol;
                }
            }

            if(AudioManager._bgmBuffer && AudioManager._bgmBuffer.isReady()){
                let playbackRate = AudioManager._bgmBuffer._sourceNode.playbackRate.value;
                if(this._initialPlaybackRate === -1){
                    this._initialPlaybackRate = playbackRate;
                }
                if(playbackRate > Gimmer_Core.WibblyWobbly.MuffleSlowDown){
                    playbackRate -= this._playbackPerFrame;
                    AudioManager._bgmBuffer._sourceNode.playbackRate.value = playbackRate;
                    this._stillMuffling = true;
                }
                else{
                    this._stillMuffling = false;
                }
            }
        }
    }
    else if(!this._stayDrunk && this._drunkCount > 0){
        this._drunkCount -= 1;
        if(this._drunkCount === 0){
            this._soberingUp = true;
        }
    }
    else if(this._soberingUp){
        this._drunkAmount -= this._drunkPerFrame;
        if(this._drunkAmount <= 0){
            this._drunkAmount = 0;
            this._soberingUp = false;
            if(this._soberWait === -1 && Gimmer_Core.WibblyWobbly.DrunkWalkSpeed){
                $gamePlayer.setMoveSpeed($gamePlayer._soberWalkingSpeed);
            }
        }

        if(this._muffleMusic){
            if(AudioManager.bgmVolume < this._initialVol) {
                let tempVol = AudioManager.bgmVolume;
                if (tempVol < this._initialVol) {
                    tempVol += this._volPerFrame;
                    if(tempVol > this._initialVol){
                        tempVol = this._initialVol;
                    }
                    if(!this._soberingUp){
                        tempVol = this._initialVol;
                    }
                    AudioManager.bgmVolume = tempVol;
                }
            }

            if(AudioManager._bgmBuffer && AudioManager._bgmBuffer.isReady()){
                let playbackRate = AudioManager._bgmBuffer._sourceNode.playbackRate.value;
                if(playbackRate < this._initialPlaybackRate){
                    playbackRate += this._playbackPerFrame;
                    if(playbackRate > this._initialPlaybackRate ){
                        playbackRate = this._initialPlaybackRate;
                    }
                    if(!this._soberingUp){
                        playbackRate = this._initialPlaybackRate;
                    }
                    AudioManager._bgmBuffer._sourceNode.playbackRate.value = playbackRate;
                }
            }
        }
    }
    else if(this._soberWait >= 0){
        if(this._soberWait > 0){
            this._soberWait -= 1;
        }
        else{
            this._gettingDrunk = true;
            this._soberWait = this._initialSoberWait;
        }
    }
    this._filter.blur = this._drunkAmount;
}

Spriteset_Map.prototype.calculateBGMVolumes = function(){
    this._initialVol = AudioManager.bgmVolume;
    let numFrames = Math.ceil(this._drunkMax / this._drunkPerFrame);
    this._targetVol = Math.floor(this._initialVol * Gimmer_Core.WibblyWobbly.MufflePercent);
    this._volPerFrame = Math.ceil((this._initialVol - this._targetVol) / numFrames);
    this._playbackPerFrame = Gimmer_Core.WibblyWobbly.MuffleSlowDown / numFrames;
}

Gimmer_Core.WibblyWobbly._Game_Player_prototype_initialize = Game_Player.prototype.initialize;
Game_Player.prototype.initialize = function(){
    Gimmer_Core.WibblyWobbly._Game_Player_prototype_initialize.call(this);
    this._stumbleCount = 0;
    this._lastSwayDirection = "right";
    this._lastSwayAmount = 0;
    this._swayPerFrame = Gimmer_Core.WibblyWobbly.SwayPerFrame;
    this._soberWalkingSpeed = -1;
}

//Drunk Walking
Game_Player.prototype.setDirection = function(d) {
    Game_CharacterBase.prototype.setDirection.call(this,d);
    if(Gimmer_Core.WibblyWobbly.DrunkWalking && Gimmer_Core.WibblyWobbly.isDrunk()){
        if((Math.random() * 100) + 1 >= Gimmer_Core.WibblyWobbly.DrunkTurningPercent){
            this._stumbleCount++;
            this.turnRightOrLeft90();
        }
    }
    else{
        this._stumbleCount = 0;
    }
};

Gimmer_Core.WibblyWobbly._Game_Player_prototype_moveStraight = Game_Player.prototype.moveStraight
Game_Player.prototype.moveStraight = function(d) {
    if(this._stumbleCount >= Gimmer_Core.WibblyWobbly.StumbleLimit){
        this._stumbleCount = 0;
        switch (Math.randomInt(2)) {
            case 0:
                switch (d) {
                    case 2:
                        d = 4;
                        break;
                    case 4:
                        d = 8;
                        break;
                    case 6:
                        d = 2;
                        break;
                    case 8:
                        d = 6;
                        break;
                }
                break;
            case 1:
                switch (d) {
                    case 2:
                        d = 6;
                        break;
                    case 4:
                        d = 2;
                        break;
                    case 6:
                        d = 8;
                        break;
                    case 8:
                        d = 4;
                        break;
                }
                break;
        }
    }
    if(Gimmer_Core.WibblyWobbly.DrunkWalkSpeed && Gimmer_Core.WibblyWobbly.isDrunk()){
        let speed = Math.random() * (Gimmer_Core.WibblyWobbly.DrunkWalkingSpeedMax - Gimmer_Core.WibblyWobbly.DrunkWalkingSpeedMin + 1) + Gimmer_Core.WibblyWobbly.DrunkWalkingSpeedMin;
        this.setMoveSpeed(speed);
    }
    Gimmer_Core.WibblyWobbly._Game_Player_prototype_moveStraight.call(this,d);
};

//Drunk Swag
Sprite_Character.prototype.updatePosition = function() {
    this.x = this._character.screenX();
    this.y = this._character.screenY();
    this.z = this._character.screenZ();
    if(Gimmer_Core.WibblyWobbly.DrunkenSway && this._character === $gamePlayer && Gimmer_Core.WibblyWobbly.isDrunk()){
        let directionToGo = this._character._lastSwayDirection;
        if(Math.abs(this._character._lastSwayAmount) > Gimmer_Core.WibblyWobbly.DrunkenSwayMax){
            directionToGo = (directionToGo === "right" ? "left" : "right");
            this._character._lastSwayDirection = directionToGo;
        }
        if(directionToGo === "right"){
            this._character._lastSwayAmount += this._character._swayPerFrame;
            this.x += this._character._lastSwayAmount;
        }
        else{
            this._character._lastSwayAmount -= this._character._swayPerFrame;
            this.x += this._character._lastSwayAmount;
        }
    }
};

Gimmer_Core.WibblyWobbly._SceneManager_goto = SceneManager.goto;
SceneManager.goto = function(sceneClass){
    if(this._scene && this._scene.constructor === Scene_Map && Gimmer_Core.WibblyWobbly.isDrunk()){
        Gimmer_Core.WibblyWobbly.snapShot(this._scene._spriteset);
    }
    Gimmer_Core.WibblyWobbly._SceneManager_goto.call(this, sceneClass);
    if(SceneManager.isNextScene(Scene_Title)){
        Gimmer_Core.WibblyWobbly.ForceSobriety();
    }
}

/*
* Plugin commands!
*/

Gimmer_Core.pluginCommands['GETDRUNK'] = function(args){
    if($gamePlayer._soberWalkingSpeed === -1){
        $gamePlayer._soberWalkingSpeed = $gamePlayer._moveSpeed;
    }
    let Scene = SceneManager._scene;
    if(!Scene || !("_spriteset" in Scene)){
        return false;
    }
    //Arg 1: how long (number of frames or "forever")
    //Arg 2: redrunk pulse time (if you are sober, how long in frame before you become drunk again. Leave blank for never)
    let SpriteSet = Scene._spriteset
    if(args && args.length > 0 && args[0] === "forever"){
        SpriteSet._stayDrunk = true;
    }
    else if(args && args.length > 0 && Number(args[0]) > 0){
        SpriteSet._targetDrunkCount = Number(args[0]);
    }

    if(args && args.length > 1 && Number(args[1]) > 0){
        SpriteSet._initialSoberWait = Number(args[1]);
        SpriteSet._soberWait = Number(args[1]);
    }

    if(!SpriteSet._gettingDrunk){
        SpriteSet._soberingUp = false;
        SpriteSet._gettingDrunk = true;
        if(Gimmer_Core.WibblyWobbly.MuffleMusic){
            SpriteSet._muffleMusic = true;
            SpriteSet.calculateBGMVolumes();
        }
    }
}

Gimmer_Core.pluginCommands['SOBERUP'] = function(args){
    let Scene = SceneManager._scene
    if(!Scene || !('_spriteset' in Scene)){
        return false;
    }
    //Args[1] = how long to wait to sober up, otherwise instant
    let SpriteSet = Scene._spriteset;
    if(!SpriteSet._soberingUp){
        if(args && args.length > 0 && Number(args[0]) > 0){
            SpriteSet._drunkCount = Number(args[0]);
            SpriteSet._stayDrunk = false;
            SpriteSet._soberWait = -1;
        }
        else{
            SpriteSet._drunkCount = 0;
            SpriteSet._soberWait = -1;
            SpriteSet._soberingUp = true;
            SpriteSet._gettingDrunk = false;
            SpriteSet._stayDrunk = false;
            SpriteSet._filter.blur = 0;
            Gimmer_Core.WibblyWobbly.DrunkLevelSnapShot.snapShot = false;
            if(Gimmer_Core.WibblyWobbly.DrunkWalkSpeed){
                $gamePlayer.setMoveSpeed($gamePlayer._soberWalkingSpeed);
            }
            if(Gimmer_Core.WibblyWobbly.MuffleMusic){
                AudioManager.bgmVolume = SpriteSet._initialVol;
                if(AudioManager._bgmBuffer){
                    AudioManager._bgmBuffer._sourceNode.playbackRate.value = SpriteSet._initialPlaybackRate;
                }
            }
        }
    }
}


//Extend saving
Gimmer_Core.WibblyWobbly.DataManager_makeSaveContents = DataManager.makeSaveContents;
DataManager.makeSaveContents = function() {
    var contents = Gimmer_Core.WibblyWobbly.DataManager_makeSaveContents.call(this);
    contents.drunk = Gimmer_Core.WibblyWobbly.DrunkLevelSnapShot;
    return contents;
};

Gimmer_Core.WibblyWobbly.DataManager_extractSaveContents = DataManager.extractSaveContents;
DataManager.extractSaveContents = function(contents) {
    Gimmer_Core.WibblyWobbly.DataManager_extractSaveContents.call(this, contents);
    if('drunk' in contents){
        Gimmer_Core.WibblyWobbly.DrunkLevelSnapShot = contents.drunk;
    }
};