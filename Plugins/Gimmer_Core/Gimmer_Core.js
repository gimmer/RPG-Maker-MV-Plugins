var Gimmer_Core = Gimmer_Core || {'debug':false, 'pluginCommands':{}};

Gimmer_Core.pendingCallbacks = {};
Gimmer_Core.areEventsStopped = false;
Gimmer_Core.isPlayerStopped = false;
//=============================================================================
/*:
 * @plugindesc General plugin framework for my other plugins
 * @author Gimmer
 * @help
 * ===========
 * Gimmer_Core
 * ===========
 *
 * Currently this plugin doesn't do very much beyond letting you toggle on some debug console output, and some frameworking for plugin commands.

 * @param debug
 * @parent ---Parameters---
 * @type Boolean
 * @desc Debug messages in console for all Gimmer plugins
 * Default: False
 * @default false
 *
 * @param Advanced Debug
 * @parent debug
 * @type Boolean
 * @desc Debug messages in console will have more information.
 * Default: False
 * @default false
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
    if(command in Gimmer_Core.pluginCommands){
        Gimmer_Core.pluginCommands[command](args);
    }
};

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

Game_Interpreter.prototype.setupReservedCommonEvent = function() {
    if ($gameTemp.isCommonEventReserved()) {
        this.setup($gameTemp.reservedCommonEvent().list, 0, $gameTemp.reservedCommonEvent().id);
        $gameTemp.clearCommonEvent();
        return true;
    } else {
        return false;
    }
};
Gimmer_Core.Game_Interpreter_prototype_setup = Game_Interpreter.prototype.setup;
Game_Interpreter.prototype.setup = function(list, eventId, commonEventId) {
    Gimmer_Core.Game_Interpreter_prototype_setup.call(this,list,eventId);
    this._commonEventId = commonEventId || 0;
};


Gimmer_Core.Game_Interpreter_prototype_terminate = Game_Interpreter.prototype.terminate;
Game_Interpreter.prototype.terminate = function() {
    if(this._commonEventId.toString() in Gimmer_Core.pendingCallbacks && typeof Gimmer_Core.pendingCallbacks[this._commonEventId.toString()] === 'function'){
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

Window_Fade.prototype.fade = function(){
    let numChanged = 0;
    for(var i = 0; i < this.children.length; i++){
        if(this.children[i].alpha > this._desinationAlpha){
            this.children[i].alpha -= 0.1;
            if(this.children[i].alpha < this._desinationAlpha){
                this.children[i].alpha = this._desinationAlpha;
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

Window_Fade.prototype.update = function(){
    Window_Plain.prototype.update.call(this);
    this.updateFade();
}

Window_Fade.prototype.updateFade = function(){
    if(this._fadeForPlayer){
        //Check X
        let minX = this.x;
        let maxX = this.x + this.width;
        let minY = this.y;
        let maxY = this.y + this.height;
        let playerX = $gamePlayer.screenX();
        let playerXmin = playerX - ($gameMap.tileWidth() / 2);
        let playerXmax = playerX + ($gameMap.tileWidth() / 2);
        let playerY = $gamePlayer.screenY();
        let playerYmin = playerY - $gameMap.tileHeight()
        let playerYmax = playerY;
        if( ((playerXmin > minX && playerXmin <= maxX) || (playerXmax > minX && playerXmax <= maxX))
            && ((playerYmin > minY && playerYmin <= maxY) || (playerYmax > minY && playerYmax <= maxY))){
            if(this._fadeLevel === 1){
                this.reserveFade();
            }
        }
        else {
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