if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

Imported = Imported || {};
Imported['Gimmer_PauseArrowBeGone'] = 2.0;

Gimmer_Core['PauseArrowBeGone'] = {'loaded':true};

//=============================================================================
/*:
 * @plugindesc Hide the pause arrow or up/down arrows using a plugin command
 * @author Gimmer
 * @help
 *
 * Run the plugin command "HidePauseArrow" to hide the pause arrow in a Message window
 * Run the plugin command "ShowPauseArrow" to show the pause arrow in a message window
 *
 * Run the plugin command "HideUpDownArrows" to hide the up and down arrows in choice lists, item windows, etc.
 * Run the plugin command "ShowUpDownArrows" to show the up and down arrows in choice lists, item windows, etc.
 *
 * ================
 * Version History
 * ================
 * - Version 1.0: Initial Release
 * - Version 2.0: Added hiding of other arrows too
 *
 */

Gimmer_Core.PauseArrowBeGone.pauseHiding = false;
Gimmer_Core.PauseArrowBeGone.arrowsHiding = false;

Gimmer_Core.pluginCommands['HIDEPAUSEARROW'] = function (){
    Gimmer_Core.PauseArrowBeGone.pauseHiding = true;
}

Gimmer_Core.pluginCommands['SHOWPAUSEARROW'] = function (){
    Gimmer_Core.PauseArrowBeGone.pauseHiding = false;
}

Gimmer_Core.pluginCommands['HIDEPUPDOWNARROWS'] = function (){
    Gimmer_Core.PauseArrowBeGone.arrowsHiding = true;
}

Gimmer_Core.pluginCommands['SHOWUPDOWNARROWS'] = function (){
    Gimmer_Core.PauseArrowBeGone.arrowsHiding = false;
}

Gimmer_Core.PauseArrowBeGone._Window_prototype_updatePauseSign = Window.prototype._updatePauseSign;
Window.prototype._updatePauseSign = function (){
    if(Gimmer_Core.PauseArrowBeGone.pauseHiding){
        this._windowPauseSignSprite.visible = false;
    }
    else{
        Gimmer_Core.PauseArrowBeGone._Window_prototype_updatePauseSign.call(this);
    }
}
Gimmer_Core.PauseArrowBeGone._Window_prototype_updateArrows = Window.prototype._updateArrows;
Window.prototype._updateArrows = function (){
    if(Gimmer_Core.PauseArrowBeGone.arrowsHiding){
        this._downArrowSprite.visible = false;
        this._upArrowSprite.visible = false;
    }
    else{
        Gimmer_Core.PauseArrowBeGone._Window_prototype_updateArrows.call(this);
    }
}
