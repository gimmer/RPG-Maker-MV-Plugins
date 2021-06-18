if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

Imported = Imported || {}

Gimmer_Core['ControllerType'] = {'loaded':true};

//=============================================================================
/*:
 * @plugindesc v1.1 - Add a plugin command to return controller type
 * @author Gimmer_
 * @help Use the plugin command GimmerControllerType to get if the controller is Xbox, Playstation, or Other layouts
 *
 * ===========
 * Gimmer_ControllerType
 * ===========
 *
 * Terms of Use:
 * =======================================================================
 * Free for both commercial and non-commercial use, with credit.
 * More Gimmer_ plugins at: https://github.com/gimmer/RPG-Maker-MV-Plugins
 * =======================================================================
 *
 * @param Keyboard Ok
 * @parent ---Parameters---
 * @type select
 * @option z
 * @option space
 * @option enter
 * @desc What button do you want to display as the primary ok button for Keyboard?
 * Default: z
 * @default z
 *
 * @param Keyboard Menu
 * @parent ---Parameters---
 * @type select
 * @option x
 * @option escape
 * @option insert
 * @option numpad0
 * @desc What button do you want to display as the primary menu button for Keyboard?
 * Default: x
 * @default x
 *
 * @param Keyboard System Menu
 * @parent ---Parameters---
 * @type select
 * @option x
 * @option escape
 * @option insert
 * @option numpad0
 * @desc What button do you want to display as the primary system menu button for Keyboard? (Only used with the Gimmer_SystemMenu plugin)
 * Default: escape
 * @default escape
 *
 * @param Keyboard Cancel
 * @parent ---Parameters---
 * @type select
 * @option x
 * @option escape
 * @option insert
 * @option numpad0
 * @desc What button do you want to display as the primary cancel button for Keyboard?
 * Default: x
 * @default x
 *
 * @param Keyboard Page Up
 * @parent ---Parameters---
 * @type select
 * @option pageup
 * @option q
 * @desc What button do you want to display as the primary page up button for Keyboard?
 * Default: q
 * @default q
 *
 * @param Keyboard Page Down
 * @parent ---Parameters---
 * @type select
 * @option pagedown
 * @option w
 * @desc What button do you want to display as the primary page down button for Keyboard?
 * Default: w
 * @default w
 *
 * @param Game Pad Index
 * @parent ---Parameters---
 * @desc ADVANCED: your own game pad index to map buttons to specific icons
 * @type struct<GamePadIndexMap>
 *
 * @param Keyboard Index
 * @parent ---Parameters---
 * @desc ADVANCED: your own key board index to map keyboard keys used by RPG Maker MV to specific icons
 * @type struct<KeyboardIndexMap>
 */

/*~struct~GamePadIndexMap:
 * @param 0
 * @desc icon info for button 0
 * @type struct<IconData>
 *
 * @param 1
 * @desc icon info for button 1
 * @type struct<IconData>
 *
 * @param 2
 * @desc icon info for button 2
 * @type struct<IconData>
 *
 * @param 3
 * @desc icon info for button 3
 * @type struct<IconData>
 *
 * @param 4
 * @desc icon info for button 4
 * @type struct<IconData>
 *
 * @param 5
 * @desc icon info for button 5
 * @type struct<IconData>
 *
 * @param directions
 * @desc icon info for direction pad
 * @type struct<IconData>
 *
 */

/*~struct~KeyboardIndexMap:
 * @param enter
 * @desc icon info for enter key
 * @type struct<IconData>
 *
 * @param space
 * @desc icon info for space bar
 * @type struct<IconData>
 *
 * @param z
 * @desc icon info for z key
 * @type struct<IconData>
 *
 * @param escape
 * @desc icon info for escape key
 * @type struct<IconData>
 *
 * @param insert
 * @desc icon info for insert key
 * @type struct<IconData>
 *
 * @param x
 * @desc icon info for x key
 * @type struct<IconData>
 *
 * @param numpad0
 * @desc icon info for numpad 0 key
 * @type struct<IconData>
 *
 * @param shift
 * @desc icon info for shift key
 * @type struct<IconData>
 *
 * @param pageup
 * @desc icon info for pageup key
 * @type struct<IconData>
 *
 * @param pagedown
 * @desc icon info for pagedown key
 * @type struct<IconData>
 *
 * @param q
 * @desc icon info for q key
 * @type struct<IconData>
 *
 * @param w
 * @desc icon info for w key
 * @type struct<IconData>
 *
 * @param directions
 * @desc icon info for direction pad
 * @type struct<IconData>
 *
 */

/*~struct~IconData:
 * @param iconIndex
 * @type Number
 *
 * @param iconUnitWidth
 * @desc Multiplier of _iconWidth that makes up the width of this icon, usually 1
 * @type Number
 * @default 1
 * @Default 1
 *
 * @param iconYMod
 * @desc What iconNumber needs to be added to move to the row this icon is in (0,16,32, etc. assuming 16 icons per row)
 * @type Number
 *
 */

var ctParameters = PluginManager.parameters('Gimmer_ControllerType');
Gimmer_Core.ControllerType.ProvidedKeyBoardMap = {}
Gimmer_Core.ControllerType.ProvidedKeyBoardMap['ok'] = ctParameters['Keyboard Ok'];
Gimmer_Core.ControllerType.ProvidedKeyBoardMap['menu'] = ctParameters['Keyboard Menu'];
Gimmer_Core.ControllerType.ProvidedKeyBoardMap['system'] = ctParameters['Keyboard System Menu'];
Gimmer_Core.ControllerType.ProvidedKeyBoardMap['cancel'] = ctParameters['Keyboard Cancel'];
Gimmer_Core.ControllerType.ProvidedKeyBoardMap['shift'] = 'shift';
Gimmer_Core.ControllerType.ProvidedKeyBoardMap['pageup'] = ctParameters['Keyboard Page Up'];
Gimmer_Core.ControllerType.ProvidedKeyBoardMap['pagedown'] = ctParameters['Keyboard Page Down'];
Gimmer_Core.ControllerType.ProvidedKeyBoardMap['directions'] = 'directions';
Gimmer_Core.ControllerType.CustomGamePadIndexMap = (ctParameters['Game Pad Index'].length > 0 ? JSON.parse(ctParameters['Game Pad Index']) : "");
Gimmer_Core.ControllerType.CustomKeyboardIndexMap = (ctParameters['Keyboard Index'].length > 0 ? JSON.parse(ctParameters['Keyboard Index']) : "");

//Function to validate provided custom gamepad index map
Gimmer_Core.ControllerType.validateGamePadIndexMap = function(){
    if(typeof this.CustomGamePadIndexMap === "object"){
        let valid = true;
        Object.keys(this.CustomGamePadIndexMap).every(function(value){
            if(typeof this.CustomGamePadIndexMap[value] === 'object'
                && 'iconIndex' in this.CustomGamePadIndexMap[value]
                && 'iconUnitWidth' in this.CustomGamePadIndexMap[value]
                && 'iconYMod' in this.CustomGamePadIndexMap[value]
            ){
                this.CustomGamePadIndexMap[value].iconIndex = Number(this.CustomGamePadIndexMap[value].iconIndex);
                this.CustomGamePadIndexMap[value].iconUnitWidth = Number(this.CustomGamePadIndexMap[value].iconUnitWidth);
                this.CustomGamePadIndexMap[value].iconYMod = Number(this.CustomGamePadIndexMap[value].iconYMod);
                return true;
            }
            valid = false;
            return true;
        }, this);
        if(!valid){
            this.setDefaultGamepadIndexMap();
        }
        else{
            this.GamePadIndexMap = this.CustomGamePadIndexMap;
        }
    }
    else{
        this.setDefaultGamepadIndexMap();
    }
}

//Function to validate provided custom keyboard index map
Gimmer_Core.ControllerType.validateKeyboardPadIndexMap = function(){
    if(typeof this.CustomKeyboardIndexMap === "object"){
        let valid = true;
        Object.keys(this.CustomKeyboardIndexMap).every(function(value){
            if(typeof this.CustomKeyboardIndexMap[value] === 'object'
                && 'iconIndex' in this.CustomKeyboardIndexMap[value]
                && 'iconUnitWidth' in this.CustomKeyboardIndexMap[value]
                && 'iconYMod' in this.CustomKeyboardIndexMap[value]
            ){
                this.CustomKeyboardIndexMap[value].iconIndex = Number(this.CustomKeyboardIndexMap[value].iconIndex);
                this.CustomKeyboardIndexMap[value].iconUnitWidth = Number(this.CustomKeyboardIndexMap[value].iconUnitWidth);
                this.CustomKeyboardIndexMap[value].iconYMod = Number(this.CustomKeyboardIndexMap[value].iconYMod);
                return true;
            }
            valid = false;
            return true;
        }, this);
        if(!valid){
            this.setDefaultKeyboardIndexMap();
        }
        else{
            this.KeyboardIndexMap = this.CustomKeyboardIndexMap;
        }
    }
    else{
        this.setDefaultKeyboardIndexMap();
    }
}

//Set default index map
Gimmer_Core.ControllerType.setDefaultGamepadIndexMap = function(){
    this.GamePadIndexMap = {
        '0': {iconIndex: 3, iconUnitWidth: 1, iconYMod: 0}, //Ok
        '1': {iconIndex: 2, iconUnitWidth: 1, iconYMod: 0}, //Cancel
        '2': {iconIndex: 1, iconUnitWidth: 1, iconYMod: 0}, //menu
        '3': {iconIndex: 0, iconUnitWidth: 1, iconYMod: 0}, //shift
        '4': {iconIndex: 7, iconUnitWidth: 2, iconYMod: 0}, //LB
        '5': {iconIndex: 5, iconUnitWidth: 2, iconYMod: 0}, //RB
        '8': {iconIndex: -1, iconUnitWidth: 1, iconYMod: 0}, //Select or "middle button on left"
        '9': {iconIndex: -1, iconUnitWidth: 1, iconYMod: 0}, //start or "middle button on right"
        'directions': {iconIndex: 4, iconUnitWidth: 1, iconYmod: 0} // directionPad
    }
}

//Set default keyboard map
Gimmer_Core.ControllerType.setDefaultKeyboardIndexMap = function(){
    this.KeyboardIndexMap = {
        'enter' : {iconIndex: 8, iconUnitWidth: 2, iconYMod: 48},
        'space' : {iconIndex: 11, iconUnitWidth: 3, iconYMod: 32},
        'z': {iconIndex: 5, iconUnitWidth: 1, iconYMod: 32},
        //menu / cancel
        'escape': {iconIndex: 14, iconUnitWidth: 1, iconYMod: 32},
        'insert': {iconIndex: -1, iconUnitWidth: 1, iconYMod: 32},
        'x': {iconIndex: 6, iconUnitWidth: 1, iconYMod: 32},
        'numpad0': {iconIndex: 14, iconUnitWidth: 2, iconYMod: 48},
        'shift': {iconIndex: 2, iconUnitWidth: 2, iconYMod: 48},
        //Pageup / page down
        'pageup': {iconIndex: 4, iconUnitWidth: 1, iconYMod: 48},
        'pagedown': {iconIndex: 5, iconUnitWidth: 1, iconYMod: 48},
        'q': {iconIndex: 13, iconUnitWidth: 1, iconYMod: 48},
        'w': {iconIndex: 0, iconUnitWidth: 1, iconYMod: 32},
        //directions
        'directions': {iconIndex: 1, iconUnitWidth: 2, iconYMod: 64}
    }
}


//Validate and include custom maps if provided
Gimmer_Core.ControllerType.validateGamePadIndexMap();
Gimmer_Core.ControllerType.validateKeyboardPadIndexMap();

//Constants
Gimmer_Core.ControllerType.TYPE_SONY = 'playstation';
Gimmer_Core.ControllerType.TYPE_MICROSOFT = 'xbox';
Gimmer_Core.ControllerType.TYPE_NONE = 'none';
Gimmer_Core.ControllerType.TYPE_OTHER = 'other';

//Reserve the system image at startup
ImageManager.reserveSystem('GimmerControllerIconSet');

//Extend Input to support recording last input
Input._onKeyDown = function(event) {
    if (this._shouldPreventDefault(event.keyCode)) {
        event.preventDefault();
    }
    if (event.keyCode === 144) {    // Numlock
        this.clear();
    }
    var buttonName = this.keyMapper[event.keyCode];
    if (ResourceHandler.exists() && buttonName === 'ok') {
        ResourceHandler.retry();
    } else if (buttonName) {
        this._currentState[buttonName] = true;
        this.lastInputType = 'keyboard';
    }
};

//Extend _updateGamepadState to support recording last input:
//I hate doing a full replace, but the nature of the code doesn't work for what I want to do
Input._updateGamepadState = function(gamepad) {
    var lastState = this._gamepadStates[gamepad.index] || [];
    var newState = [];
    var buttons = gamepad.buttons;
    var axes = gamepad.axes;
    var threshold = 0.5;
    newState[12] = false;
    newState[13] = false;
    newState[14] = false;
    newState[15] = false;
    for (var i = 0; i < buttons.length; i++) {
        newState[i] = buttons[i].pressed;
    }
    if (axes[1] < -threshold) {
        newState[12] = true;    // up
    } else if (axes[1] > threshold) {
        newState[13] = true;    // down
    }
    if (axes[0] < -threshold) {
        newState[14] = true;    // left
    } else if (axes[0] > threshold) {
        newState[15] = true;    // right
    }
    for (var j = 0; j < newState.length; j++) {
        if (newState[j] !== lastState[j]) {
            var buttonName = this.gamepadMapper[j];
            if (buttonName) {
                this._currentState[buttonName] = newState[j];
                if(newState[j]){
                    this.lastInputType = 'gamepad';
                }
            }
        }
    }
    this._gamepadStates[gamepad.index] = newState;
};

/**
 * The last input that went in
 *
 * @static
 * @property lastInputType
 * @type String
 */
Object.defineProperty(Input, 'lastInputType', {
    get: function() {
        return this._lastInputType;
    },
    set: function (type){
        this._lastInputType = type;
    },
    configurable: true
});


//Helper function to get the controller type as a string
Gimmer_Core.ControllerType.getControllerTypeIfPresent = function(){
    let controllerType = this.TYPE_NONE;
    if (navigator.getGamepads && Input.lastInputType === 'gamepad') {
        var gamepads = navigator.getGamepads();
        if (gamepads) {
            for (var i = 0; i < gamepads.length; i++) {
                var gamepad = gamepads[i];
                if (gamepad && gamepad.connected) {
                    controllerType = this.getControllerType(gamepad);
                }
            }
        }
    }
    return controllerType;
}

//Gets the controller type from a gamepad
Gimmer_Core.ControllerType.getControllerType = function(gamepad){
    let controllerType = this.TYPE_OTHER;
    if(gamepad.id.search(/054c|sony|PLAYSTATION/i) > -1){
        controllerType = this.TYPE_SONY;
    }
    else if(gamepad.id.search(/xbox|360|028e|045e|02d1/i) > -1){
        controllerType = this.TYPE_MICROSOFT;
    }
    return controllerType;
}

//Extend escape codes
Gimmer_Core.ControllerType._Window_Base_obtainEscapeCode = Window_Base.prototype.obtainEscapeCode;
Window_Base.prototype.obtainEscapeCode = function(textState) {
    var send = (Imported.YEP_MessageCore) ? !this._checkWordWrapMode : true;
    textState.index++;
    if(textState.text.slice(textState.index, textState.index+2).match(/ok/)) {
        textState.index += 2;
        return (send) ? "gimmer_ok" : "";
    }
    else if(textState.text.slice(textState.index, textState.index+5).match(/shift/)) {
        textState.index += 5;
        return (send) ? "gimmer_shift" : "";
    }
    else if(textState.text.slice(textState.index, textState.index+4).match(/menu/)) {
        textState.index += 4;
        return (send) ? "gimmer_menu" : "";
    }
    else if(textState.text.slice(textState.index, textState.index+6).match(/system/)) {
        textState.index += 6;
        return (send) ? "gimmer_system" : "";
    }
    else if(textState.text.slice(textState.index, textState.index+6).match(/cancel/)) {
        textState.index += 6;
        return (send) ? "gimmer_cancel" : "";
    }
    else if(textState.text.slice(textState.index, textState.index+8).match(/pagedown/)) {
        textState.index += 8;
        return (send) ? "gimmer_pagedown" : "";
    }
    else if(textState.text.slice(textState.index, textState.index+6).match(/pageup/)) {
        textState.index += 6;
        return (send) ? "gimmer_pageup" : "";
    }
    else if(textState.text.slice(textState.index, textState.index+10).match(/directions/)) {
        textState.index += 10;
        return (send) ? "gimmer_directions" : "";
    }
    else {
        textState.index--;
        return Gimmer_Core.ControllerType._Window_Base_obtainEscapeCode.call(this, textState);
    }
};

//Extend escape characters to find buttons
Gimmer_Core.ControllerType._Window_Base_processEscapeCharacter = Window_Base.prototype.processEscapeCharacter;
Window_Base.prototype.processEscapeCharacter = function(code, textState) {
    switch (code) {
        case 'gimmer_ok':
        case 'gimmer_cancel':
        case 'gimmer_shift':
        case 'gimmer_menu':
        case 'gimmer_pageup':
        case 'gimmer_pagedown':
        case 'gimmer_directions':
        case 'gimmer_system':
            this.processDrawButtonIcon(this.determineIconForButton(code), textState);
            break;
        default:
            Gimmer_Core.ControllerType._Window_Base_processEscapeCharacter.call(this, code, textState);
            break;
    }
};

//Find what icon a specific button should have based on the current active device
Window_Base.prototype.determineIconForButton = function(code){
    code = code.replace('gimmer_',"");
    let iconUnitWidth = 1;
    let iconYMod = 0;
    let iconIndex = -1;
    let type = Gimmer_Core.ControllerType.getControllerTypeIfPresent();
    if(type === Gimmer_Core.ControllerType.TYPE_NONE){
        let keyChoice = Gimmer_Core.ControllerType.ProvidedKeyBoardMap[code]
        if(keyChoice){
            let keyData = Gimmer_Core.ControllerType.KeyboardIndexMap[keyChoice];
            if(keyData){
                iconIndex = keyData.iconIndex;
                iconUnitWidth = keyData.iconUnitWidth;
                iconYMod = keyData.iconYMod;
            }
        }
    }
    else{
        //Figure out what button they pressed by reversing gamepadMapper into
        if(code !== 'directions'){
            let buttonObj = JSON.parse(JSON.stringify(Input.gamepadMapper));
            let reverseMap = Gimmer_Core.reverseObject(buttonObj);
            let buttonId = reverseMap[code];
            if(buttonId) {
                let keyData = Gimmer_Core.ControllerType.GamePadIndexMap[buttonId.toString()];
                iconIndex = keyData.iconIndex;
                iconUnitWidth = keyData.iconUnitWidth;
            }
        }
        else{
            let keyData = Gimmer_Core.ControllerType.GamePadIndexMap[code];
            if(keyData){
                iconIndex = keyData.iconIndex;
                iconUnitWidth = keyData.iconUnitWidth;
            }
        }

        switch (type){
            case Gimmer_Core.ControllerType.TYPE_SONY:
                iconYMod = 16;
                break;
        }
    }

    iconIndex += iconYMod;

    return {'iconIndex':iconIndex, 'iconUnitWidth': iconUnitWidth};

}

//Draw the icon in any given window using textState
Window_Base.prototype.processDrawButtonIcon = function(iconInfo, textState) {
    this.drawButtonIcon(iconInfo.iconIndex, textState.x + 2, textState.y + 2, iconInfo.iconUnitWidth);
    textState.x += (iconInfo.iconUnitWidth * Window_Base._iconWidth) + 4;
};

//Draw a button icon
Window_Base.prototype.drawButtonIcon = function(iconIndex, x, y, widthModifier) {
    var bitmap = ImageManager.loadSystem('GimmerControllerIconSet');
    var pw = Window_Base._iconWidth;
    var ph = Window_Base._iconHeight;
    var sx = iconIndex % 16 * pw;
    pw *= widthModifier;
    var sy = Math.floor(iconIndex / 16) * ph;
    this.contents.blt(bitmap, sx, sy, pw, ph, x, y);
};

//Plugin comment to get the controller type as a string, in case you want to just display some static controls or what have you
Gimmer_Core.pluginCommands['GIMMERCONTROLLERTYPE'] = function(){
    return Gimmer_Core.ControllerType.getControllerTypeIfPresent();
}