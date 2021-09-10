if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

Gimmer_Core['BOOT'] = {'loaded':true};

var Imported = Imported || {};
Imported['Gimmer_Boot'] = '1.0';

//=============================================================================
/*:
 * @plugindesc Pre boot support to load databases before other databases
 * @author Gimmer_
 * @help
 *
 * Largely used to work with other plugins
 *
 * Version History:
 * - Version 1.0: Initial Release
 *
 */

Gimmer_Core.BOOT.loaded = false;

Gimmer_Core.BOOT.SceneManager_goto = SceneManager.goto;
SceneManager.goto = function(sceneClass){
    if(sceneClass === Scene_Boot && !Gimmer_Core.BOOT.loaded){
        sceneClass = Scene_GimmerBoot;
    }
    Gimmer_Core.BOOT.SceneManager_goto.call(this, sceneClass);
}

//Force Scene Pre Boot
function Scene_GimmerBoot() {
    this.initialize.apply(this, arguments);
}

Scene_GimmerBoot.prototype = Object.create(Scene_Base.prototype);
Scene_GimmerBoot.prototype.constructor = Scene_GimmerBoot;

Scene_GimmerBoot.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
};

Scene_GimmerBoot.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
    DataManager.loadFirstDatabase();
};

Scene_GimmerBoot.prototype.isReady = function() {
    if (Scene_Base.prototype.isReady.call(this)) {
        return DataManager.isFirstDatabaseLoaded();
    } else {
        return false;
    }
};

Scene_GimmerBoot.prototype.start = function() {
    Scene_Base.prototype.start.call(this);
    Gimmer_Core.BOOT.loaded = true;
    SceneManager.goto(Scene_Boot);
};

//Load First Database function
DataManager._firstDatabaseFiles = [];

DataManager.loadFirstDatabase = function() {
    var test = this.isBattleTest() || this.isEventTest();
    var prefix = test ? 'Test_' : '';
    for (var i = 0; i < this._firstDatabaseFiles.length; i++) {
        var name = this._firstDatabaseFiles[i].name;
        var src = this._firstDatabaseFiles[i].src;
        this.loadDataFile(name, prefix + src);
    }
};

DataManager.isFirstDatabaseLoaded = function() {
    this.checkError();
    for (var i = 0; i < this._firstDatabaseFiles.length; i++) {
        if (!window[this._firstDatabaseFiles[i].name]) {
            return false;
        }
    }
    return true;
};