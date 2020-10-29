## Gimmer_ExtendGalvAI
An extension of Galv's Action Indicators to be a bit more flexible

Requires [Galv's Action Indicators](https://forums.rpgmakerweb.com/index.php?threads/galvs-action-indicators.52254/)

ActionIndicators has you put <actionIcon: iconId> into the comment of an event to have it show up over the event when you approach it

My change allows the format: <actionIcon: iconDown:iconId|iconUp:iconId|iconLeft:iconId|iconRight:iconId|PC|x:num|y:num|iconId

* iconDown[Left,Up,Right]: iconId supports you choosing which icon id shows when the player is facing the event and facing that specific direction.
This can be used to only have icons set when the player is facing towards the event, not when they just walk by it.
* PC: just putting "PC" alone will make the actionIcon appear over the player characters head wit the provided offset parameters
* iconId: if you just have a number as one of the arguments, it'll use that iconId to allow backwards compatibility
* x or y: This is the exact X or Y coordinates you want the icon to show up at. This can help custom positioning more finely than the default option

In order to use this, you'll have to edit Galv_ActionIndicators at line 283:

```javascript
let tempOffsetX = this._offsetX;
let tempOffsetY = this._offsetY;

if('offsetX' in $gamePlayer.actionIconTarget){
	tempOffsetX = $gamePlayer.actionIconTarget.offsetX;
}

if('offsetY' in $gamePlayer.actionIconTarget){
	tempOffsetY = $gamePlayer.actionIconTarget.offsetY;
}

if('isPlayer' in $gamePlayer.actionIconTarget){
	this.x = $gamePlayer.screenX() + tempOffsetX;
	this.y = $gamePlayer.screenY() + tempOffsetY + this._float;
}
else{
	this.x = $gameMap.event($gamePlayer.actionIconTarget.eventId).screenX() + tempOffsetX;
	this.y = $gameMap.event($gamePlayer.actionIconTarget.eventId).screenY() + tempOffsetY + this._float;
}
```

This edit has to happen because Galv declares some functions in a document on ready, and other plugins can't override them;

## Terms of Use:

Free for both commercial and non-commercial use, with credit.

More Gimmer_ plugins at: https://github.com/gimmer/RPG-Maker-MV-Plugins