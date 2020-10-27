if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

Gimmer_Core['MapPreload'] = {'loaded':true};
Gimmer_Core.MapPreload.mapCache = {};
Gimmer_Core.MapPreload.preloadQueue = [];
Gimmer_Core.MapPreload.mapInfo = {};
Gimmer_Core.MapPreload.nextPreloadRunId = 0;

//=============================================================================
/*:
 * @plugindesc A plugin to support preloading maps
 * @author Gimmer
 * @help Preload adjacent maps in the background to speed up gameplay
 *
 * @param Enabled
 * @parent ---Parameters---
 * @type Boolean
 * @desc Enable or disable the plugin?
 * Default: True
 * @default true
 */

var MapPreloadParameters = PluginManager.parameters('Gimmer_MapPreload');
Gimmer_Core.MapPreload.enabled = (MapPreloadParameters['Enabled'] === "true");
//Gimmer_Core.MapPreload.enabled = false;
if(Gimmer_Core.MapPreload.enabled){
    Game_Map.prototype.setup = function(mapId, mapDataObj) {
        if(mapDataObj === undefined){
            mapDataObj = $dataMap;
        }
        if (!mapDataObj) {
            throw new Error('The map data is not available');
        }
        this._mapId = mapId;
        this._tilesetId = mapDataObj.tilesetId;
        this._displayX = 0;
        this._displayY = 0;
        this.refereshVehicles();
        this.setupEvents(mapDataObj);
        this.setupScroll();
        this.setupParallax(mapDataObj);
        this.setupBattleback(mapDataObj);
        this._needsRefresh = false;
        if(mapId !== Gimmer_Core.MapPreload._nextPreloadMapId){
            Gimmer_Core.MapPreload.queuePreloads(this.events(), mapId);
        }
    };

//Transfer the player to the new map, don't set it up if you got it from the cache
    Game_Player.prototype.performTransfer = function() {
        if (this.isTransferring()) {
            this.setDirection(this._newDirection);
            if (this._newMapId !== $gameMap.mapId() || this._needsMapReload) {
                if(this._newMapId.toString() in Gimmer_Core.MapPreload.mapCache){
                    $gameMap = Gimmer_Core.MapPreload.mapCache[this._newMapId.toString()];
                    Gimmer_Core.MapPreload.queuePreloads($gameMap.events(), this._newMapId);
                    delete Gimmer_Core.MapPreload.mapCache[this._newMapId.toString()];
                }
                else{
                    $gameMap.setup(this._newMapId);
                }
                this._needsMapReload = false;
            }
            this.locate(this._newX, this._newY);
            this.refresh();
            this.clearTransferInfo();
        }
    };

    Gimmer_Core.MapPreload.Scene_Map_prototype_updateMain = Scene_Map.prototype.updateMain;
    Scene_Map.prototype.updateMain = function(){
        Gimmer_Core.MapPreload.Scene_Map_prototype_updateMain.call(this);
        Gimmer_Core.MapPreload.preloadAdjacentArea();
    }

//figure out all the events on a map and if there are transfer players, queue the maps needed
    Gimmer_Core.MapPreload.queuePreloads = function(events, newMapId){
        dd('queue maps adjacent to '+newMapId);
        events.forEach(function(event){
            if(event._trigger === 3){
                return
            }
            event.list().forEach(function(command){
                if(command.code === 201){
                    //Transfer player
                    let transferMapId;
                    if (command.parameters[0] === 0) {
                        transferMapId = command.parameters[1];
                    } else {
                        transferMapId = command.parameters(this._params[1]);
                    }
                    if(!(transferMapId.toString() in Gimmer_Core.MapPreload.mapCache) &&
                        Gimmer_Core.MapPreload.preloadQueue.indexOf(transferMapId) === -1
                    ){
                        Gimmer_Core.MapPreload.preloadQueue.push(transferMapId);
                        if(!'$dataMap'+transferMapId.toString() in window || !window['$dataMap'+transferMapId.toString()]){
                            DataManager.loadMapDataToFile(transferMapId, '$dataMap'+transferMapId.toString());
                        }
                    }
                }
            });
        });

        //Flush cache
        Object.keys(Gimmer_Core.MapPreload.mapCache).forEach(function(v){
            if(Gimmer_Core.MapPreload.preloadQueue.indexOf(parseInt(v)) === -1 && parseInt(v) !== parseInt(newMapId)){
                dd('flushing map '+v);
                delete Gimmer_Core.MapPreload.mapCache[v];
            }
        });
    }

    Gimmer_Core.MapPreload.preloadAdjacentArea = function(){
        if(Gimmer_Core.MapPreload.preloadQueue.length){
            this._nextPreloadMapId = Gimmer_Core.MapPreload.preloadQueue.pop();
            dd('preloading '+this._nextPreloadMapId);
            Gimmer_Core.MapPreload.mapCache[this._nextPreloadMapId.toString()] = new Game_Map();
            let oldDataMap = $dataMap;
            $dataMap = window['$dataMap'+this._nextPreloadMapId];
            Gimmer_Core.MapPreload.mapCache[this._nextPreloadMapId.toString()].setup(this._nextPreloadMapId);
            $dataMap = oldDataMap;
            this._nextPreloadMapId = undefined;
        }
    }


    Gimmer_Core.pluginCommands["PRELOADADJACENTAREA"] = function(args){
        Gimmer_Core.MapPreload.preloadAdjacentArea();
    }

    DataManager.loadMapDataToFile = function(mapId, name) {
        if (mapId > 0) {
            var filename = 'Map%1.json'.format(mapId.padZero(3));
            this._mapLoader = ResourceHandler.createLoader('data/' + filename, this.loadDataFile.bind(this, name, filename));
            this.loadDataFile(name, filename);
        } else {
            this.makeEmptyMap();
        }
    };

//Load the already loaded data into the map instead of requesting the json again
    Gimmer_Core.MapPreload.DataManager_loadMapData = DataManager.loadMapData;
    DataManager.loadMapData = function(mapId) {
        if('$dataMap'+mapId.toString() in window){
            $dataMap = window['$dataMap'+mapId.toString()];
            DataManager.onLoad(window['$dataMap']);
        }
        else{
            Gimmer_Core.MapPreload.DataManager_loadMapData.call(this,mapId);
        }
    };

    DataManager.onLoad = function(object) {
        var array;
        if (object === $dataMap) {
            this.extractMetadata(object);
            array = object.events;
        } else {
            array = object;
        }
        if (Array.isArray(array)) {
            for (var i = 0; i < array.length; i++) {
                var data = array[i];
                if (data && data.note !== undefined) {
                    this.extractMetadata(data);
                }
            }
        }
        if (object === $dataSystem) {
            Decrypter.hasEncryptedImages = !!object.hasEncryptedImages;
            Decrypter.hasEncryptedAudio = !!object.hasEncryptedAudio;
            Scene_Boot.loadSystemImages();
        }
    };

    Gimmer_Core.MapPreload.DataManager_onLoad = DataManager.onLoad;
    DataManager.onLoad = function(object){
        Gimmer_Core.MapPreload.DataManager_onLoad.call(this,object);
        if(object === $dataMapInfos){
            object.forEach(function(map){
                if(map){
                    DataManager.loadMapDataToFile(map.id,'$dataMap'+map.id.toString());
                }

            });

        }
    }
}