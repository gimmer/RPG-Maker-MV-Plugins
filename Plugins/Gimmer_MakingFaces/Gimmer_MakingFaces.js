if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

Gimmer_Core['MakingFaces'] = {'loaded':true};
Gimmer_Core.MakingFaces.faceOverrides = {};

//=============================================================================
/*:
 * @plugindesc v1.0.1 - Change faces during chat messages
 * @author Gimmer_
 * @help
 * ==================
 * Gimmer_MakingFaces
 * ==================
 *
 * Use the command \TF[faceIndex] to change the face index of an actor during chat messages.
 *
 * Terms of Use:
 * =======================================================================
 * Free for both commercial and non-commercial use, with credit.
 * More Gimmer_ plugins at: https://github.com/gimmer/RPG-Maker-MV-Plugins
 * =======================================================================
 */

//Add the command as an escape character
Gimmer_Core.Window_Message_prototype_processEscapeCharacter = Window_Message.prototype.processEscapeCharacter;
Window_Message.prototype.processEscapeCharacter = function(code, textState) {
    switch (code) {
        case 'TF':
            var i = parseInt( this.obtainEscapeParam(textState));
            this.drawFace($gameMessage.faceName(), i, 0, 0);
            Gimmer_Core.MakingFaces.faceOverrides[$gameMessage.faceName()] = i;
            break;
        default:
            Gimmer_Core.Window_Message_prototype_processEscapeCharacter.call(this,
                code, textState);
            break;
    }
}

//The message face reloads every page, if there's an override, make sure that at time of reload, the override is used
Window_Message.prototype.loadMessageFace = function() {
    this._faceBitmap = ImageManager.reserveFace($gameMessage.faceName(), 0, this._imageReservationId);
    $gameMessage.setFaceImage($gameMessage.faceName(), Gimmer_Core.MakingFaces.faceOverrides[$gameMessage.faceName()] || $gameMessage.faceIndex());
};

//Clear face cache when the message clears, so overrides won't persist between show text events
Gimmer_Core.Game_Message_prototype_clear = Game_Message.prototype.clear;
Game_Message.prototype.clear = function() {
    if(this._faceName in Gimmer_Core.MakingFaces.faceOverrides){
        delete Gimmer_Core.MakingFaces.faceOverrides[this._faceName];
    }
    Gimmer_Core.Game_Message_prototype_clear.call(this);
};