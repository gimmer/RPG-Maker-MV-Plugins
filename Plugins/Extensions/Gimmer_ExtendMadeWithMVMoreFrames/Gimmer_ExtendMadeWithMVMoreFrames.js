if(!Liquidize.MadeWithMV){
    throw "This requires MadeWithMv!";
}

/*:
 * NOTE: Images are stored in the img/system folder.
 *
 * @plugindesc Extend the number of screens in MadeWithMvCustom
 * @author Gimmer_
 *
 * @help
 *
 * @param Custom Image
 * @desc The image to use when showing "Made with MV"
 * Default:
 * @default
 * @require 1
 * @dir img/system/
 * @type file[]
 *
 */

var ExtendMvParams = PluginManager.parameters('Gimmer_ExtendMadeWithMVMoreFrames');

Liquidize.MadeWithMV.CustomImage = JSON.parse(ExtendMvParams['Custom Image']);


var ExtendMv_Scene_Boot_loadSystemImages = Scene_Boot.prototype.loadSystemImages;
Scene_Boot.prototype.loadSystemImages = function() {
    ExtendMv_Scene_Boot_loadSystemImages.call(this);
    if (Liquidize.MadeWithMV.ShowMV) {
        ImageManager.loadSystem(Liquidize.MadeWithMV.MVImage);
    }
    if (Liquidize.MadeWithMV.ShowCustom && Liquidize.MadeWithMV.CustomImage.length) {
        Liquidize.MadeWithMV.CustomImage.forEach(function(path){
            ImageManager.loadSystem(path);
        })

    }
};

Scene_Splash.prototype.createSplashes = function() {
    if (Liquidize.MadeWithMV.ShowMV) {
        this._mvSplash = new Sprite(ImageManager.loadSystem(Liquidize.MadeWithMV.MVImage));
        this.addChild(this._mvSplash);
    }
    if (Liquidize.MadeWithMV.CustomImage.length) {
        this._customSplash = [];
        Liquidize.MadeWithMV.CustomImage.forEach(function(splash){
            let myCustomSplash = new Sprite(ImageManager.loadSystem(splash));
            myCustomSplash.opacity = 0;
            this._customSplash.push(myCustomSplash);
            this.addChild(myCustomSplash);
        }, this);

    }
};

Scene_Splash.prototype.centerSprite = function(sprite) {
    if(Array.isArray(sprite)){
        sprite.forEach(function(mysprite){
            this.centerSprite(mysprite);
        }, this);
    } else{
        sprite.x = Graphics.width / 2;
        sprite.y = Graphics.height / 2;
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
    }

};

Scene_Splash.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
    this._mvSplash = null;
    this._customSplash = null;
    this._mvWaitTime = Liquidize.MadeWithMV.WaitTime;
    this._customWaitTime = Liquidize.MadeWithMV.WaitTime;
    this._mvFadeOut = false;
    this._mvFadeIn = false;
    this._customFadeOut = 0;
    this._customFadeIn = 0;
};

Scene_Splash.prototype.update = function() {
    if (Liquidize.MadeWithMV.ShowMV) {
        if (!this._mvFadeIn) {
            this.startFadeIn(Liquidize.MadeWithMV.FadeInTime,false);
            this._mvFadeIn = true;
        } else {
            if (this._mvWaitTime > 0 && this._mvFadeOut === false) {
                this._mvWaitTime--;
            } else {
                if (this._mvFadeOut === false) {
                    this._mvFadeOut = true;
                    this.startFadeOut(Liquidize.MadeWithMV.FadeOutTime,false);
                }
            }
        }
    }

    if (Liquidize.MadeWithMV.CustomImage.length) {
        if (Liquidize.MadeWithMV.ShowMV && this._mvFadeOut === true) {
            if (this._customFadeOut === this._customFadeIn && this._customFadeIn !== Liquidize.MadeWithMV.CustomImage.length && this._fadeDuration === 0) {
                this._customSplash[this._customFadeIn].opacity = 255;
                this._customWaitTime = Liquidize.MadeWithMV.WaitTime;
                this.startFadeIn(Liquidize.MadeWithMV.FadeInTime, false);
                this._customFadeIn++;
            } else {
                if (this._customWaitTime > 0 && this._customFadeOut !== Liquidize.MadeWithMV.CustomImage.length) {
                    this._customWaitTime--;
                } else {
                    if (this._customFadeOut < this._customFadeIn && this._customFadeOut !== Liquidize.MadeWithMV.CustomImage.length) {
                        this._customFadeOut++;
                        this.startFadeOut(Liquidize.MadeWithMV.FadeOutTime, false);
                    }
                }
            }
        } else if (!Liquidize.MadeWithMV.ShowMV) {
            if (this._customFadeOut === this._customFadeIn && this._customFadeIn !== Liquidize.MadeWithMV.CustomImage.length && this._fadeDuration === 0) {
                this._customSplash[this._customFadeIn].opacity = 255;
                this.startFadeIn(Liquidize.MadeWithMV.FadeInTime, false);
                this._customFadeIn++;
            } else {
                if (this._customWaitTime > 0 && this._customFadeOut !== Liquidize.MadeWithMV.CustomImage.length) {
                    this._customWaitTime--;
                } else {
                    if (this._customFadeOut < this._customFadeIn && this._customFadeOut !== Liquidize.MadeWithMV.CustomImage.length) {
                        this._customFadeOut++;
                        this.startFadeOut(Liquidize.MadeWithMV.FadeOutTime, false);
                    }
                }
            }
        }
    }

    if (Liquidize.MadeWithMV.CustomImage.length) {
        if (Liquidize.MadeWithMV.ShowMV && this._mvFadeOut === true && this._customFadeOut === Liquidize.MadeWithMV.CustomImage.length) {
            this.gotoTitleOrTest();
        } else if (!Liquidize.MadeWithMV.ShowMV && this._customFadeOut === Liquidize.MadeWithMV.CustomImage.length) {
            this.gotoTitleOrTest();
        }
    } else {
        if (this._mvFadeOut === true) {
            this.gotoTitleOrTest();
        }
    }

    Scene_Base.prototype.update.call(this);
};