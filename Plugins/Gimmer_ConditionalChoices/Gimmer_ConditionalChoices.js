var Imported = Imported || {};
Imported['Gimmer_ConditionalChoices'] = 1.2;

if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

Gimmer_Core['conc'] = {'loaded':true};

//=============================================================================
/*:
 * @plugindesc enable or disable a choice based on conditions
 * @author Gimmer_
 * @help This plugin gives a series of plugin commands to hide / disable / or change the text of a given choice in the next choice window
 *
 * Plugin Commands:
 * cchoices hide/disable [choiceNumberInList] "equation using var:num or switch:number and ==, &&, and || operators"
 *
 * If the above equation validates as true, the choice will be disabled or hidden.
 *
 * cchoices change [choiceNumberInList] "equation using var:num or switch:number and ==, &&, and || operators" "Replacement text"
 *
 * If the above equation validates as true, the choice at the chosen number will have different text
 *
 * You can run the multiple commands for the same choice with different equations
 * (for example, hide if var:1 == 1, disable if switch:2 is on, change the text if var:1 > 3)
 *
 * You can also put in item:itemId:minNum to hide/disable/or change the choice if you don't have the minNum of a given itemId
 *
 * Version History:
 * 1.0 : Release
 * 1.1 : Fix issue with choices not actually working
 * 1.2 : Added in support for MZ, and requiring items to enable commands
 *
 *
 * @param ---Parameters---
 *
 * @param Opacity for Disabled
 * @parent ---Parameters---
 * @type Number
 * @default 127
 * @desc What opacity (out of 255) for a disabled choice?
 *
 * @command cchoice
 * @text Set a conditional choice
 * @desc Set settings for a conditional choice
 *
 * @arg choiceNumberInList
 * @text Which choice number to alter?
 * @desc Choose choice you want to alter, starting with 1
 *
 * @arg type
 * @text Either hide, disable, or change
 * @desc Whether you want to hide, disabled, or change an option.
 *
 * @arg equation
 * @text equation to evaluate
 * @desc equation using var:num or switch:number and ==, &&, and || operators
 *
 * @arg replacementText
 * @text Replacement text if you choose "change"
 * @desc What text to show if the equation is true and you chose type change
*
 */


Gimmer_Core.conc.choiceMods = {};
Gimmer_Core.conc.originalTextIndexes = [];
Gimmer_Core.conc.opacity = Number(PluginManager.parameters('Gimmer_ConditionalChoices')['Opacity for Disabled']);

Gimmer_Core.conc.resetMods = function (){
    this.choiceMods = {};
    this.originalTextIndexes = [];
}

Gimmer_Core.conc.getMods = function(n){
    if(this.choiceMods.hasOwnProperty('c'+n)){
        return this.choiceMods['c'+n];
    }
    return false;
}

Gimmer_Core.conc.setMod = function(n, type, equation, replaceText){
    n--;
    if(!this.choiceMods.hasOwnProperty("c"+n)){
        this.choiceMods["c"+n] = {disable: false, hide: false, replaceText: ""};
    }
    let eval = this.evaluateEquation(equation);
    if(type === "change"){
        if(eval){
            this.choiceMods["c"+n].replaceText = replaceText;
        }
    }
    else{
        this.choiceMods["c"+n][type] = eval;
    }
}

Gimmer_Core.pluginCommands['CCHOICES'] = function(params){
    let type = params[0].toLowerCase();
    let choiceNumber = Number(params[1]);
    let equation = params[2];
    let replaceText = (type === "change" && params[3] ? params[3] : "");
    Gimmer_Core.conc.setMod(choiceNumber, type, equation, replaceText);
}

Gimmer_Core.conc.evaluateEquation = function(equation){
    const varRegEx = /var:\d+/g;
    let vars = [];
    let varCheck = varRegEx.exec(equation);
    while(varCheck != null){
        vars.push(varCheck[0]);
        varCheck = varRegEx.exec(equation);
    }
    if(vars.length){
        vars.forEach(function(varInfo){
            let varNumber = varInfo.split(":")[1];
            equation = equation.replace(varInfo,$gameVariables.value(varNumber));
        });
    }
    const switchRegEx = /switch:\d+/g
    let switches = [];
    let switchCheck = switchRegEx.exec(equation);
    while(switchCheck != null){
        switches.push(switchCheck[0]);
        switchCheck = switchRegEx.exec(equation);
    }
    if(switches.length) {
        switches.forEach(function (switchInfo) {
            let varNumber = switchInfo.split(":")[1];
            let onOrOff = $gameSwitches.value(varNumber);
            equation = equation.replace(switchInfo, (onOrOff ? "true" : "false"));
        });
    }

    const itemRegEx = /item:\d+:\d+/g
    let items = [];
    let itemcheck = itemRegEx.exec(equation);
    while(itemcheck != null){
        items.push(itemcheck[0]);
        itemcheck = itemRegEx.exec(equation);
    }

    if(items.length){
        items.forEach(function(itemInfo) {
            let itemInfoArray = itemInfo.split(":");
            let item = $dataItems[itemInfoArray[1]];
            console.log(item);
            console.log($gameParty.numItems(item));
            let onOrOff = ($gameParty.numItems(item) < Number(itemInfoArray[2]));
            equation = equation.replace(itemInfo, (onOrOff ? "true" : "false"));
        });
    }
    console.log(equation);

    return eval(equation);
}

/**
 * =======================
 * Window_ChoiceList Mods
 * =======================
 */

Window_ChoiceList.prototype.makeCommandList = function() {
    var choices = $gameMessage.choices();
    for (let i = 0; i < choices.length; i++) {
        let enabled = true;
        let mod = Gimmer_Core.conc.getMods($gameMessage.realChoiceIndex(i));
        let choice = choices[i];
        if(mod){
            if(mod.disable === true){
                enabled = false;
            }
            if(mod.replaceText.length){
                choice = mod.replaceText;
            }
        }

        this.addCommand(choice, 'choice', enabled);
    }
};

Gimmer_Core.conc.Window_ChoiceList_prototype_drawItem = Window_ChoiceList.prototype.drawItem;
Window_ChoiceList.prototype.drawItem = function (index){
    let originalOpacity = this.contents.paintOpacity;
    if(!this._list[index].enabled){
        this.contents.paintOpacity = Gimmer_Core.conc.opacity;
    }
    Gimmer_Core.conc.Window_ChoiceList_prototype_drawItem.call(this, index);
    this.contents.paintOpacity = originalOpacity;
}

/**
 * ==================
 * Game_Message Mods
 * ==================
 */

Game_Message.prototype.choices = function() {
    let choices = this._choices;
    if(!choices){
        return [];
    }
    let returnedChoices = [];
    for (let i = 0; i < choices.length; i++) {
        let mod = Gimmer_Core.conc.getMods(i);
        let choice = choices[i];
        if(mod && mod.replaceText.length){
            choice = mod.replaceText;
        }
        Gimmer_Core.conc.originalTextIndexes[i] = choice;
        if(!mod || !mod.hide){
            returnedChoices.push(choice);
        }
    }

    return returnedChoices;
};

Game_Message.prototype.realChoiceIndex = function(n){
    let choice = this.choices()[n];
    return Gimmer_Core.conc.originalTextIndexes.indexOf(choice);
}

Gimmer_Core.conc.Game_Message_prototype_onChoice = Game_Message.prototype.onChoice;
Game_Message.prototype.onChoice = function (n){
    n = this.realChoiceIndex(n);
    Gimmer_Core.conc.Game_Message_prototype_onChoice.call(this,n);
    Gimmer_Core.conc.resetMods();
}

if(Utils.RPGMAKER_NAME === "MZ"){
    PluginManager.registerCommand("Gimmer_ConditionalChoices", "cchoice", (args) => {
        let newArgs = [];
        newArgs.push(args['type']);
        newArgs.push(Number(args['choiceNumberInList']));
        newArgs.push(args['equation']);
        newArgs.push(args['replacementText']);
        Gimmer_Core.pluginCommands['CCHOICES'](newArgs);
    });

}
/*
* @arg choiceNumberInList
* @text Which choice number to alter?
* @desc Choose choice you want to alter, starting with 1
*
* @arg type
* @text Either hide, disable, or change
* @desc Whether you want to hide, disabled, or change an option.
*
* @arg equation
* @text equation to evaluate
* @desc equation using var:num or switch:number and ==, &&, and || operators
*
* @arg replacementText
* @text Replacement text if you choose "change"
* @desc What text to show if the equation is true and you chose type change
 */