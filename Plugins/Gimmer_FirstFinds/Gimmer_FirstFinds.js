var Imported = Imported || {};

if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

Gimmer_Core['FF'] = {'loaded':true};
Imported['Gimmer_FirstFinds'] = '1.0'

//=============================================================================
/*:
 * @plugindesc v1.0 - Show dialogue or a common event the first time the party gets an item
 * @author Gimmer_
 * @help This plugin lets you set up note tags on items to act either
 * as dialogue or links to a common event that will fire the first time the party gets an item.
 *
 * In the note area of an item add either:
 *
 * Show text:
 * ff:the text you want to show
 *
 * or
 *
 * Start a common event
 * ffe:[commonEventId]
 *
 * @param ---Parameters---
 * @default
 *
 * @param Window Background for Item Messages
 * @parent ---Parameters---
 * @type select
 * @option Dim
 * @value 1
 * @option Window
 * @value 0
 * @option Transparent
 * @value 2
 *
 * @param Window Position for Item Messages
 * @parent ---Parameters---
 * @type select
 * @option Middle
 * @value 1
 * @option Bottom
 * @value 2
 * @option Top
 * @value 0
 *
 */

var ffParams = PluginManager.parameters('Gimmer_FirstFinds');
Gimmer_Core.FF['WindowBackground'] = Number(ffParams['Window Background for Item Messages'] || 0);
Gimmer_Core.FF['WindowPosition'] = Number(ffParams['Window Position for Item Messages'] || 2);

Gimmer_Core.FF.Game_Party_prototype_gainItem = Game_Party.prototype.gainItem;
Game_Party.prototype.gainItem = function(item, amount, includeEquip){
    const hadItem = this.hasEverHadItem(item);
    Gimmer_Core.FF.Game_Party_prototype_gainItem.call(this, item, amount, includeEquip);
    if(!hadItem && this.hasItem(item, includeEquip)){ //sanity check
        if(item.meta['ff'] && item.meta.ff.length > 0){
            if(SceneManager._scene.constructor === Scene_Map){
                $gameMessage.setBackground(Gimmer_Core.FF.WindowBackground);
                $gameMessage.setPositionType(Gimmer_Core.FF.WindowPosition);
                $gameMessage.add(item.meta.ff);
            }
            else{
                $gameMessage.addDeferred(item.meta.ff);
            }

        }
        else if(item.meta['ffe'] && Number(item.meta.ffe) > 0){
            $gameTemp.reserveCommonEvent(Number(item.meta.ffe));
        }
    }
}

Game_Party.prototype.hasEverHadItem = function(item){
    var container = this.itemContainer(item);
    return (container && item.id in container);
}

Gimmer_Core.FF.Game_Message_prototype_initialize= Game_Message.prototype.initialize;
Game_Message.prototype.initialize = function(){
    Gimmer_Core.FF.Game_Message_prototype_initialize.call(this);
    this._deferredTexts = [];
}

Game_Message.prototype.addDeferred = function(text){
    this._deferredTexts.push(text);
}

Game_Message.prototype.hasDeferredText = function() {
    return this._deferredTexts.length > 0;
};

Game_Message.prototype.displayDeferredTexts = function (){
    $gameMessage.setBackground(Gimmer_Core.FF.WindowBackground);
    $gameMessage.setPositionType(Gimmer_Core.FF.WindowPosition);
    this._deferredTexts.forEach(function(text){
        this.add(text);
    }, this);
    this._deferredTexts = [];
}

Gimmer_Core.FF.Scene_Map_prototype_onMapLoaded = Scene_Map.prototype.onMapLoaded
Scene_Map.prototype.onMapLoaded = function(){
    Gimmer_Core.FF.Scene_Map_prototype_onMapLoaded.call(this);
    if($gameMessage.hasDeferredText()){
        $gameMessage.displayDeferredTexts();
    }
}