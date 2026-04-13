var Gimmer_Core = Gimmer_Core || {};
Gimmer_Core.nf = {};

//=============================================================================
/*:
 * @plugindesc (v1.0) Put note tags into note files if you don't want to use a tiny box
 * @author Gimmer_
 * @help Instead of putting note tags into the notes folder, just put the following:
 *
 * <noteFile:path/to/file.txt>
 *
 * Place the file in the data folder. You can add sub folders if you want.
 * E.G. <noteFile:notes/harold.txt>
 *
 * The files will just contain whatever you would have put in a box.
 *
 * The system will try to cache files to avoid loading them repeatedly (mostly map events, between map loads)
 *
 * ====================
 * Version History
 * ====================
 * - 1.0: initial release
 */


DataManager._notesToLoad = [];
DataManager._loadingNotes = false;
DataManager._notesCache = {};

Gimmer_Core.nf.DataManager_extractMetadata = DataManager.extractMetadata
DataManager.extractMetadata = function(data){
    Gimmer_Core.nf.DataManager_extractMetadata.call(this, data);
    if(data.meta['noteFile']){
        this._notesToLoad.push({dest: data, fileName: data.meta['noteFile'], loaded: false});
    }
}

DataManager.areNotesLoaded = function(){
    return this._notesToLoad.filter(function(item){ return !item.loaded }).length === 0;
}

DataManager.startLoadingNotes = function(){
    this._loadingNotes = true;
    for (let i = 0; i < this._notesToLoad.length; i++) {
        let fileName = this._notesToLoad[i].fileName;
        let intoObject = this._notesToLoad[i].dest;
        this.loadNoteFile(intoObject, fileName, i);
    }
}

DataManager.loadNoteFile = function(intoObject, src, index) {
    if(this._notesCache[src]){
        DataManager.onNoteLoad(intoObject, src, this._notesCache[src], index)
        return;
    }
    var xhr = new XMLHttpRequest();
    var url = 'data/' + src;
    xhr.open('GET', url);
    xhr.overrideMimeType('application/text');
    xhr.onload = function() {
        if (xhr.status < 400) {
            DataManager.onNoteLoad(intoObject, src, xhr.responseText, index);
        }
    };
    xhr.onerror = function() {
        DataManager._errorUrl = DataManager._errorUrl || url;
    };

    xhr.send();
};

DataManager.onNoteLoad = function(object, src, text, index){
    object.note = text;
    this.extractMetadata(object)
    this._notesToLoad[index].loaded = true;
    this._notesCache[src] = text;
}

DataManager.clearNotes = function(){
    this._notesToLoad = [];
    this._loadingNotes = false;
}

/**
 * Scene_Boot
 */

Gimmer_Core.nf.Scene_Boot_prototype_isReady = Scene_Boot.prototype.isReady;
Scene_Boot.prototype.isReady = function() {
    if(Gimmer_Core.nf.Scene_Boot_prototype_isReady.call(this)){
        if(DataManager._loadingNotes){
            return DataManager.areNotesLoaded();
        }
        else{
            DataManager.startLoadingNotes();
        }
    }
    return false;
};

/**
 * Scene_Map Extensions
 */

Gimmer_Core.nf.Scene_Map_prototype_initialize = Scene_Map.prototype.initialize
Scene_Map.prototype.initialize = function(){
    Gimmer_Core.nf.Scene_Map_prototype_initialize.call(this);
    this._mapNotesLoading = false;
}

Gimmer_Core.nf.Scene_Map_prototype_isReady = Scene_Map.prototype.isReady
Scene_Map.prototype.isReady = function(){
    if(Gimmer_Core.nf.Scene_Map_prototype_isReady.call(this)){
        if(!this._mapNotesLoading){
            this._mapNotesLoading = true;
            DataManager.startLoadingNotes();
        }
        return DataManager.areNotesLoaded();
    }
    return false;
}

Gimmer_Core.nf.Scene_Map_prototype_start = Scene_Map.prototype.start
Scene_Map.prototype.start = function(){
    Gimmer_Core.nf.Scene_Map_prototype_start.call(this);
    DataManager.clearNotes();
}