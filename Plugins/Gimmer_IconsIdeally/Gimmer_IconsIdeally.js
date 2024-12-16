var Gimmer_Core = Gimmer_Core || {};

var Imported = Imported || {}
Imported['Gimmer_IconsIdeally'] = '1.0';

Gimmer_Core['ii'] = {'loaded':true};


//=============================================================================
/*:
 * @plugindesc Map specific words or phrases to icons to avoid needing repetitive icon flags
 * @author Gimmer_
 * @help Update Icons.json with the icons you want to use. Automatically any terms found will be prefixed by the icon
 *
 * Putting ! in front of a term will prevent it from having its icon drawn in that particular instance
 *
 * NOTE: you cannot use the word UBBAJABBAFLUBBADUBBA in your text chat. Don't ask why, it's a dirty code reason.
 *
 * @param Use icons in text boxes?
 * @parent ---Parameters---
 * @type Boolean
 * @desc Show Text should show icons?
 * Default: True
 * @default true
 *
 * @param Use icons in battle log?
 * @parent ---Parameters---
 * @type Boolean
 * @desc The Battle Log should show icons?
 * Default: True
 * @default true
 *
 *
 */

$dataIcons = null;

Gimmer_Core.ii['rawParameters'] = PluginManager.parameters('Gimmer_IconsIdeally');
Gimmer_Core.ii.TEXT_BOX_ON = (Gimmer_Core.ii.rawParameters['Use icons in text boxes?'] === "true");
Gimmer_Core.ii.BATTLE_LOG_ON = (Gimmer_Core.ii.rawParameters['Use icons in battle log?'] === "true");

Gimmer_Core.ii.initializeDatabase = function(){
    DataManager.loadDataFile('$dataIcons','Icons.json');
}

//Make sure new game reloads the current data colors from default
Gimmer_Core.ii.DataManager_setupNewGame = DataManager.setupNewGame;
DataManager.setupNewGame = function (){
    Gimmer_Core.ii.initializeDatabase();
    Gimmer_Core.ii.DataManager_setupNewGame.call(this);
}

//Save data colors to the save file
Gimmer_Core.ii.DataManager_makeSaveContents = DataManager.makeSaveContents;
DataManager.makeSaveContents = function() {
    let contents = Gimmer_Core.ii.DataManager_makeSaveContents.call(this);
    contents.icons = $dataIcons;
    return contents;
}

//Load data colors from the save file
Gimmer_Core.ii.DataManager_extractSaveContents = DataManager.extractSaveContents;
DataManager.extractSaveContents = function(contents) {
    Gimmer_Core.ii.DataManager_extractSaveContents.call(this, contents);
    $dataIcons = contents.icons;
}

Gimmer_Core.ii.DataManager_setupBattleTest = DataManager.setupBattleTest;
DataManager.setupBattleTest = function(){
    Gimmer_Core.ii.initializeDatabase();
    Gimmer_Core.ii.DataManager_setupBattleTest.call(this);
}

Gimmer_Core.ii.Scene_GameEnd_prototype_commandToTitle = Scene_GameEnd.prototype.commandToTitle;
Scene_GameEnd.prototype.commandToTitle = function() {
    Gimmer_Core.ii.initializeDatabase();
    Gimmer_Core.ii.Scene_GameEnd_prototype_commandToTitle.call(this);
};

Gimmer_Core.ii.Game_Message_prototype_add = Game_Message.prototype.add;
Game_Message.prototype.add = function(text) {
    if(Gimmer_Core.ii.TEXT_BOX_ON){
        text = this.magicallyAddIcons(text);
    }
    Gimmer_Core.ii.Game_Message_prototype_add.call(this, text);
}

Gimmer_Core.ii.Window_BattleLog_prototype_addText = Window_BattleLog.prototype.addText;
Window_BattleLog.prototype.addText = function(text){
    if(Gimmer_Core.ii.BATTLE_LOG_ON){
        text = Game_Message.prototype.magicallyAddIcons(text);
    }
    Gimmer_Core.ii.Window_BattleLog_prototype_addText.call(this, text);
}

//Magical add icons function
Game_Message.prototype.magicallyAddIcons = function(text){
    Object.keys($dataIcons).forEach(function(word){
        if(text.contains(word)){
            text = text.replace("!"+word,"UBBAJABBAFLUBBADUBBA");
            text = text.replace(word,"\x1bi["+$dataIcons[word]+"]"+word);
            text = text.replace("UBBAJABBAFLUBBADUBBA", word);
        }
    });
    return text;
}