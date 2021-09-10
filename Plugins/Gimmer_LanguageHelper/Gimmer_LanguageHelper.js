if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

if(!Gimmer_Core.BOOT){
    throw "Gimmer_Boot is required for this plugin";
}

Gimmer_Core['LH'] = {'loaded':true};

var Imported = Imported || {};
Imported['Gimmer_LanguageHelper'] = '0.1';

//=============================================================================
/*:
 * @plugindesc Allow the game to load different language files at run time
 * @author Gimmer_
 * @help
 *
 * This plugin requires Gimmer_Core and Gimmer_Boot
 *
 * This plugin lets files named LanguageXX.json load at startup and be used to override text strings
 * and various database entries during play time.
 *
 * Text strings in events can be placed such as "##KEY##" and they will be load from the "strings" portion of the text
 * database file.
 *
 * Database entries for the databases (Actors.json, Classes.json, etc.) will be overwritten at load time
 *
 * The easiest way to translate your game will be to make it as normal, and run the associate parsing program.
 * That will create updated versions of all the map files replacing all text with unique codes and mapping them all
 * into a LanguageEN.json file. (Note, you can rename this to whatever suffix you want depending on the original language.
 *
 * Once you are confident that the code is working for the base language, replace all the Map.json and database json files
 * with the update variants and enable the plugin. You can now choose a language at startup and the text will come out
 * of the LanguageXX.json file based on the players choice.
 *
 * Make copies of this file for all associated languages you set in the plugin parameters, and translate at your leisure.
 * Add them to the choices in the plugin parameter to make the new languages available.
 *
 * LIMITATIONS:
 *
 * Because of the way game objects get saved when the game saves, the system will save the language at run time and switch
 * to that when you load a save. Unfortunately can't find a way to work around this, as things like "actor description"
 * from Actors.json gets loaded into your save at run time, but can also be changed by event commands, so there's no easy
 * way to know the game object has something from the database or a user submitted name.
 *
 * Version History:
 * - Version 0.1: Initial Release
 *
 * @param ---Parameters---
 * @default
 *
 * @param Language List
 * @parent ---Parameters---
 * @type struct<language>[]
 * @desc List of languages you want to offer
 *
 */
/*~struct~language:
* @param label
* @type text
* @desc Language label player sees when choosing a language
*
* @param suffix
* @type text
* @desc The XX part in the LanguageXX.json file for this language
*/

//Global variables
//What language is set?
Gimmer_Core.LH.language = false;
//Has the name screen been initialized, to avoid reinitializing it on every load
Gimmer_Core.LH.IsNameInitialized = false;

//plugin params
Gimmer_Core.LH.LanguageChoices = JSON.parse(PluginManager.parameters('Gimmer_LanguageHelper')['Language List']) || [];
Gimmer_Core.LH.LanguageChoices.forEach(function(entry, key){
    Gimmer_Core.LH.LanguageChoices[key] = JSON.parse(entry);
});

//Reload Language function
Gimmer_Core.LH.reloadLanguage = function(){
    let data = null;
    const fs = require('fs');
    const path = require('path');
    const base = path.dirname(process.mainModule.filename);
    const filePath = path.join(base, 'data/')+"Language"+Gimmer_Core.LH.language+".json";
    if (fs.existsSync(filePath)) {
        data = fs.readFileSync(filePath, { encoding: 'utf8' });
        $dataLanguage = JSON.parse(data);
        //Language loaded, reload all databases
        [$dataSystem, $dataActors, $dataItems, $dataWeapons, $dataArmors, $dataEnemies, $dataClasses, $dataSkills, $dataStates].forEach(function(object){
            Gimmer_Core.LH.HandleDatabaseLoad(object);
        });
        Gimmer_Core.LH.IsNameInitialized = false;
    }
    else{
        throw "Cannot find language file "+filePath;
    }
}

Gimmer_Core.LH.HandleDatabaseLoad = function(object){
    if(object === $dataSystem){
        $dataSystem.gameTitle = $dataLanguage.system.gameTitle;
        $dataSystem.elements = $dataLanguage.system.elements;
        $dataSystem.equipTypes = $dataLanguage.system.equipTypes;
        $dataSystem.skillTypes = $dataLanguage.system.skillTypes;
        $dataSystem.weaponTypes = $dataLanguage.system.weaponTypes;
        $dataSystem.armorTypes = $dataLanguage.system.armorTypes;
        $dataSystem.terms = $dataLanguage.system.terms;
    }
    else{
        let fields = [];
        let objectName = "";
        switch(object){
            case $dataActors:
                fields = ['name','nickname','profile'];
                objectName = "$dataActors";
                break;
            case $dataItems:
                fields = ['description','name'];
                objectName = "$dataItems";
                break;
            case $dataArmors:
                fields = ['description','name'];
                objectName = "$dataArmors";
                break;
            case $dataWeapons:
                fields = ['description','name'];
                objectName = "$dataWeapons";
                break;
            case $dataEnemies:
                fields = ['name'];
                objectName = "$dataEnemies";
                break;
            case $dataStates:
                fields = ['message1','message2','message3','message4','name'];
                objectName = "$dataStates";
                break;
            case $dataSkills:
                fields = ['message1','message2','name'];
                objectName = "$dataSkills";
                break;
            case $dataClasses:
                fields = ['name'];
                objectName = "$dataClasses";
                break;
        }
        if(objectName !== ""){
            object.forEach(function(value, key){
                if(value && value.id.toString() in $dataLanguage.databases[objectName]){
                    fields.forEach(function(field){
                        if(value.id.toString() in $dataLanguage.databases[objectName] && field in $dataLanguage.databases[objectName][value.id.toString()]){
                            value[field] = $dataLanguage.databases[objectName][value.id.toString()][field]
                        }
                    });
                }
            });
        }
    }
}

var $dataLanguage;

/**
 *  FUNCTION EXTENDING
 */

//Add Text
Gimmer_Core.LH.Game_Message_prototype_add = Game_Message.prototype.add
Game_Message.prototype.add = function(text){
    text = this.replaceLanguageTags(text);
    Gimmer_Core.LH.Game_Message_prototype_add.call(this,text);

}

//Show choices
Gimmer_Core.LH.Game_Message_prototype_setChoices = Game_Message.prototype.setChoices;
Game_Message.prototype.setChoices = function(choices, defaultType, cancelType){
    choices.forEach(function(v, k){
        v = this.replaceLanguageTags(v);
        choices[k] = v;
    }, this);
    Gimmer_Core.LH.Game_Message_prototype_setChoices.call(this, choices, defaultType, cancelType);
}

//Change Name
Gimmer_Core.LH.Game_Actor_prototype_setName = Game_Actor.prototype.setName;
Game_Actor.prototype.setName = function(name) {
    Gimmer_Core.LH.Game_Actor_prototype_setName.call(this, $gameMessage.replaceLanguageTags(name));
};

//Change nickname
Gimmer_Core.LH.Game_Actor_prototype_setNickname = Game_Actor.prototype.setNickname;
Game_Actor.prototype.setNickname = function(nickname) {
    Gimmer_Core.LH.Game_Actor_prototype_setNickname.call(this, $gameMessage.replaceLanguageTags(nickname));
};

//Change profile
Gimmer_Core.LH.Game_Actor_prototype_setProfile = Game_Actor.prototype.setProfile;
Game_Actor.prototype.setProfile = function(profile) {
    Gimmer_Core.LH.Game_Actor_prototype_setProfile.call(this, $gameMessage.replaceLanguageTags(profile));
};

//Name Input
Gimmer_Core.LH.Window_NameInput_prototype_table = Window_NameInput.prototype.table;
Window_NameInput.prototype.table = function (){
    if(!$gameSystem.isJapanese() && !$gameSystem.isRussian() && !Gimmer_Core.LH.IsNameInitialized){
        Window_NameInput.LATIN1[Window_NameInput.LATIN1.length - 1] = $dataLanguage.special.nameOK;
        Window_NameInput.LATIN1[Window_NameInput.LATIN1.length - 2] = $dataLanguage.special.nameChangePage;
        Window_NameInput.LATIN2[Window_NameInput.LATIN1.length - 1] = $dataLanguage.special.nameOK;
        Window_NameInput.LATIN2[Window_NameInput.LATIN1.length - 2] = $dataLanguage.special.nameChangePage;
        Gimmer_Core.LH.IsNameInitialized = true;
    }
    return Gimmer_Core.LH.Window_NameInput_prototype_table.call(this);
}

//Map Display Name
Gimmer_Core.LH.Game_Map_prototype_displayName = Game_Map.prototype.displayName;
Game_Map.prototype.displayName = function() {
    if(this.mapId().toString() in $dataLanguage.maps){
        return $dataLanguage.maps[this.mapId()];
    }
    return Gimmer_Core.LH.Game_Map_prototype_displayName.call(this);
};

//Prevent sounds from playing if they aren't in the database. Needed to let the language select happen before the system is loaded
SoundManager.playSystemSound = function(n) {
    if ($dataSystem && 'sounds' in $dataSystem) {
        AudioManager.playStaticSe($dataSystem.sounds[n]);
    }
};

Gimmer_Core.LH.DataManager_makeSaveContents = DataManager.makeSaveContents;
DataManager.makeSaveContents = function(){
    var contents = Gimmer_Core.LH.DataManager_makeSaveContents.call(this);
    contents['language'] = Gimmer_Core.LH.language;
    return contents;
}

Gimmer_Core.LH.DataManager_extractSaveContents = DataManager.extractSaveContents;
DataManager.extractSaveContents = function(contents){
    Gimmer_Core.LH.DataManager_extractSaveContents.call(this, contents);
    if(!contents.language){
        //If the save doesn't have a language, it's now the language the game started in.
        // This will almost certainly cause problems
        contents.language = Gimmer_Core.LH.language;
    }
    if(Gimmer_Core.LH.language !== contents.langauge){
        Gimmer_Core.LH.language = contents.language;
        Gimmer_Core.LH.reloadLanguage();
    }

}

/**
 * DATABASE SPECIFIC STUFF
 */

Gimmer_Core.LH.DataManager_onLoad = DataManager.onLoad;
DataManager.onLoad = function (object){
    Gimmer_Core.LH.DataManager_onLoad.call(this, object);
    Gimmer_Core.LH.HandleDatabaseLoad(object);
}

/**
 * LANGUAGE SCENE SELECT EXTENSION OF GIMMER_BOOT CODE
 */

SceneManager.goto = function(sceneClass){
    if((sceneClass === Scene_Boot || sceneClass === Scene_GimmerBoot) && !Gimmer_Core.LH.language){
        sceneClass = Scene_ChooseLanguage;
    }
    else if(sceneClass === Scene_Boot && !Gimmer_Core.BOOT.loaded){
        sceneClass = Scene_GimmerBoot;
    }
    Gimmer_Core.BOOT.SceneManager_goto.call(this, sceneClass);
}

function Scene_ChooseLanguage() {
    this.initialize.apply(this, arguments);
}

Scene_ChooseLanguage.prototype = Object.create(Scene_Base.prototype);
Scene_ChooseLanguage.prototype.constructor = Scene_ChooseLanguage;

Scene_ChooseLanguage.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
    this._selectorWindow = null;
};

Scene_ChooseLanguage.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
    this.createWindowLayer();
    this.createSelectorWindow();
};

Scene_ChooseLanguage.prototype.createSelectorWindow = function(){
    $dataSystem = {'locale':'en',"windowTone":[0,0,0,0]};
    $gameSystem = new Game_System();
    let temp = new Window_Base();
    let width = 250;
    Gimmer_Core.LH.LanguageChoices.forEach(function(choice){
        let textWidth = temp.textWidth(choice.label) + (temp.standardPadding() * 2);
        if(textWidth > width){
            width = textWidth;
        }
    });
    let height = Gimmer_Core.LH.LanguageChoices.length * temp.lineHeight() + (temp.standardPadding() * 2);
    this._selectorWindow = new Window_LanguageSelector(Graphics.boxWidth / 2 - (width / 2), Graphics.boxHeight / 2 - (height / 2),width,height);
    this._selectorWindow.setHandler('ok', this.onItemOk.bind(this));
    this.addWindow(this._selectorWindow);
    this._selectorWindow.activate();
}

Scene_ChooseLanguage.prototype.onItemOk = function(){
    let index = this._selectorWindow.index();
    if(index >= 0){
        this._selectorWindow.contents.clear();
        $dataSystem = null;
        $gameSystem = null;
        Gimmer_Core.LH.language = Gimmer_Core.LH.LanguageChoices[index]['suffix'];
        DataManager._firstDatabaseFiles.push({ name: '$dataLanguage', src: 'Language'+Gimmer_Core.LH.language+'.json'});
        SceneManager.goto(Scene_GimmerBoot);
    }
}

function Window_LanguageSelector() {
    this.initialize.apply(this, arguments);
}

Window_LanguageSelector.prototype = Object.create(Window_Selectable.prototype);
Window_LanguageSelector.prototype.constructor = Window_LanguageSelector;

Window_LanguageSelector.prototype.initialize = function(x, y, width, height) {
    Window_Selectable.prototype.initialize.call(this, x, y, width, height);
    this.drawAllItems();
    this.select(0);
};

Window_LanguageSelector.prototype.maxItems = function() {
    return Gimmer_Core.LH.LanguageChoices.length;
};

Window_LanguageSelector.prototype.drawItem = function(index) {
    this.changeTextColor('#FFFFFF');
    this.drawText(Gimmer_Core.LH.LanguageChoices[index].label,0,this.lineHeight() * index, this.width,'left');
};

Window_LanguageSelector.prototype.refresh = function(){
    Window_Selectable.prototype.refresh.call(this);
    this.select(this._index);
}


/**
 *
 * LANGUAGE HELPER FUNCTIONS
 *
 */
Game_Message.prototype.makeLanguageKey = function(text){
    return text.replace("##","").replace("##","");
}

Game_Message.prototype.replaceLanguageTags = function(text){
    //Find any hashtags within text via regexp
    let regex = /##.*##/g;
    let match;
    do {
        match = regex.exec(text);
        if(match){
            text = text.replace(match[0],$dataLanguage.strings[this.makeLanguageKey(match[0])]);
        }
    }
    while(match);
    return text;
}