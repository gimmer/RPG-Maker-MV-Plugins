if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

var Imported = Imported || {}
Imported['Gimmer_CommentsAreNoteFunny'] = '1.0';

Gimmer_Core['CANF'] = {'loaded':true};


//=============================================================================
/*:
 * @plugindesc Wrap event lines with comments to temporarily disable them
 * @author Gimmer_
 * @help This plugin lets you put a comment line in events containing the body: /* and *\/ (Without the first slash)
 * to start and stop the event from processing those specific lines.
 *
 */

Gimmer_Core.CANF.Game_Interpreter_prototype_setup = Game_Interpreter.prototype.setup;
Game_Interpreter.prototype.setup = function(list, eventId){
    list = this.reduceListUsingComments(list)
    Gimmer_Core.CANF.Game_Interpreter_prototype_setup.call(this, list, eventId);
}

/*
* Reduce a command list removing things that are commented out
 */
Game_Interpreter.prototype.reduceListUsingComments = function(list){
    let newlist = [];
    let isCommentedOut = false;
    list.forEach(function(value){
        if(value.code === 108){
            if(value.parameters[0] === "/*"){
                isCommentedOut = true;
            }
            else if(value.parameters[0] === "*/"){
                isCommentedOut = false;
            }
        }
        if(!isCommentedOut) {
            newlist.push(value);
        }
    });
    return newlist;
}