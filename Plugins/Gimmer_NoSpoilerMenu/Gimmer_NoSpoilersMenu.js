if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

Gimmer_Core['NSM'] = {'loaded':true};

var Imported = Imported || {};
Imported['Gimmer_NoSpoilersMenu'] = '1.1'

//=============================================================================
/*:
 * @plugindesc v1.0 - Hide magic and special from characters menus if they don't have any spells yet, even if their class can use it
 * @author Gimmer
 * @help
 * ===========
 * Gimmer_NoSpoilersMenu
 * ===========
 *
 * Want a character to unlock spells as they level up, but not to have that great plot element revealed by the battler menu?
 *
 * Problem Solved!
 *
 * NOTE: This must be loaded AFTER YEP_Core as for some reason YEP completely replaces the addSkillCommands function with a clone of the function from the core.
 *
 * @param ---Parameters---
 *
 * @param Block Magic From Showing
 * @parent ---Parameters---
 * @type Boolean
 * @desc Block magic from showing if you don't have any spells?
 * Default True
 * @default true
 *
 * @param Block Special From Showing
 * @parent ---Parameters---
 * @type Boolean
 * @desc Block special from showing if you don't have any special attacks?
 * Default True
 * @default true
 *
 * ===============
 * Version History:
 * ===============
 * - Version 1.0: Initial release
 * - Version 1.1: Removed stuff from status menus
 *
 * Terms of Use:
 * =======================================================================
 * Free for both commercial and non-commercial use, with credit.
 * More Gimmer_ plugins at: https://github.com/gimmer/RPG-Maker-MV-Plugins
 * =======================================================================
 */

let NSParams = PluginManager.parameters('Gimmer_NoSpoilersMenu');
Gimmer_Core.NSM.HideMagic = (NSParams['Block Magic From Showing'] === "true");
Gimmer_Core.NSM.HideSpecial = (NSParams['Block Special From Showing'] === "true");


Window_ActorCommand.prototype.addSkillCommands = function() {
    var skillTypes = this._actor.addedSkillTypes();
    skillTypes.sort(function(a, b) {
        return a - b;
    });
    skillTypes.forEach(function(stypeId) {
        let checkParam = (stypeId === 1 ? Gimmer_Core.NSM.HideMagic : Gimmer_Core.NSM.HideSpecial)

        let skills = ['fake'];
        if(checkParam){
            skills = this._actor.skills().filter(function(skill) {
                return skill.stypeId === stypeId;
            }, this);
        }

        if(skills.length){
            var name = $dataSystem.skillTypes[stypeId];
            this.addCommand(name, 'skill', true, stypeId);
        }

    }, this);
};

Gimmer_Core.NSM.Window_MenuStatus_prototype_processOk = Window_MenuStatus.prototype.processOk;
Window_MenuStatus.prototype.processOk = function (){
    if(SceneManager._scene._commandWindow.currentSymbol() === "skill"){
        let actorSkills = $gameParty.members()[this._index].skills()
        if(actorSkills.length === 0){
            this.playBuzzerSound()
        }
        else{
            Gimmer_Core.NSM.Window_MenuStatus_prototype_processOk.call(this);
        }
    }
    else{
        Gimmer_Core.NSM.Window_MenuStatus_prototype_processOk.call(this);
    }
}

Window_SkillType.prototype.makeCommandList = function() {
    if (this._actor) {
        var skillTypes = this._actor.addedSkillTypes();
        skillTypes.sort(function(a, b) {
            return a - b;
        });
        skillTypes.forEach(function(stypeId) {
            let checkParam = (stypeId === 1 ? Gimmer_Core.NSM.HideMagic : Gimmer_Core.NSM.HideSpecial)

            let skills = ['fake'];
            if(checkParam){
                skills = this._actor.skills().filter(function(skill) {
                    return skill.stypeId === stypeId;
                }, this);
            }

            if(skills.length){
                var name = $dataSystem.skillTypes[stypeId];
                this.addCommand(name, 'skill', true, stypeId);
            }

        }, this);
    }
};