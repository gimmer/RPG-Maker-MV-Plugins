if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

//=============================================================================
/*:
 * @plugindesc v2.8 - Display text anywhere on the screen
 * @author Gimmer_
 * @help You can use this plugin to show text on the screen
 *
 * ================
 * Gimmer_TextAnywhere
 * ================
 *
 * This plugin lets you put text on the screen.
 * In it's simplest form, you set a text's x, y, fontsize, opacity, bold, color, and text body.
 * You also give this text an id (any unique string you want).
 * It will show on the screen forever.
 *
 * You can use various plugin commands to add text, hide text, show text, and create temporary text
 *
 * Must be loaded BEFORE YEP_MessageCore if you are using it, otherwise it will break word wrapping
 * Must be loaded AFTER YEP_CoreEngine as it has to amend drawTextEx to support opacity changes in text
 *
 *
 * Global Plugin Commands:
 *
 * ===Command===
 * HideTextLayer
 * ===Params===
 * N/A
 * ===Description===
 * Hides the layer all text is on
 *
 * ===Command===
 * ShowTextLayer
 * ===Params===
 * N/A
 * ===Description===
 * Shows the layer all text is on
 *
 * Text Specific Plugin Commands:
 *
 * ===Command===
 * ShowText
 * ===Params===
 * id: the unique id of the text
 * ===Description===
 * Shows this specific text if it isn't visible
 *
 * ===Command===
 * HideText
 * ===Params===
 * id: the unique id of the text
 * ===Description===
 * Hides this specific text if it is visible
 *
 * ===Command===
 * FadeOutText
 * ===Params===
 * id: the unique id of the text
 * fadeFrames: the number of frames to take to fade out
 * ===Description===
 * Fades out the text over this amount of time
 *
 * ===Command===
 * FadeInText
 * ===Params===
 * id: the unique id of the text
 * fadeFrames: the number of frames to take to fade on
 * ===Description===
 * Fades in text not currently visible over the text over this amount of time
 *
 * ===Command===
 * TypeInText
 * ===Params===
 * id: the unique id of the text
 * typingFrames: the number of frames to spend typing
 * ===Description===
 * Types text from left to right over the number of frames provided
 *
 * Quick Add Plugin Commands:
 *
 * ===Command===
 * TaSetQuickParams
 * ===Params===
 * id: the unique id of the text
 * typingFrames: the number of frames to spend typing
 * ===Description===
 * Replaces the defaults for the plugin that were provided in the editors.
 * These changes will persist for all quick add commands, and remain the default in the game
 * These changes persist in game saves, so events that change these are effectively permanently changing them
 *
 * ===Command===
 * QuickAddText
 * ===Params===
 * id: the unique id of the text
 * x: Where on the x to put the text. Can be a number or an eval'd string (e.g. Graphics.boxWidth/2)
 * y: Where on the y to put the text. Can be a number or an eval'd string (e.g. Graphics.boxHeight/2)
 * text: the text you want to show
 * ===Description===
 * Adds text with the default color, bold, fontsize and opacity to the texts array.
 *
 * ===Command===
 * AddTempText
 * ===Params===
 * x: Where on the x to put the text. Can be a number or an eval'd string (e.g. Graphics.boxWidth/2)
 * y: Where on the y to put the text. Can be a number or an eval'd string (e.g. Graphics.boxHeight/2)
 * text: the text you want to show
 * duration: Number of frames to leave the text for
 * durationHandler: either "fade", or "hide"
 * fadeFrames: if you chose fade, how many frames to fade over
 * ===Description===
 * Creates temporary text that displays, and remains for a duration, and the disappears instantly or fades out
 *
 * ===Command===
 * TypeTempText
 * ===Params===
 * x: Where on the x to put the text. Can be a number or an eval'd string (e.g. Graphics.boxWidth/2)
 * y: Where on the y to put the text. Can be a number or an eval'd string (e.g. Graphics.boxHeight/2)
 * text: the text you want to show
 * duration: Number of frames to leave the text for
 * durationHandler: either "fade", or "hide"
 * fadeFrames: if you chose fade, how many frames to fade over
 * typingFrames: how many frames to take to type the text
 * ===Description===
 * Creates temporary text that types out over a duration, then remains for a duration, and the disappears instantly or fades out over another duration
 *
 * Big Mama Pajama Plugin Commands:
 *
 * ===Command===
 * AdvancedAddText
 * ===Params===
 * id: the unique id of the text
 * x: Where on the x to put the text. Can be a number or an eval'd string (e.g. Graphics.boxWidth/2)
 * y: Where on the y to put the text. Can be a number or an eval'd string (e.g. Graphics.boxHeight/2)
 * color: hexcode of the color you want
 * bold: true or false if you want bold
 * fontsize: fontsize you want
 * opacity: (1-255) opacity you want
 * text: the text you want to show
 * ===Description===
 * Adds fully customizable text to the texts array.
 *
 *
 * ===Command===
 * AdvancedTypeTempText
 * ===Params===
 * id: the unique id of the text
 * x: Where on the x to put the text. Can be a number or an eval'd string (e.g. Graphics.boxWidth/2)
 * y: Where on the y to put the text. Can be a number or an eval'd string (e.g. Graphics.boxHeight/2)
 * Text: Put in double quotes "" the text you want to include
 * Duration: number of frames to remain on the screen
 * Duration Handler: either "fade" or "hide"
 * Fade Frames: if you chose "fade", how many frames to take to fade"
 * typingFrames: how many frames to take to type the text
 * Font: the font name you want the text to be
 * fontsize: fontsize you want
 * color: hexcode of the color you want
 * bold: true or false if you want bold
 * opacity: (1-255) opacity you want
 * outline: true or false if you want the outline
 * ===Description===
 * Adds fully customizable text that types in and disappears afterwards.
 *
 *
 * ==============
 * Version History
 * ==============
 * - Version 1.0: Initial Release
 * - Version 2.0: Adding more plugin commands
 * - Version 2.1: Moved to used drawTextEx to make text codes available
 * - Version 2.2: Fixed font color, size, bold, and opacity to keep working with drawTextEx
 * - Version 2.3: Support for stopping outlines around words
 * - Version 2.4: Bug fix so it doesn't break when you don't HAVE text
 * - Version 2.5: Bug fix so faded out text doesn't flash back on the screen for a second
 * - Version 2.6: Added in AdvancedTypeTempText to support typing with fonts
 * - Version 2.7: Fixing in Type Temp Text to support text and font tags
 * - Version 2.8: Added optional support for making a button held down to show the text layer
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
 * @param Trigger Via Button
 * @parent ---Parameters---
 * @type Boolean
 * @desc Do you want text to only show when a button is held down?
 * Default: False
 * @default False
 *
 * @param Trigger Button Type
 * @parent Trigger Via Button
 * @type Select
 * @desc Do you want to trigger the text via mouse or keyboard?
 * @option mouse
 * @option keyboard
 * Default keyboard
 * @default keyboard
 *
 * @param Trigger Button Keyboard
 * @parent Trigger Via Button
 * @type Number
 * @desc What keycode to trigger the UI? See https://keycode.info/
 * @default 9
 * Default 9 (tab)
 *
 * @param Trigger Button Mouse
 * @parent Trigger Via Button
 * @type Select
 * @desc What mouse button (Right, Middle, or Left) to trigger the text?
 * @option Right
 * @option Middle
 * @option Left
 * Default Right
 * @default Right
 *
 *
 * @param Default Text List
 * @parent --Parameters--
 * @type struct<Text>[]
 * @desc Make a list of all the default text you want to show. You can add to this list dynamically via events
 *
 * @param ---Defaults---
 * @default
 *
 * @param Default Color
 * @parent ---Defaults---
 * @type String
 * @desc Hexcode for the default color to use for quick add commands
 * @default #FFFFFF
 * Default #FFFFFF
 *
 * @param Default Font Size
 * @parent ---Defaults---
 * @type Number
 * @desc What is the default the font size for quick add commands
 * @default 28
 * Default 28
 *
 * @param Default Bold
 * @parent ---Defaults---
 * @type Boolean
 * @desc Show text be bold for quick add commands
 * @default false
 * Default false
 *
 * @param Default Include Outline
 * @parent ---Defaults---
 * @type Boolean
 * @desc Show text should include outline by default
 * @default true
 * Default true
 *
 * @param Default Opacity
 * @parent ---Defaults---
 * @type Number
 * @desc What opacity for quick add commands?
 * @min 1
 * @max 255
 * @default 255
 * Default 255
 *
 */
/*~struct~Text:
 * @param id
 * @type String
 * @desc Unique Stub or id you want to use to refer to this text in plugin commands
 *
 * @param x
 * @type String
 * @desc Where on the x to put the text?
 * @default 0
 * Default 0
 *
 * @param color
 * @type string
 * @desc hexcode of the label text color eg #FF0000
 *
 * @param fontsize
 * @type number
 * @desc Font size
 * @default 28
 * Default Default Font size
 *
 * @param bold
 * @type Boolean
 * @desc Should the font be bold?
 * Default false
 * @default false
 *
 * @param defaultOpacity
 * @type Number
 * @desc What is the default opacity of this text (1-255)
 * @min 1
 * @max 255
 * Default 255
 * @default 255
 *
 * @param y
 * @type String
 * @desc Where on the y to put the texT?
 * @default 0
 * Default 0
 *
 * @param includeOutline
 * @type Boolean
 * @desc Should you include the outline around text that the engine includes by default?
 * @default true
 * Default True
 *
 * @param text
 * @type String
 * @string What's the text you want (us \V[1] for variables);
*/

Imported = Imported || {};
Imported.Gimmer_TextAnywhere = '2.8'

Gimmer_Core['TextAnywhere'] = {'loaded':true};

//todo params
let TAParams = PluginManager.parameters('Gimmer_TextAnywhere');
Gimmer_Core.TextAnywhere.DefaultColor = TAParams["Default Color"];
Gimmer_Core.TextAnywhere.DefaultFontSize = Number(TAParams["Default Font Size"]);
Gimmer_Core.TextAnywhere.DefaultBold = (TAParams["Default Bold"] === "true");
Gimmer_Core.TextAnywhere.DefaultOutline = (TAParams["Default Include Outline"] === "true");
Gimmer_Core.TextAnywhere.DefaultOpacity = Number(TAParams['Default Opacity']);
Gimmer_Core.TextAnywhere.TriggerByButton = (TAParams["Trigger Via Button"] === "true");
if(Gimmer_Core.TextAnywhere.TriggerByButton){
    Gimmer_Core.TextAnywhere.TriggerType = TAParams['Trigger Button Type'];
    switch(Gimmer_Core.TextAnywhere.TriggerType.toLowerCase()){
        case 'keyboard':
            Input.keyMapper[Number(TAParams['Trigger Button Keyboard'])] = 'TATOGGLE';
            break;
        case 'mouse':
            TouchInput._uiToggled = false;
            const clickFunction = function(event) {
                var x = Graphics.pageToCanvasX(event.pageX);
                var y = Graphics.pageToCanvasY(event.pageY);
                if (Graphics.isInsideCanvas(x, y)) {
                    this._uiToggled = true;
                }
            };
            let closeUIOnEventId;
            dd(TAParams['Trigger Button Mouse']);
            switch(TAParams['Trigger Button Mouse'].trim()){
                case 'Right':
                    closeUIOnEventId = 2;
                    TouchInput._onRightButtonDown = clickFunction;
                    break;
                case 'Middle':
                    closeUIOnEventId = 1;
                    TouchInput._onMiddleButtonDown = clickFunction;
                    break;
                case 'Left':
                    closeUIOnEventId = 0;
                    Gimmer_Core.TextAnywhere._TouchInput_onLeftButtonDown = TouchInput._onLeftButtonDown;
                    TouchInput._onLeftButtonDown = function(event){
                        Gimmer_Core.TextAnywhere._TouchInput_onLeftButtonDown.call(this, event);
                        clickFunction.call(this, event);
                    };
                    break;
            }

            Gimmer_Core.TextAnywhere._TouchInput_onMouseUp = TouchInput._onMouseUp;
            TouchInput._onMouseUp = function(event){
                Gimmer_Core.TextAnywhere._TouchInput_onMouseUp.call(this,event);
                if(event.button === closeUIOnEventId){
                    this._uiToggled = false;
                }
            }
            break;
    }
}

Gimmer_Core.TextAnywhere.SkipOutline = false;
Gimmer_Core.TextAnywhere.SeedForId = new Date().getTime();
Gimmer_Core.TextAnywhere.generateTextId = function (){
    this.SeedForId++;
    return 't'+this.SeedForId;
}

Gimmer_Core.TextAnywhere.InitializeTexts = function(){
    let GlobalTextObj = {};
    let textList = PluginManager.parameters('Gimmer_TextAnywhere')['Default Text List'];
    let texts = [];
    if(textList !== ""){
        texts = JSON.parse(textList);
    }

    texts.forEach(function(text){
        text = JSON.parse(text);
        let textObj = new TAObject(text.id, text.x, text.y, text.color, text.fontsize, text.bold, text.defaultOpacity, text.text, (text.includeOutline === "true"));
        textObj.alive = true;
        GlobalTextObj[textObj.id] = textObj;
    });

    Gimmer_Core.TextAnywhere.Texts = GlobalTextObj;
}

Gimmer_Core.TextAnywhere.showDisplayLayer = function(){
    let display = false;
    if(Gimmer_Core.TextAnywhere.TriggerByButton){
        if(Gimmer_Core.TextAnywhere.TriggerType === "keyboard"){
            display = (Input.isPressed('TATOGGLE') || Input.isLongPressed('TATOGGLE'))
        }
        else if(Gimmer_Core.TextAnywhere.TriggerType === "mouse"){
            display = TouchInput._uiToggled;
        }
    }
    else{
        display = true;
    }
    return display;
}

Gimmer_Core.TextAnywhere.Scene_Map_prototype_createAllWindows = Scene_Map.prototype.createAllWindows;
Scene_Map.prototype.createAllWindows = function(){
    this.addTextOverlay();
    Gimmer_Core.TextAnywhere.Scene_Map_prototype_createAllWindows.call(this);
}

Scene_Map.prototype.addTextOverlay = function(){
    let temp = new Window_Base();
    this._textOverLay = new Window_Plain(-temp.standardPadding(),-temp.standardPadding(),Graphics.width + temp.standardPadding() * 2,Graphics.height + temp.standardPadding() * 2);
    this.addChild(this._textOverLay);
}

Gimmer_Core.TextAnywhere._Scene_Map_prototype_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function(){
    Gimmer_Core.TextAnywhere._Scene_Map_prototype_update.call(this);
    this.updateTextOverlay();
}

Scene_Map.prototype.updateTextOverlay = function(){
    this._textOverLay.contents.clear();

    if(Gimmer_Core.TextAnywhere.showDisplayLayer()){
        Object.values(Gimmer_Core.TextAnywhere.Texts).forEach(function(text){
            if(!text.alive){
                return;
            }
            if(text.needsDelete){
                delete Gimmer_Core.TextAnywhere.Texts[text.id];
                return;
            }

            this.updateTextVisibility(text);
            if(text.visible){
                this.updateTextDuration(text);
                this.updateTextFadeOut(text);
                this.updateTextFadeIn(text);
                let tempText = this._textOverLay.convertEscapeCharacters(text.text);
                let textLength = this.updateTypingIn(text, tempText);
                this.displayTextAnywhere(text,tempText, textLength);
            }
        }, this)
    }
}

Scene_Map.prototype.updateTextDuration = function(text){
    if(text.duration > 0 && !text.isTypingIn && !text.isFadingIn && !text.isFadingOut){
        text.duration--;
    }

    if(text.duration === 0){
        text.handleDurationZero();
    }
}

Scene_Map.prototype.updateTypingIn = function(text, tempText){
    if(text.isTypingIn){
        let textState = this._textOverLay.drawTextEx(tempText,0,this._textOverLay.contents.height,0,-1,true);
        tempText = textState.normalText;
        let charsPerFrame = tempText.length / text.typingFrames;
        text.typingIndex += charsPerFrame;
        if(text.typingIndex > tempText.length){
            text.isTypingIn = false;
            text.typingIndex = 0;
            return tempText.length;
        }
        return Math.round(text.typingIndex);
    }
    return -2;
}

Scene_Map.prototype.displayTextAnywhere = function (text, tempText, textLength){
    tempText = "\x1bCCCC["+text.color+"]" +  tempText;
    tempText = "\x1bSSSS["+text.fontsize+"]" + tempText;
    if(Imported.YEP_MessageCore){
        if(text.bold){
            tempText = "\x1bBBBB" + tempText;
        }
        else{
            tempText = "\x1bNBNB" + tempText;
        }
    }


    if(text.outline === false){
        tempText = "\x1bOLOFF" +tempText + "\x1bOLON";
    }

    if(text.font){
        tempText = "\x1bFURN["+text.font+"]"+tempText;
    }

    this._textOverLay.drawTextEx(tempText, Number(eval(text.x)), Number(eval(text.y)), text.currentOpacity, textLength);
    this._textOverLay.resetFontSettings();
}

//Copied from YEP_Core
Window_Base.prototype.drawTextEx = function(text, x, y, alpha, stopAt, returnObject) {
    if (text) {
        if(!alpha){
            alpha = 255;
        }
        if(stopAt === undefined){
            stopAt = -2;
        }
        this.resetFontSettings();
        var textState = { index: 0, x: x, y: y, left: x, alpha: alpha, myindex: 0, normalText: "" };
        textState.text = this.convertEscapeCharacters(text);
        textState.height = this.calcTextHeight(textState, false);
        while (textState.index < textState.text.length) {
            if(stopAt === textState.myindex){
                return textState.x - x;
            }
            this.processCharacter(textState);
        }
        if(returnObject){
            return textState;
        }
        return textState.x - x;
    } else {
        return 0;
    }
};

Window_Base.prototype.processNormalCharacter = function(textState) {
    var c = textState.text[textState.index++];
    var w = this.textWidth(c);
    this.contents.drawTextAlpha(c, textState.x, textState.y, w * 2, textState.height, textState.align, textState.alpha );
    textState.normalText += c;
    textState.x += w;
    textState.myindex++;
};

Gimmer_Core.TextAnywhere.Window_Base_prototype_processEscapeCharacter = Window_Base.prototype.processEscapeCharacter;
Window_Base.prototype.processEscapeCharacter = function(code, textState){
    switch(code){
        case "CCCC":
            this.changeTextColor(this.obtainColorParam(textState));
            break;
        case "SSSS":
            this.contents.fontSize = this.obtainEscapeParam(textState);
            break;
        case "BBBB":
            this.contents.fontBold = true;
            break;
        case "NBNB":
            this.contents.fontBold = false;
            break;
        case "OLOFF":
            Gimmer_Core.TextAnywhere.SkipOutline = true;
            break;
        case "OLON":
            Gimmer_Core.TextAnywhere.SkipOutline = false;
            break;
        case "FURN":
            this.contents.fontFace = this.obtainFontParam(textState);
            break;
        default:
            Gimmer_Core.TextAnywhere.Window_Base_prototype_processEscapeCharacter.call(this,code,textState);
    }
}

Window_Base.prototype.obtainColorParam = function(textState) {
    var arr = /^\[#[A-Za-z0-9]+\]/.exec(textState.text.slice(textState.index));
    if (arr) {
        textState.index += arr[0].length;
        return arr[0].slice(1).replace("]","");
    } else {
        return '';
    }
};

Window_Base.prototype.obtainFontParam = function(textState) {
    var arr = /^\[[A-Za-z0-9\-]+\]/.exec(textState.text.slice(textState.index));
    if (arr) {
        textState.index += arr[0].length;
        return arr[0].slice(1).replace("]","");
    } else {
        return '';
    }
};

Scene_Map.prototype.updateTextVisibility = function(text){
    if(!text.visible && (text.isFadingIn || text.isTypingIn)){
        text.visible = true;
        if(text.isTypingIn){
            text.currentOpacity = text.getDefaultOpacity();
        }
    }
    if(!text.visible && text.deletesOnceInvisible){
        text.needsDelete = true;
    }
}

Scene_Map.prototype.updateTextFadeOut = function(text){
    if(text.isFadingOut){
        if(text.currentOpacity > 0){
            text.currentOpacity -= text.getDefaultOpacity() / text.fadeFrames;
            if(text.currentOpacity <= 0){
                text.currentOpacity = 0;
                text.isFadingOut = false;
                text.visible = false;
            }
        }
        else{
            text.isFadingOut = false;
            text.visible = false;
        }
    }
}

Scene_Map.prototype.updateTextFadeIn = function(text){
    if(text.isFadingIn){
        if(text.currentOpacity < text.getDefaultOpacity()){
            text.currentOpacity += text.getDefaultOpacity() / text.fadeFrames;
            if(text.currentOpacity > text.getDefaultOpacity()){
                text.currentOpacity = text.getDefaultOpacity();
            }
        }
        else{
            text.isFadingIn = false;
        }
    }
}

Gimmer_Core.TextAnywhere.quickAddText = function(id,x,y,text){
    let color = this.DefaultColor;
    let fontsize = this.DefaultFontSize;
    let bold = this.DefaultBold;
    let opacity = this.DefaultOpacity;
    let outline = this.DefaultOutline;
    Gimmer_Core.TextAnywhere.Texts[id] = new TAObject(id,x,y,color, fontsize, bold, opacity,text, outline);
    Gimmer_Core.TextAnywhere.Texts[id].alive = true;
    return Gimmer_Core.TextAnywhere.Texts[id];
}

Gimmer_Core.TextAnywhere.advancedAddText = function(id,x,y,color,bold,fontsize,opacity, text, outline){
    Gimmer_Core.TextAnywhere.Texts[id] = new TAObject(id,x,y,color, fontsize, bold, opacity,text, outline);
    Gimmer_Core.TextAnywhere.Texts[id].alive = true;
    return Gimmer_Core.TextAnywhere.Texts[id];
}

Gimmer_Core.pluginCommands["TASETQUICKPARAMS"] = function(params){
    Gimmer_Core.TextAnywhere.DefaultColor = params[0];
    Gimmer_Core.TextAnywhere.DefaultFontSize = Number(params[1]);
    Gimmer_Core.TextAnywhere.DefaultBold = params[2];
    Gimmer_Core.TextAnywhere.DefaultOpacity = Number(params[3]);
    Gimmer_Core.TextAnywhere.DefaultOutline = (params[4] === "true");
}

Gimmer_Core.pluginCommands["ADDTEMPTEXT"] = function(params){
    let id = Gimmer_Core.TextAnywhere.generateTextId();
    let x = params[0];
    let y = params[1];
    let text = params[2];
    let duration = Number(params[3]);
    let durationType = params[4];
    let durationTypeParam = params[5];
    let obj = Gimmer_Core.TextAnywhere.quickAddText(id,x,y,text);
    obj.setDuration(duration, durationType, durationTypeParam);
    obj.deletesOnceInvisible = true;
    obj.alive = true;
}

Gimmer_Core.pluginCommands["TYPETEMPTEXT"] = function(params){
    let id = Gimmer_Core.TextAnywhere.generateTextId();
    let x = params[0];
    let y = params[1];
    let text = params[2];
    let duration = Number(params[3]);
    let durationType = params[4];
    let durationTypeParam = params[5];
    let typingFrames = Number(params[6]);
    let textObj = Gimmer_Core.TextAnywhere.quickAddText(id,x,y,text);
    textObj.isTypingIn = true;
    textObj.deletesOnceInvisible = true;
    textObj.typingFrames = typingFrames;
    textObj.setDuration(duration, durationType, durationTypeParam);
    textObj.alive = true;
}
Gimmer_Core.pluginCommands["ADVANCEDTYPETEMPTEXT"] = function(params){
    let id = params[0];
    let x = params[1];
    let y = params[2];
    let text = params[3];
    let duration = Number(params[4]);
    let durationType = params[5];
    let durationTypeParam = params[6];
    let typingFrames = Number(params[7]);
    let font = params[8];
    let fontsize = Number(params[9]);
    let color = params[10];
    let bold = params[11];
    let opacity = params[12];
    let outline = (params[13] === "true")
    let textObj = new TAObject(id,x,y,color,fontsize,bold,opacity,text,outline);
    textObj.setFont(font);
    textObj.isTypingIn = true;
    textObj.deletesOnceInvisible = true;
    textObj.typingFrames = typingFrames;
    textObj.setDuration(duration, durationType, durationTypeParam);
    textObj.alive = true;
    Gimmer_Core.TextAnywhere.Texts[id] = textObj;
}

Gimmer_Core.pluginCommands["QUICKADDTEXT"] = function (params){
    let id = params[0].toString();
    let x = params[1];
    let y = params[2];
    let text = params[3];
    Gimmer_Core.TextAnywhere.quickAddText(id,x,y,text).alive = true;
}

Gimmer_Core.pluginCommands["ADVANCEDADDTEXT"] = function (params){
    let id = params[0].toString();
    let x = params[1];
    let y = params[2];
    let color = params[3];
    let bold = params[4];
    let fontsize = params[5];
    let opacity = params[6];
    let text = params[7];
    let outline = (params[8] === "true");
    Gimmer_Core.TextAnywhere.advancedAddText(id,x,y,color, bold,fontsize,opacity,text, outline).alive = true;
}

Gimmer_Core.pluginCommands["HIDETEXTLAYER"] = function(){
    if('_textOverLay' in SceneManager._scene){
        SceneManager._scene._textOverLay.visible = false;
    }
}

Gimmer_Core.pluginCommands["SHOWTEXTLAYER"] = function(){
    if('_textOverLay' in SceneManager._scene){
        SceneManager._scene._textOverLay.visible = true;
    }
}

Gimmer_Core.pluginCommands["SHOWTEXT"] = function(params){
    let id = params[0].toString();
    Gimmer_Core.TextAnywhere.Texts[id].visible = true;
}


Gimmer_Core.pluginCommands["HIDETEXT"] = function(params){
    let id = params[0].toString();
    Gimmer_Core.TextAnywhere.Texts[id].visible = false;
}

Gimmer_Core.pluginCommands["FADEOUTTEXT"] = function(params){
    let id = params[0].toString();
    Gimmer_Core.TextAnywhere.Texts[id].isFadingOut = true;
    Gimmer_Core.TextAnywhere.Texts[id].isFadingIn = false;
    Gimmer_Core.TextAnywhere.Texts[id].fadeFrames = Number(params[1] || 60);
}

Gimmer_Core.pluginCommands["FADEINTEXT"] = function(params){
    let id = params[0].toString();
    Gimmer_Core.TextAnywhere.Texts[id].isFadingOut = false;
    Gimmer_Core.TextAnywhere.Texts[id].isFadingIn = true;
    Gimmer_Core.TextAnywhere.Texts[id].fadeFrames = Number(params[1] || 60);
}

Gimmer_Core.pluginCommands["TYPEINTEXT"] = function (params){
    let id = params[0].toString();
    if(!Gimmer_Core.TextAnywhere.Texts[id].visible){
        Gimmer_Core.TextAnywhere.Texts[id].isTypingIn = true;
        Gimmer_Core.TextAnywhere.Texts[id].typingFrames = Number(params[1] || 60);
    }
}

//Extend Saving
Gimmer_Core.TextAnywhere.DataManager_makeSaveContents = DataManager.makeSaveContents;
DataManager.makeSaveContents = function() {
    let contents = Gimmer_Core.TextAnywhere.DataManager_makeSaveContents.call(this);
    contents.textAnywhereTexts = Gimmer_Core.TextAnywhere.Texts;
    contents.textAnywhereDefaults = [Gimmer_Core.TextAnywhere.DefaultColor,Gimmer_Core.TextAnywhere.DefaultFontSize, Gimmer_Core.TextAnywhere.DefaultBold, Gimmer_Core.TextAnywhere.DefaultOpacity];
    return contents;
};

Gimmer_Core.TextAnywhere.DataManager_extractSaveContents = DataManager.extractSaveContents;
DataManager.extractSaveContents = function(contents) {
    Gimmer_Core.TextAnywhere.DataManager_extractSaveContents.call(this, contents);
    if('textAnywhereTexts' in contents){
        Gimmer_Core.TextAnywhere.Texts = contents.textAnywhereTexts;
        Gimmer_Core.TextAnywhere.DefaultColor = contents.textAnywhereDefaults[0];
        Gimmer_Core.TextAnywhere.DefaultFontSize = contents.textAnywhereDefaults[1];
        Gimmer_Core.TextAnywhere.DefaultBold = contents.textAnywhereDefaults[2];
        Gimmer_Core.TextAnywhere.DefaultOpacity = contents.textAnywhereDefaults[3];
    }
};


//Bitmap Functions
/**
 * Draws the outline text to the bitmap.
 *
 * @method drawText
 * @param {String} text The text that will be drawn
 * @param {Number} x The x coordinate for the left of the text
 * @param {Number} y The y coordinate for the top of the text
 * @param {Number} maxWidth The maximum allowed width of the text
 * @param {Number} lineHeight The height of the text line
 * @param {String} align The alignment of the text
 */
Bitmap.prototype.drawTextAlpha = function(text, x, y, maxWidth, lineHeight, align, alpha) {
    // Note: Firefox has a bug with textBaseline: Bug 737852
    //       So we use 'alphabetic' here.
    if (text !== undefined) {
        var tx = x;
        var ty = y + lineHeight - (lineHeight - this.fontSize * 0.7) / 2;
        var context = this._context;
        maxWidth = maxWidth || 0xffffffff;
        if (align === 'center') {
            tx += maxWidth / 2;
        }
        if (align === 'right') {
            tx += maxWidth;
        }
        context.save();
        context.font = this._makeFontNameText();
        context.textAlign = align;
        context.textBaseline = 'alphabetic';
        context.globalAlpha = alpha;
        if(!Gimmer_Core.TextAnywhere.SkipOutline){
            this._drawTextOutline(text, tx, ty, maxWidth);
        }

        this._drawTextBody(text, tx, ty, maxWidth);
        context.restore();
        this._setDirty();
    }
};


function TAObject(id, x, y, color, fontsize, bold, opacity, text, outline) {
    this.id = id.toString();
    this.x = x;
    this.y = y;
    this.color = color;
    this.fontsize = Number(fontsize);
    this.bold = (bold === "true");
    this.defaultOpacity = Number(opacity) / 255;
    this.text = text;
    this.currentOpacity = Number(opacity) / 255;
    this.visible = true;
    this.isFadingOut = false;
    this.isFadingIn = false;
    this.fadeFrames = 0;
    this.isTypingIn = false;
    this.typingIndex = 0;
    this.typingFrames = 0;
    this.duration = -1;
    this.durationHandler = "fade";
    this.durationParam = 0;
    this.needsDelete = false;
    this.deletesOnceInvisible = false;
    this.outline = outline;
    this.alive = false;
}

TAObject.prototype.getDefaultOpacity = function(){
    return this.defaultOpacity;
}

TAObject.prototype.setFont = function(font){
    this.font = font;
}

TAObject.prototype.setDuration = function(duration, handler, handlerParam){
    this.duration = Number(duration);
    if(['fade','delete','hide'].indexOf(handler) > -1){
        this.durationHandler = handler;
        this.durationParam = handlerParam;
    }
    return this;
}

TAObject.prototype.handleDurationZero = function(){
    switch(this.durationHandler){
        case 'fade':
            this.isFadingOut = true;
            this.fadeFrames = this.durationParam;
            break;
        case 'delete':
            this.needsDelete = true;
            break;
        case 'hide':
            this.visible = false;
            break;
    }
    this.duration = -1;
}


Gimmer_Core.TextAnywhere.InitializeTexts();