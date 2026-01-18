var Gimmer_Core = Gimmer_Core || {};

Imported = Imported || {};
Imported['Gimmer_StateYerBusiness'] = true;

Gimmer_Core['syb'] = {'loaded':true};

//=============================================================================
/*:
 * @plugindesc v1.0.1 - Create a list of states to pick to start your game at
 * @author Gimmer_
 * @help This plugin is for debugging. It replaces the title scene.
 *
 * Create a list of states where you set the switches, self switches, variables, map starting point, items,
 * plugin commands, common event, and even raw javascript to run at the press of the button to start a new game
 *
 * =================
 * Version History
 * =================
 * - 1.0: Initial release
 * - 1.0.1: Fixing bug with not included options.
 * - 1.1: Adding in support for global state
 *
 * @param ---Global---
 * @default
 *
 * @param Global State
 * @parent ---Global---
 * @type struct<state>
 *
 * @param State List
 * @type struct<state>[]
 *
 */
/*~struct~state:
* @param Label
* @type text
* @desc Label in the drop down menu. It's your full game screen wide, so make it long and descriptive.
*
* @param Switches
* @type switch[]
* @desc List of switches to turn on
*
* @param Variables
* @type struct<variable>[]
* @desc A list of variable ids and their values
*
* @param SelfSwitches
* @type struct<selfswitch>[]
* @desc A list of self swiches and their mapIds, eventIds, and letters to turn on.
*
* @param Transfer
* @type struct<transfer>
* @desc Transfer information for the player.
*
* @param Items
* @type struct<item>[]
* @desc Items to give at start up.
*
* @param Plugin Commands
* @type text[]
* @desc A list of plugin commands in the same format as you'd write them into an event.
*
* @param Common Event
* @type common_event
* @desc Common event you want to run
*
* @param Javascript
* @type text
* @desc Raw JavaScript to be eval'd and run.
*
*/
/*~struct~variable:
* @param key
* @type variable
* @desc Variable you want to set
*
* @param value
* @type Text
* @desc Value you want. Will attempt to turn the value into numbers if they are numbers
*/
/*~struct~selfswitch:
* @param mapId
* @type number
* @desc MapId of the event
*
* @param eventId
* @type number
* @desc EventId of the event
*
* @param letter
* @type text
* @desc Letter of the self switch to turn on (A, B, C, D)
*/
/*~struct~transfer:
* @param mapId
* @type number
* @desc What mapId to arrive at?
*
* @param x
* @type number
* @desc What X coordinate to arrive at?
*
* @param y
* @type number
* @desc What Y coordinate to arrive at?
*
* @param direction
* @type number
* @desc What direction to arrive facing?
*
* @param fadeType
* @type number
* @desc 0 for black, 1 for white
* @min 0
* @max 1
* Default: 0
* @default 0
*/
/*~struct~item:
* @param itemId
* @type number
* @desc ItemId you want
*
* @param amount
* @type number
* @desc Number you want. Negative will try to take items away (although it's a new game, so you won't have items unless
* other plugins are doing something)
*/

/**
 * New Object for State information
 * @param rawState
 * @constructor
 */

function StateObject(rawState) {
    this.label = rawState['Label'];
    this.switches = this.parseSwitches(rawState['Switches']);
    this.variables = this.parseVariables(rawState['Variables']);
    this.selfswitches = this.parseSelfSwitches(rawState['SelfSwitches']);
    this.items = this.parseItems(rawState['Items']);
    this.transfer = this.parseTransfer(rawState['Transfer']);
    this.commonEvent = this.parseCommonEvent(rawState['Common Event']);
    this.pluginCommands = this.parsePluginCommands(rawState['Plugin Commands']);
    this.script = this.parseJavascript(rawState['Javascript']);
}

StateObject.prototype.parseSwitches = function(switches){
    if(!switches){
        switches = [];
    }
    else{
        switches = JSON.parse(switches);
    }
    return switches.map(function(element){
        return Number(element);
    });
}

StateObject.prototype.parseVariables = function(variables){
    if(!variables){
        variables = [];
    }
    else{
        variables = JSON.parse(variables);
    }
    return variables.map(function(element){
        element = JSON.parse(element);
        element.key = Number(element.key);
        element.value = (isFinite(String(element.value)) ? Number(element.value) : element.value)
        return element;
    });
}

StateObject.prototype.parseSelfSwitches = function(selfSwitches){
    if(!selfSwitches){
        selfSwitches = [];
    }
    else{
        selfSwitches = JSON.parse(selfSwitches);
    }
    return selfSwitches.map(function(element){
        element = JSON.parse(element);
        element.mapId = Number(element.mapId);
        element.eventId = Number(element.eventId);
        return element;
    });
}

StateObject.prototype.parseItems = function(items){
    if(!items){
        items = [];
    }
    else{
        items = JSON.parse(items);
    }
    return items.map(function(element){
        element = JSON.parse(element);
        element.itemId = Number(element.itemId);
        element.amount = Number(element.amount);
        return element;
    });
}

StateObject.prototype.parseTransfer = function(transfer){
    if(transfer){
        transfer = JSON.parse(transfer);
        transfer.mapId = Number(transfer.mapId);
        transfer.x = Number(transfer.x)
        transfer.y = Number(transfer.y)
        transfer.direction = Number(transfer.direction)
        transfer.fadeType = Number(transfer.fadeType);
    }
    else{
        transfer = {};
    }

    return transfer;
}

StateObject.prototype.parseCommonEvent = function(commonEventId){
    return Number(commonEventId);
}

StateObject.prototype.parsePluginCommands = function(pluginCommands){
    if(!pluginCommands){
        pluginCommands = [];
    }
    else{
        pluginCommands = JSON.parse(pluginCommands);
    }
    return pluginCommands;
}

StateObject.prototype.parseJavascript = function(script){
    return script;
}

Gimmer_Core.syb.createStateList = function(stateList){
    Gimmer_Core.syb.STATES = [];
    stateList.forEach(function(state){
        Gimmer_Core.syb.STATES.push(new StateObject(JSON.parse(state)));
    });
}

Gimmer_Core.syb.createGlobalState = function(state){
    Gimmer_Core.syb.globalState = new StateObject(state);
}

Gimmer_Core.syb.rawParameters = PluginManager.parameters('Gimmer_StateYerBusiness');
Gimmer_Core.syb.createStateList(JSON.parse(Gimmer_Core.syb.rawParameters['State List']));
Gimmer_Core.syb.createGlobalState(JSON.parse(Gimmer_Core.syb.rawParameters['Global State']));

/**
 * New State Scene
 */

function Scene_State() {
    this.initialize.apply(this, arguments);
}

Scene_State.prototype = Object.create(Scene_Base.prototype);
Scene_State.prototype.constructor = Scene_State;

Scene_State.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
    this.createWindowLayer();
    this.createStateWindow();
};

Scene_State.prototype.createStateWindow = function() {
    this._stateWindow = new Window_StateSelect(0,0,Graphics.boxWidth, Graphics.boxHeight);
    this._stateWindow.setHandler('ok', this.commandState.bind(this));
    this._stateWindow.setHandler('cancel', this.commandExit.bind(this));
    this.addWindow(this._stateWindow);
};

Scene_State.prototype.commandState = function(){
    this.processGlobalState();
    this.processChosenState();
    this.startGame();
}

Scene_State.prototype.processGlobalState = function(){
    this.processGivenStateItem(Gimmer_Core.syb.globalState);
}

Scene_State.prototype.processChosenState = function(){
    const item = this._stateWindow.item();
    if(item) {
        this.processGivenStateItem(item);
    }
}

Scene_State.prototype.processGivenStateItem = function(item){
    this.processSwitches(item.switches);
    this.processVariables(item.variables);
    this.processSelfSwitches(item.selfswitches);
    this.processItems(item.items);
    this.processMapTransfer(item.transfer);
    this.processCommonEvent(item.commonEvent);
    this.processJavascript(item.script);
    this.processPluginCommands(item.pluginCommands);
}

Scene_State.prototype.commandExit = function(){
    SceneManager.pop();
}

Scene_State.prototype.processSwitches = function(switches){
    if(switches && switches.length) {
        switches.forEach(function (switchId) {
            $gameSwitches.setValue(switchId, true);
        });
    }
}

Scene_State.prototype.processVariables = function(variables){
    if(variables && variables.length){
        variables.forEach(function(variable){
            const variableId = variable.key;
            const value = variable.value;
            $gameVariables.setValue(variableId, value);
        });
    }
}

Scene_State.prototype.processSelfSwitches = function(selfswitches){
    if(selfswitches && selfswitches.length) {
        selfswitches.forEach(function (selfswitch) {
            const mapId = selfswitch.mapId;
            const eventId = selfswitch.eventId;
            const letter = selfswitch.letter;
            $gameSelfSwitches.setValue([mapId, eventId, letter], true);
        });
    }
}

Scene_State.prototype.processItems = function(items){
    if(items && items.length){
        items.forEach(function(item){
            const itemId = item.itemId;
            if($dataItems[itemId]) {
                const itemObject = $dataItems[itemId];
                const amount = item.amount;
                $gameParty.gainItem(itemObject, amount);
            }
            else{
                console.log("ItemId not found: "+itemId);
            }
        })
    }
}

Scene_State.prototype.processMapTransfer = function(transfer){
    if(Object.keys(transfer).length > 0) {
        $gamePlayer.reserveTransfer(transfer.mapId, transfer.x, transfer.y, transfer.d, transfer.fade ?? 0);
    }
}

Scene_State.prototype.processCommonEvent = function(commonEventId){
    if(commonEventId > 0){
        if($dataCommonEvents[commonEventId]){
            $gameTemp.reserveCommonEvent(commonEventId);
        }
        else{
            console.log("Common event not found: "+commonEventId);
        }
    }
}

Scene_State.prototype.processJavascript = function(script){
    //todo maybe do this AFTER transfer?
    if(script && script.length){
        eval(script);
    }
}

Scene_State.prototype.processPluginCommands = function(pluginCommands){
    if(pluginCommands && pluginCommands.length){
        const interpreter = new Game_Interpreter();
        pluginCommands.forEach(function(pluginCommand){
            let args = pluginCommand.split(" ");
            let command = args.shift();
            interpreter.pluginCommand(command, args);
        });
    }
}

Scene_State.prototype.startGame = function(){
    SceneManager.goto(Scene_Map);
}

/**
 * New State Window
 */

function Window_StateSelect() {
    this.initialize.apply(this, arguments);
}

Window_StateSelect.prototype = Object.create(Window_Selectable.prototype);
Window_StateSelect.prototype.constructor = Window_StateSelect;

Window_StateSelect.prototype.initialize = function(x, y, width, height) {
    Window_Selectable.prototype.initialize.call(this, x, y, width, height);
    this._index = 0;
    this.activate();
    this.refresh();
};

Window_StateSelect.prototype.item = function(){
    return Gimmer_Core.syb.STATES[this._index];
}

Window_StateSelect.prototype.maxItems = function(){
    return Gimmer_Core.syb.STATES.length;
}

Window_StateSelect.prototype.drawAllItems = function() {
    var topIndex = this.topIndex();
    for (var i = 0; i < this.maxPageItems(); i++) {
        var index = topIndex + i;
        if (index < this.maxItems()) {
            this.drawItem(index);
        }
    }
};

Window_StateSelect.prototype.drawItem = function(index){
    const item = Gimmer_Core.syb.STATES[index];
    const rect = this.itemRectForText(index);
    this.drawText(item.label, rect.x, rect.y, rect.width,'left');
}

/**
 * Go right to list
 */

Gimmer_Core.syb._SceneManager_goto = SceneManager.goto;
SceneManager.goto = function(sceneClass){
    if(sceneClass === Scene_Title){
        sceneClass = Scene_State;
    }
    Gimmer_Core.syb._SceneManager_goto.call(this, sceneClass);
}
