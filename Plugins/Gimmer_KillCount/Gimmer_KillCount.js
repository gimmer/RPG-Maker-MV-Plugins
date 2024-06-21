var Gimmer_Core = Gimmer_Core || {};
Gimmer_Core['kc'] = {'loaded':true};

//=============================================================================
/*:
 * @plugindesc v1.0 - Count kills for a specific enemy
 * @author Gimmer
 * @help
 * =================
 * Gimmer_KillCount
 * =================
 *
 * Run the plugin command to start counting kills of a given enemyId:
 * (Note: starting a new tracking will reset the current kill count)
 *
 * startKillCount enemyId
 *
 * E.G. startKillCount 3 to track enemyId 3
 *
 * Run the plugin command to stop counting kills
 *
 * stopKillCount
 *
 * Run the plugin command to reset kill count
 *
 * resetKillCount
 *
 * ================
 * Version History
 * ================
 * - 1.0: Release
 *
 * @param ---Parameters---
 * @default
 *
 * @param VariableId For Kills
 * @parent ---Parameters---
 * @type variable
 * @desc Variable Id for the kills to go into
 *
 */

Gimmer_Core.kc.rawParameters = PluginManager.parameters('Gimmer_KillCount');
Gimmer_Core.kc.KILL_VARIABLE_ID = Number(Gimmer_Core.kc.rawParameters['VariableId For Kills']);

/**
 * Game_Map Extensions
 */
Gimmer_Core.kc.Game_Map_prototype_initialize = Game_Map.prototype.initialize
Game_Map.prototype.initialize = function(){
    Gimmer_Core.kc.Game_Map_prototype_initialize.call(this);
    this._enemyIdToTrack = -1;
}

Game_Map.prototype.setEnemyToTrack = function(enemyId){
    this._enemyIdToTrack = Number(enemyId);
}

Game_Map.prototype.getTrackedEnemy = function(){
    return this._enemyIdToTrack;
}

Gimmer_Core.kc.Game_Enemy_prototype_performCollapse  = Game_Enemy.prototype.performCollapse
Game_Enemy.prototype.performCollapse  = function(){
    Gimmer_Core.kc.Game_Enemy_prototype_performCollapse.call(this);
    if(this.enemyId() === $gameMap.getTrackedEnemy() && Gimmer_Core.kc.KILL_VARIABLE_ID > 0){
        let value = $gameVariables.value(Gimmer_Core.kc.KILL_VARIABLE_ID);
        if(!value){
            value = 0;
        }
        $gameVariables.setValue(Gimmer_Core.kc.KILL_VARIABLE_ID, value + 1);
    }

}

/** Backwards compatibility for saves */
Gimmer_Core.kc.DataManager_extractSaveContents = DataManager.extractSaveContents
DataManager.extractSaveContents  = function(contents){
    Gimmer_Core.kc.DataManager_extractSaveContents.call(this, contents);
    if(!$gameMap.hasOwnProperty('_enemyIdToTrack')){
        $gameMap._enemyIdToTrack = -1;
    }
}
Gimmer_Core.kc.Game_Interpreter_prototype_pluginCommand = Game_Interpreter.prototype.pluginCommand
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    switch(command){
        case 'startKillCount':
            $gameMap.setEnemyToTrack(Number(args[0]));
            $gameVariables.setValue(Gimmer_Core.kc.KILL_VARIABLE_ID, 0);
            break;
        case 'stopKillCount':
            $gameMap.setEnemyToTrack(-1)
            break;
        case 'resetKillCount':
            $gameVariables.setValue(Gimmer_Core.kc.KILL_VARIABLE_ID, 0);
            break;
    }

    return Gimmer_Core.kc.Game_Interpreter_prototype_pluginCommand.call(this, command, args);
};