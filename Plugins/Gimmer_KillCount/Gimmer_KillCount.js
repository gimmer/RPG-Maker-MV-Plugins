var Gimmer_Core = Gimmer_Core || {};
Gimmer_Core['kc'] = {'loaded':true};

//=============================================================================
/*:
 * @plugindesc v2.0 - Count kills for a specific enemy
 * @author Gimmer
 * @help
 * =================
 * Gimmer_KillCount
 * =================
 *
 * Run the plugin command to start counting kills of a given enemyId with in a provided variable Id:
 * (Note: starting a new tracking will reset the current kill count if you choose an id that is already in use)
 *
 * startKillCount enemyId variableId
 *
 * E.G. startKillCount 3 10 to track enemyId 3 in variable 10
 *
 * Run the plugin command to stop counting kills. This WILL NOT clear the variable associated with the kill count.
 *
 * stopKillCount enemyId
 *
 * Run the plugin command to reset kill count
 *
 * resetKillCount enemyId
 *
 * ================
 * Version History
 * ================
 * - 1.0: Release
 * - 2.0: Rework for unlimited counts, removed parameters
 *
 */

/**
 * Game_Map Extensions
 */
Gimmer_Core.kc.Game_Map_prototype_initialize = Game_Map.prototype.initialize
Game_Map.prototype.initialize = function(){
    Gimmer_Core.kc.Game_Map_prototype_initialize.call(this);
    this._enemysTracked = {};
}

Game_Map.prototype.setEnemyToTrack = function(enemyId, variableId){
    this._enemysTracked[enemyId.toString()] = variableId;
}

Game_Map.prototype.stopTrackingEnemy = function(enemyId){
    if(this.isEnemyTracked(enemyId)){
        delete this._enemysTracked[enemyId.toString()];
    }
}

Game_Map.prototype.isEnemyTracked = function(enemyId){
    return this._enemysTracked.hasOwnProperty(enemyId.toString());
}

Game_Map.prototype.getEnemyVariable = function(enemyId){
    return this._enemysTracked[enemyId.toString()] || 0;
}

Gimmer_Core.kc.Game_Enemy_prototype_performCollapse  = Game_Enemy.prototype.performCollapse
Game_Enemy.prototype.performCollapse  = function(){
    Gimmer_Core.kc.Game_Enemy_prototype_performCollapse.call(this);
    if($gameMap.isEnemyTracked(this.enemyId())){
        const variableId = $gameMap.getEnemyVariable(this.enemyId());
        if(variableId > 0){
            let value = $gameVariables.value(Gimmer_Core.kc.KILL_VARIABLE_ID);
            if(!value){
                value = 0;
            }
            $gameVariables.setValue(variableId, value + 1);
        }
    }
}

/** Backwards compatibility for saves */
Gimmer_Core.kc.DataManager_extractSaveContents = DataManager.extractSaveContents
DataManager.extractSaveContents  = function(contents){
    Gimmer_Core.kc.DataManager_extractSaveContents.call(this, contents);
    if(!$gameMap.hasOwnProperty('_enemysTracked')){
        $gameMap._enemysTracked = {};
    }
}
Gimmer_Core.kc.Game_Interpreter_prototype_pluginCommand = Game_Interpreter.prototype.pluginCommand
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    let enemyId = args[0];
    switch(command){
        case 'startKillCount':
            const variableId = Number(args[1]);
            $gameMap.setEnemyToTrack(enemyId, variableId);
            $gameVariables.setValue(variableId, 0);
            break;
        case 'stopKillCount':
            $gameMap.stopTrackingEnemy(args[0]);
            break;
        case 'resetKillCount':
            if($gameMap.isEnemyTracked(enemyId)){
                let varId = $gameMap.getEnemyVariable(enemyId);
                $gameVariables.setValue(varId, 0);
            }
            break;
    }

    return Gimmer_Core.kc.Game_Interpreter_prototype_pluginCommand.call(this, command, args);
};