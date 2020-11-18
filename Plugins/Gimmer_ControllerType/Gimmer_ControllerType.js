if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

Gimmer_Core['ControllerType'] = {'loaded':true};

//=============================================================================
/*:
 * @plugindesc Add a plugin command to return controller type
 * @author Gimmer_
 * @help Use the plugin command GimmerControllerType to get if the controller is Xbox, Playstation, or Other layouts
 */

Gimmer_Core.ControllerType.getControllerType = function(gamepad){
    let controllerType = "other";
    if(gamepad.id.search(/054c|sony|PLAYSTATION/i) > -1){
        controllerType = 'playstation';
    }
    else if(gamepad.id.search(/xbox|360|028e|045e|02d1/i) > -1){
        controllerType = 'xbox';
    }

    return controllerType;
}


Gimmer_Core.pluginCommands['GIMMERCONTROLLERTYPE'] = function(){
    let controllerType = 'none';
    if (navigator.getGamepads) {
        var gamepads = navigator.getGamepads();
        if (gamepads) {
            for (var i = 0; i < gamepads.length; i++) {
                var gamepad = gamepads[i];
                if (gamepad && gamepad.connected) {
                    controllerType = Gimmer_Core.ControllerType.getControllerType(gamepad);
                }
            }
        }
    }
    return controllerType;
}