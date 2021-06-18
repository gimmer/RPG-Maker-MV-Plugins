if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

Gimmer_Core['SpottingPlayers'] = {'loaded':true};

//=============================================================================
/*:
 * @plugindesc v1.1 - A plugin to allow NPC events to "spot the player" and send execute a common event
 * @author Gimmer_
 *
 * @param ---Parameters---
 * @default
 *
 * @param Common Event
 * @parent ---Parameters---
 * @type common_event
 * @desc Common event to run when the player is spotted
 *
 * @param Map ID Variable
 * @parent ---Parameters---
 * @type variable
 * @desc Variable that holds current map
 *
 * @param Starting X Variable
 * @parent ---Parameters---
 * @type variable
 * @desc Variable that holds the start x of current map
 *
 * @param Starting Y Variable
 * @parent ---Parameters---
 * @type variable
 * @desc Variable that holds the start y of current map
 *
 * @param Solid Wall Region Id
 * @parent ---Parameters---
 * @type Number
 * @desc RegionId that represents a solid wall
 *
 * Default: 1
 * @default 1
 *
 * @param Track Spotter For Balloons
 * @parent ---Parameters---
 * @type Boolean
 * @desc Track who spotted the player and overwrite balloons in common events to be over their head?
 *
 * Default: True
 * @default true
 *
 * @param Track Map Position
 * @parent ---Parameters---
 * @type Boolean
 * @desc Track the mapId, X, and Y in variables for use in spotted common event?
 *
 * Default: True
 * @default true
 *
 * @help
 * ======================
 * Gimmer_SpottingPlayers
 * ======================
 *
 * A plugin to allow NPC events to "spot the player" and send & execute
 * a Common Event.
 *
 * VIDEO TUTORIAL:
 * ============================
 * https://youtu.be/sW1RJ_Xm7h0
 * ============================
 *
 * Terms of Use:
 * =======================================================================
 * Free for both commercial and non-commercial use, with credit.
 * More Gimmer_ plugins at: https://github.com/gimmer/RPG-Maker-MV-Plugins
 * =======================================================================
 */
//=============================================================================

let SpottingPlayersParameters = PluginManager.parameters('Gimmer_SpottingPlayers');
Gimmer_Core.SpottingPlayers.commonEvent = SpottingPlayersParameters['Common Event'];
Gimmer_Core.SpottingPlayers.mapIdVariable = SpottingPlayersParameters['Map ID Variable'];
Gimmer_Core.SpottingPlayers.startingX = SpottingPlayersParameters['Starting X Variable'];
Gimmer_Core.SpottingPlayers.startingY = SpottingPlayersParameters['Starting Y Variable'];
Gimmer_Core.SpottingPlayers.spotter = 0;
Gimmer_Core.SpottingPlayers.isSpotted = false;
Gimmer_Core.SpottingPlayers.watchedBoxes = {};
Gimmer_Core.SpottingPlayers.stopViewAt = Number(SpottingPlayersParameters['Solid Wall Region Id']);
Gimmer_Core.SpottingPlayers.trackSpotter = (SpottingPlayersParameters['Track Spotter For Balloons'] === "true");
Gimmer_Core.SpottingPlayers.trackMapPosition = (SpottingPlayersParameters['Track Map Position'] === "true");


//Direction constants
Gimmer_Core.SpottingPlayers.up = 8;
Gimmer_Core.SpottingPlayers.down = 2;
Gimmer_Core.SpottingPlayers.right = 6;
Gimmer_Core.SpottingPlayers.left = 4;


//Extend performTransfer to record the mapId, x, and y that the player is being sent to
Game_Player.prototype.performTransfer = function() {
    if (this.isTransferring()) {
        this.setDirection(this._newDirection);
        if (this._newMapId !== $gameMap.mapId() || this._needsMapReload) {
            $gameMap.setup(this._newMapId);
            this._needsMapReload = false;
        }
        this.locate(this._newX, this._newY);
        this.refresh();
        Gimmer_Core.SpottingPlayers.watchedBoxes = {};
        if(Gimmer_Core.SpottingPlayers.trackMapPosition){
            $gameVariables.setValue(Gimmer_Core.SpottingPlayers.mapIdVariable, this._newMapId);
            $gameVariables.setValue(Gimmer_Core.SpottingPlayers.startingX, this._newX);
            $gameVariables.setValue(Gimmer_Core.SpottingPlayers.startingY, this._newY);
        }
        this.clearTransferInfo();
    }
};

Gimmer_Core.SpottingPlayers.checkIfSpotted = function(){
    let spotter = false;
    let playerPosition = $gamePlayer._x+","+$gamePlayer._y;
    for (const [watcher, spaces] of Object.entries(Gimmer_Core.SpottingPlayers.watchedBoxes)) {
        if(spaces.indexOf(playerPosition) > 0){
            spotter = parseInt(watcher.replace("npc",""));
            break;
        }
    }

    if(spotter){
        Gimmer_Core.SpottingPlayers.isSpotted = true;
        Gimmer_Core.stopEventMovement();
        Gimmer_Core.stopPlayerMovement();
        if(Gimmer_Core.SpottingPlayers.trackSpotter){
            Gimmer_Core.SpottingPlayers.spotter = spotter;
        }
        Gimmer_Core.reserveCommonEventWithCallback(Gimmer_Core.SpottingPlayers.commonEvent, function(){
            Gimmer_Core.startEventMovement();
            Gimmer_Core.startPlayerMovement();
            Gimmer_Core.SpottingPlayers.isSpotted = false;
        });
    }
}

Gimmer_Core.SpottingPlayers.resetLevel = function (){
    $dataMap.events.forEach(function(v,k){
        if(k > 0){
            if(v && 'pages' in v){
                v.pages.forEach(function(p){
                    p.list.forEach(function(command){
                        if(command.code === 121){
                            $gameSwitches.setValue(command.parameters[0],0);
                        }
                    })
                })
            }
        }
    });
}

Gimmer_Core.SpottingPlayers.setViewedArea = function(obj, viewDistances){
    let watcher = "npc" + obj._eventId;
    Gimmer_Core.SpottingPlayers.watchedBoxes[watcher] = []
    let npcX = parseInt(obj._x);
    let npcY = parseInt(obj._y);
    Gimmer_Core.SpottingPlayers.watchedBoxes[watcher].push(npcX+','+npcY);
    let npcDirection = parseInt(obj._direction);
    let distance = 0;
    switch(npcDirection){
        case Gimmer_Core.SpottingPlayers.up:
            distance = viewDistances.up;
            break;
        case Gimmer_Core.SpottingPlayers.right:
            distance = viewDistances.right;
            break;
        case Gimmer_Core.SpottingPlayers.down:
            distance = viewDistances.down;
            break;
        case Gimmer_Core.SpottingPlayers.left:
            distance = viewDistances.left;
            break;
    }

    let newX, newY;
    let stopViewDistance = false;
    for(let i = 1; i <= distance; i++){
        switch(npcDirection){
            case Gimmer_Core.SpottingPlayers.up:
                newY = npcY - i;
                if(parseInt($gameMap.regionId(npcX, newY)) === Gimmer_Core.SpottingPlayers.stopViewAt){
                    stopViewDistance = true;
                }
                else{
                    Gimmer_Core.SpottingPlayers.watchedBoxes[watcher].push(npcX+','+newY);
                }

                break;
            case Gimmer_Core.SpottingPlayers.right:
                newX = npcX + i;
                if(parseInt($gameMap.regionId(newX, npcY)) === Gimmer_Core.SpottingPlayers.stopViewAt){
                    stopViewDistance = true;
                }
                else{
                    Gimmer_Core.SpottingPlayers.watchedBoxes[watcher].push(newX+','+npcY);
                }

                break;
            case Gimmer_Core.SpottingPlayers.down:
                newY = npcY + i;
                if(parseInt($gameMap.regionId(npcX, newY)) === Gimmer_Core.SpottingPlayers.stopViewAt){
                    stopViewDistance = true;
                }
                else{
                    Gimmer_Core.SpottingPlayers.watchedBoxes[watcher].push(npcX+','+newY);
                }
                break;
            case Gimmer_Core.SpottingPlayers.left:
                newX = npcX - i;
                if(parseInt($gameMap.regionId(newX, npcY)) === Gimmer_Core.SpottingPlayers.stopViewAt){
                    stopViewDistance = true;
                }
                else{
                    Gimmer_Core.SpottingPlayers.watchedBoxes[watcher].push(newX+','+npcY);
                }
                break;
        }
        if(stopViewDistance){
            break;
        }
    }
}


Game_CharacterBase.prototype.setDirection = function(d) {
    if (!this.isDirectionFixed() && d) {
        this._direction = d;
        if($dataMap && typeof $dataMap.events[this._eventId] !== 'undefined' && 'note' in $dataMap.events[this._eventId] && $dataMap.events[this._eventId].note.includes("canSpotPlayer") && !Gimmer_Core.SpottingPlayers.isSpotted) {
            let notes = $dataMap.events[this._eventId].note.split("|");
            let distances = {
                'up': 0,
                'right': 0,
                'down': 0,
                'left': 0
            }
            notes.every(function(v){
                if(v.includes('canSpotPlayer')){
                    let split = v.split(":");
                    split = split[1].split("-");
                    distances = {
                        'up': split[0],
                        'right': split[1],
                        'down':split[2],
                        'left':split[3]
                    }
                    return false;
                }
            });
            Gimmer_Core.SpottingPlayers.setViewedArea(this, distances);
            Gimmer_Core.SpottingPlayers.checkIfSpotted();
        }
        else if(this instanceof Game_Player && !Gimmer_Core.SpottingPlayers.isSpotted){
            Gimmer_Core.SpottingPlayers.checkIfSpotted();
        }
    }
    this.resetStopCount();
};

// Show Balloon Icon with override
Game_Interpreter.prototype.command213 = function() {
    if(Gimmer_Core.SpottingPlayers.spotter > 0){
        this._params[0] = Gimmer_Core.SpottingPlayers.spotter;
    }
    this._character = this.character(this._params[0]);
    if (this._character) {
        this._character.requestBalloon(this._params[1]);
        if (this._params[2]) {
            this.setWaitMode('balloon');
        }
    }
    Gimmer_Core.SpottingPlayers.spotter = 0;
    return true;
};

Gimmer_Core.SpottingPlayers.Game_CharacterBase_prototype_moveStraight = Game_CharacterBase.prototype.moveStraight;
Game_CharacterBase.prototype.moveStraight = function(d){
    Gimmer_Core.SpottingPlayers.Game_CharacterBase_prototype_moveStraight.call(this,d);
    this.setDirection(d);
}

Gimmer_Core.pluginCommands['RESETLEVEL'] = function(args){
    Gimmer_Core.SpottingPlayers.resetLevel();
}

Gimmer_Core.pluginCommands['STOPSPOTTING'] = function(){
    Gimmer_Core.SpottingPlayers.isSpotted = true;
}

Gimmer_Core.pluginCommands['STARTSPOTTING'] = function(){
    Gimmer_Core.SpottingPlayers.isSpotted = false;
}