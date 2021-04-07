if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

//=============================================================================
/*:
 * @plugindesc v1.0 - Display text anywhere on the screen
 * @author Gimmer_
 * @help You can use this plugin to show text on the screen
 *
 * ================
 * Gimmer_TextAnywhere
 * ================
 *
 * Plugin Commands:
 *
 * HideTextLayer: Hides the layer all text is on
 * ShowTextLayer: Shows the layer all text is on
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
 * @param Text List
 * @parent --Parameters--
 * @type struct<Text>[]
 * @desc Make a list of all the text you want to show
 *
 */
/*~struct~Text:
 * @param x
 * @type String
 * @desc Where on the x to put the text?
 * @default 0
 * Default 0
 *
 * @param color
 * @type string
 * @desc hexcode of the label text color eg #FF0000
 *
 * @param fontsize
 * @type number
 * @desc Font size
 * @default 28
 * Default Default Font size
 *
 * @param bold
 * @type Boolean
 * @desc Should the font be bold?
 * Default false
 * @default false
 *
 * @param y
 * @type String
 * @desc Where on the y to put the texT?
 * @default 0
 * Default 0
 *
 * @param text
 * @type String
 * @string What's the text you want (us \V[1] for variables);
*/

Imported = Imported || {};

Gimmer_Core['TextAnywhere'] = {'loaded':true};

let texts = JSON.parse(PluginManager.parameters('Gimmer_TextAnywhere')['Text List']);
texts.forEach(function(text, key){
    text = JSON.parse(text);
    text.fontsize = Number(text.fontsize);
    text.bold = (text.bold === "true");
    texts[key] = text;
})

Gimmer_Core.TextAnywhere.Texts = texts;

Gimmer_Core.TextAnywhere.Scene_Map_prototype_createAllWindows = Scene_Map.prototype.createAllWindows;
Scene_Map.prototype.createAllWindows = function(){
    this.addTextOverlay();
    Gimmer_Core.TextAnywhere.Scene_Map_prototype_createAllWindows.call(this);
}

Scene_Map.prototype.addTextOverlay = function(){
    let temp = new Window_Base();
    this._textOverLay = new Window_Plain(-temp.standardPadding(),-temp.standardPadding(),Graphics.width + temp.standardPadding() * 2,Graphics.height + temp.standardPadding() * 2);
    this.addChild(this._textOverLay);
}

Gimmer_Core.TextAnywhere._Scene_Map_prototype_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function(){
    Gimmer_Core.TextAnywhere._Scene_Map_prototype_update.call(this);
    this.updateTextOverlay();
}

Scene_Map.prototype.updateTextOverlay = function(){
    this._textOverLay.contents.clear();
    Gimmer_Core.TextAnywhere.Texts.forEach(function(text){
        let tempText = this._textOverLay.convertEscapeCharacters(text.text);
        let maxWidth = this._textOverLay.contents.measureTextWidth(text)
        this._textOverLay.contents.fontBold = text.bold;
        this._textOverLay.contents.fontSize = text.fontsize;
        this._textOverLay.contents.textColor = text.color;
        this._textOverLay.contents.drawText(tempText, eval(text.x), eval(text.y), maxWidth, this._textOverLay.lineHeight());
        this._textOverLay.resetFontSettings();
    }, this)
}

Gimmer_Core.pluginCommands["HideTextLayer"] = function(){
    if('_textOverLay' in SceneManager._scene){
        SceneManager._scene._textOverLay.visible = false;
    }
}

Gimmer_Core.pluginCommands["ShowTextLayer"] = function(){
    if('_textOverLay' in SceneManager._scene){
        SceneManager._scene._textOverLay.visible = show;
    }
}