if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

Gimmer_Core['SystemMenu'] = {'loaded':true};

//=============================================================================
/*:
 * @plugindesc v1.1 - Support spliting out some menu options to a different menu
 * @author Gimmer_
 *
 * ================
 * Gimmer_SystemMenu
 * ================
 *
 * Split the menu so that you have a game menu & system menu (for settings, quitting the game etc.)
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
 *
 * @param Move Options To System Menu
 * @parent ---Parameters---
 * @type Boolean
 * @desc Move options to the system menu?
 * Default True
 * @default true
 *
 * @param Move Save To System Menu
 * @parent ---Parameters---
 * @type Boolean
 * @desc Move save to the system menu?
 * Default True
 * @default true
 *
 * @param Move Game End To System Menu
 * @parent ---Parameters---
 * @type Boolean
 * @desc Move game end to the system menu?
 * Default True
 * @default true
 *
 * @param Keyboard Key for System Menu
 * @type select
 * @desc What button should open the system menu on the keyboard?
 * @option Escape
 * @value 27
 * @option Insert
 * @value 45
 * @option Numpad 0
 * @value 96
 * @option X
 * @value 88
 *
 * @param Gamepad Key for System Menu
 * @type select
 * @desc What button should open the system menu on the keyboard?
 * @option Select
 * @value 8
 * @option Start
 * @value 9
 * @option Menu (Y on Xbox, Triangle on PS)
 * @value 3
 *
 */

var smParamaters = PluginManager.parameters('Gimmer_SystemMenu');
Gimmer_Core.SystemMenu.IncludeOptions = (smParamaters['Move Options To System Menu'] === "true");
Gimmer_Core.SystemMenu.IncludeSave = (smParamaters['Move Save To System Menu'] === "true");
Gimmer_Core.SystemMenu.IncludeGameEnd = (smParamaters['Move Game End To System Menu'] === "true");
Gimmer_Core.SystemMenu.KeyBind = Number(smParamaters['Keyboard Key for System Menu']);
if(Gimmer_Core.SystemMenu.KeyBind >= 0){
    Input.keyMapper[Gimmer_Core.SystemMenu.KeyBind] = 'system';
}
else{
    Input.keyMapper[27] = 'system';     // esc - open menu
}
Gimmer_Core.SystemMenu.GamepadBind = Number(smParamaters['Gamepad Key for System Menu']);
if(Gimmer_Core.SystemMenu.GamepadBind >= 0){
    Input.gamepadMapper[Gimmer_Core.SystemMenu.GamepadBind] = 'system';
}
else{
    Input.gamepadMapper[8] = 'system' //Select? Maybe?
}

//System Menu support
var Scene_Map_prototype_updateScene = Scene_Map.prototype.updateScene;
Scene_Map.prototype.updateScene = function(){
    Scene_Map_prototype_updateScene.call(this);
    if(!SceneManager.isSceneChanging()){
        this.updateCallSystemMenu();
    }
}
var Scene_Map_prototype_initialize = Scene_Map.prototype.initialize;
Scene_Map.prototype.initialize = function(){
    Scene_Map_prototype_initialize.call(this);
    this.systemMenuCalling = false;
}

Scene_Map.prototype.updateCallSystemMenu = function() {
    if (this.isSystemMenuEnabled()) {
        if (this.isSystemMenuCalled()) {
            this.systemMenuCalling = true;
        }
        if (this.systemMenuCalling && !$gamePlayer.isMoving()) {
            this.callSystemMenu();
        }
    } else {
        this.systemMenuCalling = false;
    }
};

Scene_Map.prototype.isSystemMenuCalled = function(){
    return Input.isTriggered('system');
}

Scene_Map.prototype.callSystemMenu = function(){
    SoundManager.playOk();
    SceneManager.push(Scene_SystemMenu);
    Window_MenuSystem.initCommandPosition();
    $gameTemp.clearDestination();
    this._mapNameWindow.hide();
    this._waitCount = 2;
}


Scene_Map.prototype.isSystemMenuEnabled = function(){
    return $gameSystem.isSystemMenuEnabled() && !$gameMap.isEventRunning();
}

var Game_System_prototype_initialize = Game_System.prototype.initialize;
Game_System.prototype.initialize = function(){
    Game_System_prototype_initialize.call(this);
    this._systemMenuEnabled = true;
}

Game_System.prototype.disableMenu = function() {
    this._menuEnabled = false;
    this._systemMenuEnabled = false;
};

Game_System.prototype.enableMenu = function() {
    this._menuEnabled = true;
    this._systemMenuEnabled = true;
};

Game_System.prototype.isSystemMenuEnabled = function(){
    return this._systemMenuEnabled;
};

//Overload existing menu
Window_MenuCommand.prototype.makeCommandList = function() {
    this.addMainCommands();
    this.addFormationCommand();
    this.addOriginalCommands();
    if(!Gimmer_Core.SystemMenu.IncludeOptions){
        this.addOptionsCommand();
    }
    if(!Gimmer_Core.SystemMenu.IncludeSave){
        this.addSaveCommand();
    }
    if(!Gimmer_Core.SystemMenu.IncludeGameEnd){
        this.addGameEndCommand();
    }

};

//System Menu object
function Scene_SystemMenu() {
    this.initialize.apply(this, arguments);
}

Scene_SystemMenu.prototype = Object.create(Scene_Menu.prototype);
Scene_SystemMenu.prototype.constructor = Scene_SystemMenu;

Scene_SystemMenu.prototype.initialize = function() {
    Scene_Menu.prototype.initialize.call(this);
};

Scene_SystemMenu.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createCommandWindow();
    this._commandWindow.x = Graphics.boxWidth / 2 - this._commandWindow.width / 2;
    this._commandWindow.y = Graphics.boxHeight / 2 - this._commandWindow.height / 2;
};

Scene_SystemMenu.prototype.start = function() {
    Scene_MenuBase.prototype.start.call(this);
};

Scene_SystemMenu.prototype.createCommandWindow = function(){
    this._commandWindow = new Window_MenuSystem(0, 0);
    this._commandWindow.setHandler('options',   this.commandOptions.bind(this));
    this._commandWindow.setHandler('save',      this.commandSave.bind(this));
    this._commandWindow.setHandler('gameEnd',   this.commandGameEnd.bind(this));
    this._commandWindow.setHandler('cancel',    this.popScene.bind(this));
    this.addWindow(this._commandWindow);
}

//Extended Windows
function Window_MenuSystem(){
    this.initialize.apply(this,arguments);
}

Window_MenuSystem.prototype = Object.create(Window_MenuCommand.prototype);
Window_MenuSystem.prototype.constructor = Window_MenuSystem;

Window_MenuSystem.prototype.initialize = function(x,y){
    Window_MenuCommand.prototype.initialize.call(this,x,y);
}

Window_MenuSystem.prototype.makeCommandList = function(){
    if(Gimmer_Core.SystemMenu.IncludeOptions){
        this.addOptionsCommand();
    }
    if(Gimmer_Core.SystemMenu.IncludeSave){
        this.addSaveCommand();
    }
    if(Gimmer_Core.SystemMenu.IncludeGameEnd){
        this.addGameEndCommand();
    }
}

Window_MenuSystem.initCommandPosition = function() {
    this._lastCommandSymbol = null;
};

Window_Selectable.prototype.isCancelTriggered = function() {
    return Input.isRepeated('cancel') || Input.isRepeated('system');
};