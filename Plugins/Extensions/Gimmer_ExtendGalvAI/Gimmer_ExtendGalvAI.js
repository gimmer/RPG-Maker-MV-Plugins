if(!Galv || !Galv.AI){
    throw "You must have Galv_ActionIndicators running to use this extension.";
}

if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

Gimmer_Core['ExtendGalvAI'] = {'loaded':true};

//=============================================================================
/*:
 * @plugindesc Extending Galv_ActionIndicators to support more dynamic values
 * @author Gimmer
 *
 * @param ---Parameters---
 * @default
 *
 * @param Player Action Icon X Offset
 * @parent ---Parameters---
 * @type number
 * @min 0
 * @max 1000
 * @desc Offset on the X axis for an actionIcon over the player
 * Default: 0
 * @default 0
 *
 * @param Player Action Icon Y Offset
 * @parent ---Parameters---
 * @type number
 * @min 0
 * @max 1000
 * @desc Offset on the Y axis for an actionIcon over the player
 * Default: 0
 * @default 0
 *
 * @help
 * ===================
 * Gimmer_ExtendGalvAI
 * ===================
 *
 * An extension to Galv_ActionIndicators to support dynamic positioning and icons.
 *
 * ActionIndicators has you put <actionIcon: iconId> into the comment of an event to have it show up over the event when you approach it
 * My change allows the format: <actionIcon: iconDown:iconId|iconUp:iconId|iconLeft:iconId|iconRight:iconId|PC|x:num|y:num|iconId
 *
 * iconDown[Left,Up,Right]: iconId supports you choosing which icon id shows when the player is facing the event and facing that specific direction.
 * This can be used to only have icons set when the player is facing towards the event, not when they just walk by it.
 *
 * PC: just putting "PC" alone will make the actionIcon appear over the player characters head wit the provided offset parameters
 *
 * iconId: if you just have a number as one of the arguments, it'll use that iconId to allow backwards compatibility
 *
 * x or y: This is the exact X or Y coordinates you want the icon to show up at. This can help custom positioning more finely than the default options
 *
 * Terms of Use:
 * =======================================================================
 * Free for both commercial and non-commercial use, with credit.
 * More Gimmer_ plugins at: https://github.com/gimmer/RPG-Maker-MV-Plugins
 * =======================================================================
 */
//=============================================================================

var ExtendedGalvAIParameters = PluginManager.parameters('Gimmer_ExtendGalvAI');
Gimmer_Core.ExtendGalvAI.playerOffsetX = ExtendedGalvAIParameters['Player Action Icon X Offset'];
Gimmer_Core.ExtendGalvAI.playerOffsetY = ExtendedGalvAIParameters['Player Action Icon Y Offset'];

//Extend Action Icons to support dynamic values
Galv.AI.checkEventForIcon = function(event) {
    var icon = 0;

    if (event.page()) {
        var listCount = event.page().list.length;

        for (var i = 0; i < listCount; i++) {
            if (event.page().list[i].code === 108) {
                var iconCheck = event.page().list[i].parameters[0].match(/<actionIcon: (.*)>/i);
                if (iconCheck) {
                    let returnObj = {'eventId': event._eventId, 'iconId' : -1};
                    iconCheck = iconCheck[1].split("|");
                    iconCheck.forEach(function(val){
                        val = val.trim();
                        if(val === 'PC'){
                            returnObj['offsetX'] = Number(Gimmer_Core.ExtendGalvAI.playerOffsetX);
                            returnObj['offsetY'] = Number(Gimmer_Core.ExtendGalvAI.playerOffsetY);
                            returnObj['isPlayer'] = true;
                        }
                        else if(val.contains('iconUp:') && $gamePlayer.direction() === 8){
                            val = val.split(":");
                            returnObj['iconId'] = Number(val[1]);
                        }
                        else if(val.contains('iconDown:') && $gamePlayer.direction() === 2){
                            val = val.split(":");
                            returnObj['iconId'] = Number(val[1]);
                        }
                        else if(val.contains('iconLeft:') && $gamePlayer.direction() === 4){
                            val = val.split(":");
                            returnObj['iconId'] = Number(val[1]);
                        }
                        else if(val.contains('iconRight:') && $gamePlayer.direction() === 6){
                            val = val.split(":");
                            returnObj['iconId'] = Number(val[1]);
                        }
                        else if(val.contains('x')){
                            val = val.split(":");
                            returnObj['offsetX'] = Number(val[1]);
                        }
                        else if(val.contains('y')){
                            val = val.split(":");
                            returnObj['offsetX'] = Number(val[1]);
                        }
                        else if(parseInt(val) > 0 && returnObj['iconId'] < 0){
                            returnObj['iconId'] = Number(val);
                        }
                    });
                    if(returnObj['iconId'] < 0){
                        return null;
                    }
                    return returnObj
                };
            };
        };
    };
    return null;
};