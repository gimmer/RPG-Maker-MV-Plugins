if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

Gimmer_Core['QuitToDesktop'] = {'loaded':true};

//=============================================================================
/*:
 * @plugindesc v1.1 - A plugin that adds quit to desktop to the Game_End window
 * @author Gimmer_
 * @help
 * ====================
 * Gimmer_QuitToDesktop
 * ====================
 *
 * Adds a quit to desktop option to the Game_End window.
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
 * @param Label
 * @parent ---Parameters---
 * @type text
 * @desc What do you want to put in the for to Desktop
 *
 * Default: To Desktop
 * @default To Desktop
 *
 */

Gimmer_Core.QuitToDesktop.label = PluginManager.parameters('Gimmer_QuitToDesktop')['Label'];

//Add in a to desktop quit
Window_GameEnd.prototype.makeCommandList = function() {
    this.addCommand(TextManager.toTitle, 'toTitle');
    this.addCommand(Gimmer_Core.QuitToDesktop.label, 'toDesktop');
    this.addCommand(TextManager.cancel,  'cancel');
};


Scene_GameEnd.prototype.createCommandWindow = function() {
    this._commandWindow = new Window_GameEnd();
    this._commandWindow.setHandler('toTitle',  this.commandToTitle.bind(this));
    this._commandWindow.setHandler('toDesktop',  this.commandToDesktop.bind(this));
    this._commandWindow.setHandler('cancel',   this.popScene.bind(this));
    this.addWindow(this._commandWindow);
};

Scene_GameEnd.prototype.commandToDesktop = function() {
    this.fadeOutAll();
    SceneManager.exit();
};