var Imported = Imported || {};

if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

Imported['Gimmer_BeKindRewind'] = '0.1';

Gimmer_Core['BKR'] = {'loaded':true};

//=============================================================================
/*:
 * @plugindesc Press "TAB" key to rewind map events, including switches, variables, and self switches.
 * @author Gimmer_
 * @help This plugin provides support for rewinding activities on the map.
 *
 * 1) Set a trigger switch to "true" to enable time rewinding powers.
 * 2) Press "TAB" and the game will rewind the last x seconds, where x is defined in the plugin parameters.
 * 3) Set any Variables, Self Switches, or Switches you want not to reset on rewind
 *
 * @param ---Parameters---
 *
 * @param Debug Always On
 * @parent ---Parameters---
 * @type Boolean
 * @desc Ignore the trigger switch for testing purposes?
 * @default false
 * Default false
 *
 * @param Trigger Switch
 * @parent ---Parameters---
 * @type Switch
 * @desc What switch needs to be true for time to be rewindable;
 *
 * @param Variable To Store Rewind Time
 * @parent ---Parameters---
 * @type Variable
 * @desc Which variable to store the rewind seconds in so you can use them in dialog?
 *
 * @param Seconds to Remember
 * @parent ---Parameters---
 * @type Number
 * @default 5
 * Default 5
 * @desc How many seconds to rewind?
 *
 * @param Switches To Remember
 * @parent ---Parameters---
 * @type switch[]
 * @desc List of switches you don't want to rewind
 *
 * @param Variables To Remember
 * @parent ---Parameters---
 * @type variables[]
 * @desc List of variables you don't want to rewind
 *
 * @param Self Switches To Remember
 * @parent ---Parameters---
 * @type text[]
 * @desc List of self switch keys you don't want to rewind (format: MapId-EventId-SwitchLetter)
 *
 */

let bkrParams = PluginManager.parameters('Gimmer_BeKindRewind');

Gimmer_Core.BKR.playerMovementBuffer = [];
Gimmer_Core.BKR.gainBuffer = [];
Gimmer_Core.BKR.eventMovementBuffer = {};
Gimmer_Core.BKR.switchBuffer = [];
Gimmer_Core.BKR.selfSwitchBuffer = [];
Gimmer_Core.BKR.variableBuffer = [];
Gimmer_Core.BKR.eventMovementCache = {};
Gimmer_Core.BKR.GlobalRewind = false;
Gimmer_Core.BKR.SwitchId = Number(bkrParams['Trigger Switch']);
Gimmer_Core.BKR.eventStart = {};
Gimmer_Core.BKR.purgeBuffers = true;
Gimmer_Core.BKR.HistorySeconds = Number(bkrParams['Seconds to Remember']);
Gimmer_Core.BKR.VariableToStoreRewindTime = Number(bkrParams['Variable To Store Rewind Time'])
Gimmer_Core.BKR.HistoryMS = Number(bkrParams['Seconds to Remember'] * 1000); //5 seconds
Gimmer_Core.BKR.LockedSwitches = bkrParams['Switches To Remember'];
Gimmer_Core.BKR.LockedVariables = bkrParams['Variables To Remember'];
Gimmer_Core.BKR.LockedSelfSwitches = eval(bkrParams['Self Switches To Remember']) || [];

Gimmer_Core.BKR.DebugOn = (bkrParams['Debug Always On'] === "true");

Gimmer_Core.BKR.onMapChange = function(){
    $gameVariables.setValue(Gimmer_Core.BKR.VariableToStoreRewindTime, Gimmer_Core.BKR.HistorySeconds);
    Gimmer_Core.BKR.gainBuffer = [];
    Gimmer_Core.BKR.playerMovementBuffer = [];
    Gimmer_Core.BKR.eventMovementBuffer = {};
    Gimmer_Core.BKR.switchBuffer = [];
    Gimmer_Core.BKR.selfSwitchBuffer = [];
    Gimmer_Core.BKR.variableBuffer = [];
    Gimmer_Core.BKR.eventMovementCache = {};
}

Gimmer_Core.BKR.isEnabled = function(){
    return (Gimmer_Core.BKR.DebugOn || $gameSwitches.value(Gimmer_Core.BKR.SwitchId));
}

Gimmer_Core.BKR.SomethingToDo = function(){
    if(!Gimmer_Core.BKR.isEnabled()){
        return false;
    }
    let eventsHaveMovement = false;
    Object.keys(Gimmer_Core.BKR.eventMovementBuffer).some(function(eventId){
        if(Gimmer_Core.BKR.eventMovementBuffer[eventId].route.length){
            eventsHaveMovement = true;
            return false;
        }
        return true;
    });

    return (
        !!(Gimmer_Core.BKR.playerMovementBuffer.length > 0 ||
            eventsHaveMovement ||
            Gimmer_Core.BKR.gainBuffer.length > 0 ||
            Gimmer_Core.BKR.switchBuffer.length > 0 ||
            Gimmer_Core.BKR.selfSwitchBuffer.length > 0||
            Gimmer_Core.BKR.variableBuffer.length > 0))
}

Gimmer_Core.BKR.rewindPlayer = function(){
    if(Gimmer_Core.BKR.playerMovementBuffer.length){
        $gamePlayer._isRewinding = true;
        let origMoveSpeed = $gamePlayer.moveSpeed();
        if($gamePlayer.isDashing()){
            origMoveSpeed--;
        }
        let rewindSpeed = 6;
        let moveList = [{code: 29, parameters:[rewindSpeed]}];
        let oldThrough = $gamePlayer.isThrough();
        moveList.push({code:Game_Character.ROUTE_THROUGH_ON});
        moveList = moveList.concat(Gimmer_Core.BKR.playerMovementBuffer.reverse());
        moveList.push({code: 29, parameters:[origMoveSpeed]});
        moveList.push({code: (oldThrough ? Game_Character.ROUTE_THROUGH_ON : Game_Character.ROUTE_THROUGH_OFF)});
        moveList.push({code:0});
        let moveRoute = {
            list: moveList,
            repeat: false,
            skippable: false,
            wait: false
        }
        $gamePlayer.forceMoveRoute(moveRoute);
    }
}

Gimmer_Core.BKR.rewindGains = function(){
    if(Gimmer_Core.BKR.gainBuffer.length){
        $gameParty._isRewinding = true;
        Gimmer_Core.BKR.gainBuffer.forEach(function(gain){
            if(gain.type === "item"){
                $gameParty.gainItem(gain.item, gain.amount, gain.includeEquip);
            }
        });
        Gimmer_Core.BKR.gainBuffer = [];
        $gameParty._isRewinding = false;
    }
}

Gimmer_Core.BKR.rewindEvent = function(eventId){
    let event = $gameMap.event(eventId);
    if(Gimmer_Core.BKR.eventMovementBuffer[eventId] && Gimmer_Core.BKR.eventMovementBuffer[eventId].route && Gimmer_Core.BKR.eventMovementBuffer[eventId].route.length > 0){
        event._isRewinding = true;
        let origMoveSpeed = event.moveSpeed();
        let rewindSpeed = 6;
        let moveList = [{code: 29, parameters:[rewindSpeed]}];
        let oldThrough = event.isThrough();
        moveList.push({code:Game_Character.ROUTE_THROUGH_ON});
        let reverseList = Gimmer_Core.BKR.eventMovementBuffer[eventId].route.reverse();
        Gimmer_Core.BKR.eventMovementBuffer[eventId].moveIndex = reverseList[reverseList.length - 1].moveIndex;
        moveList = moveList.concat(reverseList);
        moveList.push({code: 29, parameters:[origMoveSpeed]});
        moveList.push({code: (oldThrough ? Game_Character.ROUTE_THROUGH_ON : Game_Character.ROUTE_THROUGH_OFF)});
        moveList.push({code:0});
        let moveRoute = {
            list: moveList,
            repeat: false,
            skippable: false,
            wait: false
        }

        event.forceMoveRoute(moveRoute);
    }
}

Gimmer_Core.BKR.rewindSelfSwitches = function(){
    if(Gimmer_Core.BKR.selfSwitchBuffer.length){
        SceneManager._scene._dirtySwitches = true;
        Gimmer_Core.BKR.selfSwitchBuffer.reverse().forEach(function(selfswitch){
            $gameSelfSwitches.setValue(selfswitch.key, selfswitch.oldValue);
        });
        Gimmer_Core.BKR.selfSwitchBuffer = [];
    }
}

Gimmer_Core.BKR.rewindSwitches = function(){
    if(Gimmer_Core.BKR.switchBuffer.length){
        SceneManager._scene._dirtySwitches = true;
        Gimmer_Core.BKR.switchBuffer.reverse().forEach(function(myswitch){
            $gameSwitches.setValue(myswitch.id, myswitch.oldValue);
        });
        Gimmer_Core.BKR.switchBuffer = [];
    }
}

Gimmer_Core.BKR.rewindVariables = function(){
    if(Gimmer_Core.BKR.variableBuffer.length){
        SceneManager._scene._dirtySwitches = true;
        Gimmer_Core.BKR.variableBuffer.reverse().forEach(function(variable){
            $gameVariables.setValue(variable.variableId, variable.oldValue);
        });
        Gimmer_Core.BKR.variableBuffer = [];
    }
}

Gimmer_Core.BKR.Game_Player_prototype_moveStraight = Game_Player.prototype.moveStraight;
Game_Player.prototype.moveStraight = function(d){
    if(Gimmer_Core.BKR.isEnabled()){
        let time = new Date();
        if(this.direction() !== d){
            Gimmer_Core.BKR.playerMovementBuffer.push(this.turnToReverse(this.direction(), time));
        }
        if(this.canPass(this._x, this._y, d)){
            Gimmer_Core.BKR.playerMovementBuffer.push({code:36, time:time}); //Direction Fix off
            Gimmer_Core.BKR.playerMovementBuffer.push(this.movementToMovelist(d, time));
            Gimmer_Core.BKR.playerMovementBuffer.push({code:35, time:time}); //Direction Fix on
        }
    }
    Gimmer_Core.BKR.Game_Player_prototype_moveStraight.call(this, d);
}

Gimmer_Core.BKR.Game_Player_prototype_jump = Game_Player.prototype.jump;
Game_Player.prototype.jump = function(xPlus, yPlus){
    if(Gimmer_Core.BKR.isEnabled() && !Gimmer_Core.BKR.GlobalRewind){
        let newXplus = xPlus * -1;
        let newYplus = yPlus * -1;
        Gimmer_Core.BKR.playerMovementBuffer.push({code:Game_Character.ROUTE_JUMP, parameters: [newXplus,newYplus],time: new Date()});
    }

    Gimmer_Core.BKR.Game_Player_prototype_jump.call(this, xPlus, yPlus);
}

Gimmer_Core.BKR.Game_Event_prototype_moveStraight = Game_Event.prototype.moveStraight;
Game_Event.prototype.moveStraight = function(d){
    if(Gimmer_Core.BKR.isEnabled()) {
        let time = new Date();
        if (!Gimmer_Core.BKR.eventMovementBuffer[this._eventId]) {
            Gimmer_Core.BKR.eventMovementBuffer[this._eventId] = {'route': [], 'moveIndex': 0};
        }
        let moveIndex = this._moveRouteIndex - 1;
        if (this.direction() !== d) {
            Gimmer_Core.BKR.eventMovementBuffer[this._eventId].route.push(this.turnToReverse(this.direction(), time, moveIndex));
        }
        if (this.canPass(this._x, this._y, d)) {
            Gimmer_Core.BKR.eventMovementBuffer[this._eventId].route.push({code: 36, time: time, moveIndex: moveIndex}); //Direction Fix off
            Gimmer_Core.BKR.eventMovementBuffer[this._eventId].route.push(this.movementToMovelist(d, time, moveIndex));
            Gimmer_Core.BKR.eventMovementBuffer[this._eventId].route.push({code: 35, time: time, moveIndex: moveIndex}); //Direction Fix on
        }
    }

    Gimmer_Core.BKR.Game_Event_prototype_moveStraight.call(this, d);
}


Gimmer_Core.BKR.Game_CharacterBase_prototype_initMembers = Game_CharacterBase.prototype.initMembers;
Game_CharacterBase.prototype.initMembers = function(){
    Gimmer_Core.BKR.Game_CharacterBase_prototype_initMembers.call(this);
    this._isRewinding = false;
}

Game_Player.prototype.processRouteEnd = function(){
    if(this._isRewinding){
        Gimmer_Core.BKR.playerMovementBuffer = [];
        this._isRewinding = false;
    }
    Game_Character.prototype.processRouteEnd.call(this);
}

Game_Event.prototype.restoreMoveRoute = function (){
    Game_Character.prototype.restoreMoveRoute.call(this);
    if(Gimmer_Core.BKR.eventMovementBuffer[this._eventId]){
        this._moveRouteIndex = Gimmer_Core.BKR.eventMovementBuffer[this._eventId].moveIndex;
    }
}

Game_Event.prototype.processRouteEnd = function(){
    if(this._isRewinding){
        Gimmer_Core.BKR.eventMovementBuffer[this._eventId].route = [];
        this._isRewinding = false;
        if(Gimmer_Core.BKR.eventMovementCache[this._eventId] && Gimmer_Core.BKR.eventMovementCache[this._eventId][this._pageIndex]){
            this.setMoveSpeed(Gimmer_Core.BKR.eventMovementCache[this._eventId][this._pageIndex].moveSpeed);
        }
    }
    Game_Character.prototype.processRouteEnd.call(this);
}

Game_Event.prototype.refresh = function() {
    var newPageIndex = this._erased ? -1 : this.findProperPageIndex();
    if (this._pageIndex !== newPageIndex) {
        if(this._moveRoute && Gimmer_Core.BKR.isEnabled()){
            dd('saving move route on page change: page '+this._pageIndex);
            if(!Gimmer_Core.BKR.eventMovementCache[this._eventId]){
                Gimmer_Core.BKR.eventMovementCache[this._eventId] = {};
            }
            if(!Gimmer_Core.BKR.eventMovementCache[this._eventId][this._pageIndex]){
                Gimmer_Core.BKR.eventMovementCache[this._eventId][this._pageIndex] = {};
            }
            Gimmer_Core.BKR.eventMovementCache[this._eventId][this._pageIndex]['moveRouteIndex'] = this._moveRouteIndex;
            Gimmer_Core.BKR.eventMovementCache[this._eventId][this._pageIndex]['moveSpeed'] = this.moveSpeed();
        }
        this._pageIndex = newPageIndex;
        this.setupPage();
    }
};

Gimmer_Core.BKR.Game_Event_prototype_page = Game_Event.prototype.page;
Game_Event.prototype.page = function() {
    let page = Gimmer_Core.BKR.Game_Event_prototype_page.call(this);
    if(Gimmer_Core.BKR.GlobalRewind && page){
        page.moveSpeed = 6;
    }
    return page;
};

Game_Event.prototype.setMoveRoute = function(moveroute){
    Game_Character.prototype.setMoveRoute.call(this,moveroute);
    if(SceneManager._scene._dirtySwitches && Gimmer_Core.BKR.eventMovementCache[this._eventId] && Gimmer_Core.BKR.eventMovementCache[this._eventId][this._pageIndex]){
        this._moveRouteIndex = Gimmer_Core.BKR.eventMovementCache[this._eventId][this._pageIndex].moveRouteIndex;
    }
}

Game_Event.prototype.checkEventTriggerAuto = function() {
    if (this._trigger === 3 && !Gimmer_Core.BKR.GlobalRewind) {
        this.start();
    }
};

Gimmer_Core.BKR.Game_Party_prototype_initialize = Game_Party.prototype.initialize
Game_Party.prototype.initialize = function(){
    Gimmer_Core.BKR.Game_Party_prototype_initialize.call(this);
    this._isRewinding = false;
}

Gimmer_Core.BKR.Game_Party_prototype_gainItem = Game_Party.prototype.gainItem;
Game_Party.prototype.gainItem = function(item, amount, includeEquip) {
    if(!this._isRewinding){
        var container = this.itemContainer(item);
        if (container) {
            let changeAmount = amount * -1;
            Gimmer_Core.BKR.gainBuffer.push({
                'type': 'item',
                'item' : item,
                'amount': changeAmount,
                'includeEquip': includeEquip,
                'time': new Date()
            });
        }
    }
    Gimmer_Core.BKR.Game_Party_prototype_gainItem.call(this,item,amount,includeEquip);
};

Game_CharacterBase.prototype.turnToReverse = function(oldDirection,time,moveIndex){
    let code = 0;
    switch(oldDirection){
        case 4:
            code = Game_Character.ROUTE_TURN_LEFT;
            break;
        case 6:
            code = Game_Character.ROUTE_TURN_RIGHT;
            break;
        case 8:
            code = Game_Character.ROUTE_TURN_UP;
            break;
        case 2:
            code = Game_Character.ROUTE_TURN_DOWN;
            break;
    }

    return {code:code, time:time,moveIndex:moveIndex}
}

Game_CharacterBase.prototype.movementToMovelist = function(d, time, moveIndex){
    let reverse = this.reverseDir(d);
    let code = 0;
    switch(reverse){
        case 4:
            code = Game_Character.ROUTE_MOVE_LEFT;
            break;
        case 6:
            code = Game_Character.ROUTE_MOVE_RIGHT;
            break;
        case 8:
            code = Game_Character.ROUTE_MOVE_UP;
            break;
        case 2:
            code = Game_Character.ROUTE_MOVE_DOWN;
            break;
    }

    return {code:code,intent:null,time:time,moveIndex:moveIndex}
}

Gimmer_Core.BKR.Scene_Map_prototype_onMapLoaded = Scene_Map.prototype.onMapLoaded;
Scene_Map.prototype.onMapLoaded = function(){
    if (this._transfer) {
        Gimmer_Core.BKR.onMapChange();
    }
    else{
        Gimmer_Core.BKR.refreshCaches();
    }
    Gimmer_Core.BKR.Scene_Map_prototype_onMapLoaded.call(this);

}

Gimmer_Core.BKR.Scene_Map_prototype_initialize = Scene_Map.prototype.initialize;
Scene_Map.prototype.initialize = function(){
    Gimmer_Core.BKR.Scene_Map_prototype_initialize.call(this);
    this._rewindRequested = false;
    this._playerFinishedRewinding = false;
    this._eventsFinishedRewinding = [];
    this._dirtySwitches = false;
}

Gimmer_Core.BKR.startRewindEffect = function(){
    SceneManager._scene._spriteset._rewindFilter.sepia();
    $gameSystem.saveBgm();
    AudioManager.stopBgm();
    AudioManager.playSe({
        name:'TapeRewindSE',
        volume: 20, //param
        pitch: 100,
        pan: 0
    });
}

Gimmer_Core.BKR.stopRewindEffect = function(){
    SceneManager._scene._spriteset._rewindFilter.reset();
    AudioManager.stopSe();
    $gameSystem.replayBgm();
}

Gimmer_Core.BKR.Scene_Map_prototype_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function (){
    Gimmer_Core.BKR.Scene_Map_prototype_update.call(this);
    if(!$gameMap.isEventRunning() && !this._rewindRequested && !this.isRewinding() && !Gimmer_Core.BKR.GlobalRewind && Input.isPressed('tab') && Gimmer_Core.BKR.isEnabled()){
        if(Gimmer_Core.BKR.SomethingToDo()){
            this.requestRewind();
            Gimmer_Core.BKR.GlobalRewind = true;
            Gimmer_Core.BKR.rewindSelfSwitches();
            Gimmer_Core.BKR.rewindSwitches();
            Gimmer_Core.BKR.rewindVariables();
            Gimmer_Core.BKR.startRewindEffect();
        }
    }
    if(this._rewindRequested){
        //set tone, do rewind sound effect
        Gimmer_Core.BKR.rewindPlayer();
        $gameMap.events().forEach(function(event){
            Gimmer_Core.BKR.rewindEvent(event._eventId);
        });
        Gimmer_Core.BKR.rewindGains();
        this._rewindRequested = false;
    }
    else if(this.isRewinding()){
        if(!$gamePlayer._isRewinding){
            Gimmer_Core.stopPlayerMovement();
            this._playerFinishedRewinding = true;
        }
        $gameMap.events().forEach(function(event){
            if(!event._isRewinding){
                event._locked = true;
                if(this._eventsFinishedRewinding.indexOf(event) === -1){
                    this._eventsFinishedRewinding.push(event);
                }
            }
        }, this);
    }
    else {
        //Cleanup from completed run
        if(Gimmer_Core.BKR.GlobalRewind){
            this._dirtySwitches = false;
            Gimmer_Core.BKR.stopRewindEffect();

            if(this._playerFinishedRewinding){
                Gimmer_Core.startPlayerMovement();
                this._playerFinishedRewinding = false;
            }
            if(this._eventsFinishedRewinding.length){
                this._eventsFinishedRewinding.forEach(function(event){
                    event._locked = false;
                });
                this._eventsFinishedRewinding = [];
            }
            Gimmer_Core.BKR.GlobalRewind = false;
        }

        if(Gimmer_Core.BKR.purgeBuffers){
            this.purgePlayerBuffer();
            this.purgeEventBuffer();
            this.purgeSelfSwitchBuffer();
            this.purgeSwitchBuffer();
            this.purgeVariableBuffer();
        }

    }
}

Scene_Map.prototype.isRewinding = function (){
    let rewindCount = 0;
    if($gamePlayer._isRewinding){
        rewindCount++;
    }
    $gameMap.events().forEach(function(event){
        if(event._isRewinding){
            rewindCount++;
        }
    });

    if($gameParty._isRewinding){
        rewindCount++;
    }

    return (rewindCount > 0);
}

Scene_Map.prototype.requestRewind = function (){
    this._rewindRequested = true;
}

Scene_Map.prototype.purgePlayerBuffer = function (){
    if(!$gameMap.isEventRunning()){
        let expiryDate = new Date() - Gimmer_Core.BKR.HistoryMS;
        Gimmer_Core.BKR.playerMovementBuffer.forEach(function(command, index){
            if(command.time < expiryDate){
                Gimmer_Core.BKR.playerMovementBuffer.splice(index,1);
            }
        });
    }
}

Gimmer_Core.BKR.refreshCaches = function(){
    Gimmer_Core.BKR.playerMovementBuffer.forEach(function(command, index){
        Gimmer_Core.BKR.playerMovementBuffer[index].time = new Date();
    });
    $gameMap.events().forEach(function(event){
        if(Gimmer_Core.BKR.eventMovementBuffer[event._eventId]){
            Gimmer_Core.BKR.eventMovementBuffer[event._eventId].route.forEach(function(command, index){
                Gimmer_Core.BKR.eventMovementBuffer[event._eventId].route[index].time = new Date();
            });
        }
    });
    Gimmer_Core.BKR.selfSwitchBuffer.forEach(function(selfSwitch, index){
        Gimmer_Core.BKR.selfSwitchBuffer[index].time  = new Date()
    });
    Gimmer_Core.BKR.switchBuffer.forEach(function(myswitch, index){
        Gimmer_Core.BKR.switchBuffer[index].time = new Date();
    });

    Gimmer_Core.BKR.variableBuffer.forEach(function(variable, index){
        Gimmer_Core.BKR.variableBuffer[index].time = new Date();
    });
}

Scene_Map.prototype.purgeEventBuffer = function (){
    if(!$gameMap.isEventRunning()){
        let expiryDate = new Date() - Gimmer_Core.BKR.HistoryMS;
        $gameMap.events().forEach(function(event){
            if(Gimmer_Core.BKR.eventMovementBuffer[event._eventId]){
                Gimmer_Core.BKR.eventMovementBuffer[event._eventId].route.forEach(function(command, index){
                    if(command.time < expiryDate){
                        Gimmer_Core.BKR.eventMovementBuffer[event._eventId].route.splice(index,1);
                    }
                });
            }
        });
    }
}

Scene_Map.prototype.purgeSelfSwitchBuffer = function(){
    if(!$gameMap.isEventRunning()){
        let expiryDate = new Date() - Gimmer_Core.BKR.HistoryMS;
        Gimmer_Core.BKR.selfSwitchBuffer.forEach(function(selfSwitch, index){
            if(selfSwitch.time < expiryDate){
                Gimmer_Core.BKR.selfSwitchBuffer.splice(index,1);
            }
        });
    }
}

Scene_Map.prototype.purgeSwitchBuffer = function(){
    if(!$gameMap.isEventRunning()){
        let expiryDate = new Date() - Gimmer_Core.BKR.HistoryMS;
        Gimmer_Core.BKR.switchBuffer.forEach(function(myswitch, index){
            if(myswitch.time < expiryDate){
                Gimmer_Core.BKR.switchBuffer.splice(index,1);
            }
        });
    }
}

Scene_Map.prototype.purgeVariableBuffer = function(){
    if(!$gameMap.isEventRunning()){
        let expiryDate = new Date() - Gimmer_Core.BKR.HistoryMS;
        Gimmer_Core.BKR.variableBuffer.forEach(function(variable, index){
            if(variable.time < expiryDate){
                Gimmer_Core.BKR.variableBuffer.splice(index,1);
            }
        });
    }
}

//Switch changes
Gimmer_Core.BKR.Game_Switches_prototype_setValue = Game_Switches.prototype.setValue;
Game_Switches.prototype.setValue = function(switchId, value) {
    if (Gimmer_Core.BKR.isEnabled() && !Gimmer_Core.BKR.GlobalRewind && switchId > 0 && switchId < $dataSystem.switches.length && Gimmer_Core.BKR.LockedSwitches.indexOf(switchId.toString()) === -1) {
        let oldValue = !!this._data[switchId];
        Gimmer_Core.BKR.switchBuffer.push({id:switchId, oldValue:oldValue, time: new Date()});
    }
    Gimmer_Core.BKR.Game_Switches_prototype_setValue.call(this, switchId, value);
};

Gimmer_Core.BKR.Game_SelfSwitches_prototype_setValue = Game_SelfSwitches.prototype.setValue;
Game_SelfSwitches.prototype.setValue = function(key, value) {
    let checkKey = key[0]+"-"+key[1]+"-"+key[2];
    if(Gimmer_Core.BKR.isEnabled() && !Gimmer_Core.BKR.GlobalRewind && Gimmer_Core.BKR.LockedSelfSwitches.indexOf(checkKey) === -1) {
        let oldValue = !!this._data[key];
        Gimmer_Core.BKR.selfSwitchBuffer.push({key: key, oldValue: oldValue, time: new Date()});
    }
    Gimmer_Core.BKR.Game_SelfSwitches_prototype_setValue.call(this,key,value);
};

Gimmer_Core.BKR.Game_Variables_prototype_setValue = Game_Variables.prototype.setValue;
Game_Variables.prototype.setValue = function(variableId, value) {
    if (Gimmer_Core.BKR.isEnabled() && !Gimmer_Core.BKR.GlobalRewind && variableId > 0 && variableId < $dataSystem.variables.length  && Gimmer_Core.BKR.LockedVariables.indexOf(variableId.toString()) === -1) {
        Gimmer_Core.BKR.variableBuffer.push({variableId: variableId, oldValue: this._data[variableId], time: new Date()});
    }
    Gimmer_Core.BKR.Game_Variables_prototype_setValue.call(this, variableId, value);
};

//Create rewind filter
Gimmer_Core.BKR.Spriteset_Map_prototype_initialize = Spriteset_Map.prototype.initialize
Spriteset_Map.prototype.initialize = function (){
    Gimmer_Core.BKR.Spriteset_Map_prototype_initialize.call(this);
    this._rewindFilter = new PIXI.filters.ColorMatrixFilter;
    if(this._baseSprite.filters.length){
        this._baseSprite.filters = [this._toneFilter, this._rewindFilter];
    }
    else{
        this._baseSprite.filters = [this._rewindFilter];
    }
}

//Create a timer at start and end of events
Gimmer_Core.BKR.Game_Interpreter_prototype_setup = Game_Interpreter.prototype.setup;
Game_Interpreter.prototype.setup = function(list, eventId){
    Gimmer_Core.BKR.Game_Interpreter_prototype_setup.call(this,list,eventId);
    if(Gimmer_Core.BKR.isEnabled()){
        Gimmer_Core.BKR.eventStart[this._eventId] = new Date().getTime();
    }
}

Gimmer_Core.BKR.Game_Interpreter_prototype_terminate = Game_Interpreter.prototype.terminate;
Game_Interpreter.prototype.terminate = function (){
    Gimmer_Core.BKR.Game_Interpreter_prototype_terminate.call(this);
    let diff = new Date() - Gimmer_Core.BKR.eventStart[this._eventId];
    let eventId = this._eventId;
    Gimmer_Core.BKR.playerMovementBuffer.forEach(function(line){
        line.time = new Date(line.time.getTime() + diff);
    });
    Object.keys(Gimmer_Core.BKR.eventMovementBuffer).forEach(function(eventKey){
        Gimmer_Core.BKR.eventMovementBuffer[eventKey].route.forEach(function(step){
            if(parseInt(eventKey) !== eventId){ //only add the length of the event to the ones that aren't you
                step.time = new Date(step.time.getTime() + diff)
            }
            else{
                step.time = new Date(); //All movement in an event happens at the same time, so it's all or nothing
            }
        });
    });
    Gimmer_Core.BKR.selfSwitchBuffer.forEach(function(line){
        if(line.key[0] == this._mapId && line.key[1] == this._eventId){
            //This switch belongs to the running event, tie it in to the same time
            line.time = new Date();
        }
        else{
            line.time = new Date(line.time.getTime() + diff);
        }

    }, this);
    Gimmer_Core.BKR.switchBuffer.forEach(function(line){
        line.time = new Date(line.time.getTime() + diff);
    });
    Gimmer_Core.BKR.variableBuffer.forEach(function(line){
        line.time = new Date(line.time.getTime() + diff);
    });
    delete Gimmer_Core.BKR.eventStart[this._eventId];
}