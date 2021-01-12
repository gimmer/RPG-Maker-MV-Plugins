if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

Gimmer_Core['VisualMeters'] = {'loaded':true};

//=============================================================================
/*:
 * @plugindesc Display a visual meter of a given numeric measure
 * @author Gimmer
 * @help You can use this plugin to make visual meters of various UI elements. The plugin supports as many meters are you like, following a particular structure.
 *
 * Plugin Commands:
 *
 * HideUILayer: Hides the layer all the meters are on
 * ShowUILayer: Shows the layer all the meters are on
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
 * @param Color Of Meter
 * @type text[]
 * @desc list of hexcodes you want for below 33 percent, below 66 percent, and above 66 percent. Put three hex codes in that exact order. Want them all the same? Just put it in three times
 *
 * @param Meter X
 * @type Number
 * @desc Where do you want the meter on the x axis to start?
 * @default 0
 * Default 0
 *
 * @param Meter Y
 * @type Number
 * @desc Where do you want the meter on the y axis to start?
 * @default 0
 * Default 0
 *
 * @param Meter Width
 * @type Number
 * @desc How many pixels wide?
 *
 * @param Meter Height
 * @type Number
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
 * @param Repeat Common Events
 * @type Boolean
 * @desc Should Max and Min Common events repeat? Only set to true if you are fixing the current or max values in your common event, otherwise you'll create an infinite loop
 * Default false
 * @default false
 */

//TODO Later:
//Show values on the meters?
//Images instead of rectangles

var vmParameters = PluginManager.parameters('Gimmer_VisualMeters');

Gimmer_Core.VisualMeters.meters = JSON.parse(vmParameters['Meter List']);
Gimmer_Core.VisualMeters.FadeUnderPlayer = (vmParameters['Fade Under Player'] === "true");
Gimmer_Core.VisualMeters.FadePercentage = Math.floor(Number(vmParameters['Fade Percentage']) / 100);
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
    v['Meter Height'] = Number(v['Meter Height']);
    v['Meter Width'] = Number(v['Meter Width']);
    v['Meter X'] = Number(v['Meter X']);
    v['Meter Y'] = Number(v['Meter Y']);
    v['Show Border'] = (v['Show Border'] === "true");
    v['Show Solid Background'] = (v['Show Solid Background'] === "true");
    v['Meter Label Padding Right'] = Number(v['Meter Label Padding Right']);
    v['Meter Label Padding Left'] = Number(v['Meter Label Padding Left']);
    v['Meter Label Font Bold'] = (v['Meter Label Font Bold'] === "true");
    v['Event To Run at 0'] = Number(v['Event To Run at 0']);
    v['Common Event To Run at Max'] = Number(v['Common Event To Run at Max']);
    v['Repeat Common Events'] = (v['Repeat Common Events'] === "true");

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

Gimmer_Core.VisualMeters._Scene_Map_prototype_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;
Scene_Map.prototype.createDisplayObjects = function() {
    Gimmer_Core.VisualMeters._Scene_Map_prototype_createDisplayObjects.call(this);
    this.addVisualMeters();
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
    Window_Fade.prototype.initialize.call(this, meter['Meter X'], meter['Meter Y'], meter['Meter Width'], meter['Meter Height']);
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
    let triggered = false;
    if(this._triggerSwitchId > 0){
        triggered = $gameSwitches.value(this._triggerSwitchId)
    }
    else{
        triggered = true;
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
    let widthPercent = Math.floor(width / (this.width - this._textWidth) * 100);
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

    this.contents.fillRect(this._textWidth,0,width, this.height, color);
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
    if(this._canFade){
        this.updateFade();
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

//Hide a bunch of window garbage
Window_VisualMeter.prototype._refreshFrame = function(){}
Window_VisualMeter.prototype._refreshCursor = function(){}
Window_VisualMeter.prototype._refreshPauseSign = function(){}
Window_VisualMeter.prototype._refreshArrows = function (){}
Window_VisualMeter.prototype._refreshBack = function(){}

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

//Helper to draw a rectangle border without a fill.
Bitmap.prototype.drawRectBorder = function(x, y, width, height, borderColor, thickness = 1){
    var context = this._context;
    context.save();
    context.strokeStyle = borderColor;
    context.lineWidth = thickness;
    context.strokeRect(x, y, width, height);
    context.restore();
    this._setDirty();
}

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