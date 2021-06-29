if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

var Imported = Imported || {}
Imported['Gimmer_CleverColors'] = '1.0';

Gimmer_Core['CC'] = {'loaded':true};

//=============================================================================
/*:
 * @plugindesc Map specific words or phrases to colors to avoid needing repetitive color flags
 * @author Gimmer_
 * @help You can either hardcode a list for 50 colors, or update Colors.json in the data folder to associate
 * case-sensitive phrases with specific colours.
 *
 * Putting ! in front of a term will prevent it from having it's color replaced in that particular instance of text
 *
 * NOTE: you cannot use the word UBBAJABBAFLUBBADUBBA in your text chat. Don't ask why, it's a dirty code reason.
 *
 * Plugin Commands:
 *
 * If you want to add a color:
 * CC_ADD "word or phrase" colorNumber
 *
 * If you want to remove a color:
 * CC_REMOVE "word or phrase"
 *
 * Changes to the database are saved to the save file, and persist throughout the rest of the play session.
 * Colors.json or the plugin parameters merely define what colors are set at the start of a fresh game.
 *
 * @param ---Parameters---
 * @default
 *
 * @param Use colors data file
 * @parent ---Parameters---
 * @type Boolean
 * @desc Use colors.json to hold all the color to string matches. If set to false, you'll have to set arrays for each color
 * Default: False
 * @default false
 *
 * @param ---Manual Colors---
 * @default
 *
 * @param Color List
 * @parent ---Manual Colors---
 * @type struct<colorlist>
 * @desc don't want to use Colors.json? Build it here for all 50 colors
 *
 */
/*~struct~colorlist:
* @param 1
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 2
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 3
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 4
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 5
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 6
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 7
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 8
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 9
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 10
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 11
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 12
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 13
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 14
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 15
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 16
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 17
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 18
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 19
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 20
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 21
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 22
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 23
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 24
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 25
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 26
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 27
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 28
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 29
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 30
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 31
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 32
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 33
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 34
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 35
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 36
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 37
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 38
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 39
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 40
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 41
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 42
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 43
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 44
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 45
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 46
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 47
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 48
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 49
* @type text[]
* @desc Texts for the color named in the parameter
*
* @param 50
* @type text[]
* @desc Texts for the color named in the parameter
*/

const ccParams = PluginManager.parameters('Gimmer_CleverColors');

Gimmer_Core.CC.UseJsonFile = (ccParams['Use colors data file'] === "true");

//Function to initialize $dataColors from file or plugin parameters
Gimmer_Core.CC.initializeDatabase = function(){
    if(Gimmer_Core.CC.UseJsonFile){
        DataManager.loadDataFile('$dataColors','Colors.json');
    }
    else{
        $dataColors = {};
        let list = JSON.parse(ccParams['Color List']);
        Object.keys(list).forEach(function(key){
            if(list[key].length){
                let wordList = JSON.parse(list[key]);
                wordList.forEach(function(word){
                    $dataColors[word] = parseInt(key);
                });
            }

        });
    }
}

//Make sure new game reloads the current data colors from default
Gimmer_Core.CC.DataManager_setupNewGame = DataManager.setupNewGame;
DataManager.setupNewGame = function (){
    Gimmer_Core.CC.initializeDatabase();
    Gimmer_Core.CC.DataManager_setupNewGame.call(this);
}

//Save data colors to the save file
Gimmer_Core.CC.DataManager_makeSaveContents = DataManager.makeSaveContents;
DataManager.makeSaveContents = function() {
    let contents = Gimmer_Core.CC.DataManager_makeSaveContents.call(this);
    contents.colors = $dataColors;
    return contents;
};

//Load data colors from the save file
Gimmer_Core.CC.DataManager_extractSaveContents = DataManager.extractSaveContents;
DataManager.extractSaveContents = function(contents) {
    Gimmer_Core.CC.DataManager_extractSaveContents.call(this, contents);
    $dataColors = contents.colors;
};

//Extend add text to magically add colors
Gimmer_Core.CC.Game_Message_prototype_add = Game_Message.prototype.add;
Game_Message.prototype.add = function(text) {
    text = this.magicallyAddColors(text);
    Gimmer_Core.CC.Game_Message_prototype_add.call(this, text);
};

//Magical add colors function
Game_Message.prototype.magicallyAddColors = function(text){
    Object.keys($dataColors).forEach(function(word){
        if(text.contains(word)){
            text = text.replace("!"+word,"UBBAJABBAFLUBBADUBBA");
            text = text.replace(word,"\x1bc["+$dataColors[word]+"]"+word+"\x1bc[0]");
            text = text.replace("UBBAJABBAFLUBBADUBBA", word);
        }
    });
    return text;
}

//Reset $dataColors on return to title screen
Gimmer_Core.CC.Scene_GameEnd_prototype_commandToTitle = Scene_GameEnd.prototype.commandToTitle;
Scene_GameEnd.prototype.commandToTitle = function() {
    Gimmer_Core.CC.initializeDatabase();
    Gimmer_Core.CC.Scene_GameEnd_prototype_commandToTitle.call(this);
};

//Plugin commands to add a color
Gimmer_Core.pluginCommands['CC_ADD'] = function(params){
    let wordOrPhase = "";
    let colorValue = 0;
    if(params.length > 2){
        //The text is a phrase
        params.forEach(function(param){
            if(parseInt(param) > 0) {
                colorValue = parseInt(param);
            }
            else{
                wordOrPhase += " "+param;
            }
        });
    }
    else{
        wordOrPhase = params[0];
        colorValue = parseInt(params[1]);
    }
    $dataColors[wordOrPhase.trim()] = colorValue;
}

//plugin command to remove a color
Gimmer_Core.pluginCommands['CC_REMOVE'] = function(params){
    let wordOrPhase = "";
    if(params.length > 1){
        //The text is a phrase
        params.forEach(function(param){
            wordOrPhase += " "+param;
        });
    }
    else{
        wordOrPhase = params[0];
    }
    delete $dataColors[wordOrPhase.trim()];
}