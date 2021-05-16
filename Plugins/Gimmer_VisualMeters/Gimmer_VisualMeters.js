if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

Gimmer_Core['VisualMeters'] = {'loaded':true};

//=============================================================================
/*:
 * @plugindesc v1.1 - Display a visual meter of a given numeric measure
 * @author Gimmer_
 * @help You can use this plugin to make visual meters of various UI elements. The plugin supports as many meters are you like, following a particular structure.
 *
 * ==================
 * Gimmer_VisualMeters
 * ==================
 *
 * Plugin Commands:
 *
 * HideUILayer: Hides the layer all the meters are on
 * ShowUILayer: Shows the layer all the meters are on
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
 * @param Step Percentage
 * @parent ---Parameters---
 * @type Number
 * @min 1
 * @max 100
 * @desc What percentage of the meter do you want the value to move as it's updating?
 * Default 5
 * @default 5
 *
 * @param Fade Under Player
 * @parent ---Parameters---
 * @type Boolean
 * @desc Do you want the meter to become transparent if the player walks under it?
 * Default True
 * @default true
 *
 * @param Fade Percentage
 * @parent Fade Under Player
 * @type Number
 * @desc How faded do you want the meters to be when the player passes under them? (percentage without the percent sign)
 * Default 25
 * @default 25
 *
 * @param Meter List
 * @parent --Parameters--
 * @type struct<VisualMeter>[]
 * @desc make a list of all the meters you want
 *
 */

/*~struct~VisualMeter:
 *
 * @param Show Border
 * @type Boolean
 * @desc Want a border around the meter?
 *
 * @param Border Color
 * @type string
 * @desc hexcode of the border color eg #FF0000
 *
 * @param Show Solid Background
 * @type boolean
 * @desc Show a solid background behind the meter for when it isn't full?
 *
 * @param Solid Background Color
 * @type String
 * @desc hexcode of the background color eg #FF0000
 *
 * @param Use Picture As Unit Of Meter
 * @type file
 * @dir img/pictures
 * @desc What to use an image instead of a rectangle? Choose the picture here. The picture must been one solid single color
 *
 * @param Unit Picture Padding X
 * @type Number
 * @desc How many pixels between each unit picture horizontally?
 * @min 0
 * @max 50
 * @default 5
 * Default 5
 *
 * @param Unit Picture Padding Y
 * @type Number
 * @desc How many pixels between each unit picture vertically if on two or more lines?
 * @min 0
 * @max 50
 * @default 5
 * Default 5
 *
 * @param Value Per Picture Unit
 * @type Number
 * @desc How much of the thing the meter is measuring will fit into one picture? This will control how many pictures are rendered in the meter (with automatic wrapping)
 *
 * @param Outline Picture As Unit Of Meter
 * @type file
 * @dir img/pictures
 * @desc If you are using a picture as meter, you can put this as an outline. The picture must be just an outline and otherwise transparent
 *
 * @param Color Of Meter
 * @type text[]
 * @desc list of hexcodes you want for below 33 percent, below 66 percent, and above 66 percent. Put three hex codes in that exact order. Want them all the same? Just put it in three times
 *
 * @param Meter X
 * @type String
 * @desc Where do you want the meter on the x axis to start?
 * @default 0
 * Default 0
 *
 * @param Meter Y
 * @type String
 * @desc Where do you want the meter on the y axis to start?
 * @default 0
 * Default 0
 *
 * @param Meter Width
 * @type String
 * @desc How many pixels wide?
 *
 * @param Meter Height
 * @type String
 * @desc How many pixels high?
 *
 * @param Meter Label
 * @type string
 * @desc What label would you like? Leave blank for none
 *
 * @param Meter Label Padding Right
 * @type number
 * @desc how many pixels between the end of the label and the start of the meter
 *
 * @param Meter Label Padding Left
 * @type number
 * @desc how many pixels between the start of the window and the start of the label
 *
 * @param Meter Label Color
 * @type string
 * @desc hexcode of the label text color eg #FF0000
 *
 * @param Meter Label Font Size
 * @type number
 * @desc Font size
 * @default 28
 * Default Default Font size
 *
 * @param Meter Label Font Bold
 * @type Boolean
 * @desc Should the font be bold?
 * Default false
 * @default false
 *
 * @param Trigger Switch Id
 * @type Switch
 * @desc Optionally use a switch to show this meter
 *
 * @param Current Value
 * @type string
 * @desc How to track the current value you want in a meter. Can be a variable v:num or a script e,g $gameActors._data[1].hp
 *
 * @param Max Value
 * @type string
 * @desc How to track the max value you want in a meter. Can be a variable v:num or a script e,g $gameActors._data[1].mhp
 *
 * @param Common Event To Run at 0
 * @type common_event
 * @desc Optional if you reach the score of 0 for current value, what common event should be run?
 *
 * @param Common Event To Run at Max
 * @type common_event
 * @desc Optional if you reach the max of a meter, what common event should be run?
 *
 * @param Sound When Value Goes Up
 * @type struct<se>
 * @desc What sound to play when a value goes up?
 *
 * @param Sound When Value Goes Down
 * @type struct<se>
 * @desc What sound to play a value goes down?
 *
 * @param Repeat Common Events
 * @type Boolean
 * @desc Should Max and Min Common events repeat? Only set to true if you are fixing the current or max values in your common event, otherwise you'll create an infinite loop
 * Default false
 * @default false
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
 * ========
 * Changelog
 * =======
 * Version 1.0:
 * - Initial Release
 * Version 1.1:
 * - Added functionality to coincide with Gimmer_FightyFighty
 *
*/

//TODO Later:
//Show values on the meters?
var vmParameters = PluginManager.parameters('Gimmer_VisualMeters');

Gimmer_Core.VisualMeters.meters = JSON.parse(vmParameters['Meter List']);
Gimmer_Core.VisualMeters.FadeUnderPlayer = (vmParameters['Fade Under Player'] === "true");
Gimmer_Core.VisualMeters.FadePercentage = Number(vmParameters['Fade Percentage']) / 100;
Gimmer_Core.VisualMeters.NumberStepPercentage = Number(vmParameters['Step Percentage']);

Gimmer_Core.VisualMeters.meters.forEach(function(v,k){
    v = JSON.parse(v);
    if(v['Current Value'].includes("v:")){
        v['fetchParam'] = function(){
            let split = v['Current Value'].split(":");
            return $gameVariables.value(split[1]);
        }
    }
    else{
        v['fetchParam'] = function(){
            return eval(v['Current Value']);
        }
    }

    if(v['Max Value'].includes("v:")){
        v['fetchParamMax'] = function(){
            let split = v['Max Value'].split(":");
            return $gameVariables.value(split[1]);
        }
    }
    else{
        v['fetchParamMax'] = function(){
            return eval(v['Max Value']);
        }
    }
    v['Color Of Meter'] = JSON.parse(v['Color Of Meter']);
    v['Meter Height'] = v['Meter Height'];
    v['Meter Width'] = v['Meter Width'];
    v['Meter X'] = v['Meter X'];
    v['Meter Y'] = v['Meter Y'];
    v['Show Border'] = (v['Show Border'] === "true");
    v['Show Solid Background'] = (v['Show Solid Background'] === "true");
    v['Meter Label Padding Right'] = Number(v['Meter Label Padding Right']);
    v['Meter Label Padding Left'] = Number(v['Meter Label Padding Left']);
    v['Meter Label Font Bold'] = (v['Meter Label Font Bold'] === "true");
    v['Event To Run at 0'] = Number(v['Event To Run at 0']);
    v['Common Event To Run at Max'] = Number(v['Common Event To Run at Max']);
    v['Repeat Common Events'] = (v['Repeat Common Events'] === "true");
    v['Unit Picture'] = v['Use Picture As Unit Of Meter'];
    v['Unit Outline Picture'] = v['Outline Picture As Unit Of Meter'];
    v['Unit Picture Padding X'] = Number(v['Unit Picture Padding Y']);
    v['Unit Picture Padding Y'] = Number(v['Unit Picture Padding Y']);
    v['Value Per Picture Unit'] = Number(v['Value Per Picture Unit']);

    Gimmer_Core.VisualMeters.meters[k] = v;
});

Gimmer_Core.VisualMeters._Scene_Base_prototype_initialize = Scene_Base.prototype.initialize;
Scene_Base.prototype.initialize = function() {
    Gimmer_Core.VisualMeters._Scene_Base_prototype_initialize.call(this);
    this._windowUILayer = null;
};

Gimmer_Core.VisualMeters._Scene_Base_prototype_createWindowLayer = Scene_Base.prototype.createWindowLayer;
Scene_Base.prototype.createWindowLayer = function() {
    Gimmer_Core.VisualMeters._Scene_Base_prototype_createWindowLayer.call(this)
    var width = Graphics.boxWidth;
    var height = Graphics.boxHeight;
    var x = (Graphics.width - width) / 2;
    var y = (Graphics.height - height) / 2;
    this._windowUILayer = new WindowLayer_UI();
    this._windowUILayer.move(x, y, width, height);
    this.addChild(this._windowUILayer);
};

Gimmer_Core.VisualMeters._Scene_Map_prototype_createAllWindows = Scene_Map.prototype.createAllWindows;
Scene_Map.prototype.createAllWindows = function() {
    this.addVisualMeters();
    Gimmer_Core.VisualMeters._Scene_Map_prototype_createAllWindows.call(this);
};

Gimmer_Core.pluginCommands['HIDEUILAYER'] = function(){
    if('_windowUILayer' in SceneManager._scene){
        SceneManager._scene._windowUILayer.visible = false;
    }
}

Gimmer_Core.pluginCommands['SHOWUILAYER'] = function(){
    if('_windowUILayer' in SceneManager._scene){
        SceneManager._scene._windowUILayer.visible = true;
    }
}

Scene_Base.prototype.addVisualMeters = function(){
    this._meterWindows = {};
    Gimmer_Core.VisualMeters.meters.forEach(function(meter, key){
        this.addVisualMeter(meter, key)
    }, this)
}

Scene_Base.prototype.addVisualMeter = function(meter, id){
    this._meterWindows[id.toString()] = new Window_VisualMeter(meter);
    this._windowUILayer.addChild(this._meterWindows[id.toString()]);
}

//Just make an extended windowLayer for the UI. This class does nothing, but makes it less confusing when you're looking at the console and wonder why there are two WindowLayers
function WindowLayer_UI() {
    this.initialize.apply(this, arguments);
}

WindowLayer_UI.prototype = Object.create(WindowLayer.prototype);
WindowLayer_UI.prototype.constructor = WindowLayer_UI;


//custom actor window
function Window_VisualMeter() {
    this.initialize.apply(this, arguments);
}

Window_VisualMeter.prototype = Object.create(Window_Fade.prototype);
Window_VisualMeter.prototype.constructor = Window_VisualMeter;

//Constructor
Window_VisualMeter.prototype.initialize = function(meter){
    this._hideTransparentBackground = true; //Always do this, hides weird transparency of windows
    this.fetchParam = meter.fetchParam
    this.fetchParamMax = meter.fetchParamMax;
    this._includeBackGround = meter['Show Solid Background']
    this._backgroundColor = meter['Solid Background Color'];
    this._includeBorder = meter['Show Border'];
    this._borderColor = meter['Border Color'];
    this._rangeColors = meter['Color Of Meter'];
    this._lastParamCurrent = this.fetchParam();
    this._lastParamMax = this.fetchParamMax();
    this._lastParamTemp = this.fetchParam();
    this._label = meter['Meter Label'];
    this._labelPaddingRight = meter['Meter Label Padding Right'];
    this._labelPaddingLeft = meter['Meter Label Padding Left'];
    this._labelColor = meter['Meter Label Color'];
    this._labelFontSize = Number(eval(meter['Meter Label Font Size']));
    this._labelFontBold = meter['Meter Label Font Bold']
    this._transitioning = false;
    this._numberStepPercent = Gimmer_Core.VisualMeters.NumberStepPercentage;
    this._textWidth = 0;
    this._triggerSwitchId = meter['Trigger Switch Id'];
    this._minCommonEventId = meter['Event To Run at 0'];
    this._eventsRepeat = meter['Repeat Common Events'];
    this._maxCommonEventId = meter['Common Event To Run at Max'];
    this._eventActive = false;
    this._upSound = (meter['Sound When Value Goes Up'].length ? JSON.parse(meter['Sound When Value Goes Up']) : false );
    this._downSound = (meter['Sound When Value Goes Down'].length ? JSON.parse(meter['Sound When Value Goes Down']) : false);
    this._picture = false;
    this._pictureOutline = false;
    this._picturePaddingX = 0;
    this._picturePaddingY = 0;
    this._unitsPerPicture = 0;
    if(meter['Unit Picture'].length){
        this._picture = ImageManager.reservePicture(meter['Unit Picture']);
        let that = this;
        this._picture.addLoadListener(function(){
            that._dirty = true;
        });
        if(meter['Unit Outline Picture'].length){
            this._pictureOutline = ImageManager.reservePicture(meter['Unit Outline Picture']);
            let that = this;
            this._pictureOutline.addLoadListener(function(){
                that._dirty = true;
            });
        }
        this._picturePaddingX = meter['Unit Picture Padding X'];
        this._picturePaddingY = meter['Unit Picture Padding Y'];
        this._unitsPerPicture = meter['Value Per Picture Unit'];
    }
    Window_Fade.prototype.initialize.call(this, Number(eval(meter['Meter X'])), Number(eval(meter['Meter Y'])), Number(eval(meter['Meter Width'])), Number(eval(meter['Meter Height'])));
    this._fadeForPlayer = Gimmer_Core.VisualMeters.FadeUnderPlayer;
    this._desinationAlpha = Gimmer_Core.VisualMeters.FadePercentage;
    this._dirty = true;
    this.refresh();
}
Window_VisualMeter.prototype.standardPadding = function() {
    return 0;
};

Window_VisualMeter.prototype.refresh = function(){
    this.updateValues();
    if(this._dirty){
        this.contents.clear();
        if(this.isTriggered()){
            this.drawLabel();
            if(this._includeBackGround){
                this.drawBackground();
            }
            this.drawMeterContents();
            if(this._includeBorder){
                this.drawBorder();
            }
        }
    }
}

Window_VisualMeter.prototype.isTriggered = function(){
    let triggered;
    if(this._triggerSwitchId > 0){
        triggered = $gameSwitches.value(this._triggerSwitchId)
    }
    else{
        triggered = true;
    }

    if(triggered && 'blockmeters' in $dataMap.meta && $dataMap.meta.blockmeters){
        triggered = false;
    }

    return triggered;
}

Window_VisualMeter.prototype.drawBackground = function(){
    this.contents.fillRect(this._textWidth,0,this.width - this._textWidth, this.height, this._backgroundColor);
}

Window_VisualMeter.prototype.drawBorder = function(){
    this.contents.drawRectBorder(this._textWidth,0,this.width - this._textWidth, this.height, this._borderColor, 2);
}

Window_VisualMeter.prototype.drawMeterContents = function(){
    let width;
    if(this._transitioning){
        let stop;
        if(this._lastParamCurrent > this._lastParamTemp){
            this._lastParamTemp += this.getStepValue();
            stop = this._lastParamTemp >= this._lastParamCurrent;
        }
        else{
            this._lastParamTemp -= this.getStepValue();
            stop = this._lastParamTemp <= this._lastParamCurrent;
        }

        if(stop){
            this._lastParamTemp = this._lastParamCurrent;
            this._transitioning = false;
            this._dirty = false;
        }
        width = (this._lastParamTemp / this._lastParamMax) * (this.width - this._textWidth);
    }
    else{
        //Do a jump if the change is just the change of max (from leveling up, maybe?)
        width = (this._lastParamCurrent / this._lastParamMax) * (this.width - this._textWidth);
        this._dirty = false;
    }
    let widthPercent = Math.round(width / (this.width - this._textWidth) * 100);
    let color;
    if(widthPercent <= 33){
        color = this._rangeColors[0];
    }
    else if(widthPercent > 33 && widthPercent <= 66){
        color = this._rangeColors[1];
    }
    else{
        color = this._rangeColors[2];
    }

    let sx = 0;
    let sy = 0;
    let sw = this._picture.width;
    let sh = this._picture.height;
    let dx = this._textWidth;
    let dy = 0;

    if(this._picture){
        let numberOfHearts = Math.round(this._lastParamMax / this._unitsPerPicture);
        let numberOfFilledHearts = this._lastParamTemp / this._unitsPerPicture;
        let picture = this.getPicture();
        picture.fillImage(color,'horizontal',100);
        for(let i = 0; i < numberOfHearts; i++){
            sw = picture.width;
            if(numberOfFilledHearts - i > 1){
                //full heart
            }
            else if(numberOfFilledHearts - i > 0){
                sw = sw * (numberOfFilledHearts - i);
            }
            else{
                sw = 0;
            }

            if(sw > 0){
                this.contents.blt(picture, sx, sy, sw, sh, dx, dy);
            }

            if(this._pictureOutline){
                this._pictureOutline.fillImage("#FFFFFF");
                this.contents.blt(this._pictureOutline,sx,sy,this._pictureOutline.width,sh,dx,dy);
            }

            dx += picture.width + this._picturePaddingX;
            if(dx + picture.width + this._picturePaddingX > this.width){
                dy += picture.height + this._picturePaddingY;
                dx = this._textWidth;
            }
        }
    }
    else{
        this.contents.fillRect(this._textWidth,0,width, this.height, color);
    }
}

Window_VisualMeter.prototype.getPicture = function(){
    return this._picture;
}

Window_VisualMeter.prototype.drawLabel = function(){
    let oldFontSize = this.contents.fontSize;
    let oldFontWeight = this.contents.fontBold;
    this.contents.fontBold = this._labelFontBold;
    this.contents.fontSize = this._labelFontSize;
    this._textWidth = this._labelPaddingLeft + this.contents.measureTextWidth(this._label) + this._labelPaddingRight;
    this.contents.textColor = this._labelColor;
    this.contents.drawText(this._label,this._labelPaddingLeft,0,this._textWidth, this.height);
    this.contents.fontSize = oldFontSize;
    this.contents.fontBold = oldFontWeight;
}

Window_VisualMeter.prototype.update = function(){
    if(this._fadeForPlayer){
        this.updateFadeForPlayer();
    }
    this.refresh();
}

Window_VisualMeter.prototype.getStepValue = function(){
    return (this._numberStepPercent / 100) * this._lastParamMax;
}

Window_VisualMeter.prototype.updateValues = function(){
    if(!this._transitioning){
        let temp = this.fetchParam();
        if(temp === 0 && !this._eventActive && this._minCommonEventId > 0){
            this._eventActive = true;
            let that = this;
            Gimmer_Core.reserveCommonEventWithCallback(this._minCommonEventId, function(){
                that._eventActive = false;
                if(!that._eventsRepeat){
                    that._minCommonEventId = -1;
                }
            })
        }
        if(temp != this._lastParamCurrent) {
            if(temp > this._lastParamCurrent){
                //going up
                AudioManager.playSe(this._upSound);
            }
            if(temp < this._lastParamCurrent){
                //Going down
                AudioManager.playSe(this._downSound);
            }
            this._lastParamTemp = this._lastParamCurrent;
            this._lastParamCurrent = temp;
            this._dirty = true;
            this._transitioning = true;
        }
        let tempMax = this.fetchParamMax();
        if(temp >= tempMax && !this._eventActive && this._maxCommonEventId > 0){
            //Raise a common event
            this._eventActive = true;
            let that = this;
            Gimmer_Core.reserveCommonEventWithCallback(this._maxCommonEventId, function(){
                that._eventActive = false;
                if(!that._eventsRepeat){
                    that._maxCommonEventId = -1;
                }
            })
        }
        if(tempMax != this._lastParamMax){
            this._lastParamMax = tempMax;
            this._dirty = true;
        }
    }
}

Window_VisualMeter.prototype._createAllParts = function() {
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

//Fix so Fadeout command in Game Interpreter fades out the meters too
Game_Screen.prototype.updateFadeIn = function() {
    if (this._fadeInDuration > 0) {
        var d = this._fadeInDuration;
        this._brightness = (this._brightness * (d - 1) + 255) / d;
        if('_windowUILayer' in SceneManager._scene){
            SceneManager._scene._windowUILayer.alpha = this._brightness / 255;
        }
        this._fadeInDuration--;
    }
};

Game_Screen.prototype.updateFadeOut = function() {
    if (this._fadeOutDuration > 0) {
        var d = this._fadeOutDuration;
        this._brightness = (this._brightness * (d - 1)) / d;
        if('_windowUILayer' in SceneManager._scene){
            SceneManager._scene._windowUILayer.alpha = this._brightness / 255;
        }
        this._fadeOutDuration--;
    }
};

/**
 * Returns the height of the specified text.
 *
 * @method measureTextHeight
 * @param {String} text The text to be measured
 * @return {Number} The height of the text in pixels
 */
Bitmap.prototype.measureTextHeight = function(text) {
    var context = this._context;
    context.save();
    context.font = this._makeFontNameText();
    var metrics = context.measureText(text);
    context.restore();
    return metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
};