if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

Imported = Imported || {};

if(Gimmer_Core.Fighty === undefined){
    throw "Gimmer_FightyFighty is needed for this plugin.";
}

Gimmer_Core['FightyHitboxHelper'] = {'loaded':true};

console.warn("Gimmer_FightyHitboxHelper :: YOU LEFT A DEBUG PLUGIN ON TURN IT OFF BEFORE LIVE OK?");

//=============================================================================
/*:
 * @plugindesc Helper to support making hitboxes on attack animations
 * @author Gimmer
 * @help
 * ================
 * Gimmer_FightyHitBoxHelper
 * ================
 *
 * This plugin is not meant for production games, only for debugging.
 *
 * Follow the instructions in the Gimmer_FightyFighty plugin until you get to the "make hitboxes" step.
 * It says it's hard to do, but this will make it easy!
 *
 * Press "Ctrl" to enable the plugin.
 * Doing so will save your Animations.json and Hitbox.json file into backups, just in case.
 * WARNING: Make your own backup first too! It's possible that you might accidentally change something you didn't
 * want to, and end up with a backup with the unwanted change over multiple openings of the plugin
 *
 * ==== Changing Hitboxes ====
 * By default the mode will be "Hitboxes"
 *
 * Press your chosen attack key to trigger an attack. Animation frames will go one at a time.
 *
 * Press "n" until you reach the frame you want a hitbox for
 *
 * Press "Alt" to show a yellow placeholder hitbox for this frame.
 * If you already have a defined hitbox, it will be the shape and size of that, otherwise it will be a rectangle
 * using the default width and heigth defined in the plugin parameters.
 *
 * Press w, a, s, and d to move the box up, left, down, and right respectively
 * Holding shift while pressing w, a, s, or d will shrink and grow the box, depending on direction
 * Press e or q rotates clockwise or counterclockwise
 *
 * When you have the box where you want, press "Alt" to save the data into memory.
 * This will not save anything to disk (You'll see a pending changes message on screen)
 *
 * Press "n" to change to the next frame, and repeat these steps.
 *
 * When you are done, press "u" to save the changes to the Hitboxes.json file.
 *
 * ==== Changing Animations ====
 *
 * If you attack animations frames only include a single bitmap, you can move them around with this plugin.
 * (You can tell this if your animation just has a single white box with a 1 in it in the RPG Maker MV animation tool)
 *
 * Press "CTRL" to activate the plugin.
 *
 * Press "t" to toggle debug types to "Animation"
 *
 * Press the button to start an attack, frames will go one at a time
 *
 * Press "n" to move to the frame you want to correct
 *
 * On any given frame, use w, a, s, and d to move the frame.
 * (Rotation not currently available)
 * When you've settled on a location, press "ALT" to save the frame to memory.
 *
 * When you are settled, press "u" to save the Animations.json file
 *
 *
 * @param Default Hitbox Width
 * @type Number
 * @desc What width should the default hitbox be?
 * @default 50
 * Default 50
 *
 * @param Default Hitbox Height
 * @type Number
 * @desc What height should the default hitbox be?
 * @default 25
 * Default 25
 */


var HelperParams = PluginManager.parameters('Gimmer_FightyHitBoxHelper');

Gimmer_Core.FightyHitboxHelper.Freeze = true;
Gimmer_Core.FightyHitboxHelper.PlaceHolderBox = false;
Gimmer_Core.FightyHitboxHelper = []
Gimmer_Core.FightyHitboxHelper.DefaultWidth = Number(HelperParams['Default Hitbox Width']);
Gimmer_Core.FightyHitboxHelper.DefaultHeight = Number(HelperParams['Default Hitbox Height']);
Gimmer_Core.FightyHitboxHelper.BackupCreated = false;
Gimmer_Core.FightyHitboxHelper.Type = 0;
Gimmer_Core.FightyHitboxHelper.DirtyHitboxes = false;
Gimmer_Core.FightyHitboxHelper.DirtyAnimations = false;
Gimmer_Core.FightyHitboxHelper.AnimationChange = {x:0,y:0}

Gimmer_Core.FightyHitboxHelper.setInputMap = function(){
    this.oldInputMap = JSON.parse(JSON.stringify(Input.keyMapper));
}

Gimmer_Core.FightyHitboxHelper.getInputMap = function(){
    return this.oldInputMap;
}

Input.keyMapper[17] = 'freezetoggle'; //ctrl

Gimmer_Core.FightyHitboxHelper.setDebugInputs = function(){
    this.setInputMap();
    Input.keyMapper[18] = 'drawPlaceHolderBox'; //alt
    Input.keyMapper[78] = 'nextframe'; //n
    Input.keyMapper[84] = "typeswap" //t

    Input.keyMapper[87] = "boxup"; //w
    Input.keyMapper[83] = "boxdown"; //a
    Input.keyMapper[65] = "boxleft"; //s
    Input.keyMapper[68] = "boxright"; //d
    Input.keyMapper[16] = "myshift"; //left shift
    Input.keyMapper[81] = "rotatecounterclockwise"; //q
    Input.keyMapper[69] = "rotateclockwise"; //e


    Input.keyMapper[85] = "updatefile"; //u
}

Gimmer_Core.FightyHitboxHelper.revertInput = function(){
    Input.keyMapper = this.getInputMap();
}


Gimmer_Core.FightyHitboxHelper.getAnimationCoordinates = function(object){
    let animationCoords = {x:0,y:0};
    SceneManager._scene._spriteset._characterSprites.forEach(function(sprite){
        if(sprite._character === object){
            animationCoords.x = sprite._animationSprites[0].x;
            animationCoords.y = sprite._animationSprites[0].y;
        }
    });

    return animationCoords;
}

Gimmer_Core.FightyHitboxHelper.createHitboxFrameFromPolygon = function(staringCoords){
    let polygon = Gimmer_Core.FightyHitboxHelper.PlaceHolderBox;
    let frame = {modX: 0, modY: 0, width:0, height:0, angle: 0}
    if(polygon){
        frame.modX = polygon.startingX - staringCoords.x;
        frame.modY = polygon.startingY - staringCoords.y;
        frame.width = polygon.width;
        frame.height = polygon.height;
        frame.angle = polygon.angle;
    }
    return frame;
}

Gimmer_Core.FightyHitboxHelper.saveLocalFile = function(fileName, isBackup, data) {
    if(isBackup){
        fileName += ".bak";
    }

    var fs = require('fs');
    var dirPath = this.localFileDirectoryPath();
    var filePath = dirPath + fileName;
    fs.writeFileSync(filePath, JSON.stringify(data));
};



Gimmer_Core.FightyHitboxHelper.localFileDirectoryPath = function() {
    var path = require('path');
    var base = path.dirname(process.mainModule.filename);
    return path.join(base, 'data/');
};

//Add the debug ui, even if we aren't debugging boxes, so we have somewhere to draw
Gimmer_Core.FightyHitboxHelper.Scene_Map_prototype_createAllWindows = Scene_Map.prototype.createAllWindows;
Scene_Map.prototype.createAllWindows = function(){
    Gimmer_Core.FightyHitboxHelper.Scene_Map_prototype_createAllWindows.call(this);
    if(!('_debugHitBoxWindow' in this)){
        this.addDebugHitBoxWindow();
    }
    this.addSavePopup();
    this.addSnapshotPopup();
}

Scene_Map.prototype.addSavePopup = function(){
    this._savePopUp = new Window_Popup(0,32,100,32, '#000000', 60, 0.1, 0.1);
    this.addChild(this._savePopUp);
}

Scene_Map.prototype.addSnapshotPopup = function(){
    this._snapshotPopup = new Window_Popup(0,Graphics.boxHeight - 32,100,32, '#000000', 60, 0.1, 0.1);
    this._snapshotPopup.drawText("Snapshot Added",0,0,100,'center');
    this.addChild(this._snapshotPopup);
}

Gimmer_Core.FightyHitboxHelper._Scene_Map_prototype_update = Scene_Map.prototype.update
Scene_Map.prototype.update = function (){
    if(Input.isTriggered('freezetoggle')){
        Gimmer_Core.FightyHitboxHelper.Freeze = !Gimmer_Core.FightyHitboxHelper.Freeze;
        if(Gimmer_Core.FightyHitboxHelper.Freeze){
            Gimmer_Core.FightyHitboxHelper.setDebugInputs();
            if(!Gimmer_Core.FightyHitboxHelper.BackupCreated){
                Gimmer_Core.FightyHitboxHelper.saveLocalFile("Hitboxes.json",true, $dataHitboxes);
                Gimmer_Core.FightyHitboxHelper.saveLocalFile("Animations.json",true, $dataAnimations);
                Gimmer_Core.FightyHitboxHelper.BackupCreated = true;
            }
        }
        else{
            Gimmer_Core.FightyHitboxHelper.revertInput();
            Gimmer_Core.FightyHitboxHelper.PlaceHolderBox = false;
        }
    }

    if(Input.isTriggered('updatefile') && Gimmer_Core.FightyHitboxHelper.BackupCreated){
        Gimmer_Core.FightyHitboxHelper.saveLocalFile((Gimmer_Core.FightyHitboxHelper.Type === 0 ? "Hitboxes.json" : "Animations.json"), false, (Gimmer_Core.FightyHitboxHelper.Type === 0 ? $dataHitboxes : $dataAnimations));
        if(Gimmer_Core.FightyHitboxHelper.Type === 0){
            Gimmer_Core.FightyHitboxHelper.DirtyHitboxes = false;
        }
        else{
            Gimmer_Core.FightyHitboxHelper.DirtyAnimations = false;
        }
        this.showSaveNotification();
    }

    Gimmer_Core.FightyHitboxHelper._Scene_Map_prototype_update.call(this);
    if(Gimmer_Core.FightyHitboxHelper.Freeze){
        if(Input.isTriggered('typeswap')){
            Gimmer_Core.FightyHitboxHelper.Type = (Gimmer_Core.FightyHitboxHelper.Type === 0 ? 1: 0);
            if(Gimmer_Core.FightyHitboxHelper.Type === 1 && Gimmer_Core.FightyHitboxHelper.PlaceHolderBox){
                Gimmer_Core.FightyHitboxHelper.PlaceHolderBox = false;
            }
        }
        this.updateDebugText();
    }
}

Scene_Map.prototype.showSaveNotification = function(){
    this._savePopUp.contents.clear();
    let message = (Gimmer_Core.FightyHitboxHelper.Type === 0 ? "Hitboxes Saved" : "Animations Saved");
    let y = this._savePopUp.lineHeight();
    if(Gimmer_Core.FightyHitboxHelper.DirtyAnimations){
        y += this._savePopUp.lineHeight();
    }
    if(Gimmer_Core.FightyHitboxHelper.DirtyHitboxes){
        y += this._savePopUp.lineHeight();
    }

    this._savePopUp.move(this._savePopUp.x, y, this._savePopUp.width, this._savePopUp.height);
    this._savePopUp.drawText(message,0,0,this._savePopUp.width);
    this._savePopUp.open();
}

Scene_Map.prototype.showSnapshotNotification = function(){
    this._snapshotPopup.open();
}

Scene_Map.prototype.updateDebugText = function(){
    //label
    let maxWidth = 150;
    this._debugHitBoxWindow.contents.fontSize = 16;
    this._debugHitBoxWindow.contents.fillRect(0,0,maxWidth,32,"#000000");
    let textY = 0;
    this._debugHitBoxWindow.drawText("DEBUG MODE :: "+(Gimmer_Core.FightyHitboxHelper.Type === 0 ? "Hitboxes" : "Animations"),0,textY,maxWidth);
    if(Gimmer_Core.FightyHitboxHelper.DirtyHitboxes){
        textY += this._debugHitBoxWindow.lineHeight();
        this._debugHitBoxWindow.contents.fillRect(0,textY,maxWidth,this._debugHitBoxWindow.lineHeight(),"#FFAA00");
        this._debugHitBoxWindow.drawText("Unsaved Hitboxes",0,textY,maxWidth);
    }
    if(Gimmer_Core.FightyHitboxHelper.DirtyAnimations){
        textY += this._debugHitBoxWindow.lineHeight();
        this._debugHitBoxWindow.contents.fillRect(0,textY,maxWidth,this._debugHitBoxWindow.lineHeight(),"#FFAABB");
        this._debugHitBoxWindow.drawText("Unsaved Animations",0,textY,maxWidth);
    }

    //Instructions
    let width = 300;
    let lineHeight = this._debugHitBoxWindow.lineHeight();
    let x = Graphics.boxWidth - width;
    this._debugHitBoxWindow.contents.fillRect(x,0, width, Graphics.boxHeight);
    x += 10;
    this._debugHitBoxWindow.drawText("Do an Attack One Frame at a Time", x, 0, width);
    this._debugHitBoxWindow.drawText("--------", x, lineHeight, width);
    this._debugHitBoxWindow.drawText("Buttons", x, lineHeight * 2, width);
    this._debugHitBoxWindow.drawText("--------", x, lineHeight * 3, width);
    this._debugHitBoxWindow.drawText("CTRL :: Stop Debugging", x, lineHeight * 4, width);
    this._debugHitBoxWindow.drawText("t :: change debug type", x, lineHeight * 5, width);
    this._debugHitBoxWindow.drawText("n :: move to next animation frame", x, lineHeight * 6, width);
    this._debugHitBoxWindow.drawText("u :: save the "+(Gimmer_Core.FightyHitboxHelper.Type === 0 ? "hitbox" : "animation")+".json file", x, lineHeight * 7, width);
    if(Gimmer_Core.FightyHitboxHelper.PlaceHolderBox){
        this._debugHitBoxWindow.drawText("ALT :: Save the hitbox for this frame", x, lineHeight * 8, width);
        this._debugHitBoxWindow.drawText("w a s d :: move the hit box up, left, down, and right", x, lineHeight * 9, width);
        this._debugHitBoxWindow.drawText("SHIFT + w a s d :: shrink or grow the hitbox", x, lineHeight * 10, width);
        this._debugHitBoxWindow.drawText("q e :: rotate the hitbox clockwise or counter clockwise", x, lineHeight * 11, width);
    }
    else{
        if(Gimmer_Core.FightyHitboxHelper.Type === 0){
            this._debugHitBoxWindow.drawText("ALT :: Show a hitbox for this frame", x, lineHeight * 8, width);
        }
        else{
            this._debugHitBoxWindow.drawText("ALT :: Save the animation data", x, lineHeight * 8, width);
            this._debugHitBoxWindow.drawText("w a s d :: move the animation frame up, left, down, and right", x, lineHeight * 9, width);
        }
    }
}



Gimmer_Core.FightyHitboxHelper._Sprite_Animation_prototype_update = Sprite_Animation.prototype.update
Sprite_Animation.prototype.update = function(){
    this.updateFreezeCheck();
    if(Gimmer_Core.FightyHitboxHelper.Type === 0){
        this.updateDrawing();
    }
    else{
        this.updateAnimations();
    }

    Gimmer_Core.FightyHitboxHelper._Sprite_Animation_prototype_update.call(this);
}

//Freeze any animations
Sprite_Animation.prototype.updateFreezeCheck = function(){
    if(Gimmer_Core.FightyHitboxHelper.Freeze && this._duration % this._rate === 0){
        this._delay = 1;
    }
    if(Input.isTriggered('nextframe')){
        this._delay = 0;
    }
}

Sprite_Animation.prototype.updateDrawing = function(){
    let madeBoxThisTime = false
    if(!Gimmer_Core.FightyHitboxHelper.PlaceHolderBox && Input.isTriggered('drawPlaceHolderBox')){
        let coords = Gimmer_Core.FightyHitboxHelper.getAnimationCoordinates(this._target._character);
        let width = Gimmer_Core.FightyHitboxHelper.DefaultWidth;
        if(this._animation.id.toString() in $dataHitboxes
            && $dataHitboxes[this._animation.id.toString()][this.currentFrameIndex()]
            && $dataHitboxes[this._animation.id.toString()][this.currentFrameIndex()].width > 0
        ){
            width = $dataHitboxes[this._animation.id.toString()][this.currentFrameIndex()].width;
        }

        let height = Gimmer_Core.FightyHitboxHelper.DefaultHeight;
        if(this._animation.id.toString() in $dataHitboxes
            && $dataHitboxes[this._animation.id.toString()][this.currentFrameIndex()]
            && $dataHitboxes[this._animation.id.toString()][this.currentFrameIndex()].height > 0
        ){
            height = $dataHitboxes[this._animation.id.toString()][this.currentFrameIndex()].height;
        }

        let angle = 0;
        if(this._animation.id.toString() in $dataHitboxes
            && $dataHitboxes[this._animation.id.toString()][this.currentFrameIndex()]
            && $dataHitboxes[this._animation.id.toString()][this.currentFrameIndex()].angle > 0
        ){
            angle = $dataHitboxes[this._animation.id.toString()][this.currentFrameIndex()].angle;
        }

        Gimmer_Core.FightyHitboxHelper.PlaceHolderBox = new Polygon('rectangle',coords.x, coords.y,width,height,angle);
        madeBoxThisTime = true;
    }
    if(Gimmer_Core.FightyHitboxHelper.PlaceHolderBox){
        if(Input.isTriggered('drawPlaceHolderBox') && !madeBoxThisTime){
            //Take a snapshot for the current animation frame
            if(!$dataHitboxes[this._animation.id.toString()]){
                $dataHitboxes[this._animation.id.toString()] = [];
                for(let i = 0; i < this._animation.frames.length; i++){
                    $dataHitboxes[this._animation.id.toString()].push({modX: 0, modY: 0, width:0, height:0, angle: 0});
                }
                Gimmer_Core.FightyHitboxHelper.DirtyHitboxes = true;
            }

            $dataHitboxes[this._animation.id.toString()][this.currentFrameIndex()] = Gimmer_Core.FightyHitboxHelper.createHitboxFrameFromPolygon(Gimmer_Core.FightyHitboxHelper.getAnimationCoordinates(this._target._character))
            Gimmer_Core.FightyHitboxHelper.DirtyHitboxes = true;
            Gimmer_Core.FightyHitboxHelper.PlaceHolderBox = false;
            SceneManager._scene.showSnapshotNotification();
        }
        else{
            let startingX = Gimmer_Core.FightyHitboxHelper.PlaceHolderBox.startingX;
            let startingY = Gimmer_Core.FightyHitboxHelper.PlaceHolderBox.startingY;
            let width = Gimmer_Core.FightyHitboxHelper.PlaceHolderBox.width;
            let height = Gimmer_Core.FightyHitboxHelper.PlaceHolderBox.height;
            let angle = Gimmer_Core.FightyHitboxHelper.PlaceHolderBox.angle;
            if(Input._currentState["myshift"]){
                if(Input.isTriggered('boxup') || Input.isLongPressed('boxup')){
                    height -= 1;
                }
                if(Input.isTriggered('boxdown') || Input.isLongPressed('boxdown')){
                    height += 1;
                }
                if(Input.isTriggered('boxright') || Input.isLongPressed('boxright')){
                    width += 1;
                }
                if(Input.isTriggered('boxleft') || Input.isLongPressed('boxleft')){
                    width -=1;
                }
            }
            else{
                if(Input.isTriggered('boxup') || Input.isLongPressed('boxup')){
                    startingY -= 1;
                }
                if(Input.isTriggered('boxdown') || Input.isLongPressed('boxdown')){
                    startingY += 1;
                }
                if(Input.isTriggered('boxright') || Input.isLongPressed('boxright')){
                    startingX += 1;
                }
                if(Input.isTriggered('boxleft') || Input.isLongPressed('boxleft')){
                    startingX -=1;
                }
            }

            if(Input.isTriggered('rotateclockwise') || Input.isLongPressed('rotateclockwise')){
                if(angle < 359){
                    angle += 1;
                }
                else{
                    angle = 0;
                }
            }

            if(Input.isTriggered('rotatecounterclockwise') || Input.isLongPressed('rotatecounterclockwise')){
                if(angle > 0){
                    angle -= 1
                }
                else{
                    angle = 359;
                }
            }
            Gimmer_Core.FightyHitboxHelper.PlaceHolderBox.updatePosition(startingX,startingY, width,height,angle);
            Gimmer_Core.FightyHitboxHelper.PlaceHolderBox.render(SceneManager._scene._debugHitBoxWindow.contents,"#FFFF00",1);
        }
    }
}

Sprite_Animation.prototype.updateAnimations = function(){
    if(this.currentFrameIndex() >= 0 && $dataAnimations[parseInt(this._animation.id)].frames[this.currentFrameIndex()].length === 1){
        if(Input.isTriggered('drawPlaceHolderBox')){
            $dataAnimations[parseInt(this._animation.id)].frames[this.currentFrameIndex()][0][1] += Gimmer_Core.FightyHitboxHelper.AnimationChange.x;
            $dataAnimations[parseInt(this._animation.id)].frames[this.currentFrameIndex()][0][2] += Gimmer_Core.FightyHitboxHelper.AnimationChange.y;
            Gimmer_Core.FightyHitboxHelper.DirtyAnimations = true;
            SceneManager._scene.showSnapshotNotification();
            Gimmer_Core.FightyHitboxHelper.AnimationChange = {x:0,y:0};
        }
        else{
            if(Input.isTriggered('boxup') || Input.isLongPressed('boxup')){
                this.y -= 1;
                Gimmer_Core.FightyHitboxHelper.AnimationChange.y -= 1;
            }
            if(Input.isTriggered('boxdown') || Input.isLongPressed('boxdown')){
                this.y += 1;
                Gimmer_Core.FightyHitboxHelper.AnimationChange.y += 1;
            }
            if(Input.isTriggered('boxright') || Input.isLongPressed('boxright')){
                this.x += 1;
                Gimmer_Core.FightyHitboxHelper.AnimationChange.x += 1;
            }
            if(Input.isTriggered('boxleft') || Input.isLongPressed('boxleft')){
                this.x -=1;
                Gimmer_Core.FightyHitboxHelper.AnimationChange.x -= 1;
            }
        }
    }
}