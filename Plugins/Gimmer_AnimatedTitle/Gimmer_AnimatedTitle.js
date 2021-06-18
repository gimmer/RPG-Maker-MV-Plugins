if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

Gimmer_Core['AnimatedTitle'] = {'loaded':true};

//=============================================================================
/*:
 * @plugindesc v1.1 - Choose a video to use as the animated background for the Title Screen of your game
 * @author Gimmer_
 * @help This plugin lets you choose a video in your movies folder to be the animated background for your title screen.
 *
 * ===================
 * Gimmer_AnimatedTitle
 * ===================
 *
 * The video will loop and play sound, so choose something that loops well. If you don't want sound and prefer in game music,
 * simply choose a video without sound
 *
 * For compatibility purposes, you must have a webm and mp4 of the video you want to play, the plugin will load the correct one for the environment
 *
 * To be able to see the video, your title screen sprite must be transparent
 *
 * Terms of Use:
 * =======================================================================
 * Free for both commercial and non-commercial use, with credit.
 * More Gimmer_ plugins at: https://github.com/gimmer/RPG-Maker-MV-Plugins
 * =======================================================================
 *
 * @param Movie Path
 * @parent ---Parameters---
 * @type string
 * @desc Path to the movie that you want to play (starting with movies/, can be in a folder if you want)
 *
 * @param ---Changing Titles---
 * @default
 *
 * @param Change Title As Game Progresses
 * @parent ---Changing Titles---
 * @type Boolean
 * @desc Change the title video as the game progress?
 * Default: False
 * @default false
 *
 * @param Game Progress Variable
 * @parent ---Changing Titles---
 * @desc What variable will track what video to show?
 * @type variable
 *
 * @param List Of Video Files
 * @parent ---Changing Titles---
 * @type text[]
 * @desc A list of video files that you want, in the format of "movies/NameOfFile". Whatever the value of the variable chosen above is the position in this list (starting at 1) that will be played.
 *
 * ==============
 * Changelog
 * ==============
 * 12-17-20 v1.0.2:
 * - Bug fix for flashing screen after the video had finished, but better this time
 *
 * 12-16-20 v1.0.1:
 * - Bug fix for flashing screen after the video had finished.
 *
 * 12-01-20 v1.0:
 * - Plugin Complete.
 *
 */

//Parameter handling
var atParameters = PluginManager.parameters('Gimmer_AnimatedTitle');
Gimmer_Core.AnimatedTitle.titleVideoPath = atParameters['Movie Path'];
Gimmer_Core.AnimatedTitle.ChangeTitleAsGameProgresses = (atParameters['Change Title As Game Progresses'] === "true");
if(Gimmer_Core.AnimatedTitle.ChangeTitleAsGameProgresses){
    Gimmer_Core.AnimatedTitle.GameProgressVariable = Number(atParameters['Game Progress Variable']);
    Gimmer_Core.AnimatedTitle.GameProgressVideoList = eval(atParameters['List Of Video Files']);
}

//Track flags
Gimmer_Core.AnimatedTitle.playingTitle = false;

//Helper function to determine video files
Gimmer_Core.AnimatedTitle.determineVideoFile = function(){
    let videoFile = "";
    if(Gimmer_Core.AnimatedTitle.ChangeTitleAsGameProgresses && Gimmer_Core.AnimatedTitle.GameProgressVariable > 0){
        var json = StorageManager.load(DataManager.latestSavefileId());
        if(json){
            json = JsonEx.parse(json);
            let variables = json.variables;
            if(variables.value(Gimmer_Core.AnimatedTitle.GameProgressVariable) === 0){
                variables.setValue(Gimmer_Core.AnimatedTitle.GameProgressVariable,1);
            }
            if(variables.value(Gimmer_Core.AnimatedTitle.GameProgressVariable) > 0){
                videoFile = Gimmer_Core.AnimatedTitle.GameProgressVideoList[variables.value(Gimmer_Core.AnimatedTitle.GameProgressVariable) - 1];
            }
            else{
                videoFile = Gimmer_Core.AnimatedTitle.titleVideoPath;
            }
        }
        else{
            videoFile = Gimmer_Core.AnimatedTitle.titleVideoPath;
        }
    }
    else{
        videoFile = Gimmer_Core.AnimatedTitle.titleVideoPath;
    }
    return videoFile;
}

//When you create Scene_Title's background, hijack the GameVideo element and use it for your sinister ends.
Gimmer_Core.AnimatedTitle._Scene_Title_prototype_createBackground = Scene_Title.prototype.createBackground;
Scene_Title.prototype.createBackground = function(){
    Gimmer_Core.AnimatedTitle._Scene_Title_prototype_createBackground.call(this);
    if(Gimmer_Core.AnimatedTitle.determineVideoFile().length){
        Gimmer_Core.AnimatedTitle.videoObject = document.getElementById('GameVideo');
        Gimmer_Core.AnimatedTitle.videoObject.style.opacity = 1;
        Gimmer_Core.AnimatedTitle.videoObject.style.zIndex = 0;
        Gimmer_Core.AnimatedTitle.videoObject.autoplay = true;
        Gimmer_Core.AnimatedTitle.videoObject.loop = true;
        Gimmer_Core.AnimatedTitle.videoObject.src =  Gimmer_Core.AnimatedTitle.determineVideoFile() + $gameMap._interpreter.videoFileExt();
        Gimmer_Core.AnimatedTitle.playingTitle = true;
    }
}

//when you leave Scene_Title, stop the video and return it's index back to normal
Gimmer_Core.AnimatedTitle._Scene_Title_prototype_terminate = Scene_Title.prototype.terminate;
Scene_Title.prototype.terminate = function(){
    Gimmer_Core.AnimatedTitle._Scene_Title_prototype_terminate.call(this);
    if(Gimmer_Core.AnimatedTitle.playingTitle){
        Gimmer_Core.AnimatedTitle.videoObject.remove();
        Graphics._createVideo();
        Gimmer_Core.AnimatedTitle.playingTitle = false
    }
}

//Show the video change, and you aren't currently playing an animated title, return it's z-index back to normal
Graphics._updateVideo = function() {
    this._video.width = this._width;
    this._video.height = this._height;
    if(!Gimmer_Core.AnimatedTitle.playingTitle){
        this._video.style.zIndex = 2;
    }
    this._centerElement(this._video);
};

//Make the renderer transparent, this is needed or otherwise the canvas will be opaque by default
Graphics._createRenderer = function() {
    PIXI.dontSayHello = true;
    var width = this._width;
    var height = this._height;
    var options = { view: this._canvas, transparent: true };
    try {
        switch (this._rendererType) {
            case 'canvas':
                this._renderer = new PIXI.CanvasRenderer(width, height, options);
                break;
            case 'webgl':
                this._renderer = new PIXI.WebGLRenderer(width, height, options);
                break;
            default:
                this._renderer = PIXI.autoDetectRenderer(width, height, options);
                break;
        }

        if(this._renderer && this._renderer.textureGC)
            this._renderer.textureGC.maxIdle = 1;

    } catch (e) {
        this._renderer = null;
    }
};