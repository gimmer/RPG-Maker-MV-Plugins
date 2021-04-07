if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

Gimmer_Core['SelfSwitcheroo'] = {'loaded':true};

Imported = Imported || {};
Imported['Gimmer_SelfSwitcheroo'] = true;

//=============================================================================
/*:
 * @plugindesc v1.0 - Change self switches for another event from a different event
 * @author Gimmer_
 * @help You can use this plugin to change self switches for another event, anywhere in the game.
 *
 * =====================
 * Gimmer_SelfSwitcheroo
 * =====================
 *
 * Plugin Command:
 *
 * SelfSwitch map event switchLetter value
 *
 * Where map can be the number for the map or the name of the map (note: names require you using unique names)
 * Where event can be the number of the event or the name of the event (note: names require unique names per map)
 * switch letter (A through Z, although obvious the editor only goes up to D)
 * value: true or 1 for on, 0 or false for off
 *
 * Terms of Use:
 * =======================================================================
 * Free for both commercial and non-commercial use, with credit.
 * More Gimmer_ plugins at: https://github.com/gimmer/RPG-Maker-MV-Plugins
 * =======================================================================
 *
  */

Gimmer_Core.SelfSwitcheroo.DeferredSelfSwitches = {};

Gimmer_Core.pluginCommands["SELFSWITCH"] = function (params){
    if(isNaN(Number(params[1]))){
        Gimmer_Core.SelfSwitcheroo.setDeferredSelfSwitch(params);
    }
    Gimmer_Core.SelfSwitcheroo.setSelfSwitch(params);
}

Gimmer_Core.SelfSwitcheroo.setSelfSwitch = function(params){
    let value = (params[3] === "true" || Number(params[3]) === 1);
    $gameSelfSwitches.setValue(Gimmer_Core.SelfSwitcheroo.getEventKeyFromParams(params), value);
}

Gimmer_Core.SelfSwitcheroo.setDeferredSelfSwitch = function(params){
    let eventName = params[1];
    let key = this.getEventKeyFromParams(params);
    if(!(key[0].toString() in  Gimmer_Core.SelfSwitcheroo.DeferredSelfSwitches)){
        Gimmer_Core.SelfSwitcheroo.DeferredSelfSwitches[key[0].toString()] = {}
    }
    Gimmer_Core.SelfSwitcheroo.DeferredSelfSwitches[key[0].toString()][eventName] = {value: params[3], switch: params[2]};
    if(key[0] === $gameMap._mapId){
        Gimmer_Core.SelfSwitcheroo.checkForEventsByNameOnCurrentMap();
    }
}

Gimmer_Core.SelfSwitcheroo.getEventKeyFromParams = function(params){
    let mapId = Number(params[0]);

    if(isNaN(mapId)){
        //It was a map name
        mapId = params[0];
        let myMap = $dataMapInfos.find(mapObj => {
            return (mapObj && mapObj.name.toUpperCase() === mapId.toUpperCase());
        });

        if(myMap){
            mapId = Number(myMap.id);
        }
    }
    let eventId = Number(params[1]);
    let switchLetter = params[2];
    return [mapId, eventId, switchLetter];
}

Gimmer_Core.SelfSwitcheroo.checkForEventsByNameOnCurrentMap = function(){
    if($gameMap._mapId.toString() in Gimmer_Core.SelfSwitcheroo.DeferredSelfSwitches){
        $dataMap.events.forEach(function(event){
            if(event && event.name in Gimmer_Core.SelfSwitcheroo.DeferredSelfSwitches[$gameMap._mapId.toString()]){
                let obj = Gimmer_Core.SelfSwitcheroo.DeferredSelfSwitches[$gameMap._mapId.toString()][event.name];
                Gimmer_Core.SelfSwitcheroo.setSelfSwitch([$gameMap._mapId, event.id, obj.switch, obj.value]);
                delete Gimmer_Core.SelfSwitcheroo.DeferredSelfSwitches[$gameMap._mapId.toString()][event.name];
            }
        });
    }
}

Gimmer_Core.SelfSwitcheroo._Scene_Map_prototype_onMapLoaded = Scene_Map.prototype.onMapLoaded;
Scene_Map.prototype.onMapLoaded = function(){
    Gimmer_Core.SelfSwitcheroo._Scene_Map_prototype_onMapLoaded.call(this);
    Gimmer_Core.SelfSwitcheroo.checkForEventsByNameOnCurrentMap();
}

