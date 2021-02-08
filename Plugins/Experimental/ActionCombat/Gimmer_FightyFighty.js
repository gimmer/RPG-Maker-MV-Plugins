if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

Gimmer_Core['Fighty'] = {'loaded':true};

//=============================================================================
/*:
 * @plugindesc Support for active battle with hit and hurt boxes on players npc.
 * @author Gimmer
 * @help
 * ================
 * Gimmer_FightyFighty
 * ================
 *
 * tbd
 *
 *
 */

//Todo: make plugin command for enemies to attack.
//todo: .. enemy ai?

//Extending Animation to support hitboxes being built around them
Gimmer_Core.Fighty.nextHitboxId = 0;
Gimmer_Core.Fighty.HitBoxAnimations = {
    '121': [{width:50, height:25, angle: 0},{width:100, height: 25, angle: 0}],
    '122': [{width:50, height:25, angle: 270},{width:100, height: 25, angle: 270}],
    '123': [{width:50, height:25, angle: 180},{width:100, height: 25, angle: 180}],
    '124': [{width:50, height:25, angle: 90},{width:100, height: 25, angle: 90}],
    '125': [{width:40, height:10, angle: 225},{width:40, height:10, angle: 315}]
};

Gimmer_Core.Fighty.DebugAllyHitboxes = true;
Gimmer_Core.Fighty.DebugEnemyHitboxes = true;
Gimmer_Core.Fighty.DebugHurtBoxes = true;

Gimmer_Core.Fighty._Sprite_Animation_prototype_setup = Sprite_Animation.prototype.setup;
Sprite_Animation.prototype.setup = function(target, animation, mirror, delay) {
    Gimmer_Core.Fighty._Sprite_Animation_prototype_setup.call(this,target,animation,mirror,delay);
    if(this._animation && this._animation.id.toString() in Gimmer_Core.Fighty.HitBoxAnimations){
        this.setupHitboxes(Gimmer_Core.Fighty.HitBoxAnimations[this._animation.id.toString()])
    }
}

Sprite_Animation.prototype.setupHitboxes = function(hitboxes){
    //todo decouple hit boxes from damage amounts
    this._hitboxFrames = hitboxes;
    this._lastModX = 0;
    this._lastModY = 0;
    let type = (this._target._character._eventId > 0 ? 'event' : 'player');
    let direction = this._target._character.direction();
    this._hitbox = new Hitbox(type,new Polygon('rectangle',0,0,0,0, 0),direction,this._target._character, 10, 1);
    $gameScreen._allyHitBoxes.push(this._hitbox);
}

Gimmer_Core.Fighty._Sprite_Animation_prototype_updatePosition = Sprite_Animation.prototype.updatePosition;
Sprite_Animation.prototype.updatePosition = function(){
    Gimmer_Core.Fighty._Sprite_Animation_prototype_updatePosition.call(this);
    let hitboxX = this.x;
    let hitboxY = this.y;
    let direction = Gimmer_Core.directionsToWords(this._target._character.direction());
    switch(direction){
        case 'right':
            this._lastModY = this.getModY();
            hitboxY -= this._lastModY;
            break;
        case 'left':
            this._lastModY = this.getModY();
            hitboxY -= this._lastModY;
            break;
    }
    this._hitbox.updatePosition(hitboxX, hitboxY);
}

Sprite_Animation.prototype.getModY = function(){
    return (this._hitboxFrames[this.currentFrameIndex()] ? this._hitboxFrames[this.currentFrameIndex()].height / 2 : this._lastModY);
}

Sprite_Animation.prototype.getModX = function(){
    return (this._hitboxFrames[this.currentFrameIndex()] ? this._hitboxFrames[this.currentFrameIndex()].width / 2 : this._lastModX);
}

Gimmer_Core.Fighty._Game_Player_prototype_canMove = Game_Player.prototype.canMove;
Game_Player.prototype.canMove = function(){
    if(this._isAttacking){
        return false;
    }
    else{
        return Gimmer_Core.Fighty._Game_Player_prototype_canMove.call(this);
    }
}

Gimmer_Core.Fighty._Sprite_Animation_prototype_updateMain = Sprite_Animation.prototype.updateMain;
Sprite_Animation.prototype.updateMain = function(){
    Gimmer_Core.Fighty._Sprite_Animation_prototype_updateMain.call(this);
    if(!this.isPlaying() && this.isReady()){
        this._hitbox.finished = true;
        if(this._hitbox.type === "player"){
            $gamePlayer._isAttacking = false;
            Gimmer_Core.isPlayerStopped = false;
        }
    }
}


Gimmer_Core.Fighty._Sprite_Animation_prototype_updateFrame = Sprite_Animation.prototype.updateFrame;
Sprite_Animation.prototype.updateFrame = function(){
    Gimmer_Core.Fighty._Sprite_Animation_prototype_updateFrame.call(this);
    if(this._duration > 0){
        var frameIndex = this.currentFrameIndex();
        if(this._hitboxFrames[frameIndex]){
            this._hitbox.updatePosition(false, false, this._hitboxFrames[frameIndex].width, this._hitboxFrames[frameIndex].height, this._hitboxFrames[frameIndex].angle )
        }
    }
}



/* previous work */

//HACK FOR DEBUGGING
Gimmer_Core.Fighty.Scene_Map_prototype_createAllWindows = Scene_Map.prototype.createAllWindows;
Scene_Map.prototype.createAllWindows = function(){
    Gimmer_Core.Fighty.Scene_Map_prototype_createAllWindows.call(this);
    this.addDebugHitBoxWindow();
}

Scene_Map.prototype.addDebugHitBoxWindow = function(){
    this._debugHitBoxWindow = new Window_Plain(-18,-18,Graphics.width,Graphics.height);
    this.addChild(this._debugHitBoxWindow);
}
Gimmer_Core.Fighty._Scene_Map_prototype_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function(){
    this._debugHitBoxWindow.contents.clear();
    Gimmer_Core.Fighty._Scene_Map_prototype_update.call(this);
}


Gimmer_Core.Fighty._Game_Character_prototype_update = Game_Character.prototype.update;
Game_Character.prototype.update = function(sceneActive){
    Gimmer_Core.Fighty._Game_Character_prototype_update.call(this,sceneActive);
    if(this._needsHurtBox){
        if(Gimmer_Core.Fighty.DebugHurtBoxes){
            this.getHurtBox().render(SceneManager._scene._debugHitBoxWindow.contents,'#FFFFFF',1);
        }
        this.resolveHitBoxes();
        if('_selfHitBox' in this){
            let rectangle = this.getHurtBox();
            this._selfHitBox.updatePosition(rectangle.startingX, rectangle.startingY);
        }
    }
}


Gimmer_Core.Fighty._Game_Player_prototype_update = Game_Player.prototype.update;
Game_Player.prototype.update = function(sceneActive){
    Gimmer_Core.Fighty._Game_Player_prototype_update.call(this,sceneActive);
    this.updateAttacks();
    this.updateInvincibility();
}

Game_Player.prototype.updateInvincibility = function(){
    //TOdo add somekind of flash effect;
    if(this._invincibilityCount > 0){
        this._invincibilityCount--;
    }
}

//Todo resolve this better using player equipment to source animation, potentially hitboxes
Game_Player.prototype.updateAttacks = function(){
    if(Input.isTriggered('ok')  && !this._isAttacking){
        switch(Gimmer_Core.directionsToWords(this.direction())){
            case 'right':
                this.requestAnimation(125);
                break;
            case 'up':
                this.requestAnimation(122);
                break;
            case 'left':
                this.requestAnimation(123);
                break;
            case 'down':
                this.requestAnimation(124);
                break;

        }
        this._isAttacking = true;
        Gimmer_Core.isPlayerStopped = true;
    }
}



//Todo: fix to evaluate the first hitbox at location based on some kind of timestamp of creation time
Game_Character.prototype.resolveHitBoxes = function(){
    var hitboxes = $gameScreen.enemyHitBoxesAtLocation(this.getHurtBox());
    if(hitboxes.length){
        hitboxes.forEach(function(hitbox){
            this.resolveHitBox(hitbox);
        }, this);
    }
}

Game_Event.prototype.resolveHitBoxes = function(){
    var hitboxes = $gameScreen.allyHitBoxesAtLocation(this.getHurtBox());
    if(hitboxes.length){
        hitboxes.forEach(function(hitbox){
            this.resolveHitBox(hitbox);
        }, this);
    }
}

Game_Player.prototype.resolveHitBox = function(hitbox){
    if(this._invincibilityCount === 0 && !hitbox.engaged){
        hitbox.engaged = true;
        let actor = $gameActors._data[$gameParty._actors[this.characterIndex()]];
        let damage = -hitbox.damage;
        //actor.gainHp(damage)
        if (hitbox.damage > 0) {
            actor.performMapDamage();
        }
        if(hitbox.pushback > 0){
            for(let i = 0; i < hitbox.pushback; i++){
                this.resolvePushback(hitbox);
            }
        }
        if(hitbox.direction === 'self'){
            hitbox.engaged = false;
        }
        this._invincibilityCount = 60; //todo: param
    }
}

Gimmer_Core.Fighty._Game_Event_prototype_update = Game_Event.prototype.update;
Game_Event.prototype.update = function(){
    if(this._needsHurtBox && this._hp <= 0){
        this._needsHurtBox = false;
        $gameMap.eraseEvent(this._eventId);
    }
    Gimmer_Core.Fighty._Game_Event_prototype_update.call(this);
}

Game_Character.prototype.resolvePushback = function(hitbox){
    let victimMoving = this.isMoving();

    let hitboxDirection = hitbox.direction;
    if(hitbox.direction === "self"){
        if(victimMoving){
            hitboxDirection = Gimmer_Core.directionsToWords(this.reverseDir(this.direction()));
        }
        else{
            hitboxDirection = Gimmer_Core.directionsToWords(hitbox.source.direction())
        }
    }
    let d = Gimmer_Core.wordsToDirections(hitboxDirection);

    switch(hitboxDirection){
        case 'left':
        case 'right':
            if(this.canPass(this._x, this._y, d)){
                this._x = $gameMap.roundXWithDirection(this._x, d);
                if(!victimMoving){
                    this._realX = $gameMap.xWithDirection(this._x, this.reverseDir(d));
                }
            }
            break;
        case 'up':
        case 'down':
            if(this.canPass(this._x, this._y, d)){
                this._y = $gameMap.roundYWithDirection(this._y, d);
                if(!victimMoving){
                    this._realY = $gameMap.yWithDirection(this._y, this.reverseDir(d));
                }
            }
            break;
    }
}

Game_Event.prototype.takeDamage = function(damage){
    this._hp -= damage;
}

Game_Event.prototype.resolveHitBox = function(hitbox){
    if(!hitbox.engaged){
        hitbox.engaged = true;
        this.takeDamage(hitbox.damage);
        if (hitbox.damage > 0) {
            //Todo animation for getting hurt
            SoundManager.playActorDamage();
        }

        if(hitbox.pushback > 0){
            for(let i = 0; i < hitbox.pushback; i++){
                this.resolvePushback(hitbox);
            }
        }
    }
}


//Helper function to get the get based on which game character you are
Game_Player.prototype.getObjectData = function(){
    return $dataActors[$gameParty._actors[this.characterIndex()]];
}

Game_Event.prototype.getObjectData = function(){
    return $dataMap.events[this._eventId];
}

Gimmer_Core.Fighty._Game_Character_prototype_initialize = Game_Character.prototype.initialize;
Game_Character.prototype.initialize = function(){
    Gimmer_Core.Fighty._Game_Character_prototype_initialize.call(this);
    this._needsHurtBox = false;
    this._hurtBoxModLeft = 0;
    this._hurtBoxModRight = 0;
    this._hurtBoxModTop = 0;
    this._hurtBoxModBottom = 0;
}

Gimmer_Core.Fighty._Game_Event_prototype_initialize = Game_Event.prototype.initialize;
Game_Event.prototype.initialize = function(mapId, eventId){
    Gimmer_Core.Fighty._Game_Event_prototype_initialize.call(this,mapId, eventId);
    let data = this.getObjectData();
    if('isEnemy' in data.meta && data.meta.isEnemy){
        this._needsHurtBox = true;
        //Todo: couple this to enemy block, rather than static data
        this._mhp = data.meta.mhp;
        this._hp = data.meta.mhp;

        //Modify local hurtbox to go around the sprite, instead of being the tile
        this._hurtBoxModLeft = ('modLeft' in data.meta ? parseInt(data.meta.modLeft) : 0);
        this._hurtBoxModRight = ('modRight' in data.meta ? parseInt(data.meta.modRight) : 0);
        this._hurtBoxModTop = ('modTop' in data.meta ? parseInt(data.meta.modTop) : 0);
        this._hurtBoxModBottom = ('modBottom' in data.meta ? parseInt(data.meta.modBottom) : 0);

        //Self Hitbox means the npc will hurt players by walking into them, or if walked into, use same dimenions as hurtbox
        if('selfHitbox' in data.meta && data.meta.selfHitbox){
            let rectangle = this.getHurtBox();
            this._selfHitBox = new Hitbox('npc',rectangle,'self',this, 10, 1);
            $gameScreen._enemyHitBoxes.push(this._selfHitBox);
        }

    }
}

Gimmer_Core.Fighty._Game_Player_prototype_refresh = Game_Player.prototype.refresh;
Game_Player.prototype.refresh = function(){
    Gimmer_Core.Fighty._Game_Player_prototype_refresh.call(this);
    let actor = this.getObjectData();
    this._hurtBoxModLeft = ('modLeft' in actor.meta ? parseInt(actor.meta.modLeft) : 0);
    this._hurtBoxModRight = ('modRight' in actor.meta ? parseInt(actor.meta.modRight) : 0);
    this._hurtBoxModTop = ('modTop' in actor.meta ? parseInt(actor.meta.modTop) : 0);
    this._hurtBoxModBottom = ('modBottom' in actor.meta ? parseInt(actor.meta.modBottom) : 0);
}

Gimmer_Core.Fighty._Game_Player_prototype_initialize = Game_Player.prototype.initialize;
Game_Player.prototype.initialize = function(){
    Gimmer_Core.Fighty._Game_Player_prototype_initialize.call(this);
    this._needsHurtBox = true;
    this._isAttacking = false;
    this._invincibilityCount = 0;
}

Game_Character.prototype.getHurtBox = function(){
    let tw = $gameMap.tileWidth();
    let th = $gameMap.tileHeight()
    let x = this.screenX() - (tw / 2);
    let y = this.screenY() - th + this.shiftY();
    return new Polygon('rectangle',x + this._hurtBoxModLeft, y + this._hurtBoxModTop, tw + this._hurtBoxModRight, th + this._hurtBoxModBottom);
}

Gimmer_Core.Fighty._Game_Screen_prototype_clear = Game_Screen.prototype.clear;
Game_Screen.prototype.clear = function() {
    Gimmer_Core.Fighty._Game_Screen_prototype_clear.call(this);
    this.clearHitBoxes();
};

Game_Screen.prototype.clearHitBoxes = function(){
    this._enemyHitBoxes = [];
    this._allyHitBoxes = [];
}

Gimmer_Core.Fighty._Game_Screen_prototype_update = Game_Screen.prototype.update;
Game_Screen.prototype.update = function(){
    Gimmer_Core.Fighty._Game_Screen_prototype_update.call(this);
    this.updateHitBoxes();
}

Game_Screen.prototype.updateHitBoxes = function(){
    this._allyHitBoxes.forEach(function(hitbox, k){
        if(hitbox.finished){
            delete this._allyHitBoxes[k];
        }
        if(Gimmer_Core.Fighty.DebugAllyHitboxes){
            hitbox.shape.render(SceneManager._scene._debugHitBoxWindow.contents, '#FF0000', 1);
        }
    }, this);


    this._enemyHitBoxes.forEach(function(hitbox, k){
        if(hitbox.finished){
            delete this._enemyHitBoxes[k];
        }
        if(Gimmer_Core.Fighty.DebugEnemyHitboxes){
            hitbox.shape.render(SceneManager._scene._debugHitBoxWindow.contents, '#FF0000', 1);
        }
    }, this);
}


Game_Screen.prototype.enemyHitBoxesAtLocation = function(playerHurtBox){
    let hittingBoxes = [];
    if(!playerHurtBox){
        return hittingBoxes;
    }
    this._enemyHitBoxes.forEach(function(hitbox){
        if(!hitbox.engaged && hitbox.shape.intersects(playerHurtBox)){
            hittingBoxes.push(hitbox);
        }
    });
    return hittingBoxes;
}

Game_Screen.prototype.allyHitBoxesAtLocation = function(enemyHurtBox){
    let hittingBoxes = [];
    if(!enemyHurtBox){
        return hittingBoxes;
    }
    this._allyHitBoxes.forEach(function(hitbox){
        if(!hitbox.engaged && hitbox.shape.intersects(enemyHurtBox)){
            hittingBoxes.push(hitbox);
        }
    });
    return hittingBoxes;
}

class Polygon {
    constructor(type, startingX, startingY, width, height, angle) {
        this.type = type;
        this.startingX = startingX;
        this.startingY = startingY;
        this.width = width;
        this.height = height;
        this.angle = angle;
        this.updatePosition();
    }

    createPoints(){
        let x = this.startingX;
        let y = this.startingY;
        let width = this.width;
        let height = this.height;
        this.points = [];
        switch(this.type){
            case 'triangle':
                break;
            case 'rectangle':
                //Basic points
                this.points.push({x:x, y:y});
                this.points.push({x:x + width,y:y});
                this.points.push({x:x + width,y:y + height});
                this.points.push({x:x, y: y + height});
                break;
        }
    }

    updatePosition(x,y, width, height, angle){
        x = x || this.startingX;
        y = y || this.startingY;
        width = width || this.width;
        height = height || this.height;
        angle = angle || this.angle;
        this.startingX = x;
        this.startingY = y;
        this.width = width;
        this.height = height;
        this.angle = angle;
        this.pivotPoint = {x:this.startingX, y: this.startingY + (this.height / 2)}
        this.createPoints();
        this.rotate();
    }

    rotate(){
        if(this.angle > 0){
            this.points.forEach(function(point, k){
                this.points[k] = this.rotatePoint(point.x, point.y, this.pivotPoint.x, this.pivotPoint.y, this.angle);
            }, this);
            dd(this.points);
        }
    }

    rotatePoint(pointX, pointY, originX, originY, angle) {
        angle = angle * Math.PI / 180.0;
        return {
            x: Math.cos(angle) * (pointX-originX) - Math.sin(angle) * (pointY-originY) + originX,
            y: Math.sin(angle) * (pointX-originX) + Math.cos(angle) * (pointY-originY) + originY
        };
    }

    intersects(otherPolygon){
        //this is always the hit box, otherPolygon is the hurt box

        //If the box has no width or height, it can't hit anything
        if(this.width === 0 || this.height === 0){
            return false;
        }

        let a = this.points;
        let b = otherPolygon.points;

        var polygons = [a, b];
        var minA, maxA, projected, i, i1, j, minB, maxB;

        for (i = 0; i < polygons.length; i++) {

            // for each polygon, look at each edge of the polygon, and determine if it separates
            // the two shapes
            var polygon = polygons[i];
            for (i1 = 0; i1 < polygon.length; i1++) {

                // grab 2 vertices to create an edge
                var i2 = (i1 + 1) % polygon.length;
                var p1 = polygon[i1];
                var p2 = polygon[i2];

                // find the line perpendicular to this edge
                var normal = { x: p2.y - p1.y, y: p1.x - p2.x };

                minA = maxA = undefined;
                // for each vertex in the first shape, project it onto the line perpendicular to the edge
                // and keep track of the min and max of these values
                for (j = 0; j < a.length; j++) {
                    projected = normal.x * a[j].x + normal.y * a[j].y;
                    if (Gimmer_Core.isUndefined(minA) || projected < minA) {
                        minA = projected;
                    }
                    if (Gimmer_Core.isUndefined(maxA) || projected > maxA) {
                        maxA = projected;
                    }
                }

                // for each vertex in the second shape, project it onto the line perpendicular to the edge
                // and keep track of the min and max of these values
                minB = maxB = undefined;
                for (j = 0; j < b.length; j++) {
                    projected = normal.x * b[j].x + normal.y * b[j].y;
                    if (Gimmer_Core.isUndefined(minB) || projected < minB) {
                        minB = projected;
                    }
                    if (Gimmer_Core.isUndefined(maxB) || projected > maxB) {
                        maxB = projected;
                    }
                }

                // if there is no overlap between the projects, the edge we are looking at separates the two
                // polygons, and we know there is no overlap
                if (maxA < minB || maxB < minA) {
                    return false;
                }
            }
        }
        return true;
    }

    render(bitmap, color, thickness){
        let context = bitmap._context;
        context.save();
        context.strokeStyle = color;
        context.lineWidth = thickness;
        context.beginPath();
        context.moveTo(this.points[0].x, this.points[0].y);

        for (var j = 1; j < this.points.length; j++) {
            context.lineTo(this.points[j].x, this.points[j].y);
        }

        context.lineTo(this.points[0].x, this.points[0].y);
        context.closePath();
        context.stroke();
        context.restore();
        bitmap._setDirty();
    }
}


class Hitbox {
    constructor(type, shape, direction, source, damage, pushback){
        this.type = type;
        this.direction = (direction === "self" ? direction : Gimmer_Core.directionsToWords(direction));
        this.damage = damage;
        this.pushback = pushback;
        this.source = source
        this.engaged = false;
        this.finished = false;
        this.shape = shape;
    }

    updatePosition(x,y, width, height, angle){
        this.shape.updatePosition(x,y,width,height, angle);
    }
}

Rectangle.prototype.intersects = function(rect) {
    //rect = hurtbox
    //this = hitbox
    let width = this.width;
    let height = this.height;

    let comparison1 = rect.x > (this.x + width);
    let comparison2 = (rect.x + rect.width) <  this.x;
    let comparison3 = rect.y  > (this.y + height);
    let comparison4 = (rect.y + rect.height) <  this.y;
    if(width < 0){
        comparison2 = (rect.x + rect.width) <  this.x + width;
    }
    if(height < 0){
        comparison4 = (rect.y + rect.height) <  this.y + height;
    }

    return !(comparison1 || comparison2 || comparison3 || comparison4);
}
