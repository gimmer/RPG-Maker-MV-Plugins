if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

Gimmer_Core['GameTimer'] = {'loaded':true};

//=============================================================================
/*:
 * @plugindesc v1.1 - Support for a real time game timer
 * @author Gimmer_
 * @help
 * ================
 * Gimmer_GameTimer
 * ================
 *
 * Use the system clock to keep time of how long a player takes to do something. Pauses when the menu is called and starts again when closed
 * Includes a plugin command to snapshot the length of time at any point into a variable to be used in other places
 *
 * Plugin Commands:
 *
 *
 * GameTimerPause: pause the timer
 * GameTimerUnpause: unpause the timer
 * GameTimerSnapShot: saves the current value of the timer to the specified game variable
 * GameTimerReset: resets the timer to 0.
 *
 * IF SHOWING TIMER ENABLED
 *
 * GameTimerShow: Shows the timer on the screen
 * GameTimerHide: Hides the timer on the screen
 *
 * Terms of Use:
 * =======================================================================
 * Free for both commercial and non-commercial use, with credit.
 * More Gimmer_ plugins at: https://github.com/gimmer/RPG-Maker-MV-Plugins
 * =======================================================================

 * @param Snapshot Variable
 * @parent ---Parameters---
 * @type variable
 * @desc What variable do you want snapshots to go to?
 *
 * @param Format
 * @parent ---Parameters---
 * @type select
 * @option HH:MM:SS
 * @option HH:MM:SS:mmm
 * @option MM:SS
 * @option MM:SS:mmm
 * @desc What format do you want?
 *
 * @param Show Timer
 * @parent ---Parameters---
 * @type Boolean
 * @default false
 * Default false
 * @desc Have the option to show the timer on the screen?
 *
 * @param Timer Window X
 * @parent Show Timer
 * @type Text
 * @desc Where do you want the X of the timer window (can be a number or a script)
 *
 * @param Timer Window Y
 * @parent Show Timer
 * @type Text
 * @desc Where do you want the Y of the timer window (can be a number or a script)
 *
 * @param Timer Fades Under Player
 * @parent Show Timer
 * @type Boolean
 * @default false
 * Default False
 * @desc Timer fades when the player passes under it?
 *
 * @param Timer Window Can Be Toggled
 * @parent Show Timer
 * @type Boolean
 * @default false
 * default false
 * @desc Can players toggle on and off the gamer timer?
 *
 * @param Timer Settings Label
 * @parent Timer Window Can Be Toggled
 * @type Text
 * @desc What is the label for the timer option?
 * @default Show Play Timer
 * default Show Play Timer
 *
 */

Gimmer_Core.GameTimer.startTime = '';
Gimmer_Core.GameTimer.currentTime = '';
Gimmer_Core.GameTimer.timerMS = 0;
Gimmer_Core.GameTimer.paused = true; //Start paused
let GameTimerParameters = PluginManager.parameters('Gimmer_GameTimer');
Gimmer_Core.GameTimer.snapshotVariableId = Number(GameTimerParameters['Snapshot Variable']);
Gimmer_Core.GameTimer.Format = GameTimerParameters['Format'];
Gimmer_Core.GameTimer.TimerWindow = (GameTimerParameters['Show Timer'] === "true");
Gimmer_Core.GameTimer.TimerWindowX = GameTimerParameters['Timer Window X'];
Gimmer_Core.GameTimer.TimerWindowY = GameTimerParameters['Timer Window Y'];
Gimmer_Core.GameTimer.TimerWindowFades = (GameTimerParameters['Timer Fades Under Player'] === "true");
Gimmer_Core.GameTimer.TimerToggle = (GameTimerParameters['Timer Window Can Be Toggled'] === "true");
Gimmer_Core.GameTimer.TimerToggleLabel = GameTimerParameters['Timer Settings Label'];
Gimmer_Core.GameTimer.show = true;
Gimmer_Core.GameTimer.timerEverStarted = false;

//Upgrade main loop to record real time
Gimmer_Core.GameTimer.Scene_Map_prototype_updateMain = Scene_Map.prototype.updateMain;
Scene_Map.prototype.updateMain = function() {
    Gimmer_Core.GameTimer.Scene_Map_prototype_updateMain.call(this);
    Gimmer_Core.GameTimer.currentTime = new Date();
    if(!Gimmer_Core.GameTimer.paused){
        Gimmer_Core.GameTimer.timerMS += Gimmer_Core.GameTimer.currentTime - Gimmer_Core.GameTimer.startTime;
    }
    Gimmer_Core.GameTimer.startTime = new Date();
};

//Extend Call Menu to pause the menu
Gimmer_Core.GameTimer.Scene_Map_prototype_callMenu = Scene_Map.prototype.callMenu;
Scene_Map.prototype.callMenu = function() {
    Gimmer_Core.GameTimer.Scene_Map_prototype_callMenu.call(this);
    Gimmer_Core.GameTimer.pause();
};

//Extend Menu so cancelling it unpauses the timer
Gimmer_Core.GameTimer._Scene_Menu_prototype_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
Scene_Menu.prototype.createCommandWindow = function() {
    Gimmer_Core.GameTimer._Scene_Menu_prototype_createCommandWindow.call(this);
    this._commandWindow.setHandler('cancel',    this.commandCancelMenu.bind(this));
};

//Cancelling menu will unpause the timer
Scene_Menu.prototype.commandCancelMenu = function() {
    if(Gimmer_Core.GameTimer.timerEverStarted){
        Gimmer_Core.GameTimer.unpause();
    }
    this.popScene();
}

//Quitting to title will reset the timer
Gimmer_Core.GameTimer.Scene_GameEnd_prototype_commandToTitle = Scene_GameEnd.prototype.commandToTitle;
Scene_GameEnd.prototype.commandToTitle = function() {
    Gimmer_Core.GameTimer.pause();
    Gimmer_Core.GameTimer.reset();
    Gimmer_Core.GameTimer.Scene_GameEnd_prototype_commandToTitle.call(this);
};

if(Gimmer_Core.GameTimer.TimerWindow){
    Gimmer_Core.GameTimer._Scene_Map_prototype_allWindows = Scene_Map.prototype.createAllWindows
    Scene_Map.prototype.createAllWindows = function(){
        this.createTimerWindow();
        Gimmer_Core.GameTimer._Scene_Map_prototype_allWindows.call(this);
    }

    Scene_Map.prototype.createTimerWindow = function(){
        let x = eval(Gimmer_Core.GameTimer.TimerWindowX);
        let y = eval(Gimmer_Core.GameTimer.TimerWindowY);
        let tmp = new Window_Base();
        if(!Gimmer_Core.GameTimer.TimerWindowFades){
            this._timerWidow = new Window_Plain(x, y, tmp.textWidth(Gimmer_Core.GameTimer.Format) * 2,tmp.fittingHeight(1));
        }
        else{
            this._timerWidow = new Window_Fade(x, y, tmp.textWidth(Gimmer_Core.GameTimer.Format) * 2,tmp.fittingHeight(1));
            this._timerWidow._fadeForPlayer = true;
            this._timerWidow._desinationAlpha = 0.25;
        }

        this.addWindow(this._timerWidow);
    }

    Gimmer_Core.GameTimer._Scene_Map_prototype_updateMain = Scene_Map.prototype.updateMain;
    Scene_Map.prototype.updateMain = function(){
        Gimmer_Core.GameTimer._Scene_Map_prototype_updateMain.call(this);
        this.updateTimer();
    }

    Scene_Map.prototype.updateTimer = function(){
        this._timerWidow.contents.clear();
        if(Gimmer_Core.GameTimer.show && ConfigManager.timerToggle){
            this._timerWidow.drawText(Gimmer_Core.GameTimer.getTimeString(Gimmer_Core.GameTimer.Format),0,0,this._timerWidow.width, 'center');
        }
    }

    if(Gimmer_Core.GameTimer.TimerToggle){
        ConfigManager.timerToggle   = false;
        Gimmer_Core.GameTimer._Window_Options_prototype_makeCommandList =  Window_Options.prototype.makeCommandList;
        Window_Options.prototype.makeCommandList = function() {
            Gimmer_Core.GameTimer._Window_Options_prototype_makeCommandList.call(this);
            this.addCommand(Gimmer_Core.GameTimer.TimerToggleLabel, 'timerToggle');
        };
    }
}

//Helper Methods
Gimmer_Core.GameTimer.pause = function(){
    this.paused = true;
}

Gimmer_Core.GameTimer.unpause = function(){
    this.paused = false;
    this.startTime = new Date();
}

Gimmer_Core.GameTimer.reset = function(){
    this.timerMS = 0;
}

Gimmer_Core.GameTimer.getTimeString = function(format){
    // 1- Convert to seconds:
    let seconds = Gimmer_Core.GameTimer.timerMS / 1000;
    // 2- Extract hours:
    let hours = parseInt( seconds / 3600 ); // 3,600 seconds in 1 hour
    seconds = seconds % 3600; // seconds remaining after extracting hours
    // 3- Extract minutes:
    let minutes = parseInt( seconds / 60 ); // 60 seconds in 1 minute
    // 4- Keep only seconds not extracted to minutes:
    seconds = seconds % 60;
    let milliseconds = (seconds % 1 * 1000).toFixed();
    seconds = seconds.toFixed();
    let output = "";
    switch(format){
        case 'HH:MM:SS':
            hours = hours.toString().padStart(2,"0");
            minutes = minutes.toString().padStart(2,"0");
            seconds = seconds.toString().padStart(2,"0");
            output = hours+":"+minutes+":"+seconds;
            break;
        case 'HH:MM:SS:mmm':
            milliseconds = milliseconds.toString().padStart(3,"0");
            hours = hours.toString().padStart(2,"0");
            minutes = minutes.toString().padStart(2,"0");
            seconds = seconds.toString().padStart(2,"0");
            output = hours+":"+minutes+":"+seconds+":"+milliseconds;
            break;
        case 'MM:SS':
            minutes += (hours * 60);
            minutes = minutes.toString().padStart(2,"0");
            seconds = seconds.toString().padStart(2,"0");
            output = minutes+":"+seconds;
            break;
        case 'MM:SS:mmm':
            minutes += (hours * 60);
            minutes = minutes.toString().padStart(2,"0");
            seconds = seconds.toString().padStart(2,"0");
            milliseconds = milliseconds.toString().padStart(3,"0");
            output = minutes+":"+seconds+":"+milliseconds;
            break;
    }

    return output;
}

Gimmer_Core.pluginCommands['GAMETIMERPAUSE'] = function(){
    Gimmer_Core.GameTimer.pause();
}

Gimmer_Core.pluginCommands['GAMETIMERUNPAUSE'] = function(){
    Gimmer_Core.GameTimer.timerEverStarted = true;
    Gimmer_Core.GameTimer.unpause();
}

Gimmer_Core.pluginCommands['GAMETIMERSNAPSHOT'] = function(){
    $gameVariables.setValue(Gimmer_Core.GameTimer.snapshotVariableId,Gimmer_Core.GameTimer.getTimeString(Gimmer_Core.GameTimer.Format));
}

Gimmer_Core.pluginCommands['GAMETIMERRESET'] = function(){
    Gimmer_Core.GameTimer.reset();
}

if(Gimmer_Core.GameTimer.TimerWindow){
    Gimmer_Core.pluginCommands['GAMETIMERSHOW'] = function(){
        Gimmer_Core.GameTimer.show = true;
    }

    Gimmer_Core.pluginCommands['GAMETIMERHIDE'] = function(){
        Gimmer_Core.GameTimer.show = false;
    }
}