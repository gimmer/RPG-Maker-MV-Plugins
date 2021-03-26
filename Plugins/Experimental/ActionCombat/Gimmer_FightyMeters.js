if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

Imported = Imported || {};
Imported['Gimmer_FightyMeters'] = true;

if(Gimmer_Core.Fighty === undefined){
    throw "Gimmer_FightyFighty is needed for this plugin.";
}

Gimmer_Core['FightyMeters'] = {'loaded':true};

//=============================================================================
/*:
 * @plugindesc Support for floating health meters for enemies
 * @author Gimmer
 * @help
 * ================
 * Gimmer_FightyMeters
 * ================
 *
 * Add optional floaty visual meters appear above enemies when they are hit to show their hp
 *
 * @param Visual Meter
 * @type struct<EnemyVisualMeter>
 *
 */
/*~struct~EnemyVisualMeter:
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
 * @desc list of hexcodes you want for the range of health in percentage, ordered from lowest to highest. If you put 3, it'll be 33%, 66%, and 100% ranges respectively.
 *
 * @param Position Type
 * @select
 * @option static
 * @option above
 * @option below
 * @desc where do you want the meter to appear? (centered above the enemy, centered below the enemy, or in a static x y)
 * @default above
 * Default above
 *
 * @param Meter X
 * @type String
 * @desc Where do you want the meter on the x axis to start? (used if position is static)
 * @default 0
 * Default 0
 *
 * @param Meter Y
 * @type String
 * @desc Where do you want the meter on the y axis to start? (used if position is static)
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
*/

var FMParams = PluginManager.parameters('Gimmer_FightyMeters');
Gimmer_Core.FightyMeters.Meter = Gimmer_Core.VisualMeters.cleanMeter(FMParams['Visual Meter']);

Gimmer_Core.FightyMeters.getParamOfEvent = function(eventId){
    let value = 0;
    let event = $gameMap.getEventById(eventId);
    if(event && event._enemy){
        value = event._enemy.hp;
    }
    return value;
}

Gimmer_Core.FightyMeters.getParamMaxOfEvent = function(eventId){
    let value = 0;
    let event = $gameMap.getEventById(eventId);
    if(event && event._enemy){
        value = event._enemy.mhp;
    }
    return value;
}

Game_Map.prototype.getEventById = function(eventId){
    let returnEvent = false;
    $gameMap.events().some(function(event){
        if(event && event._eventId === eventId && event._enemy){
            returnEvent = event;
            return true;
        }
        return false;
    });
    return returnEvent;
}

Gimmer_Core.FightyMeters._Scene_Map_prototype_onMapLoaded = Scene_Map.prototype.onMapLoaded;
Scene_Map.prototype.onMapLoaded = function(){
    Gimmer_Core.FightyMeters._Scene_Map_prototype_onMapLoaded.call(this);
    $dataMap.events.forEach(function(event){
        if(event && event.meta.isEnemy){
            let meter = Gimmer_Core.FightyMeters.Meter;
            meter['eventId'] = event.id;
            meter["fetchParam"] = function(){
                return Gimmer_Core.FightyMeters.getParamOfEvent(this._eventId);
            }
            meter["fetchParamMax"] = function (){
                return Gimmer_Core.FightyMeters.getParamMaxOfEvent(this._eventId);
            }

            meter["Close When Inactive"] = true;

            this.addVisualMeter(meter, "event-"+event.id.toString());
        }
    },this);
}


Gimmer_Core.FightyMeters._Window_VisualMeter_prototype_initialize = Window_VisualMeter.prototype.initialize;
Window_VisualMeter.prototype.initialize = function (meter){
    this._eventId = meter["eventId"] || 'static';
    this._position = meter["Position Type"];
    this._closeWhenInactive = meter["Close When Inactive"] || false;
    this._closeCount = 60;
    Gimmer_Core.FightyMeters._Window_VisualMeter_prototype_initialize.call(this,meter);
}

Gimmer_Core.FightyMeters._Window_VisualMeter_prototype_refresh = Window_VisualMeter.prototype.refresh
Window_VisualMeter.prototype.refresh = function(){

    if(this._closeWhenInactive){
        this.updateCloseCount();
    }

    Gimmer_Core.FightyMeters._Window_VisualMeter_prototype_refresh.call(this);
    if(this._position !== 'static' && this._eventId > 0){
        this.updatePosition();
    }
}

Window_VisualMeter.prototype.updateCloseCount = function(){
    let shouldBeShowing = (this._dirty || this._transitioning);
    if(shouldBeShowing){
        this.fullOpacity();
        this._closeCount = 60;
    }
    else if(this._closeCount > 0){
        this._closeCount--;
    }
    else{
        this.fade(0);
    }
}

Window_VisualMeter.prototype.updatePosition = function(){
    let event = $gameMap.getEventById(this._eventId);
    if(event){
        let x = event.screenX();
        let y = event.screenY();
        let yPadding = 3;
        this._position = 'above';
        if(this._position === 'above'){
            y = y - $gameMap.tileHeight() - this.height - yPadding;
        }
        else{
            y += yPadding;
        }
        x = x - (this.width / 2);
        this.move(x,y, this.width, this.height);
    }
}
