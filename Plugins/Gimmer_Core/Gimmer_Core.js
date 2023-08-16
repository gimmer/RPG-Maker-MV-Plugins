if(Gimmer_Core !== undefined){
    throw new Error("You have to load Gimmer_Core before any other gimmer plugins");
}

var Gimmer_Core =  {'debug':false, 'pluginCommands':{}};

var Imported = Imported || {};
Imported['Gimmer_Core'] = "1.6.6";

Gimmer_Core.pendingCallbacks = {};
Gimmer_Core.areEventsStopped = false;
Gimmer_Core.isPlayerStopped = false;
//=============================================================================
/*:
 * @plugindesc v1.6.6 - General plugin framework for my other plugins
 * @author Gimmer
 * @help
 * ===========
 * Gimmer_Core
 * ===========
 *
 * Currently this plugin doesn't do very much beyond letting you toggle on some debug console output, and some frameworking for plugin commands.
 *
 * But you can run the script call:
 * Gimmer_Core.areEventsStopped = true; -> stop events from moving
 * Gimmer_Core.isPlayerStopped = true; -> stop play from moving
 * Gimmer_Core.areEventsStopped = false; -> let events move
 * Gimmer_Core.isPlayerStopped = false; -> let player move
 *
 * And you can disable F5 from reloading the game
 *
 * @param ---Parameters---
 *
 * @param debug
 * @parent ---Parameters---
 * @type Boolean
 * @desc Debug messages in console for all Gimmer plugins
 * Default False
 * @default false
 *
 * @param Advanced Debug
 * @parent debug
 * @type Boolean
 * @desc Debug messages in console will have more information.
 * Default False
 * @default false
 *
 * @param Show Mouse Coordinates
 * @parent ---Parameters---
 * @type Boolean
 * @desc Show mouse coordinates on the screen
 * Default False
 * @default false
 *
 * @param ---Helpers---
 *
 * @param Block F5 Reload
 * @parent ---Helpers---
 * @type Boolean
 * @desc Prevent F5 from reloading the game, good for production builds
 * Default False
 * @default false
 *
 * ===============
 * Version History:
 * ===============
 * - Version 1.0: Initial release
 * - Version 1.1: I don't remember
 * - Version 1.2: better fading windows
 * - Version 1.3: Adding block to reload helper
 * - Version 1.4: parse plugin parameters in double quotes ("") as a single entry
 * - Version 1.4.1: bug fix for " parsing in plugin parameters
 * - Version 1.5: Show mouse cursor for debugging
 * - Version 1.6: Updated Polygon object to old js standard
 * - Version 1.6.1: Updated common event call back framework as it doesn't seem to work anymore
 * - Version 1.6.2: Fix an error occuring when events terminate
 * - Version 1.6.3: Add in support for hiding events via an image tag
 * - Version 1.6.4: Fixed an issue whereby Gimmer_Core would crash if it was loaded after other Gimmer_Core plugins
 * - Version 1.6.5: Fixed bug for Gimmer_Core being added later to a project
 * - Version 1.6.6: Fixed incompabiility with events that don't have meta tag data (E.G. from event spawners)
 *
 * Terms of Use:
 * =======================================================================
 * Free for both commercial and non-commercial use, with credit.
 * More Gimmer_ plugins at: https://github.com/gimmer/RPG-Maker-MV-Plugins
 * =======================================================================
 */

var gParameters = PluginManager.parameters('Gimmer_Core');
Gimmer_Core.debug = (gParameters['debug'] === "true");
Gimmer_Core.advancedDebug = (Gimmer_Core.debug && gParameters['Advanced Debug'] === "true");
Gimmer_Core.blockF5 = (gParameters['Block F5 Reload'] === "true");
Gimmer_Core.showMouseCoords = (gParameters['Show Mouse Coordinates'] === "true");


Gimmer_Core.SceneManager_onKeyDown = SceneManager.onKeyDown;
SceneManager.onKeyDown = function(event) {
    if (Gimmer_Core.blockF5 && !event.ctrlKey && !event.altKey && event.keyCode === 116) {
        return false;
    }
    Gimmer_Core.SceneManager_onKeyDown.call(this, event);
};

if(Gimmer_Core.showMouseCoords){
    //Add a sprite to the
    Gimmer_Core.SceneManager_onSceneStart = SceneManager.onSceneStart;
    SceneManager.onSceneStart = function(){
        if($dataSystem && $dataSystem._windowTone){
            const width = 100;
            const height = 50;
            this._scene._coordWindow = new Window_Plain(Graphics.boxWidth - width, Graphics.boxHeight - height, width, height);
            this._scene.addChild(this._scene._coordWindow);
            this._scene._coordWindow.contents.fontSize = 12;
        }
        Gimmer_Core.SceneManager_onSceneStart.call(this);
    }

    Gimmer_Core.TouchInput_onMouseMove = TouchInput._onMouseMove;
    TouchInput._onMouseMove  = function(event){
        Gimmer_Core.TouchInput_onMouseMove.call(this,event);
        if(SceneManager._scene && SceneManager._scene._coordWindow){
            const x = Graphics.pageToCanvasX(event.pageX);
            const y = Graphics.pageToCanvasY(event.pageY);
            SceneManager._scene._coordWindow.contents.clear();
            SceneManager._scene._coordWindow.contents.drawText(x+","+y, 0, 0,75, 12, "center");
        }
    }
}



//Function for debugging. Uses the DD name because my muscle memory types that when I want to figure out what's broken
function dd(something){
    if(Gimmer_Core.debug){
        console.log(something);
        if(Gimmer_Core.advancedDebug) {
            try {
                throw Error('Debug Info');
            } catch (e) {
                console.log(e.stack);
            }
        }
    }
}

//Support for common events to have callbacks
var Gimmer_Core_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    Gimmer_Core_Interpreter_pluginCommand.call(this, command, args)
    command = command.toUpperCase();
    args = Gimmer_Core.compressArgs(args);
    if(command in Gimmer_Core.pluginCommands){
        return Gimmer_Core.pluginCommands[command](args);
    }
};

Gimmer_Core.compressArgs = function(args){
    if(!args){
        args = [];
    }

    let returnArgs = [];

    let textArg = [];
    for(let i=0;i<args.length;i++){
        if(args[i][0] === '"'){
            if(args[i][args[i].length -1] === '"'){
                returnArgs.push(args[i].replace('"',"").replace('"',""));
            }
            else{
                textArg.push(args[i].replace('"',""));
            }

        }
        else if(args[i][args[i].length -1] === '"'){
            textArg.push(args[i].replace('"',""));
            returnArgs.push(textArg.join(" "));
            textArg = [];
        }
        else if(textArg.length > 0){
            textArg.push(args[i]);
        }
        else{
            returnArgs.push(args[i]);
        }
    }
    return returnArgs;
}

Gimmer_Core.pluginCommands['FADEINBGM'] = function(args){
    let bgm = {
        name: args[1],
        volume: parseInt(args[2]),
        pitch: parseInt(args[3]),
        pan: parseInt(args[4]),
        pos: parseInt(args[5]) || 0
    }

    AudioManager.playBgm(bgm, bgm.pos);
    AudioManager.fadeInBgm(parseInt(args[0]));
}

Gimmer_Core.reserveCommonEventWithCallback = function(commentEventId, callback){
    Gimmer_Core.pendingCallbacks[commentEventId.toString()] = callback;
    $gameTemp.reserveCommonEvent(commentEventId);
}

Gimmer_Core.Game_Interpreter_prototype_setupReservedCommonEvent = Game_Interpreter.prototype.setupReservedCommonEvent;
Game_Interpreter.prototype.setupReservedCommonEvent = function() {
    if ($gameTemp.isCommonEventReserved()) {
        this._commonEventId = $gameTemp.reservedCommonEvent().id;
    }
    return Gimmer_Core.Game_Interpreter_prototype_setupReservedCommonEvent.call(this);
};

Game_Interpreter.prototype.initialize()
Gimmer_Core.Game_Interpreter_prototype_initialize = Game_Interpreter.prototype.initialize;
Game_Interpreter.prototype.initialize = function(depth) {
    Gimmer_Core.Game_Interpreter_prototype_initialize.call(this, depth);
    this._commonEventId = -1;
}

Gimmer_Core.Game_Interpreter_prototype_terminate = Game_Interpreter.prototype.terminate;
Game_Interpreter.prototype.terminate = function() {
    if(this._commonEventId && this._commonEventId.toString() in Gimmer_Core.pendingCallbacks && typeof Gimmer_Core.pendingCallbacks[this._commonEventId.toString()] === 'function'){
        Gimmer_Core.pendingCallbacks[this._commonEventId.toString()]();
        delete Gimmer_Core.pendingCallbacks[this._commonEventId];
    }
    Gimmer_Core.Game_Interpreter_prototype_terminate.call(this);
};

//Quick functionality to stop players and events from moving. Similar to functionality from a no longer available YEP Plugin, but watered down for my needs only
Gimmer_Core.stopEventMovement = function(){
    this.areEventsStopped = true;
}

Gimmer_Core.startEventMovement = function(){
    this.areEventsStopped = false;
}

Gimmer_Core.stopPlayerMovement = function(){
    this.isPlayerStopped = true;
}

Gimmer_Core.startPlayerMovement = function(){
    this.isPlayerStopped = false;
}

//Stop players
Gimmer_Core.Game_Player_prototype_canMove = Game_Player.prototype.canMove;
Game_Player.prototype.canMove = function() {
    if (Gimmer_Core.isPlayerStopped) return false;
    return Gimmer_Core.Game_Player_prototype_canMove.call(this);
};

//Stop Events
Gimmer_Core.Game_Event_prototype_updateSelfMovement = Game_Event.prototype.updateSelfMovement;
Game_Event.prototype.updateSelfMovement = function() {
    if (Gimmer_Core.areEventsStopped || this._moveType === 0) return;
    Gimmer_Core.Game_Event_prototype_updateSelfMovement.call(this);
};


/*
* Popup window support
 */
Gimmer_Core._WindowLayer_prototype_maskWindow = WindowLayer.prototype._maskWindow;
WindowLayer.prototype._maskWindow = function(window, shift) {
    Gimmer_Core._WindowLayer_prototype_maskWindow.call(this, window, shift);
    if('_hideTransparentBackground' in window && window._hideTransparentBackground){
        this._windowRect.height = 0;
        this._windowRect.width = 0;
    }
}

//Make a really simple Window
function Window_Plain() {
    this.initialize.apply(this, arguments);
}

Window_Plain.prototype = Object.create(Window_Base.prototype);
Window_Plain.prototype.constructor = Window_Plain;
Window_Plain.prototype._refreshFrame = function(){}
Window_Plain.prototype._refreshCursor = function(){}
Window_Plain.prototype._refreshPauseSign = function(){}
Window_Plain.prototype._refreshArrows = function (){}
Window_Plain.prototype._refreshBack = function (){}


function Window_Popup() {
    this.initialize.apply(this, arguments);
}

Window_Popup.prototype = Object.create(Window_Plain.prototype);
Window_Popup.prototype.constructor = Window_Popup;

Window_Popup.prototype.initialize = function(x,y,width,height, color, countToSpendOpen, openSpeed, closeSpeed){
    this._openCount = 0;
    this._onClose = false;
    this._countToSpendOpen = countToSpendOpen;
    this._backgroundColor = color;
    this._openSpeed = openSpeed;
    this._closeSpeed = closeSpeed;
    this._hideTransparentBackground = true;
    Window.prototype.initialize.call(this,x,y,width,height);
    this.loadWindowskin();
    this.move(x, y, width, height);
    this.updatePadding();
    this.backOpacity = 255;
    this.alpha = 0;
    this.updateTone();
    this.createContents();
    this._opening = false;
    this._closing = false;
    this._dimmerSprite = null;
    this.refresh();
}

Window_Popup.prototype._refreshBack = function(){
    var w = this._width;
    var h = this._height;
    var bitmap = new Bitmap(w, h);

    this._windowBackSprite.bitmap = bitmap;
    this._windowBackSprite.setFrame(0, 0, w, h);
    this._windowBackSprite.move(0, 0);
    this._windowBackSprite.bitmap.fillAll(this._backgroundColor);
}

Window_Popup.prototype.refresh = function(){
    this.contents.clear();
}

Window_Popup.prototype.update = function(){
    Window_Base.prototype.update.call(this);
    if(this.isOpen() && !this.isClosing()){
        this._openCount -= 1;
        if(this._openCount <= 0){
            this.close();
        }
    }
}

Window_Popup.prototype.updateOpen = function() {
    if (this._opening) {
        this.alpha += this._openSpeed;
        this.alpha = this.alpha.clamp(0,1);
        if (this.isOpen()) {
            this._opening = false;
        }
    }
};

Window_Popup.prototype.close = function(){
    Window_Base.prototype.close.call(this);
    if(this._onClose){
        this._onClose();
    }
}

Window_Popup.prototype.setOnClose = function(onClose){
    if(typeof onClose === 'function'){
        this._onClose = onClose;
    }
}

Window_Popup.prototype.isClosed = function(){
    return (this.alpha === 0);
}

Window_Popup.prototype.isOpen = function(){
    return (this.alpha === 1);
}

Window_Popup.prototype.updateClose = function() {
    if (this._closing) {
        this.alpha -= this._closeSpeed;
        this.alpha = this.alpha.clamp(0,1);
        if (this.isClosed()) {
            this._closing = false;
        }
    }
};

Window_Popup.prototype.open = function(){
    if (!this.isOpen()) {
        this._opening = true;
    }
    this._openCount = this._countToSpendOpen;
    this._closing = false;
}

Window_Popup.prototype._createAllParts = function() {
    this._windowSpriteContainer = new PIXI.Container();
    this._windowBackSprite = new Sprite();
    this._windowCursorSprite = new Sprite();
    this._windowFrameSprite = new Sprite();
    this._windowContentsSprite = new Sprite();
    this._downArrowSprite = new Sprite();
    this._upArrowSprite = new Sprite();
    this._windowPauseSignSprite = new Sprite();
    this._windowBackSprite.bitmap = new Bitmap(1, 1);
    this._windowBackSprite.alpha = 1;
    this.addChild(this._windowSpriteContainer);
    this._windowSpriteContainer.addChild(this._windowBackSprite);
    this._windowSpriteContainer.addChild(this._windowFrameSprite);
    this.addChild(this._windowCursorSprite);
    this.addChild(this._windowContentsSprite);
    this.addChild(this._downArrowSprite);
    this.addChild(this._upArrowSprite);
    this.addChild(this._windowPauseSignSprite);
};

Window_Popup.prototype.standardPadding = function(){
    return 0;
}

//Fading window
function Window_Fade() {
    this.initialize.apply(this, arguments);
}

Window_Fade.prototype = Object.create(Window_Plain.prototype);
Window_Fade.prototype.constructor = Window_Fade;

Window_Fade.prototype.initialize = function(x, y, width, height){
    Window_Plain.prototype.initialize.call(this, x, y, width, height);
    this._fadeForPlayer = true;
    this.setOriginalAlpha();
    this._desinationAlpha = 0;
    this._isFading = false;
    this._fadeLevel = 1;
}

Window_Fade.prototype.setOriginalAlpha = function(){
    this._originalAlpha = [];
    for(var i = 0; i < this.children.length; i++){
        this._originalAlpha.push(this.children[i].alpha);
    }
}

Window_Fade.prototype.reserveFade = function(){
    this._fadeLevel = -1;
    this._isFading = true;
}

Window_Fade.prototype.reserveUnFade = function(){
    this._isFading = true;
    this._fadeLevel = 1;
}

Window_Fade.prototype.fade = function(destinationAlpha){
    if(destinationAlpha === undefined){
        destinationAlpha = this._desinationAlpha;
    }
    let numChanged = 0;
    for(var i = 0; i < this.children.length; i++){
        if(this.children[i].alpha > destinationAlpha){
            this.children[i].alpha -= 0.1;
            if(this.children[i].alpha < destinationAlpha){
                this.children[i].alpha = destinationAlpha;
            }
            numChanged++;
        }
    }
    if(numChanged === 0){ //finished fading
        this._isFading = false;
    }
}
Window_Fade.prototype.fadeIn = function(){
    let numChanged = 0;
    for(var i = 0; i < this.children.length; i++){
        if(this.children[i].alpha < this._originalAlpha[i]){
            this.children[i].alpha += 0.1;
            if(this.children[i].alpha > this._originalAlpha[i]){
                this.children[i].alpha = this._originalAlpha[i];
            }
            numChanged++;
        }
    }
    if(numChanged === 0){ //finished fading
        this._isFading = false;
    }
}

Window_Fade.prototype.fullOpacity = function(){
    for(var i = 0; i < this.children.length; i++){
        this.children[i].alpha = this._originalAlpha[i];
    }
    this._isFading = false;
}

Window_Fade.prototype.update = function(){
    Window_Plain.prototype.update.call(this);
    this.updateFadeForPlayer();
}

Window_Fade.prototype.updateFadeForPlayer = function(){
    if(this._fadeForPlayer){
        let windowPolygon = new Polygon('rectangle',this.x, this.y, this.width, this.height, 0);
        let playerHeight = (ImageManager.isBigCharacter($gamePlayer._characterName) ? $gameMap.tileHeight() * 1.5 : $gameMap.tileHeight());
        let playerStartingY = $gamePlayer.screenY() - playerHeight / 2;
        let playerPolygon = new Polygon('rectangle',$gamePlayer.screenX() - ($gameMap.tileWidth() / 2), playerStartingY, $gameMap.tileWidth(), playerHeight, 0);

        if(playerPolygon.intersects(windowPolygon)){
            if(this._fadeLevel === 1){
                this.reserveFade();
            }
        }
        else{
            if(this._fadeLevel === -1 && !$gamePlayer.isMoving()){
                this.reserveUnFade();
            }
        }
    }
    if(this._isFading){
        if(this._fadeLevel > 0){
            this.fadeIn();
        }
        else{
            this.fade();
        }
    }
}

//Helper Functions

//Reverse an object
Gimmer_Core.reverseObject = function(object){
    var ret = {};
    for(let key in object){
        ret[object[key]] = key;
    }
    return ret;
}

Gimmer_Core.directionsToWords = function(d){
    let directionWord = "";
    switch(d){
        case 2:
            directionWord = "down";
            break;
        case 4:
            directionWord = "left";
            break;
        case 6:
            directionWord = "right";
            break;
        case 8:
            directionWord = "up";
            break;

    }
    return directionWord;
}

Gimmer_Core.wordsToDirections = function(d){
    let direction;
    switch(d){
        case "down":
            direction = 2;
            break;
        case "left":
            direction = 4;
            break;
        case "right":
            direction = 6;
            break;
        case "up":
            direction = 8;
            break;

    }
    return direction;
}

/**
 * =================
 * Game_Event Mod
 * ================
 */

Gimmer_Core.Game_Event_prototype_setImage = Game_Event.prototype.setImage;
Game_Event.prototype.setImage = function (characterName, characterIndex){
    if(this.event().hasOwnProperty('meta') && this.event().meta.hasOwnProperty('hideimg') && Number(this.event().meta.hideimg) === 1){
        this._tileId = 0;
        this._characterName = "";
        this._characterIndex = 0;
        this._isObjectCharacter = false;
    }
    else{
        Gimmer_Core.Game_Event_prototype_setImage.call(this,characterName, characterIndex);
    }
}
Gimmer_Core.Game_Event_prototype_setTileImage = Game_Event.prototype.setTileImage;
Game_Event.prototype.setTileImage = function(tileId){
    if(this.event().meta.hasOwnProperty('hideimg') && Number(this.event().meta.hideimg) === 1){
        this._tileId = 0;
        this._characterName = "";
        this._characterIndex = 0;
        this._isObjectCharacter = false;
    }
    else{
        Gimmer_Core.Game_Event_prototype_setTileImage.call(this, tileId);
    }
}


//Helper to draw a rectangle border without a fill.
Bitmap.prototype.drawRectBorder = function(x, y, width, height, borderColor, thickness = 1){
    var context = this._context;
    context.save();
    context.strokeStyle = borderColor;
    context.lineWidth = thickness;
    context.strokeRect(x, y, width, height);
    context.rotation = 45;
    context.restore();
    this._setDirty();
}

//Helper to check for undefined
Gimmer_Core.isUndefined = function(variable){
    return (typeof variable === 'undefined');
}

//Helper to capitalize a string
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1)
}

//Polygon class to be used inside of hitboxes. Can be created, and then rotated using math
//The math is provided with the disclaimer that it came from the internet rather than my brain
function Polygon(type, startingX, startingY, width, height, angle) {
    this.type = type;
    this.startingX = startingX;
    this.startingY = startingY;
    this.width = width;
    this.height = height;
    this.angle = angle;
    this.updatePosition();
}

Polygon.prototype.cloneBase = function(){
    return new Polygon(this.type, this.startingX, this.startingY, this.width, this.height, 0);
}

Polygon.prototype.createPoints = function(){
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

Polygon.prototype.updatePosition = function(x,y, width, height, angle){
    x = x || this.startingX;
    y = y || this.startingY;
    if(width !== 0){
        width = width || this.width;
    }
    if(height !== 0){
        height = height || this.height;
    }

    if(angle !== 0){
        angle = angle || this.angle;
    }

    this.startingX = x;
    this.startingY = y;
    this.width = width;
    this.height = height;
    this.angle = angle;
    this.pivotPoint = {x:this.startingX, y: this.startingY + (this.height / 2)}
    this.createPoints();
    this.rotate();
}

Polygon.prototype.rotate = function(){
    if(this.angle > 0){
        this.points.forEach(function(point, k){
            this.points[k] = this.rotatePoint(point.x, point.y, this.pivotPoint.x, this.pivotPoint.y, this.angle);
        }, this);
    }
}

Polygon.prototype.rotatePoint = function(pointX, pointY, originX, originY, angle) {
    angle = angle * Math.PI / 180.0;
    return {
        x: Math.cos(angle) * (pointX-originX) - Math.sin(angle) * (pointY-originY) + originX,
        y: Math.sin(angle) * (pointX-originX) + Math.cos(angle) * (pointY-originY) + originY
    };
}

//Flat out copied this from stack overflow
Polygon.prototype.intersects = function(otherPolygon){
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
Polygon.prototype.render = function(bitmap, color, thickness){
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

Bitmap.prototype.fillImage = function (color, fillDirection, fillPercent){
    let cutOffX;
    let cutOffY;
    if(!fillDirection){
        fillDirection = "horizontal";
    }

    if(!fillPercent){
        fillPercent = 100;
    }
    else{
        fillPercent = Math.round(fillPercent);
    }

    fillPercent = fillPercent.clamp(0,100);

    if(fillPercent < 100){
        let percent = fillPercent / 100;
        if(fillDirection === "horizontal"){
            cutOffX = Math.floor(this.width * percent);
        }
        else{
            cutOffY = Math.floor(this.height * percent);
        }
    }
    this._fill = fillPercent;
    let points = [];
    let transparentPoints = [];
    for(let x = 0; x < this.width; x++){
        for(let y = 0; y < this.height; y++){
            if(this.getAlphaPixel(x,y) > 0){
                if(cutOffY && y > cutOffY){
                    transparentPoints.push({x:x,y:y});
                }
                else if(cutOffX && x > cutOffX){
                    transparentPoints.push({x:x,y:y});
                }
                else{
                    points.push({x:x,y:y});
                }

            }
        }
    }

    points.forEach(function(point){
        this.fillRect(point.x,point.y,1,1, color);
    },this);

    transparentPoints.forEach(function(point){
        this.clearRect(point.x,point.y,1,1);
    },this);
}