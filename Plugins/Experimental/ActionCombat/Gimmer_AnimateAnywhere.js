var Imported = Imported || {};

if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}
//=============================================================================
/*:
 * @plugindesc Plugin command to make an animation anywhere on the map
 * @author Gimmer
 * @help
 * ================
 * Gimmer_AnimationAnywhere
 * ================
 * run the following pluginCommand to put an animation anywhere on the screen
 *
 * addAnimation animationId character mirror x y delay
 *
 * AnimationId: the number of animation you want to animation
 * Character: the target. Strictly speaking only used in my other plugins. Can be any character instance. Used $gamePlayer if you don't know what to put
 * Mirror: 1 or 0, 1 if you want the animation to mirror. tbh, no idea why you'd do this
 * x: x coordinates in pixels
 * y: y coordinates in pixels
 * delay: how many frames to wait before playing
 *
 */

Gimmer_Core['AnimateAnywhere'] = {'loaded':true};

Gimmer_Core.AnimateAnywhere._Scene_Map_prototype_initialize = Scene_Map.prototype.initialize;
Scene_Map.prototype.initialize = function(){
    Gimmer_Core.AnimateAnywhere._Scene_Map_prototype_initialize.call(this);
    this._animations = [];
}

Gimmer_Core.AnimateAnywhere._Scene_Map_prototype_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function(){
    Gimmer_Core.AnimateAnywhere._Scene_Map_prototype_update.call(this);
    this.updateMapAnimations();
}

Scene_Map.prototype.updateMapAnimations = function(){
    this._animations.forEach(function(animation, key){
        if(!animation.isPlaying()){
            this.removeChild(animation);
            this._animations.splice(key,1);
        }
    }, this);
}

Scene_Map.prototype.addAnimation = function(animationId, character, mirror, x, y, delay){
    let animation = new Sprite_Animation();
    let fakeTarget = {
        parent: {
            x:x,
            y:y,
        },
        x:x,
        y:y,
        width: 1,
        height: 1,
        '_character': character,
        setBlendColor: function(){},
        hide: function(){}
    };
    animation.setup(fakeTarget,$dataAnimations[animationId],mirror, delay);
    this._animations.push(animation);
    this.addChild(animation);
}

Gimmer_Core.pluginCommands['ANIMATEANYWHERE'] = function(params){
    if(SceneManager._scene.constructor === Scene_Map){
        SceneManager._scene.addAnimation(Number(params[0]),eval(params[1]),(Number(params[2]) === 1),Number(params[3]),Number(params[4]),Number(params[5]));
    }
}