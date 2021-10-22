var Imported = Imported || {};

if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

Gimmer_Core['TextEntryPopup'] = {'loaded':true};

//=============================================================================
/*:
 * @plugindesc v1.1 - Show a text popup that you can type in.
 * @author Gimmer_
 * @help
 * ====================
 * Gimmer_TextEntryPopup
 * ====================
 *
 * Run the plugin command ShowPopup to show the window
 * Syntax:
 * ShowPopup maxLengthNumber placeholdertext descriptionText
 *
 * Run the plugin command HidePopup to hide the window
 *
 * Use the script call "Gimmer_Core.TextEntryPopup.lastEntry()" in a condition branch to get the text that was most recent entered.
 * The text clears if the window opens again
 *
 * Terms of Use:
 * =======================================================================
 * Free for both commercial and non-commercial use, with credit.
 * More Gimmer_ plugins at: https://github.com/gimmer/RPG-Maker-MV-Plugins
 * =======================================================================
 *
 * @param ---Window Parameters---
 *
 * @param Window X
 * @parent ---Window Parameters---
 * @type String
 * @desc Text Window X
 * @default 0
 * Default 0
 *
 * @param Window Y
 * @parent ---Window Parameters---
 * @type String
 * @desc Text Window Y
 * @default Graphics.boxHeight / 4
 * Default Graphics.boxHeight / 4
 *
 * @param Window Width
 * @parent ---Window Parameters---
 * @type String
 * @desc Text Window Width
 * @default Graphics.boxWidth
 * Default Graphics.boxWidth
 *
 * @param Window Height
 * @parent ---Window Parameters---
 * @type String
 * @desc Text Window Height
 * @default Graphics.boxHeight / 2
 * Default Graphics.boxHeight / 2
 *
 * @param Window Background Color
 * @parent ---Window Parameters---
 * @type String
 * @desc Window Background Color hex code (default black)
 * @default 000000
 * Default 000000
 *
 * @param Window Opacity
 * @parent ---Window Parameters---
 * @type Number
 * @desc Opacity of text window
 * @min 1
 * @max 255
 * Default: 255
 * @default 255
 *
 * @param ---Text Placement Parameters---
 * @parent ---Window Parameters---
 *
 * @param Y Offset of Entry Line
 * @parent ---Text Placement Parameters---
 * @type String
 * @desc Y offset for the text entry line in the window
 * @default 0
 * Default 0
 *
 * @param Y Offset of Description
 * @parent ---Text Placement Parameters---
 * @type String
 * @desc Y offset for the description in the window (this, in context, is the text popup window)
 * @default this.height / 2
 * Default this.height / 2
 *
 * @param ---Default Parameters---
 *
 * @param Default Max Length
 * @parent ---Default Parameters---
 * @type Number
 * @desc Default Max Length of characters
 * @min 1
 * @max 100
 * Default: 20
 * @default 20
 *
 * @param Default Description
 * @parent ---Default Parameters---
 * @type String
 * @desc Default description under the input
 *
 * @param Default Placeholder Text
 * @parent ---Default Parameters---
 * @type String
 * @desc Default value for all inputs. Just leave blank if you don't want it
 *
 * @param ---Misc Parameters---
 *
 * @param All Lower Case
 * @parent ---Misc Parameters---
 * @type Boolean
 * @desc Treat all entries as lower case for the purposes of later conditional checks?
 * @default True
 * Default True
 *
 */

var tepp = PluginManager.parameters('Gimmer_TextEntryPopup');
Gimmer_Core.TextEntryPopup.windowX = tepp['Window X'].toString();
Gimmer_Core.TextEntryPopup.windowY = tepp['Window Y'].toString();
Gimmer_Core.TextEntryPopup.windowWidth = tepp['Window Width'].toString();
Gimmer_Core.TextEntryPopup.windowHeight = tepp['Window Height'].toString();
Gimmer_Core.TextEntryPopup.windowColor = tepp['Window Background Color'];
Gimmer_Core.TextEntryPopup.windowOpacity = Number(tepp['Window Opacity']);

//Defaults:
Gimmer_Core.TextEntryPopup.DefaultMaxLength = Number(tepp['Default Max Length']);
Gimmer_Core.TextEntryPopup.DefaultDescription = tepp['Default Description'];
Gimmer_Core.TextEntryPopup.DefaultStartingText = tepp['Default Placeholder Text'];

//todo maybe fonts?
//font of description
//font of entry

Gimmer_Core.TextEntryPopup.TextY = tepp['Y Offset of Entry Line'].toString();
Gimmer_Core.TextEntryPopup.DescriptionY = tepp['Y Offset of Description'].toString();

//Misc
Gimmer_Core.TextEntryPopup.lowerCaseInput = (tepp['All Lower Case'] === "true");


Gimmer_Core.TextEntryPopup.isWindowOpen = function (){
    return ('_scene' in SceneManager && SceneManager._scene && '_textEntryPopup' in SceneManager._scene && SceneManager._scene._textEntryPopup.visible);
}

Gimmer_Core.TextEntryPopup.lastEntry = function(){
    let text = "";
    if('_scene' in SceneManager && SceneManager._scene && '_enteredText' in SceneManager._scene){
        text = SceneManager._scene._enteredText;
        if(Gimmer_Core.TextEntryPopup.lowerCaseInput){
            text = text.toLowerCase();
        }
    }
    return text;
}

Gimmer_Core.pluginCommands['SHOWPOPUP'] = function (params){
    if(SceneManager._scene.constructor === Scene_Map){
        $gameMap._interpreter.setWaitMode("textEntry");
        if(!params){
            params = [];
        }
        SceneManager._scene._textEntryPopup.setInitial(params[0],params[1],params[2])
        SceneManager._scene._showPopup = true;
        SceneManager._scene._enteredText = "";
    }
}

Gimmer_Core.pluginCommands['HIDEPOPUP'] = function (){
    if(SceneManager._scene.constructor === Scene_Map){
        SceneManager._scene._hidePopup = true;
    }
}

Gimmer_Core.TextEntryPopup.getKeyPressed = function(event){
    if(Window_NameInput.LATIN1.indexOf(event.key) > -1 || Window_NameInput.LATIN2.indexOf(event.key) > -1 ){
        return "letter";
    }

    return event.code;
}

Gimmer_Core.TextEntryPopup._Scene_Map_prototype_createAllWindows = Scene_Map.prototype.createAllWindows;
Scene_Map.prototype.createAllWindows = function(){
    Gimmer_Core.TextEntryPopup._Scene_Map_prototype_createAllWindows.call(this);
    this.createPopupWindow();
    this._showPopup = false;
    this._hidePopup = false;
    this._enteredText = "";
}

Gimmer_Core.TextEntryPopup._Game_Interpreter_prototype_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
Game_Interpreter.prototype.updateWaitMode = function(){
    let waiting = false;
    if(this._waitMode === "textEntry"){
        waiting = Gimmer_Core.TextEntryPopup.isWindowOpen() || SceneManager._scene._showPopup;
    }
    if(!waiting){
        return Gimmer_Core.TextEntryPopup._Game_Interpreter_prototype_updateWaitMode.call(this);
    }
    else{
        return waiting;
    }
}

Scene_Map.prototype.createPopupWindow = function(){
    this._textEntryPopup = new Window_TextInput(
        eval(Gimmer_Core.TextEntryPopup.windowX),
        eval(Gimmer_Core.TextEntryPopup.windowY),
        eval(Gimmer_Core.TextEntryPopup.windowWidth),
        eval(Gimmer_Core.TextEntryPopup.windowHeight)
    );
    this._textEntryPopup.setInitial();
    this._textEntryPopup.visible = false;
    this.addWindow(this._textEntryPopup);
}

Scene_Map.prototype.onInputOk = function(text){
    this._enteredText = text;
    SoundManager.playOk();
    this._hidePopup = true;
}

Gimmer_Core.TextEntryPopup._Scene_Map_prototype_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function(){
    Gimmer_Core.TextEntryPopup._Scene_Map_prototype_update.call(this);
    if(this._showPopup){
        this._textEntryPopup.visible = true;
        this._textEntryPopup.active = true;
        this.rigKeyboard();
        this._showPopup = false;
    }
    if(this._hidePopup){
        this._textEntryPopup.visible = false;
        this._textEntryPopup.active = false;
        this.revertKeyboard();
        this._hidePopup = false;
    }
}

Scene_Map.prototype.rigKeyboard = function(){
    document.addEventListener('keydown', this.onKeyDown);
}

Scene_Map.prototype.revertKeyboard = function (){
    document.removeEventListener('keydown', this.onKeyDown);
}

Scene_Map.prototype.onKeyDown = function(event){
    let popup = SceneManager._scene._textEntryPopup;
    let keyPressed = Gimmer_Core.TextEntryPopup.getKeyPressed(event);
    switch(keyPressed){
        case 'Enter':
            SceneManager._scene.onInputOk(SceneManager._scene._textEntryPopup._textArray.join(''));
            break;
        case 'Backspace':
            popup.backspace();
            break;
        case 'letter':
            popup.setLetter(event.key);
            break;
    }
}

//Text Input Window
function Window_TextInput() {
    this.initialize.apply(this, arguments);
}

Window_TextInput.prototype = Object.create(Window_Plain.prototype);
Window_TextInput.prototype.constructor = Window_TextInput;

Window_TextInput.prototype.initialize = function(x, y, width, height) {
    Window_Plain.prototype.initialize.call(this, x, y, width, height);
    this._backgroundColor = Gimmer_Core.TextEntryPopup.windowColor;
    this._windowBackSprite.opacity = Gimmer_Core.TextEntryPopup.windowOpacity; //param
    this._max = 0;
    this._text = "";
    this._textArray = [];
    this._description = "";
    this._currentCursor = 0;
    this._startingX = 0;
    this._textY = eval(Gimmer_Core.TextEntryPopup.TextY);
    this._descriptionY = eval(Gimmer_Core.TextEntryPopup.DescriptionY);
};

Window_TextInput.prototype.setInitial = function(max, startingText, description) {
    this._max = max || Gimmer_Core.TextEntryPopup.DefaultMaxLength;
    this._text = startingText || Gimmer_Core.TextEntryPopup.DefaultStartingText;
    this._textArray = this._text.split('');
    this._currentCursor = this._textArray.length;
    this._description = description || Gimmer_Core.TextEntryPopup.DefaultDescription;
}

Window_TextInput.prototype._refreshBack = function(){
    let w = this._width;
    let h = this._height;

    this._windowBackSprite.bitmap = new Bitmap(w, h);
    this._windowBackSprite.setFrame(0, 0, w, h);
    this._windowBackSprite.move(0, 0);
    this._windowBackSprite.bitmap.fillAll(this._backgroundColor);
}

Window_TextInput.prototype.populateTextSpaces = function(){
    let fullWidth = this.charWidth() * this._max;
    this._startingX = (this.width / 2) - (fullWidth / 2); //Where should the textBoxes start
    for(var i = 0; i < this._max; i++){
        this.drawUnderline(i);
    }
}

Window_TextInput.prototype.underlineRect = function(index) {
    var rect = this.itemRect(index);
    rect.x++;
    rect.y += rect.height - 4;
    rect.width -= 2;
    rect.height = 2;
    return rect;
};

Window_TextInput.prototype.drawUnderline = function(index) {
    var rect = this.underlineRect(index);
    var color = this.normalColor();
    this.contents.paintOpacity = 48;
    this.contents.fillRect(rect.x, rect.y, rect.width, rect.height, color);
    this.contents.paintOpacity = 255;
};


Window_TextInput.prototype.setLetter = function(letter){
    letter = letter.toString();
    if(this._textArray.length >= this._max){
        SoundManager.playCancel()
    }
    else{
        if(this._currentCursor > this._textArray.length){
            this._textArray.push(letter);
        }
        else{
            this._textArray[this._currentCursor] = letter;
        }
        this._currentCursor++;
        this.refresh();
    }
}

Window_TextInput.prototype.itemRect = function(index){
    return {
        x: this._startingX + index * this.charWidth(),
        y: this._textY,
        width: this.charWidth(),
        height: this.lineHeight()
    };
}

Window_TextInput.prototype.charWidth = function() {
    var text = $gameSystem.isJapanese() ? '\uff21' : 'A';
    return this.textWidth(text);
};

Window_TextInput.prototype.backspace = function(){
    if(this._currentCursor > 0){
        this._textArray.splice(this._currentCursor-1,1);
        this._currentCursor--;
    }
}

Window_TextInput.prototype.update = function (){
    this.refresh();
}

Window_TextInput.prototype.refresh = function(){
    this.contents.clear();
    this.populateTextSpaces();
    for(let i = 0; i < this._textArray.length; i++){
        this.drawText(this._textArray[i], this._startingX + this.charWidth() * i, this._textY, this.width);
    }

    this.drawText(this._description, 0, this._descriptionY, this.width, 'center');
}

//Override input if window is showing

Gimmer_Core.TextEntryPopup._Input_onKeyDown = Input._onKeyDown;
Input._onKeyDown = function(event){
    if(!Gimmer_Core.TextEntryPopup.isWindowOpen()){
        Gimmer_Core.TextEntryPopup._Input_onKeyDown.call(this, event);
    }
}

Gimmer_Core.TextEntryPopup._TouchInput_isPressed = TouchInput.isPressed
TouchInput.isPressed = function() {
    if(Gimmer_Core.TextEntryPopup.isWindowOpen()){
        return false;
    }
    else{
        return Gimmer_Core.TextEntryPopup._TouchInput_isPressed.call(this);
    }
};