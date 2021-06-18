if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

Gimmer_Core['MatchingFaces'] = {'loaded':true};

//=============================================================================
/*:
 * @plugindesc v1.1 - A plugin to use actor notes and a common naming convention to automatically match actors to variations of the same face
 * @author Gimmer_
 * @help
 * ====================
 * Gimmer_MatchingFaces
 * ====================
 *
 * This plugin lets you set a meta parameter on any Actor in the database "<faceName: String>".
 *
 * You can set as many actors as you want with a similar stem, deliminated by a dash:
 * Hero
 * Hero-Armour
 * Hero-Naked
 * etc.
 *
 * Then, in the "Show Text", you can use the faceName of "hero" for all lines of dialog for the hero character, and depending on which variant is in your party the correct portrait will show
 *
 * Terms of Use:
 * =======================================================================
 * Free for both commercial and non-commercial use, with credit.
 * More Gimmer_ plugins at: https://github.com/gimmer/RPG-Maker-MV-Plugins
 * =======================================================================
 */

Gimmer_Core.Game_Message_prototype_setFaceImage = Game_Message.prototype.setFaceImage;
Game_Message.prototype.setFaceImage = function(faceName, faceIndex) {
    let faceBase = Gimmer_Core.MatchingFaces.makeFaceBase(faceName);
    $gameParty.allMembers().every(function(member){
        if('meta' in $dataActors[member.actorId()] &&
            'faceName' in $dataActors[member.actorId()].meta &&
            Gimmer_Core.MatchingFaces.makeFaceBase($dataActors[member.actorId()].meta.faceName) === faceBase){
            faceName = $dataActors[member.actorId()].meta.faceBase;
            return false;
        }

    });
    this._faceName = faceName;
    this._faceIndex = faceIndex;
    Gimmer_Core.Game_Message_prototype_setFaceImage(this, faceName, faceIndex);
};

Gimmer_Core.MatchingFaces.makeFaceBase = function(faceName){
    return faceName.replace(/\-.*$/i,"");
}