var Imported = Imported || {};

if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

Gimmer_Core['MapWindows'] = {'loaded':true};

//=============================================================================
/*:
 * @plugindesc Show a rename window on the map without pausing
 * @author Gimmer
 * @help
 * ================
 * Gimmer_MapWindows
 * ================
 *
 * @param ---Parameters---
 *
 * @param Actor Id
 * @parent ---Parameters---
 * @type Number
 * @desc Which actorId are we renaming?
 * @default 1
 * Default 1
 *
 * @param Max Characters
 * @parent ---Parameters---
 * @type Number
 * @desc What's the max characters?
 * Default 12
 * @default 12
 *
 * Run the plugin command ShowNaming to show the window
 *
 * Run the plugin command HideNaming to hide the window
 *
 * You'll need to disable map movement yourself.
 * If you are moving with a player you can call Gimmer_Core.stopPlayerMovement()
 * If you want to stop events you can use Gimmer_Core.stopEventMovement()
 *
 */

var MapParams = PluginManager.parameters('Gimmer_MapWindows');
Gimmer_Core.MapWindows.actorId = Number(MapParams['Actor Id']);
Gimmer_Core.MapWindows.maxLength = Number(MapParams['Max Characters']);

Gimmer_Core.MapWindows.isWindowOpen = function (windowName){
    return (windowName in SceneManager._scene && SceneManager._scene[windowName].visible);
}

Gimmer_Core.pluginCommands['SHOWNAMING'] = function (){
    if(SceneManager._scene.constructor === Scene_Map){
        SceneManager._scene._showNamingWindow = true;
    }

}

Gimmer_Core.pluginCommands['HIDENAMING'] = function (){
    if(SceneManager._scene.constructor === Scene_Map){
        SceneManager._scene._hideNamingWindow = true;
    }
}

Gimmer_Core.MapWindows._Scene_Map_prototype_createAllWindows = Scene_Map.prototype.createAllWindows;
Scene_Map.prototype.createAllWindows = function (){
    Gimmer_Core.MapWindows._Scene_Map_prototype_createAllWindows.call(this);
    this.addNamingWindow();
}

Scene_Map.prototype.addNamingWindow = function(){
    this._actor = $gameActors.actor(Gimmer_Core.MapWindows.actorId);
    this._max = Gimmer_Core.MapWindows.maxLength;
    this._editWindow = new Window_NameEdit(this._actor, this._max);
    this._editWindow.visible = false;
    this.addWindow(this._editWindow);
    this._inputWindow = new Window_NameInput(this._editWindow);
    this._inputWindow.setHandler('ok', this.onInputOk.bind(this));
    this._inputWindow.visible = false;
    this.addWindow(this._inputWindow);
    this._showNamingWindow = false;
    this._hideNamingWindow = false;
}

Scene_Map.prototype.onInputOk = function(){
    this._actor.setName(this._editWindow.name());
    this._hideNamingWindow = true;
}

Gimmer_Core.MapWindows._Scene_Map_prototype_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function(){
    Gimmer_Core.MapWindows._Scene_Map_prototype_update.call(this);
    if(this._showNamingWindow){
        this._editWindow.visible = true;
        this._inputWindow.visible = true;
        this._inputWindow.active = true;
        this._showNamingWindow = false;
    }
    if(this._hideNamingWindow){
        this._editWindow.visible = false;
        this._inputWindow.visible = false;
        this._inputWindow.active = false;
        this._hideNamingWindow = false;
    }
}