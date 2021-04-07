var Imported = Imported || {};

if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

Gimmer_Core['CenterText'] = {'loaded':true};

//=============================================================================
/*:
 * @plugindesc v1.0 - Use a simple command to center your text in a window
 * @author Gimmer_
 * @help This plugin lets you center text in the Text window easily
 *
 * ================
 * Gimmer_CenterText
 * ================
 *
 * Simply put \sc at the start of a message to "simply center" the text!
 *
 * If you want multiple lines, make the message multi-lined in the Show Text box, or use YEP_MessageCore's wordwrap function.
 *
 * Terms of Use:
 * =======================================================================
 * Free for both commercial and non-commercial use, with credit.
 * More Gimmer_ plugins at: https://github.com/gimmer/RPG-Maker-MV-Plugins
 * =======================================================================
 *
 * @param ---Parameters---
 * @default
 *
 * @param Left Indent Percent
 * @parent ---Parameters---
 * @type number
 * @min 1
 * @max 45
 * @desc When the text is too big for the chat window, how much of the window on the left side should be indented
 * Default: 25
 * @default 25
 *
 * @param Right Indent Percent
 * @parent ---Parameters---
 * @type number
 * @min 1
 * @max 45
 * @desc When the text is too big is too big for the box, much of the right side of the window will be wordwrapped if using YEP_MessageCore's <WordWrap> feature
 * Default: 25
 * @default 25
 *
 * @param Always Center Certain Messages
 * @parent ---Parameters---
 * @type Boolean
 * @default false
 * Default false
 * @desc Is there a certain message window type that you want to always center? You have to set Background and Window Position and then all those windows will be centered
 *
 * @param Background to Center
 * @parent Always Center Certain Messages
 * @type select
 * @option Dim
 * @value 1
 * @option Window
 * @value 0
 * @option Transparent
 * @value 2
 *
 * @param Window Position to Center
 * @parent Always Center Certain Messages
 * @type select
 * @option Middle
 * @value 1
 * @option Bottom
 * @value 2
 * @option Top
 * @value 0
 *
 */

//_background: 1
//_positionType: 1

var CenterTextParameters = PluginManager.parameters('Gimmer_CenterText');
Gimmer_Core.CenterText.LeftIndentPercent = Number(CenterTextParameters['Left Indent Percent']);
Gimmer_Core.CenterText.RightIndentPercent = Number(CenterTextParameters['Right Indent Percent']);
Gimmer_Core.CenterText.AutoCenterEnabled = (CenterTextParameters['Always Center Certain Messages'] === "true");
Gimmer_Core.CenterText.AutoPositionType = Number(CenterTextParameters['Window Position to Center']);
Gimmer_Core.CenterText.AutoBackgroundType = Number(CenterTextParameters['Background to Center']);

Gimmer_Core.CenterText._Game_Message_prototype_add = Game_Message.prototype.add;
Game_Message.prototype.add = function(text){
    if(text.match(/\\sc/)){
        text = text.replace("\\sc","");
        this._centerText = true;
    }

    Gimmer_Core.CenterText._Game_Message_prototype_add.call(this,text);
}

Gimmer_Core.CenterText._Game_Message_prototype_clear = Game_Message.prototype.clear;
Game_Message.prototype.clear = function(){
    Gimmer_Core.CenterText._Game_Message_prototype_clear.call(this);
    this._centerText = false;
    this._leftPercent = Gimmer_Core.CenterText.LeftIndentPercent;
    this._rightPercent = Gimmer_Core.CenterText.RightIndentPercent;
}

Gimmer_Core.CenterText._Game_Message_prototype_setBackground = Game_Message.prototype.setBackground;
Game_Message.prototype.setBackground = function(background) {
    Gimmer_Core.CenterText._Game_Message_prototype_setBackground.call(this,background);
    this.checkAutoCenter();
};

Gimmer_Core.CenterText._Game_Message_prototype_setPositionType = Game_Message.prototype.setPositionType;
Game_Message.prototype.setPositionType = function(positionType) {
    Gimmer_Core.CenterText._Game_Message_prototype_setPositionType.call(this,positionType);
    this.checkAutoCenter();
};

Game_Message.prototype.checkAutoCenter = function(){
    if(Gimmer_Core.CenterText.AutoCenterEnabled &&
        this._positionType === Gimmer_Core.CenterText.AutoPositionType &&
        this._background === Gimmer_Core.CenterText.AutoBackgroundType
    ){
        this._centerText = true;
    }
}

Gimmer_Core.CenterText._Window_Message_prototype_newLineX = Window_Message.prototype.newLineX;
Window_Message.prototype.newLineX = function (){
    let newLineX = Gimmer_Core.CenterText._Window_Message_prototype_newLineX.call(this);
    if($gameMessage._centerText){
        newLineX += this.determineXOffset(this._textState, newLineX);
    }
    return newLineX;
}

Window_Message.prototype.determineXOffset = function(textState, newLineX){
    let textWidth;
    if(Imported.YEP_MessageCore){
        //Have to use YEP's text measure to not clobber his centering and font stuff
        textWidth = this.textWidthExCheck(textState.text)
    }
    else{
        textWidth = this.drawTextEx(textState.text, 0, this.contents.height + this.lineHeight());
    }

    let windowWidth = this.contents.width - newLineX;
    let leftPaddingSize = windowWidth * ($gameMessage._leftPercent / 100);
    return Math.max((windowWidth / 2) - (textWidth / 2), leftPaddingSize);
}

if(Imported.YEP_MessageCore){
    Gimmer_Core.CenterText._Window_Message_prototype_wordwrapWidth = Window_Message.prototype.wordwrapWidth;
    Window_Message.prototype.wordwrapWidth = function (){
        let wordwrapWidth = Gimmer_Core.CenterText._Window_Message_prototype_wordwrapWidth.call(this);
        if($gameMessage._centerText){
            let rightPaddingSize = wordwrapWidth * ($gameMessage._rightPercent / 100);
            wordwrapWidth -= rightPaddingSize;
        }
        return wordwrapWidth;
    }
}