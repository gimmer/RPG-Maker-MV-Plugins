if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

Imported = Imported || {};
Imported['Gimmer_MirrorMirrorOnTheWall'] = '1.0';

Gimmer_Core['Mirror'] = {'loaded':true};

//=============================================================================
/*:
 * @plugindesc v1.0 - Choose tiles that are mirrors? Regions that are Mirrors? Who knows
 * @author Gimmer_
 * @help This plugin lets you define events as mirrors
 *
 * Simply put <mirror> in the note tag on event, and place it on a transparent tile on the map.
 * Any events or characters on the screen using a "characterName" will be reflected.
 * The terrain in front of the mirror will also be reflected.
 *
 * KNOWN ISSUE:  The tiles reflected won't be inverted in the mirror.
 * Make sure the terrain in front of the mirror is direction agnostic.
 *
 * Version 1.0
 * - Initial release
 *
 * @param ---Parameters---
 *
 * @param Opacity of Mirrors
 * @parent ---Parameters---
 * @type Number
 * @desc What should the opacity of a sprite reflected in a mirror be?
 * Default 180
 * @default 180
 *
 *
 */

Gimmer_Core.Mirror.DefaultMirrorOpacity = Number(PluginManager.parameters('Gimmer_MirrorMirrorOnTheWall')['Opacity of Mirrors']) || 180;

function Sprite_Character_Mirror() {
    this.initialize.apply(this, arguments);
}

Sprite_Character_Mirror.prototype = Object.create(Sprite_Character.prototype);
Sprite_Character_Mirror.prototype.constructor = Sprite_Character_Mirror;

Sprite_Character_Mirror.prototype.initialize = function(character) {
    Sprite_Character.prototype.initialize.call(this, character);
    this._mirrorSource = false;
};

Sprite_Character_Mirror.prototype.updateVisibility = function() {
    if(this._character.isMoving() && !Imported.Galv_PixelMove){
        this.visible = (this.isLeavingMirroredSpace() || this.isEnteringMirroredSpace());
    }
    else if(SceneManager._scene._spriteset){
        let tilemap =  SceneManager._scene._spriteset._mirrorTileMap || false;
        if(tilemap){
            let x = Math.round(this._character._x);
            let y = Math.round(this._character._y);
            dd(x + "," + y);
            this.visible = !!tilemap._mirrorSpacesToEvent[x + "," + y];
            dd(this.visible);
        }
        else{
            this.visible = false;
        }
    }
    else{
        this.visible = false;
    }
};


Sprite_Character_Mirror.prototype.characterPatternY = function() {
    let d = this._character.direction();
    if(d === 2 || d === 8){
        return (this._character.reverseDir(d) - 2) / 2;
    }

    return ((d - 2) / 2);
};

Sprite_Character_Mirror.prototype.updatePosition = function() {
    let mirror = this.findNearestMirror(this._character);
    let th = $gameMap.tileHeight();
    if(mirror){
        let d = this._character.direction();
        if(!Imported.Galv_PixelMove && this._frame.width !== this.patternWidth() && this._character.isMoving() && (d === 6 || d === 4)){
            let widthMod = this.getWidthMod(mirror);
            if(widthMod > 0){
                widthMod = this.patternWidth() * (1 - widthMod);
                widthMod /= 2;
                if(d === 6){
                    widthMod *= -1;
                }
            }
            this.x = this._character.screenX() + widthMod;
        }
        else{
            this.x = this._character.screenX();
        }
        let distY = mirror.screenY() - this._character.screenY();
        this.y = mirror.screenY() + distY + th;
    }
    else{

        this.x = this._character.screenX();
        this.y = this._character.screenY();
    }
    this.z = this._character.screenZ();
};

Sprite_Character_Mirror.prototype.setFrame = function (x, y, width, height){
    if(!Imported.Galv_PixelMove){
        let mirror = this.findNearestMirror(this._character);
        let d = this._character.direction();

        let isEnteringMirroredSpace = false;
        let isLeavingMirroredSpace = false;
        if(this._character.isMoving() &&  (d === 4 || d === 6)){
            isEnteringMirroredSpace = this.isEnteringMirroredSpace();
            isLeavingMirroredSpace = this.isLeavingMirroredSpace();
        }
        if(this._character.isMoving() && this._character === $gamePlayer){
            dd('entering:');
            dd(isEnteringMirroredSpace);
            dd('leaving:');
            dd(isLeavingMirroredSpace);
        }


        if(mirror){
            if(isEnteringMirroredSpace){
                if(!isLeavingMirroredSpace){
                    if(isEnteringMirroredSpace.x !== this._character._realX){
                        if(isEnteringMirroredSpace.x < this._character._realX){
                            let mod = this.getWidthMod(isEnteringMirroredSpace);
                            let tempWidth = width * mod;
                            let diff = width - tempWidth;
                            width *= mod;
                            x += diff;

                        }
                        else{
                            let mod = this.getWidthMod(isEnteringMirroredSpace);
                            width *= mod;
                        }
                    }
                }

            }
            else{
                if(mirror.x !== this._character._realX){
                    if(mirror.x > this._character._realX){
                        let mod = this.getWidthMod(mirror);
                        let tempWidth = width * mod;
                        let diff = width - tempWidth;
                        width *= mod;
                        x += diff;

                    }
                    else{
                        let mod = this.getWidthMod(mirror);
                        width *= mod;
                    }
                }
            }

        }
    }
    Sprite_Character.prototype.setFrame.call(this, x, y, width, height);
}

Sprite_Character_Mirror.prototype.isEnteringMirroredSpace = function(){
    let tilemap = (SceneManager._scene._spriteset && SceneManager._scene._spriteset._mirrorTileMap ? SceneManager._scene._spriteset._mirrorTileMap : false);
    if(tilemap && this._character.isMoving()){
        let x = this._character._realX;
        let y = this._character._realY;
        let d = this._character.direction();
        switch(d){
            case 4:
                x = Math.floor(x);
                break;
            case 6:
                x = Math.ceil(x);
                break;
            case 8:
                y = Math.floor(y)
                break;
            case 2:
                y = Math.ceil(y);
                break;
        }
        if(tilemap._mirrorSpacesToEvent[x+","+y]){
            return tilemap._mirrorSpacesToEvent[x+","+y];
        }
    }
    return false;
}

Sprite_Character_Mirror.prototype.isLeavingMirroredSpace = function(){
    let tilemap = (SceneManager._scene._spriteset && SceneManager._scene._spriteset._mirrorTileMap ? SceneManager._scene._spriteset._mirrorTileMap : false);
    if(tilemap && this._character.isMoving()){
        let x = this._character._realX;
        let y = this._character._realY;
        let d = this._character.direction();
        switch(d){
            case 4:
                x = Math.ceil(x);
                break;
            case 6:
                x = Math.floor(x);
                break;
            case 8:
                y = Math.ceil(y)
                break;
            case 2:
                y = Math.floor(y);
                break;
        }

        if(tilemap._mirrorSpacesToEvent[x+","+y]){
            return tilemap._mirrorSpacesToEvent[x+","+y];
        }
    }
    return false;
}

Sprite_Character_Mirror.prototype.getWidthMod = function(mirror){
    return 1 - Math.abs(this._character._realX - mirror.x);
}

Sprite_Character_Mirror.prototype.findNearestMirror = function(object){
    return Gimmer_Core.Mirror.findNearestMirror(object);
}

Gimmer_Core.Mirror.mirrorEventAtXY = function(x, y, mirrorEvents){
    let returnEvent = false;
    if(!mirrorEvents){
        mirrorEvents = (SceneManager._scene && SceneManager._scene._spriteset ? SceneManager._scene._spriteset._mirrorEvents : false);
    }
    if(!mirrorEvents){
        mirrorEvents = [];
    }
    mirrorEvents.some(function(event){
        if(event.x === x && event.y === y){
            returnEvent = event;
            return true;
        }
        return false;
    });
    return returnEvent;
}

Gimmer_Core.Mirror.findNearestMirror = function(object, d){
    let mod = 0;
    if(d){
        if(d === 4){
            mod = -1;
        }
        else if(d === 6){
            mod = 1;
        }
    }
    let mirror = false;
    let minDist = Infinity;
    $gameMap.events().forEach(function (event){
        if($dataMap.events[event._eventId].meta['mirror']){
            if(event.y < Math.floor(object.y) && ((event.x + 1) > (object._realX + mod) && (event.x - 1) < (object._realX + mod))){
                let dist = $gameMap.distance(event.x, event.y, Math.floor(object.x) + mod, Math.floor(object.y));
                if(!mirror || (minDist > dist)){
                    minDist = dist;
                    mirror = event;
                }
            }
        }
    }, this);
    return mirror;
}

Sprite_Character_Mirror.prototype.updateOther = function() {
    Sprite_Character.prototype.updateOther.call(this);
    this.opacity = Gimmer_Core.Mirror.DefaultMirrorOpacity;
};

//Mirrors maybe no animations too?
Sprite_Character_Mirror.prototype.setupAnimation = function() {};

//Mirrors can't have balloons
Sprite_Character_Mirror.prototype.setupBalloon = function() {};
Sprite_Character_Mirror.prototype.startBalloon = function() {};
Sprite_Character_Mirror.prototype.updateBalloon = function() {};
Sprite_Character_Mirror.prototype.endBalloon = function() {};
Sprite_Character_Mirror.prototype.isBalloonPlaying = function() {
    return false;
};

Gimmer_Core.Mirror.Spriteset_Map_prototype_createTilemap = Spriteset_Map.prototype.createTilemap;
Spriteset_Map.prototype.createTilemap = function(){
    Gimmer_Core.Mirror.Spriteset_Map_prototype_createTilemap.call(this);
    if (Graphics.isWebGL()) {
        this._mirrorTileMap = new ShaderTilemap();
    } else {
        this._mirrorTileMap = new Tilemap();
    }


    this._mirrorTileMap.isMirror = true;
    this._mirrorTileMap.tileWidth = $gameMap.tileWidth();
    this._mirrorTileMap.tileHeight = $gameMap.tileHeight();
    this._mirrorTileMap.setData($gameMap.width(), $gameMap.height(), $gameMap.data());
    this._mirrorTileMap.horizontalWrap = $gameMap.isLoopHorizontal();
    this._mirrorTileMap.verticalWrap = $gameMap.isLoopVertical();
    if (this._tileset) {
        var tilesetNames = this._tileset.tilesetNames;
        for (var i = 0; i < tilesetNames.length; i++) {
            this._mirrorTileMap.bitmaps[i] = ImageManager.loadTileset(tilesetNames[i]);
        }
        var newTilesetFlags = $gameMap.tilesetFlags();
        this._mirrorTileMap.refreshTileset();
        if (!this._mirrorTileMap.flags.equals(newTilesetFlags)) {
            this._mirrorTileMap.refresh();
        }
        this._mirrorTileMap.flags = newTilesetFlags;
    }

    this._baseSprite.addChildAt(this._mirrorTileMap, this._baseSprite.children.indexOf(this._tilemap));
}

Gimmer_Core.Mirror.Scene_Map_prototype_start = Scene_Map.prototype.start
Scene_Map.prototype.start = function(){
    Gimmer_Core.Mirror.Scene_Map_prototype_start.call(this);
}

Gimmer_Core.Mirror.Scene_Map_prototype_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function(){
    Gimmer_Core.Mirror.Scene_Map_prototype_update.call(this);
}

Spriteset_Map.prototype.createCharacters = function() {
    this._characterSprites = [];
    this._mirrorSprites = [];
    this._mirrorSprites.push();
    this._characterSprites.push();
    this._mirrorEvents = [];
    $gameMap.events().forEach(function(event) {
        this._characterSprites.push(new Sprite_Character(event));
        if($dataMap.events[event._eventId].meta['mirror']){
            this._mirrorEvents.push(event);
        }
    }, this);
    $gameMap.vehicles().forEach(function(vehicle) {
        this._characterSprites.push(new Sprite_Character(vehicle));
    }, this);
    $gamePlayer.followers().reverseEach(function(follower) {
        this._characterSprites.push(new Sprite_Character(follower));
    }, this);
    this._characterSprites.push(new Sprite_Character($gamePlayer));

    for (var i = 0; i < this._characterSprites.length; i++) {
        this._tilemap.addChild(this._characterSprites[i]);
        if(this._mirrorEvents.length > 0 && this._characterSprites[i]._character._characterName !== ""){
            this._mirrorSprites.push(new Sprite_Character_Mirror(this._characterSprites[i]._character));
        }
    }

    if(this._mirrorEvents.length > 0){
        this._mirrorTileMap.mirrorEvents = this._mirrorEvents;
        this._mirrorTileMap.enumerateMirrors();
        for (var i = 0; i < this._mirrorSprites.length; i++) {
            this._mirrorTileMap.addChild(this._mirrorSprites[i]);
        }
    }
};

Gimmer_Core.Mirror._Spriteset_Map_prototype_updateTilemap = Spriteset_Map.prototype.updateTilemap;
Spriteset_Map.prototype.updateTilemap = function (){
    Gimmer_Core.Mirror._Spriteset_Map_prototype_updateTilemap.call(this);
    this._mirrorTileMap.origin.x = $gameMap.displayX() * $gameMap.tileWidth();
    this._mirrorTileMap.origin.y = $gameMap.displayY() * $gameMap.tileHeight();
}

Gimmer_Core.Mirror.Tilemap_prototype_readMapData = Tilemap.prototype._readMapData;
Tilemap.prototype._readMapData = function (x,y,z){
    if(this._isMirror){
        if(this._mirroredDataMap[x+","+y]){
            x = this._mirroredDataMap[x+","+y].x;
            y = this._mirroredDataMap[x+","+y].y;
        }
    }
    return Gimmer_Core.Mirror.Tilemap_prototype_readMapData.call(this, x,y,z);
}

Gimmer_Core.Mirror.Tilemap_prototype_initialize = Tilemap.prototype.initialize ;
Tilemap.prototype.initialize = function(){
    this._isMirror = false;
    this._mirrorEvents = [];
    this._mirrorCoordinates = [];
    this._mirroredDataMap= {};
    this._mirrorSpacesToEvent = {};
    Gimmer_Core.Mirror.Tilemap_prototype_initialize.call(this);
}

Tilemap.prototype.enumerateMirrors = function (){
    this._mirrorEvents.forEach(function(event){
        this._mirrorCoordinates.push(event.x+","+event.y);
    }, this);

    this._mirrorEvents.forEach(function(event){
        let y = event.y + 1;
        let numLoops = 0;
        if(this._mirrorCoordinates.indexOf(event.x+","+y) > -1){
            while(true){
                numLoops++;
                y++;
                if(this._mirrorCoordinates.indexOf(event.x+","+y) === -1){
                    break;
                }
            }
            y += numLoops;
            this._mirroredDataMap[event.x+","+event.y] = {x:event.x, y:y};
            this._mirrorSpacesToEvent[event.x+","+y] = event;
        }
        else{
            this._mirroredDataMap[event.x+","+event.y] = {x:event.x, y:y};
            this._mirrorSpacesToEvent[event.x+","+y] = event;
        }
    }, this);
}

Tilemap.prototype.mirrorEventAtXY = function(x,y){
    return Gimmer_Core.Mirror.mirrorEventAtXY(x, y,this._mirrorEvents);
}

Object.defineProperty(Tilemap.prototype, 'isMirror', {
    get: function() {
        return this._isMirror;
    },
    set: function(value) {
        this._isMirror = (value);
    }
});

Object.defineProperty(Tilemap.prototype, 'mirrorEvents', {
    get: function() {
        return this._mirrorEvents;
    },
    set: function(value) {
        this._mirrorEvents = value;
    }
});