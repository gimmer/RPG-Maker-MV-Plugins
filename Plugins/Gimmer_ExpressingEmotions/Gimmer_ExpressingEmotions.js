var Imported = Imported || {};

if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

Gimmer_Core['ExpressingEmotions'] = {'loaded':true};

//=============================================================================
/*:
 * @plugindesc v1.1 - A plugin to support animated text matching different emotional states
 * @author Gimmer_
 * @help
 * ======================
 * Gimmer_ExpressingEmotions
 * ======================
 *
 * This program lets you put the following commands into any text box or text choice option.
 * Credits to SumRndmDde and his ShakingText plugin as that ultimately gave me the inner working for now to do this
 *
 * \eea Anger: rage letters
 * \eef Fear: shaking letters
 * \eej Joyful: happiness!
 * \eep Pensive: thinking about things
 * \eec Confusion: not quite sure about things
 * \een: Neutral: place this to end the current emotion in text
 *
 * Note: not currently tested in battle systems
 *
 * Terms of Use:
 * =======================================================================
 * Free for both commercial and non-commercial use, with credit.
 * More Gimmer_ plugins at: https://github.com/gimmer/RPG-Maker-MV-Plugins
 * =======================================================================

 *
 * @param ---Anger---
 * @default
 *
 * @param Anger Color
 * @parent ---Anger---
 * @type String
 * @desc What hexcode color should anger be?
 * Default: #e8072b
 * @default #e8072b
 *
 * @param Anger Speed
 * @parent ---Anger---
 * @type Number
 * @desc How fast should Anger hop up and down?
 * @min 0
 * @max 1
 * @decimals 2
 * Default: 0.5
 * @default 0.5
 *
 * @param ---Fear---
 * @default
 *
 * @param Fear Shake Speed
 * @parent ---Fear---
 * @type Number
 * @desc What speed should fear shake at?
 * @min 0
 * @max 1
 * @decimals 2
 * Default: 0.5
 * @default 0.5
 *
 * @param Fear Font Shrink Multiplier
 * @parent ---Fear---
 * @type Number
 * @desc How much should we shrink letters when we are scared? (0.5 is half)
 * @min 0
 * @max 1
 * @decimals 2
 * Default: 0.5
 * @default 0.5
 *
 * @param ---Joyful---
 * @default
 *
 * @param Joyful Color
 * @parent ---Joyful---
 * @type String
 * @desc What hexcode color should joyful be?
 * Default: #ffd022
 * @default #ffd022
 *
 * @param Joyful Direction
 * @parent ---Joyful---
 * @type select
 * @option right
 * @option left
 * @desc Which way should joyful calmly circle?
 * Default: right
 * @default right
 *
 * @param ---Pensive---
 * @default
 *
 * @param Pensive Speed
 * @parent ---Pensive---
 * @type Number
 * @desc How fast should Pensive hop up and down?
 * @decimals 2
 * @min 0
 * @max 1
 * Default: 0.1
 * @default 0.1
 *
 * @param Pensive Delay
 * @parent ---Pensive---
 * @type Number
 * @desc How much delay between the two different sets of pensive hopping letters?
 * @min 0
 * @max 120
 * Default: 30
 * @default 30
 *
 * @param ---Confusion---
 * @default
 *
 * @param Confusion Starting Direction
 * @parent ---Confusion---
 * @type select
 * @option right
 * @option left
 * @desc Which way should confusion tilt to start?
 * Default: right
 * @default right
 *
 * @param Confusion Max Tilt
 * @parent ---Confusion---
 * @type Number
 * @desc What percent should confused letters tilt before turning around (25% default)?
 * @min 0.1
 * @max 0.9
 * @decimals 2
 * Default: 0.25
 * @default 0.25
 *
 * @param Confusion Tilt Speed
 * @parent ---Confusion---
 * @type Number
 * @desc What percentage should confused letters tilt each frame (1% default)?
 * Default: 0.01
 * @default 0.01
 *
 * @param ---Custom 1---
 * @default
 *
 * @param Custom 1 Animation Type
 * @parent ---Custom 1---
 * @type select
 * @option shake
 * @option tilt
 * @option curve
 * @option none
 * @desc Animation type for Custom 1
 * Default: none
 * @default none
 *
 * @param Custom 1 Max Tilt
 * @parent ---Custom 1---
 * @type Number
 * @desc What percent should custom 1 letters tilt before turning around (25% default)?
 * @min 0.1
 * @max 0.9
 * @decimals 2
 * Default: 0.25
 * @default 0.25
 *
 * @param Custom 1 Tilt Speed
 * @parent ---Custom 1---
 * @type Number
 * @desc What percentage should custom 1 letters tilt each frame (1% default)?
 * @decimals 2
 * Default: 0.01
 * @default 0.01
 *
 * @param Custom 1 Shake Speed X
 * @parent ---Custom 1---
 * @type Number
 * @desc What speed should custom 1 shake on the x axis?
 * @min 0
 * @max 1
 * @decimals 2
 * Default: 0.5
 * @default 0.5
 *
 * @param Custom 1 Shake Speed Y
 * @parent ---Custom 1---
 * @type Number
 * @desc What speed should custom 1 shake on the y axis?
 * @min 0
 * @max 1
 * @decimals 2
 * Default: 0.5
 * @default 0.5
 *
 * @param Custom 1 Font Multiplier
 * @parent ---Custom 1---
 * @type Number
 * @desc How much should we scale custom 1's font?
 * @min 0
 * @max 2
 * @decimals 2
 * Default: 1
 * @default 1
 *
 * @param Custom 1 Color
 * @parent ---Custom 1---
 * @type String
 * @desc What hexcode color should custom 1 be? Leave blank for no change
 *
 * @param Custom 1 Curve Direction
 * @parent ---Custom 1---
 * @type select
 * @option right
 * @option left
 * @desc Which way should custom 1 calmly circle?
 * Default: right
 * @default right
 *
 * @param Custom 1 Tilt Starting Direction
 * @parent ---Custom 1---
 * @type select
 * @option right
 * @option left
 * @desc Which way should confusion tilt to start?
 * Default: right
 * @default right
 *
 */

var eeParameters = PluginManager.parameters('Gimmer_ExpressingEmotions');
Gimmer_Core.ExpressingEmotions.AngerHexCode = eeParameters['Anger Color'];
Gimmer_Core.ExpressingEmotions.AngerSpeed = Number(eeParameters['Anger Speed']);
Gimmer_Core.ExpressingEmotions.FearSpeed = Number(eeParameters['Fear Shake Speed']);
Gimmer_Core.ExpressingEmotions.FearShrink = Number(eeParameters['Fear Font Shrink Multiplier']);
Gimmer_Core.ExpressingEmotions.JoyfulHexCode = eeParameters['Joyful Color'];
Gimmer_Core.ExpressingEmotions.JoyfulDirection = eeParameters['Joyful Direction'];
Gimmer_Core.ExpressingEmotions.PensiveSpeed = Number(eeParameters['Pensive Speed'])
Gimmer_Core.ExpressingEmotions.PensiveDelay = Number(eeParameters['Pensive Delay']);
Gimmer_Core.ExpressingEmotions.ConfusionStartingDirection = (eeParameters['Confusion Starting Direction'] === 'right' ? 'add' : 'subtract');
Gimmer_Core.ExpressingEmotions.ConfusionMaxTilt = Number(eeParameters['Confusion Max Tilt']);
Gimmer_Core.ExpressingEmotions.ConfusionTiltSpeed = Number(eeParameters['Confusion Tilt Speed']);

//Custom1
Gimmer_Core.ExpressingEmotions.Custom1AnimationType = eeParameters['Custom 1 Animation Type']
Gimmer_Core.ExpressingEmotions.Custom1ShakeSpeedX = Number(eeParameters['Custom 1 Shake Speed X']);
Gimmer_Core.ExpressingEmotions.Custom1ShakeSpeedY = Number(eeParameters['Custom 1 Shake Speed Y']);
Gimmer_Core.ExpressingEmotions.Custom1FontMultiplier = Number(eeParameters['Custom 1 Font Multiplier']);
Gimmer_Core.ExpressingEmotions.Custom1Color = eeParameters['Custom 1 Color'];
Gimmer_Core.ExpressingEmotions.Custom1CurveDirection = eeParameters['Custom 1 Curve Direction'];
Gimmer_Core.ExpressingEmotions.Custom1TiltMax = Number(eeParameters['Custom 1 Tilt Max']);
Gimmer_Core.ExpressingEmotions.Custom1TiltSpeed = Number(eeParameters['Custom 1 Tilt Speed']);
Gimmer_Core.ExpressingEmotions.Custom1TiltStartingDirection = (eeParameters['Custom 1 Tilt Starting Direction'] === 'right' ? 'add' : 'subtract');


Gimmer_Core.ExpressingEmotions._Window_Base_initialize = Window_Base.prototype.initialize;
Window_Base.prototype.initialize = function(x, y, width, height) {
    Gimmer_Core.ExpressingEmotions._Window_Base_initialize.call(this, x, y, width, height);
    this._currentEmotion = false;
    this._lastPensiveShakeDelay = 0;
    this._emotionalSprites = [];
    this._emotionDisabled = false;
};

Gimmer_Core.ExpressingEmotions._Window_Base_obtainEscapeCode = Window_Base.prototype.obtainEscapeCode;
Window_Base.prototype.obtainEscapeCode = function(textState) {
    var emote = (Imported.YEP_MessageCore) ? !this._checkWordWrapMode : true;
    emote = emote && !this._emotionDisabled; //Disable sending another emotion tag if you are checking for length
    textState.index++;
    if(textState.text.slice(textState.index, textState.index+3).match(/eea/)) {
        textState.index += 3;
        return (emote) ? "ANGER" : "";
    }
    else if(textState.text.slice(textState.index, textState.index+3).match(/eef/)) {
        textState.index += 3;
        return (emote) ? "FEAR" : "";
    }
    else if(textState.text.slice(textState.index, textState.index+3).match(/eej/)) {
        textState.index += 3;
        return (emote) ? "JOYFUL" : "";
    }
    else if(textState.text.slice(textState.index, textState.index+3).match(/eep/)) {
        textState.index += 3;
        return (emote) ? "PENSIVE" : "";
    }
    else if(textState.text.slice(textState.index, textState.index+3).match(/eec/)) {
        textState.index += 3;
        return (emote) ? "CONFUSION" : "";
    }
    else if(textState.text.slice(textState.index, textState.index+3).match(/een/)) {
        textState.index += 3;
        return (emote) ? "CALM" : "";
    }
    else if(textState.text.slice(textState.index, textState.index+3).match(/ee1/)) {
        textState.index += 3;
        return (emote) ? "CUSTOM1" : "";
    }
    else {
        textState.index--;
        return Gimmer_Core.ExpressingEmotions._Window_Base_obtainEscapeCode.call(this, textState);
    }
};

Gimmer_Core.ExpressingEmotions._Window_Base_processEscapeCharacter = Window_Base.prototype.processEscapeCharacter;
Window_Base.prototype.processEscapeCharacter = function(code, textState) {
    switch (code) {
        case 'ANGER':
        case 'FEAR':
        case 'JOYFUL':
        case 'PENSIVE':
        case 'CONFUSION':
        case 'CUSTOM1':
            this._currentEmotion = code;
            break;
        case 'CALM':
            this._currentEmotion = false;
            break;
        default:
            Gimmer_Core.ExpressingEmotions._Window_Base_processEscapeCharacter.call(this, code, textState);
            break;
    }
};

Gimmer_Core.ExpressingEmotions._Window_Base_processNormalCharacter = Window_Base.prototype.processNormalCharacter;
Window_Base.prototype.processNormalCharacter = function(textState) {
    if(this.isEmotionalText() && !this._checkWordWrapMode) {
        if(Imported.YEP_MessageCore && this.checkWordWrap(textState)) {
            return this.processNewLine(textState);
        }
        var char = textState.text[textState.index++];
        var width = this.textWidth(char);
        var height = textState.height;
        this.createEmotionalString(textState, char, width, height);
        textState.x += width;
    } else {
        Gimmer_Core.ExpressingEmotions._Window_Base_processNormalCharacter.call(this, textState);
    }
};

//YEP needs to check word wrap without checking for emotional codes
if(Imported.YEP_MessageCore){
    Gimmer_Core.ExpressingEmotions._Window_Base_prototype_checkWordWrap = Window_Base.prototype.checkWordWrap;
    Window_Base.prototype.checkWordWrap = function(textState){
        this._emotionDisabled = true;
        let val = Gimmer_Core.ExpressingEmotions._Window_Base_prototype_checkWordWrap.call(this, textState);
        this._emotionDisabled = false;
        return val;
    }
}

Window_Base.prototype.isEmotionalText = function(){
    return (this._currentEmotion && !this._emotionDisabled);
}

Window_Base.prototype.createEmotionalString = function(textState, char, width, height){
    if(this._currentEmotion === 'PENSIVE'){
        this.contents._shakeDelay = (this._lastPensiveShakeDelay === 0 ? Gimmer_Core.ExpressingEmotions.PensiveDelay : 0);
        this._lastPensiveShakeDelay = this.contents._shakeDelay;
    }
    var sprite = new Sprite_Emotional(new Bitmap(width, height), this._currentEmotion, this.contents);
    sprite.bitmap.drawText(char, 0, 0, width, height);
    sprite.x = textState.x + this.standardPadding();
    sprite.y = textState.y + this.standardPadding();
    sprite._xBase = sprite.x;
    sprite._yBase = sprite.y;
    this.addChild(sprite);
    this._emotionalSprites.push(sprite);
}

Gimmer_Core.ExpressingEmotions._Window_Base_open = Window_Base.prototype.open;
Window_Base.prototype.open = function() {
    Gimmer_Core.ExpressingEmotions._Window_Base_open.call(this);
    for(var i = 0; i < this._emotionalSprites.length; i++) {
        this._emotionalSprites[i].opacity = 255;
    }
};

Gimmer_Core.ExpressingEmotions._Window_Base_close = Window_Base.prototype.close;
Window_Base.prototype.close = function() {
    Gimmer_Core.ExpressingEmotions._Window_Base_close.call(this);
    for(var i = 0; i < this._emotionalSprites.length; i++) {
        this._emotionalSprites[i].opacity = 0;
    }
};

Window_ChoiceList.prototype.textWidthEx = function(text) {
    this._emotionDisabled = true;
    var width = this.drawTextEx(text, 0, this.contents.height);
    this._emotionDisabled = false;
    return width;
};

Gimmer_Core.ExpressingEmotions._Window_Base_newPage = Window_Message.prototype.newPage;
Window_Message.prototype.newPage = function(textState) {
    Gimmer_Core.ExpressingEmotions._Window_Base_newPage.call(this, textState);
    this.removeEmotionalSprites();
    this._currentEmotion = false;
};

Window_Base.prototype.removeEmotionalSprites = function() {
    for(var i = 0; i < this._emotionalSprites.length; i++) {
        this.removeChild(this._emotionalSprites[i]);
    }
};


function Sprite_Emotional() {
    this.initialize.apply(this, arguments);
}

Sprite_Emotional.prototype = Object.create(Sprite.prototype);
Sprite_Emotional.prototype.constructor = Sprite_Emotional;

Sprite_Emotional.prototype.initialize = function(bitmap, emotion, contents) {
    Sprite.prototype.initialize.call(this, bitmap);
    this._animationType = false;
    this._animationSubType = false;
    this._shakeDelay = 0;
    this._emotion = emotion.toUpperCase();
    this.setEmotionalParameters(contents);
    this._xBase = this.x;
    this._yBase = this.y;
    this._aniCouter = 0;
};

Sprite_Emotional.prototype.setEmotionalParameters = function(contents){
    this.bitmap.textColor = contents.textColor;
    this.bitmap.paintOpacity = contents.paintOpacity;
    this.bitmap.fontSize = contents.fontSize;
    this.bitmap.fontFace = contents.fontFace;
    switch(this._emotion){
        case 'ANGER':
            this._xSpd = 0
            this._ySpd = Gimmer_Core.ExpressingEmotions.AngerSpeed;
            this._xMax = 1;
            this._yMax = 1;
            this.bitmap.textColor = Gimmer_Core.ExpressingEmotions.AngerHexCode;
            this._animationType = 'shake';
            break;
        case 'FEAR':
            this.bitmap.fontSize *= Gimmer_Core.ExpressingEmotions.FearShrink;
            this._xSpd = Gimmer_Core.ExpressingEmotions.FearSpeed;
            this._ySpd = 0;
            this._xMax = 1;
            this._yMax = 1;
            this._animationType = 'shake'
            break;
        case 'JOYFUL':
            this.bitmap.textColor = Gimmer_Core.ExpressingEmotions.JoyfulHexCode;
            this._animationType = 'curve';
            this._animationSubType = Gimmer_Core.ExpressingEmotions.JoyfulDirection;
            break;
        case 'PENSIVE':
            this._animationType = 'shake';
            this._xSpd = 0;
            this._ySpd = Gimmer_Core.ExpressingEmotions.PensiveSpeed;
            this._xMax = 1;
            this._yMax = 1;
            this._shakeDelay = contents._shakeDelay;
            break;
        case 'CONFUSION':
            this._animationType = 'tilt';
            this._tiltMax = Gimmer_Core.ExpressingEmotions.ConfusionMaxTilt;
            this._tiltSpeed = Gimmer_Core.ExpressingEmotions.ConfusionTiltSpeed;
            this._changeDirection = Gimmer_Core.ExpressingEmotions.ConfusionStartingDirection;
            break;
        case 'CUSTOM1':
            dd('making a custom');
            this._animationType = Gimmer_Core.ExpressingEmotions.Custom1AnimationType;
            this.bitmap.fontSize *= Gimmer_Core.ExpressingEmotions.Custom1FontMultiplier;
            if(Gimmer_Core.ExpressingEmotions.Custom1Color.length){
                this.bitmap.textColor = Gimmer_Core.ExpressingEmotions.Custom1Color;
            }
            switch(this._animationType){
                case 'tilt':
                    this._tiltSpeed = Gimmer_Core.ExpressingEmotions.Custom1TiltSpeed;
                    this._tiltMax = Gimmer_Core.ExpressingEmotions.Custom1TiltMax;
                    this._changeDirection = Gimmer_Core.ExpressingEmotions.Custom1TiltStartingDirection;
                    break;
                case 'curve':
                    this._animationSubType = Gimmer_Core.ExpressingEmotions.Custom1CurveDirection;
                    break;
                case 'shake':
                    this._xMax = 1;
                    this._yMax = 1;
                    this._xSpd = Gimmer_Core.ExpressingEmotions.Custom1ShakeSpeedX;
                    this._ySpd = Gimmer_Core.ExpressingEmotions.Custom1ShakeSpeedY;
                    break;
            }
    }
}


Sprite_Emotional.prototype.update = function() {
    Sprite.prototype.update.call(this);
    switch(this._animationType){
        case 'shake':
            if(this._shakeDelay === 0){
                this.x += this._xSpd;
                this.y += this._ySpd;
                if(Math.abs(this.x - this._xBase) > this._xMax) this._xSpd *= (-1);
                if(Math.abs(this.y - this._yBase) > this._yMax) this._ySpd *= (-1);
            }
            else{
                this._shakeDelay -= 1;
            }

            break;
        case 'curve':
            if(this._animationSubType === 'right'){
                this._aniCouter += (Math.PI * 0.06);
                if(this._aniCouter > (Math.PI * 2)) this._aniCouter += (Math.PI * 2);
            }
            else{
                this._aniCouter -= (Math.PI * 0.06);
                if(this._aniCouter > (Math.PI * 2)) this._aniCouter -= (Math.PI * 2);
            }

            this._xAniOff = Math.cos(this._aniCouter) * 3;
            this._yAniOff = Math.sin(this._aniCouter) * 3;
            this.x = this._xBase + this._xAniOff;
            this.y = this._yBase + this._yAniOff;
            break;
        case 'tilt':
            if(Math.abs(this._aniCouter) >= this._tiltMax){
                //reverse
                this._changeDirection = (this._changeDirection === 'add' ? 'subtract' : 'add');
            }

            switch(this._changeDirection){
                case "add":
                    this._aniCouter += this._tiltSpeed;
                    break;
                case "subtract":
                    this._aniCouter -= this._tiltSpeed;
                    break;
            }

            this.setTransform(this.x, this.y, 1,1,this._aniCouter);
            break;
    }
};