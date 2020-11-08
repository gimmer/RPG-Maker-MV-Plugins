if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

Gimmer_Core['AnimatedTitle'] = {'loaded':true};

//=============================================================================
/*:
 * @plugindesc Choose a video to use as the animated background for the Title Screen of your game
 * @author Gimmer_
 * @help This plugin lets you choose a video in your movies folder to be the animated background for your title screen.
 *
 * The video will loop and play sound, so choose something that loops well. If you don't want sound and prefer in game music,
 * simply choose a video without sound
 *
 * For compatibility purposes, you must have a webm and mp4 of the video you want to play, the plugin will load the correct one for the environment
 *
 * To be able to see the video, your title screen sprite must be transparent
 *
 * @param Movie Path
 * @parent ---Parameters---
 * @type String
 * @desc Path to the movie that you want to play (starting with movies/, can be in a folder if you want)
 * Default: False
 * @default false
 */

var atParameters = PluginManager.parameters('Gimmer_AnimatedTitle');


Gimmer_Core.AnimatedTitle.titleVideoPath = atParameters['Movie Path'];
Gimmer_Core.AnimatedTitle.playingTitle = false;

Gimmer_Core.AnimatedTitle._Scene_Title_prototype_createBackground = Scene_Title.prototype.createBackground;
Scene_Title.prototype.createBackground = function(){
    Gimmer_Core.AnimatedTitle._Scene_Title_prototype_createBackground.call(this);
    if(Gimmer_Core.AnimatedTitle.titleVideoPath.length){
        Gimmer_Core.AnimatedTitle.videoObject = document.getElementById('GameVideo');
        Gimmer_Core.AnimatedTitle.videoObject.style.opacity = 1;
        Gimmer_Core.AnimatedTitle.videoObject.style.zIndex = 0;
        Gimmer_Core.AnimatedTitle.videoObject.autoplay = true;
        Gimmer_Core.AnimatedTitle.videoObject.loop = true;
        Gimmer_Core.AnimatedTitle.videoObject.src = Gimmer_Core.AnimatedTitle.titleVideoPath + $gameMap._interpreter.videoFileExt();
        Gimmer_Core.AnimatedTitle.playingTitle = true;
    }
}

Gimmer_Core.AnimatedTitle._Scene_Title_prototype_terminate = Scene_Title.prototype.terminate;
Scene_Title.prototype.terminate = function(){
    Gimmer_Core.AnimatedTitle._Scene_Title_prototype_terminate.call(this);
    if(Gimmer_Core.AnimatedTitle.playingTitle){
        Gimmer_Core.AnimatedTitle.playingTitle = false;
        Gimmer_Core.AnimatedTitle.videoObject.style.opacity = 0;
        Gimmer_Core.AnimatedTitle.videoObject.style.zIndex = 2;
        Gimmer_Core.AnimatedTitle.videoObject.autoplay = false;
        Gimmer_Core.AnimatedTitle.videoObject.loop = false;
        Gimmer_Core.AnimatedTitle.videoObject.pause();
    }
}

Graphics._updateVideo = function() {
    this._video.width = this._width;
    this._video.height = this._height;
    if(!Gimmer_Core.AnimatedTitle.playingTitle){
        this._video.style.zIndex = 2;
    }
    this._centerElement(this._video);
};

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