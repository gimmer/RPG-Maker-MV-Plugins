var Imported = Imported || {};

if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

Gimmer_Core['LicenseBoard'] = {'loaded':true};

//=============================================================================
/*:
 * @plugindesc License Board to replace the exp leveling sytem with stats bought with licenses
 * @author Gimmer
 * @help
 * ===========
 * Gimmer_LicenseBoard
 * ===========
 *
 * This plugin replaces the xp system with a License Point (LP) system, with stats, equip skills, and magic being bought with points earned in battles
 * Note: This assumes you will only us the LP system, and not exp. Settings an enemies XP value controls the LP they hand out now instead, so you will have to balance encounters around that.
 *
 *
 * @param License Board Name
 * @parent ---Parameters---
 * @type String
 * @desc What do you want to call the board menu option?
 * Default: License Board
 * @default License Board
 *
 * @param Point Label
 * @parent ---Parameters---
 * @type String
 * @desc What do you want to call license points in short hand?
 * Default: License Points
 * @default License Points
 *
 * @param Point Short Label
 * @parent ---Parameters---
 * @type String
 * @desc What do you want to call license points in short hand?
 * Default: LP
 * @default LP
 *
 * @param Use Custom Cursor
 * @parent ---Parameters---
 * @type Boolean
 * @desc Do you want to use a custom cursor?
 * Default: true
 * @default true
 *
 * @param Show Success Window
 * @parent ---Parameters---
 * @type Boolean
 * @desc Do you want to show a success pop up on license claim?
 * Default: true
 * @default true
 *
 * @param Success Frame Count
 * @parent Show Success Window
 * @type Number
 * @desc How many frames to show the success window?
 * Default: 60
 * @default 60
 *
 * @param Success Open Percent
 * @parent Show Success Window
 * @type Number
 * @desc What percentage to fade in the success window by each frame?
 * Default: 10
 * @default 10
 *
 * @param Success Close Percent
 * @parent Show Success Window
 * @type Number
 * @desc What percentage to fade out the success window by each frame?
 * Default: 10
 * @default 10
 *
 * @param Trigger Switch
 * @parent ---Parameters---
 * @type Switch
 * @desc What switch needs to be true for the license board to be accessible?
 *
 *
 * Terms of Use:
 * =======================================================================
 * Free for both commercial and non-commercial use, with credit.
 * More Gimmer_ plugins at: https://github.com/gimmer/RPG-Maker-MV-Plugins
 * =======================================================================
 */


//Parameters
var lbParams = PluginManager.parameters('Gimmer_LicenseBoard');
Gimmer_Core.LicenseBoard.BoardLabel = lbParams['License Board Name'];
Gimmer_Core.LicenseBoard.PointsLabel = lbParams['Point Label']
Gimmer_Core.LicenseBoard.PointsLabelShort = lbParams['Point Short Label']
Gimmer_Core.LicenseBoard.UseCustomCursor = (lbParams['Use Custom Cursor'] === 'true');
Gimmer_Core.LicenseBoard.ShowSuccessPopup = (lbParams['Show Success Window'] === 'true');
Gimmer_Core.LicenseBoard.SuccessStayOpenFor = Number(lbParams['Success Frame Count']);
Gimmer_Core.LicenseBoard.SuccessOpenSpeed = Number(lbParams['Success Open Percent']) / 100;
Gimmer_Core.LicenseBoard.SuccessCloseSpeed = Number(lbParams['Success Close Percent']) / 100;
Gimmer_Core.LicenseBoard.TriggerSwitch = Number(lbParams['Trigger Switch']);

//Tracking Variables
Gimmer_Core.LicenseBoard.maxX = 0;
Gimmer_Core.LicenseBoard.maxY = 0;
Gimmer_Core.LicenseBoard.LicenseCount = 0;

//Constants
Gimmer_Core.LicenseBoard.TOP_BORDER_ICON_ID = 3;
Gimmer_Core.LicenseBoard.BOTTOM_BORDER_ICON_ID = 5;
Gimmer_Core.LicenseBoard.LEFT_BORDER_ICON_ID = 6;
Gimmer_Core.LicenseBoard.RIGHT_BORDER_ICON_ID = 4;
Gimmer_Core.LicenseBoard.CURSOR_ICON_ID = 7;
Gimmer_Core.LicenseBoard.PortraitHeight = Window_Base._faceHeight / 2;
Gimmer_Core.LicenseBoard.PortraitWidth = Window_Base._faceWidth / 2;

//Params
Gimmer_Core.LicenseBoard.MHP = 0;
Gimmer_Core.LicenseBoard.MMP = 1;
Gimmer_Core.LicenseBoard.ATK = 2;
Gimmer_Core.LicenseBoard.DEF = 3;
Gimmer_Core.LicenseBoard.MAT = 4;
Gimmer_Core.LicenseBoard.MDF = 5;
Gimmer_Core.LicenseBoard.AGI = 6;
Gimmer_Core.LicenseBoard.LUK = 7;

var $dataLicenseBoard = [];
var $dataLicenseMap = {};
var $dataLicenseEasyCoords = [];

//Load Skill Board Data
DataManager._databaseFiles.push({name:'$dataLicenseBoard',src:'Licenses.json'});

//Map data to useful helper strings
Gimmer_Core.LicenseBoard.DataManager_onLoad = DataManager.onLoad;
DataManager.onLoad = function(object){
    Gimmer_Core.LicenseBoard.DataManager_onLoad.call(this,object);

    if(object === $dataLicenseBoard){
        $dataLicenseBoard.forEach(function(license, index){
            if(license.x > Gimmer_Core.LicenseBoard.maxX){
                Gimmer_Core.LicenseBoard.maxX = license.x;
            }
            if(license.y > Gimmer_Core.LicenseBoard.maxY){
                Gimmer_Core.LicenseBoard.maxY = license.y;
            }

            if(license.type !== 'nope'){
                Gimmer_Core.LicenseBoard.LicenseCount++;
            }

            let coordString = Gimmer_Core.LicenseBoard.getLicenseCoordinateString(license);
            $dataLicenseMap[coordString] = index;
            $dataLicenseEasyCoords.push(coordString);
            $dataLicenseBoard[index] = new BoardLicense(license);
        });
    }
}

//Helper function to get license coordinates as a string
Gimmer_Core.LicenseBoard.getLicenseCoordinateString = function(license){
    return license.x+","+license.y;
}

//Get the coordinates of a given license's index Id
Gimmer_Core.LicenseBoard.getCoordsById = function(licenseId){
    return this.getLicenseCoordinateString($dataLicenseBoard[licenseId]);
}

Gimmer_Core.LicenseBoard.isTriggered = function(){
    let triggered = true;
    if(Gimmer_Core.LicenseBoard.TriggerSwitch > 0){
        triggered = $gameSwitches.value(Gimmer_Core.LicenseBoard.TriggerSwitch)
    }
    return triggered;
}


//Inject in LicenseBoard to menu commands
Gimmer_Core.LicenseBoard._Window_MenuCommand_prototype_addMainCommands = Window_MenuCommand.prototype.addMainCommands;
Window_MenuCommand.prototype.addMainCommands = function(){
    Gimmer_Core.LicenseBoard._Window_MenuCommand_prototype_addMainCommands.call(this);
    if(Gimmer_Core.LicenseBoard.isTriggered()){
        this.addCommand(Gimmer_Core.LicenseBoard.BoardLabel,'board',true);
    }
}

//Extend createCommandWindow to add a handler for the menuboard
Gimmer_Core.LicenseBoard._Scene_Menu_prototype_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
Scene_Menu.prototype.createCommandWindow = function() {
    Gimmer_Core.LicenseBoard._Scene_Menu_prototype_createCommandWindow.call(this);
    this._windowLayer.removeChild(this._commandWindow);
    this._commandWindow.setHandler('board',     this.commandPersonal.bind(this));
    this.addWindow(this._commandWindow);
};

//Support board symbol for the onPersonalOk
Gimmer_Core.LicenseBoard._Scene_Menu_prototype_onPersonalOk = Scene_Menu.prototype.onPersonalOk;
Scene_Menu.prototype.onPersonalOk = function(){
    Gimmer_Core.LicenseBoard._Scene_Menu_prototype_onPersonalOk.call(this);
    if(this._commandWindow.currentSymbol() === 'board'){
        SceneManager.push(Scene_LicenseBoard);
    }
}

//Scene_LicenseBoard
function Scene_LicenseBoard() {
    this.initialize.apply(this, arguments);
}

Scene_LicenseBoard.prototype = Object.create(Scene_MenuBase.prototype);
Scene_LicenseBoard.prototype.constructor = Scene_LicenseBoard;

//constructor
Scene_LicenseBoard.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};

//Create license board
Scene_LicenseBoard.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createActorWindow();
    this.createHelpWindow();
    this.createBoardWindow();
    if(Gimmer_Core.LicenseBoard.ShowSuccessPopup){
        this.createSuccessWindow();
    }
};

//Create custom help window
Scene_LicenseBoard.prototype.createHelpWindow = function() {
    this._helpWindow = new Window_LicenseHelp(this._actor, this._actorWindow.width, this._actorWindow.height);
    this.addWindow(this._helpWindow);
};

//Create custom actor window
Scene_LicenseBoard.prototype.createActorWindow = function() {
    this._actorWindow = new Window_LicenseActor(this._actor);
    this._actorWindow.reserveFaceImages();
    this.addWindow(this._actorWindow);
};

//Create the license board window
Scene_LicenseBoard.prototype.createBoardWindow = function(){
    var wy = this._helpWindow.y + this._helpWindow.height;
    var wh = Graphics.boxHeight - wy
    this._boardWindow = new Window_LicenseBoard(0,wy, Graphics.boxWidth, wh, this._actor);
    this._boardWindow.setHandler('ok',     this.onItemOk.bind(this));
    this._boardWindow.setHandler('cancel', this.popScene.bind(this));
    this._boardWindow.setHandler('pagedown', this.nextActor.bind(this));
    this._boardWindow.setHandler('pageup',   this.previousActor.bind(this));
    this._boardWindow.setHelpWindow(this._helpWindow);
    this.addWindow(this._boardWindow);
    this._boardWindow.activate();
}

//Create the success window
Scene_LicenseBoard.prototype.createSuccessWindow = function(){
    this._successWindow = new Window_LicenseSuccess(this._actor);
    this._successWindow.setOnClose(function(){
        SceneManager._scene._boardWindow.activate();
    });
    this.addWindow(this._successWindow);
}

//Handle a change of actor
Scene_LicenseBoard.prototype.refreshActor = function() {
    var actor = this.actor();
    this._boardWindow.setActor(actor);
    this._helpWindow.setActor(actor);
    this._actorWindow.setActor(actor);
    if(Gimmer_Core.LicenseBoard.ShowSuccessPopup){
        this._successWindow.setActor(actor);
    }
};

//Handle changing the actor by activating the window again
Scene_LicenseBoard.prototype.onActorChange = function() {
    this.refreshActor();
    this._boardWindow.activate();
};

//Function for selecting a license
Scene_LicenseBoard.prototype.onItemOk = function(){
    let index = this._boardWindow.index();
    let item = this._boardWindow.item();
    if(index >= 0){
        if(this._actor.claimLicense(index, item)){
            if(Gimmer_Core.LicenseBoard.ShowSuccessPopup){
                this._successWindow.setItem(item);
                this._successWindow.open();
            }
            else{
                this._boardWindow.activate();
            }
        }
    }
    this._boardWindow.refresh();
}

//Expand Game Actor to support reading licenses to adjust parameters
Gimmer_Core.LicenseBoard._Game_Actor_prototype_initMembers = Game_Actor.prototype.initMembers;
Game_Actor.prototype.initMembers = function(){
    Gimmer_Core.LicenseBoard._Game_Actor_prototype_initMembers.call(this);
    this._licenses = [];
    this._lastLicenseId = -1;
}

//Record the lastLicenseId on the board so you reopen where you were each time
Game_Actor.prototype.getLastLicenseId = function(){
    let id = $dataLicenseMap[this.currentClass().meta.StartingLicensePosition];
    if(this._lastLicenseId >= 0){
        id = this._lastLicenseId;
    }
    return id;
}

//When setting up an actor for the first time, initialize the licenses their class starts with
Gimmer_Core.LicenseBoard._Game_Actor_prototype_setup = Game_Actor.prototype.setup;
Game_Actor.prototype.setup = function(actorId){
    Gimmer_Core.LicenseBoard._Game_Actor_prototype_setup.call(this, actorId);
    this.initLicenses();
}

//Help function to give the required license points and then claim all the liceses a class starts as
Game_Actor.prototype.initLicenses = function(){
    if('StartingLicenses' in this.currentClass().meta){
        let startingLicenses = this.currentClass().meta.StartingLicenses.split("|");
        startingLicenses.forEach(function(coords){
            let index = $dataLicenseMap[coords];
            let license = $dataLicenseBoard[index];
            this.gainExp(license.cost);
            this.claimLicense(index,license);
        }, this);
    }
}


//Claim the license as an actor and apply the effects
Game_Actor.prototype.claimLicense = function(index, license){
    //Determine if they can pay for it.
    let gotIt = false;
    if(this._licenses.indexOf(index) === -1 && license.type !== 'nope'){
        //Give them the license
        this._licenses.push(index);
        this.deductExp(license.cost);
        //Some attributes need immediate application
        if(license.type === 'attribute'){
            switch(license.target){
                case Gimmer_Core.LicenseBoard.MHP:
                    this._hp += license.value;
                    break;
                case Gimmer_Core.LicenseBoard.MMP:
                    this._mp += license.value;
                    break;
            }
        } else if(license.type === 'skill'){
            //Learn skills
            let skills = license.value.split(',');
            skills.forEach(function(skillId){
                skillId = Number(skillId);
                this.learnSkill(skillId);
            }, this);
        }
        gotIt = true;
    }
    return gotIt;
}


//Helper function to see if the actor has all the licenses
Game_Actor.prototype.hasAllLicenses = function(){
    return this._licenses.length === Gimmer_Core.LicenseBoard.LicenseCount;
}

//Does the actor own a license adjacent to the license provided
Game_Actor.prototype.hasAdjacentLicense = function(license){
    let coordArray = [];
    coordArray.push((license.x+1)+","+license.y);
    coordArray.push((license.x-1)+","+license.y);
    coordArray.push(license.x+","+(license.y+1));
    coordArray.push(license.x+","+(license.y-1));
    let hasAdjacentLicense = false;
    coordArray.every(function(coord){
        if(coord in $dataLicenseMap && this._licenses.indexOf($dataLicenseMap[coord]) > -1){
            hasAdjacentLicense = true;
            return false;
        }
        return true;
    },this);
    return hasAdjacentLicense;
}

//Helper to get exp for the current class. Assumes you won't ever change classes
Game_Actor.prototype.getExp = function(){
    return this._exp[this._classId];
}

//Remove experience to buy licenses
Game_Actor.prototype.deductExp = function(amount){
    return this._exp[this._classId] -= amount;
}

//Alter game actor to get parameters from the license board in addition to equipment
Gimmer_Core.LicenseBoard._Game_Actor_prototype_paramPlus = Game_Actor.prototype.paramPlus;
Game_Actor.prototype.paramPlus = function(paramId) {
    var value = Gimmer_Core.LicenseBoard._Game_Actor_prototype_paramPlus.call(this, paramId);

    for(var i = 0; i < this._licenses.length; i++){
        var license = $dataLicenseBoard[this._licenses[i]];
        if(license.type === 'attribute' && license.target === paramId){
            value += license.value;
        }
    }

    return value;
};

//Helper function to find if an actor has a specific license
Game_Actor.prototype.hasLicense = function(licenseId){
    return (this._licenses.indexOf(licenseId) > -1);
}

//Helper function to see if you can afford it
Game_Actor.prototype.canAffordLicense = function(license){
    return (this.getExp() >= license.cost);
}

//Prevent leveling up by making sure the nextLevelExp is unattainable
Game_Actor.prototype.nextLevelExp = function() {
    return 99999999999;
};

//Extend can equip weapon to see if you have a license for it
Game_Actor.prototype.canEquipWeapon = function(item){
    let check = Game_BattlerBase.prototype.canEquipWeapon.call(this, item);
    if(!check){
        this._licenses.every(function(licenseIndex){
            if($dataLicenseBoard[licenseIndex].type === 'equip' && $dataLicenseBoard[licenseIndex].target === 'weapon' && item.wtypeId === $dataLicenseBoard[licenseIndex].value){
                check = true;
                return false;
            }
            return true;
        });
    }
    return check;
}

//Extend can equip armor to see if you have a license for it
Game_Actor.prototype.canEquipArmor = function(item){
    let check = Game_BattlerBase.prototype.canEquipArmor.call(this, item);
    if(!check){
        this._licenses.every(function(licenseIndex){
            if($dataLicenseBoard[licenseIndex].type === 'equip' && $dataLicenseBoard[licenseIndex].target === 'armor' && item.atypeId === $dataLicenseBoard[licenseIndex].value){
                check = true;
                return false;
            }
            return true;
        });
    }
    return check;
}


//Window_LicenseBoard
function Window_LicenseBoard() {
    this.initialize.apply(this, arguments);
}

Window_LicenseBoard.prototype = Object.create(Window_Selectable.prototype);
Window_LicenseBoard.prototype.constructor = Window_LicenseBoard;

//constructor
Window_LicenseBoard.prototype.initialize = function(x, y, width, height, actor) {
    Window_Selectable.prototype.initialize.call(this, x, y, width, height);
    this._actor = actor;
    this.leftArrowVisible = false;
    this.rightArrowVisible = false;
    this.createContents();
    this.drawAllItems();
    this.select(this._actor.getLastLicenseId(), true);
};

//Can a license be claimed? Do they not have it, and have enough points
Window_LicenseBoard.prototype.isCurrentItemEnabled = function(){
    return (this._actor._licenses.indexOf(this.index()) === -1 && this._actor.getExp() >= this.item().cost);
}

//What's the max items of the license board
Window_LicenseBoard.prototype.maxItems = function() {
    return $dataLicenseBoard.length;
};

//What row are you in?
Window_LicenseBoard.prototype.row = function() {
    let coords = this.getCurrentCoords();
    return coords.y;
};

//Draw all the licenses on the board
Window_LicenseBoard.prototype.drawAllItems = function() {
    for(var i = 0; i < $dataLicenseBoard.length; i++){
        this.drawLicense(i);
    }
};

//get the current item
Window_LicenseBoard.prototype.item = function(){
    let license = $dataLicenseBoard[this.index()];
    if(!this.canSeeLicense(license, this.index())){
        license = false;
    }
    return license;
}

//Update the help window with the current item
Window_LicenseBoard.prototype.updateHelp = function() {
    this.setHelpWindowItem(this.item());
};

//No spacing allowed on the license board
Window_LicenseBoard.prototype.spacing = function(){
    return 0;
}

//Draw individual licenses and their border
Window_LicenseBoard.prototype.drawLicense = function(index) {
    var item = $dataLicenseBoard[index];
    if (item) {
        let hasClaimed = (this._actor._licenses.indexOf(index) > -1);
        var rect = this.itemRect(index);
        this.resetTextColor();

        //Draw background
        if('iconIndexBackground' in item){
            this.drawIcon(item.iconIndexBackground, rect.x + (this.spacing() / 2), rect.y + (this.spacing() / 2));
        }

        if(item.type === 'nope'){
            this.drawIcon(item.iconIndex, rect.x + (this.spacing() / 2), rect.y + (this.spacing() / 2));
            let border = this.getLicenseBorder(item);
            if(border){
                this.drawBorder(border, rect.x + (this.spacing() / 2),rect.y + (this.spacing() / 2));
            }
        }
        else if(this.canSeeLicense(item, index)) {
            if (hasClaimed) {
                this.drawIcon(item.iconIndex, rect.x + (this.spacing() / 2), rect.y + (this.spacing() / 2));
            } else {
                this.drawIcon(item.iconIndexInactive, rect.x + (this.spacing() / 2), rect.y + (this.spacing() / 2));
            }
        }
    }
};

//Figure out if a license should have a border
Window_LicenseBoard.prototype.getLicenseBorder = function(license){
    let licenseList = this.getAdjacentLicenses(license);
    let border = {'toLeft':false,'toRight':false,'below': false,'above': false}
    let returnAnything = false;
    Object.keys(border).forEach(function(v){
        if(v in licenseList && licenseList[v].type !== 'nope'){
            border[v] = true;
            returnAnything = true;
        }
    });

    border = (returnAnything ? border : null);

    return border;
}

//Draw the border around a license
Window_LicenseBoard.prototype.drawBorder = function (border, x, y){
    if(border.above){
        this.drawIcon(Gimmer_Core.LicenseBoard.TOP_BORDER_ICON_ID, x,y);
    }
    if(border.below){
        this.drawIcon(Gimmer_Core.LicenseBoard.BOTTOM_BORDER_ICON_ID, x,y);
    }
    if(border.toLeft){
        this.drawIcon(Gimmer_Core.LicenseBoard.LEFT_BORDER_ICON_ID, x,y);
    }
    if(border.toRight){
        this.drawIcon(Gimmer_Core.LicenseBoard.RIGHT_BORDER_ICON_ID, x,y);
    }
}

//get the adjacent licenses to a given license
Window_LicenseBoard.prototype.getAdjacentLicenses = function(license){
    let licenseList = {};
    let toRight = (license.x+1)+","+license.y;
    let toLeft =  (license.x-1)+","+license.y;
    let below = license.x+","+(license.y+1);
    let above =  license.x+","+(license.y-1);

    if(toLeft in $dataLicenseMap){
        licenseList['toLeft'] = $dataLicenseBoard[$dataLicenseMap[toLeft]];
    }

    if(toRight in $dataLicenseMap){
        licenseList['toRight'] = $dataLicenseBoard[$dataLicenseMap[toRight]];
    }

    if(below in $dataLicenseMap){
        licenseList['below'] = $dataLicenseBoard[$dataLicenseMap[below]];
    }
    if(above in $dataLicenseMap){
        licenseList['above'] = $dataLicenseBoard[$dataLicenseMap[above]];
    }

    return licenseList;
}

//Can you see the license on the board
Window_LicenseBoard.prototype.canSeeLicense = function(license, index){
    let canSee = false;
    if(this._actor){
        if(this._actor.hasLicense(index)){
            canSee = true;
        }

        if(this._actor.hasAdjacentLicense(license)){
            canSee = true;
        }

        if(!canSee && this._actor.currentClass().meta.StartingLicensePosition === $dataLicenseEasyCoords[index]){
            canSee = true;
        }
    }
    return canSee;
}

//Define the height of a board item
Window_LicenseBoard.prototype.itemHeight = function(){
    return 64;
}

//Define the width of a board item
Window_LicenseBoard.prototype.itemWidth = function(){
    return 64;
}

//Get the item rectangle for a license item
Window_LicenseBoard.prototype.itemRect = function(index) {
    let item = $dataLicenseBoard[index];
    let rect = new Rectangle();
    rect.width = this.itemWidth() + this.spacing();
    rect.height = this.itemHeight() + this.spacing();
    rect.x = (parseInt(item.x) * rect.width) - this._scrollX;
    rect.y = (parseInt(item.y) * rect.height) - this._scrollY;
    return rect;
};

//Refresh the window with the following
Window_LicenseBoard.prototype.refresh = function() {
    this.createContents();
    this.drawAllItems();
};

//Update the cursor
Window_LicenseBoard.prototype.updateCursor = function() {
    if(this.index() > -1){
        var rect = this.itemRect(this.index());
        this.setCursorRect(rect.x, rect.y, rect.width, rect.height);
    }
};

//Handle taps on the board
Window_LicenseBoard.prototype.hitTest = function(x, y) {
    if (this.isContentsArea(x, y)) {
        x = x + this._scrollX;
        y = y + this._scrollY;
        x = Math.floor(x / this.itemWidth());
        y = Math.floor(y / this.itemHeight());
        return $dataLicenseMap[x+","+y];
    }
    return -1;
};

//If you are using a custom cursor, do it your own way
if(Gimmer_Core.LicenseBoard.UseCustomCursor){
    Window_LicenseBoard.prototype._refreshCursor = function() {
        var pad = this._padding;
        var x = this._cursorRect.x + pad - this.origin.x;
        var y = this._cursorRect.y + pad - this.origin.y;
        var w = this._cursorRect.width;
        var h = this._cursorRect.height;
        var x2 = Math.max(x, pad);
        var y2 = Math.max(y, pad);
        var w2 = Math.min(w, this._width - pad - x2);
        var h2 = Math.min(h, this._height - pad - y2);
        var bitmap = new Bitmap(w2, h2);

        this._windowCursorSprite.bitmap = bitmap;
        this._windowCursorSprite.setFrame(0, 0, w2, h2);
        this._windowCursorSprite.move(x2, y2);

        var skin = ImageManager.loadSystem('LicenseIconSet');
        if (w > 0 && h > 0 && skin) {
            var pw = this.itemWidth();
            var ph = this.itemHeight();
            var sx = Gimmer_Core.LicenseBoard.CURSOR_ICON_ID % 16 * pw;
            var sy = Math.floor(Gimmer_Core.LicenseBoard.CURSOR_ICON_ID / 16) * ph;
            bitmap.blt(skin, sx, sy, pw, ph, 0, 0, this.itemWidth(), this.itemHeight());
        }
    };
}

//Set the actor in the license Window
Window_LicenseBoard.prototype.setActor = function(actor) {
    if (this._actor !== actor) {
        this._actor = actor;
        this.refresh();
        this.select(this._actor.getLastLicenseId(), true);
    }
};

//Draw a license icon from the set
Window_LicenseBoard.prototype.drawIcon = function(iconIndex, x, y) {
    var bitmap = ImageManager.loadSystem('LicenseIconSet');
    var pw = this.itemWidth();
    var ph = this.itemHeight();
    var sx = iconIndex % 16 * pw;
    var sy = Math.floor(iconIndex / 16) * ph;
    this.contents.blt(bitmap, sx, sy, pw, ph, x, y);
};

//Attach an item to the help window
Window_LicenseBoard.prototype.setHelpWindowItem = function(item) {
    this._helpWindow.setItem(item,this.canSeeLicense(item, this.index()));
};

//Get the current coordinates on the board, and the real x and y position
Window_LicenseBoard.prototype.getCurrentCoords = function(){
    let coords = {x:-1,y:-1};
    let index = this.index();
    if(index > -1){
        coords = $dataLicenseEasyCoords[index].split(',');
        let x = Number(coords[0]);
        let y = Number(coords[1]);
        coords = {x:x,y:y,xReal:x * (this.itemWidth() + this.spacing()),yReal: y * (this.itemHeight() + this.spacing())};
    }

    return coords
}

//Custom handler for moving the cursor
Window_LicenseBoard.prototype.cursorDown = function(wrap) {
    let coords = this.getCurrentCoords();
    coords.y++;
    if(coords.x+","+coords.y in $dataLicenseMap && $dataLicenseBoard[$dataLicenseMap[coords.x+","+coords.y]].type !== "nope"){
        this.select($dataLicenseMap[coords.x+","+coords.y]);
    }
};

//Custom handler for moving the cursor
Window_LicenseBoard.prototype.cursorUp = function(wrap) {
    let coords = this.getCurrentCoords();
    coords.y--;
    if(coords.x+","+coords.y in $dataLicenseMap && $dataLicenseBoard[$dataLicenseMap[coords.x+","+coords.y]].type !== "nope"){
        this.select($dataLicenseMap[coords.x+","+coords.y]);
    }

};

//Custom handler for moving the cursor
Window_LicenseBoard.prototype.cursorRight = function(wrap) {
    let coords = this.getCurrentCoords();
    coords.x++;
    if(coords.x+","+coords.y in $dataLicenseMap && $dataLicenseBoard[$dataLicenseMap[coords.x+","+coords.y]].type !== "nope"){
        this.select($dataLicenseMap[coords.x+","+coords.y]);
    }
};

//Custom handler for moving the cursor
Window_LicenseBoard.prototype.cursorLeft = function(wrap) {
    let coords = this.getCurrentCoords();
    coords.x--;
    if(coords.x+","+coords.y in $dataLicenseMap && $dataLicenseBoard[$dataLicenseMap[coords.x+","+coords.y]].type !== "nope"){
        this.select($dataLicenseMap[coords.x+","+coords.y]);
    }
};

//Select a license;
Window_LicenseBoard.prototype.select = function(index, jump){
    if($dataLicenseBoard[index] && $dataLicenseBoard[index].type !== 'nope'){
        this._index = index;
        this._stayCount = 0;
        this.ensureCursorVisible(jump);
        this.updateCursor();
        this.callUpdateHelp();
        if(this._actor){
            this._actor._lastLicenseId = index;
        }
    }
}

//Helper function to check if a space is visible currently on the x-axis
Window_LicenseBoard.prototype.isSpaceVisibleX = function(xReal, itemWidth){
    return (xReal + itemWidth <= this.width + this._scrollX &&  xReal > this._scrollX)
}

//Helper function to check if a space is visible currently on the y-axis
Window_LicenseBoard.prototype.isSpaceVisibleY = function(yReal, itemHeight){
    return (yReal + itemHeight <= this.height + this._scrollY - itemHeight &&  yReal > this._scrollY)
}

//Figure out if the cursor is visible. If it isn't then move the scroll to handle it
Window_LicenseBoard.prototype.ensureCursorVisible = function(jump) {
    let coords = this.getCurrentCoords();
    let needRefresh = false
    let itemHeight = this.itemHeight() + this.spacing();
    let itemWidth = this.itemWidth() + this.spacing();

    if(jump){
        //assume you are jumping to the coordinates
        if(!this.isSpaceVisibleX(coords.xReal,itemWidth)){
            this._scrollX = coords.xReal - (itemWidth * (Math.floor(this.width / itemWidth / 2) - 1));
        }
        if(!this.isSpaceVisibleY(coords.yReal,itemHeight)){
            this._scrollY = coords.yReal - (itemHeight * (Math.floor(this.height / itemHeight / 2) - 1));
        }
        needRefresh = true;
    }
    else{
        //Assuming you are moving one item at a time
        if(coords.yReal + (itemHeight * 2) > this.height + this._scrollY - itemHeight){
            this._scrollY += itemHeight;
            needRefresh = true;
        }
        else if(coords.yReal < this._scrollY + itemHeight){
            this._scrollY -= itemHeight;
            needRefresh = true;
        }
        else if(coords.xReal + (itemWidth * 2) > this.width + this._scrollX){
            this._scrollX += itemWidth;
            needRefresh = true;
        }
        else if(coords.xReal < this._scrollX + itemWidth){
            this._scrollX -= itemWidth;
            needRefresh = true;
        }
    }

    if(needRefresh){
        this.refresh();
    }
};

//Move the cursor to be above the window layer, and add extra sprites for left and right
Window_LicenseBoard.prototype._createAllParts = function() {
    this._windowSpriteContainer = new PIXI.Container();
    this._windowBackSprite = new Sprite();
    this._windowCursorSprite = new Sprite();
    this._windowFrameSprite = new Sprite();
    this._windowContentsSprite = new Sprite();
    this._downArrowSprite = new Sprite();
    this._upArrowSprite = new Sprite();
    this._leftArrowSprite = new Sprite();
    this._rightArrowSprite = new Sprite();
    this._windowPauseSignSprite = new Sprite();
    this._windowBackSprite.bitmap = new Bitmap(1, 1);
    this._windowBackSprite.alpha = 192 / 255;
    this.addChild(this._windowSpriteContainer);
    this._windowSpriteContainer.addChild(this._windowBackSprite);
    this._windowSpriteContainer.addChild(this._windowFrameSprite);
    this.addChild(this._windowContentsSprite);
    this.addChild(this._windowCursorSprite);
    this.addChild(this._downArrowSprite);
    this.addChild(this._upArrowSprite);
    this.addChild(this._leftArrowSprite);
    this.addChild(this._rightArrowSprite);
    this.addChild(this._windowPauseSignSprite);
};

//Expand refresh arrows to include left and right arrows
Window_LicenseBoard.prototype._refreshArrows = function() {
    Window.prototype._refreshArrows.call(this);
    var w = this._width;
    var h = this._height;
    var p = 12;
    var q = p*2;
    var sx = 96+q;
    var sy = 0+q;
    this._rightArrowSprite.bitmap = this._windowskin;
    this._rightArrowSprite.anchor.x = 0.5;
    this._rightArrowSprite.anchor.y = 0.5;
    this._rightArrowSprite.setFrame(sx+q+p, sy+p, p, q);
    this._rightArrowSprite.move(w-p, h/2);
    this._leftArrowSprite.bitmap = this._windowskin;
    this._leftArrowSprite.anchor.x = 0.5;
    this._leftArrowSprite.anchor.y = 0.5;
    this._leftArrowSprite.setFrame(sx, sy+p, p, q);
    this._leftArrowSprite.move(p, h/2);
};

//update arrows function to add left and right arrows
Window_LicenseBoard.prototype._updateArrows = function() {
    this._downArrowSprite.visible = this.isOpen() && this.downArrowVisible;
    this._upArrowSprite.visible = this.isOpen() && this.upArrowVisible;
    this._leftArrowSprite.visible = this.isOpen() && this.leftArrowVisible;
    this._rightArrowSprite.visible = this.isOpen() && this.rightArrowVisible;
};

//Function to update the arrows visibility on each refresh
Window_LicenseBoard.prototype.updateArrows = function() {
    this.downArrowVisible = this.height + this._scrollY - this.itemHeight() < ((Gimmer_Core.LicenseBoard.maxY + 1) * this.itemHeight());
    this.rightArrowVisible = this.width + this._scrollX < ((Gimmer_Core.LicenseBoard.maxX + 1) * this.itemWidth());
    this.upArrowVisible = this._scrollY > 0;
    this.leftArrowVisible = this._scrollX > 0;
};



//custom license success window
function Window_LicenseSuccess() {
    this.initialize.apply(this, arguments);
}

Window_LicenseSuccess.prototype = Object.create(Window_Popup.prototype);
Window_LicenseSuccess.prototype.constructor = Window_LicenseSuccess;

//Constructor
Window_LicenseSuccess.prototype.initialize = function(actor){
    this._actor = actor;
    this._item = false;
    this._iconWidth = 170;
    this._iconHeight = 170;
    this._stayOpenFor = Gimmer_Core.LicenseBoard.SuccessStayOpenFor;
    this._openSpeed = Gimmer_Core.LicenseBoard.SuccessOpenSpeed;
    this._closeSpeed = Gimmer_Core.LicenseBoard.SuccessCloseSpeed;
    let width = 250;
    let height = 250;
    let x = (Graphics.boxWidth / 2) - (width / 2);
    let y = (Graphics.boxHeight / 2 ) - (height / 2);
    ImageManager.reserveSystem('LargeLicenseIconSet');
    Window_Popup.prototype.initialize.call(this,x,y,width,height, '#000000',this._stayOpenFor,this._openSpeed,this._closeSpeed);
}

//Refresh Handler for the success window
Window_LicenseSuccess.prototype.refresh = function(){
    this.contents.clear();
    if(this._item){
        this.drawIcon(this._item.iconIndex - 32, this.width / 2 - (this._iconWidth / 2), 10);
        let textX = 0;
        let text = this._item.claimText(this._actor);
        let textY = this.height - this.fittingHeight(text.length);
        text.forEach(function(textLine){
            this.drawText(textLine,textX,textY, this.width, 'center');
            textY += this.fittingHeight(1);
        }, this);
    }
}

//Draw the success icon
Window_LicenseSuccess.prototype.drawIcon = function(iconIndex,x,y){
    var bitmap = ImageManager.loadSystem('LargeLicenseIconSet');
    var pw = this._iconWidth;
    var ph = this._iconHeight;
    var sx = iconIndex % 16 * pw;
    var sy = 0;
    this.contents.blt(bitmap, sx, sy, pw, ph, x, y);
}

//Set the actor on the success window
Window_LicenseSuccess.prototype.setActor = function(actor){
    if (this._actor !== actor) {
        this._actor = actor;
        this.refresh();
    }
}

//Set the license you just bought
Window_LicenseSuccess.prototype.setItem = function(item){
    if(this._item !== item){
        this._item = item;
        this.refresh();
    }
}

//No padding on the success window
Window_LicenseSuccess.prototype.standardPadding = function(){
    return 0;
}

//custom actor window
function Window_LicenseActor() {
    this.initialize.apply(this, arguments);
}

Window_LicenseActor.prototype = Object.create(Window_Base.prototype);
Window_LicenseActor.prototype.constructor = Window_LicenseActor;

//Constructor
Window_LicenseActor.prototype.initialize = function(actor){
    this._actor = actor;
    var width = Gimmer_Core.LicenseBoard.PortraitWidth + (this.standardPadding() * 2);
    var height = Gimmer_Core.LicenseBoard.PortraitHeight + (this.standardPadding() * 2);
    var x = Graphics.boxWidth - width;
    var y = 0;
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this.refresh();
}

//Refresh handler
Window_LicenseActor.prototype.refresh = function(){
    this.contents.clear();
    this.drawActorFace(this._actor, 0, 0);
}

//Show a smaller version of the current actor's face
Window_LicenseActor.prototype.drawFace = function(faceName, faceIndex, x, y, width, height) {
    width = width || Window_Base._faceWidth;
    height = height || Window_Base._faceHeight;
    var bitmap = ImageManager.loadFace(faceName);
    var pw = Window_Base._faceWidth;
    var ph = Window_Base._faceHeight;
    var sw = Math.min(width, pw);
    var sh = Math.min(height, ph);
    var dx = Math.floor(x + Math.max(width - pw, 0) / 2);
    var dy = Math.floor(y + Math.max(height - ph, 0) / 2);
    var sx = faceIndex % 4 * pw + (pw - sw) / 2;
    var sy = Math.floor(faceIndex / 4) * ph + (ph - sh) / 2;
    this.contents.blt(bitmap, sx, sy, sw, sh, dx, dy,Gimmer_Core.LicenseBoard.PortraitWidth,Gimmer_Core.LicenseBoard.PortraitHeight);
};

//Set Actor helper
Window_LicenseActor.prototype.setActor = function(actor){
    if (this._actor !== actor) {
        this._actor = actor;
        this.refresh();
    }
}

//custom help window
function Window_LicenseHelp() {
    this.initialize.apply(this, arguments);
}

Window_LicenseHelp.prototype = Object.create(Window_Help.prototype);
Window_LicenseHelp.prototype.constructor = Window_LicenseHelp;

//Constructor
Window_LicenseHelp.prototype.initialize = function(actor, portraitWidth, portraitHeight){
    var width = Graphics.boxWidth - portraitWidth;
    var height = this.fittingHeight(2);
    if(portraitHeight > height){
        height = portraitHeight;
    }
    Window_Base.prototype.initialize.call(this, 0, 0, width, height);
    this._text = '';
    this._actor = actor;
    this._license = false;
    this._licenseVisible = false;
}

//Add a license to the help window
Window_LicenseHelp.prototype.setItem = function (license, visible){
    this._license = license;
    this._licenseVisible = visible;
    this.refresh();
}

//Refresh the help window
Window_LicenseHelp.prototype.refresh = function() {
    this.contents.clear();
    if(this._licenseVisible){
        let lpShort = Gimmer_Core.LicenseBoard.PointsLabelShort;
        let lpString = "Current "+lpShort+": "+(this._actor.getExp().toString() || "0");
        let lpWidth = this.textWidth(lpString)
        this.drawText(this._license.description, this.textPadding(), 0, this.width - lpWidth);
        if(this._actor){
            this.drawText("Current "+lpShort+": "+(this._actor.getExp().toString() || "0"),0,this.lineHeight(),this.width - lpWidth,'right');
            if(!this._actor.canAffordLicense(this._license)) {
                this.contents.textColor = '#FF0000';
            }
            this.drawText("LP: "+this._license.cost ,this.textPadding(), this.lineHeight());
        }
        this.resetTextColor();
    }
};

//Helper to set the actor on the window
Window_LicenseHelp.prototype.setActor = function(actor){
    if (this._actor !== actor) {
        this._actor = actor;
        this.refresh();
    }
}

//Exp to LP conversion
BattleManager.displayExp = function() {
    var exp = this._rewards.exp;
    if (exp > 0) {
        var text = TextManager.obtainExp.format(exp, Gimmer_Core.LicenseBoard.PointsLabelShort);
        $gameMessage.add('\\.' + text);
    }
};

//Remove some stuff from the menu that doesn't fit the game
Window_Base.prototype.drawActorLevel = function(actor, x, y){}
Window_Base.prototype.drawActorClass = function(actor, x, y, width) {};

//Exp is now LP
Window_Status.prototype.drawExpInfo = function(x, y) {
    var lineHeight = this.lineHeight();
    var value1 = this._actor.getExp();
    if (this._actor.hasAllLicenses()) {
        value1 = '-------';
    }
    this.changeTextColor(this.systemColor());
    this.drawText(Gimmer_Core.LicenseBoard.PointsLabel, x, 0, 270);
    this.resetTextColor();
    this.drawText(value1, x, y + lineHeight * 1, 270, 'right');
};

//Load License Images
Gimmer_Core.LicenseBoard._Scene_Boot_loadSystemImages = Scene_Boot.loadSystemImages;
Scene_Boot.loadSystemImages = function(){
    Gimmer_Core.LicenseBoard._Scene_Boot_loadSystemImages.call(this);
    ImageManager.reserveSystem('LicenseIconSet');
}

//Helper class for a BoardLicense
class BoardLicense {
    constructor(license) {
        this.type = license.type;
        this.description = license.description;
        this.target = license.target;
        this.value = license.value;
        this.cost = license.cost;
        this.iconIndex = license.iconIndex;
        this.iconIndexInactive = license.iconIndexInactive;
        this.x = license.x;
        this.y = license.y;
        this.iconIndexBackground = license.iconIndexBackground;
    }

    //What's the description for a given node?
    targetText(){
        let textArray = [];
        let text = "#ACTOR# ";
        switch(this.type){
            case 'attribute':
                text += "gained";
                textArray.push(text);
                switch(this.target){
                    case Gimmer_Core.LicenseBoard.MHP = 0:
                        text = "HP";
                        break;
                    case Gimmer_Core.LicenseBoard.MMP = 1:
                        text = "MP";
                        break;
                    case Gimmer_Core.LicenseBoard.ATK = 2:
                        text = "ATK";
                        break;
                    case Gimmer_Core.LicenseBoard.DEF = 3:
                        text = "DEF";
                        break;
                    case Gimmer_Core.LicenseBoard.MAT = 4:
                        text = "MAT";
                        break;
                    case Gimmer_Core.LicenseBoard.MDF = 5:
                        text = "MDF";
                        break;
                    case Gimmer_Core.LicenseBoard.AGI = 6:
                        text = "AGI";
                        break;
                    case Gimmer_Core.LicenseBoard.LUK = 7:
                        text = "LUK";
                        break;
                }
                text = "+"+this.value+" "+text;
                textArray.push(text);
                break;
            case 'skill':
                text += "gained";
                textArray.push(text);
                if(this.value.toString().contains(",")){
                    text = this.description;
                }
                else{
                    let skill = $dataSkills[parseInt(this.value)];
                    text = skill.name;
                }
                textArray.push(text);
                break;
            case 'equip':
                text += "learned";
                textArray.push(text);
                let key = false;
                if(this.value.toString().contains(",")){
                    text = " "+this.description;
                }
                else{
                    switch(this.target){
                        case 'weapon':
                            text = " to wield ";
                            key = "weaponTypes";
                            break;
                        case 'armor':
                            text = " to wear ";
                            key = "armorTypes";
                            break;
                    }
                    text += $dataSystem[key][parseInt(this.value)];
                }
                textArray.push(text);
                break;
        }
        return textArray;
    }

    //get the text for an actor claiming a specific license
    claimText(actor){
        let textArray = this.targetText();
        textArray[0] = textArray[0].replace("#ACTOR#",actor.name());
        textArray[1] += "!";
        return textArray;
    }
}