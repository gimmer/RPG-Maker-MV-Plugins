if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

Gimmer_Core['FolderPictures'] = {'loaded':true};

//=============================================================================
/*:
 * @plugindesc v1.1 - A plugin to support loading Pictures from sub folders
 * @author Gimmer_
 * @help
 * ======================
 * Gimmer_FolderPictures
 * ======================
 *
 * This plugin lets you use the Plugin Command 'ShowPicture' as an alternative
 * to the regular 'Show Picture' command in an event or Common Event.
 *
 * The syntax is: ShowPicture ID Filename Origin X Y Scale-W Scale-H BlendOpacity BlendMode
 *
 * Accepted formats:
 *
 * ID = Any number handle you want to use to manipulate the image
 *
 * Filename = Filename/with/unlimtied/folders/relative/to/the/pictures/directory
 *
 * Origin = UPPERLEFT or CENTER. If not declared, will default to UPPERLEFT
 *
 * X = Integer, var:num if you want to use the value in a variable,
 * anything with Graphics. in it will be evaluated like a javascript entry
 *
 * Y = Integer, var:num if you want to use the value in a variable,
 * anything with Graphics. in it will be evaluated like a javascript entry
 *
 * Scale-W = Number
 *
 * Scale-H = Number
 *
 * BlendOpactiy = 0 to 255
 *
 * BlendMode = 0,1,2,3 (Normal, Additive, Multiply, Screen). Tbh, not sure if
 * these work because I don't know what they mean
 *
 * But Gimmer, I hear you say: I don't want to use a plugin command! I want
 * to just load images in the editor through "Show Picture" in the menu.
 * Well have I got the option for you!
 *
 * Make a picture in the root img/pictures directory with the following
 * format (it can be 0 kb):
 *
 * 'folderpicture_path_to_the_image.png'
 *
 * Put 'Show Picture' into your code, and select that picture. The interface will
 * let you choose it. What will really load is the real picture that you
 * put in img/pictures/path/to/the/image.png
 *
 * Cool eh?
 *
 * But Gimmer, I hear you say: I already have 1000 pictures in my project. I don't want to make stubs to all of them manually so I can keep using the editor
 * Included is the file: folderPictureHelper.exe!
 * Run the following from a command prompt: folderPictureHelper.exe "C:\mygame\img\pictures"
 * And the program will crawl your pictures folder and put stubs in the root for you
 *
 * But Gimmer, I hear you say: I already used those same 1000 pictures in Show Pictures commands everywhere. You canot expect me to go through every map event, commonevent, and battle event to fix it to load a stub!
 * Included is the file: fixPicturesInDatabase.exe
 * Run the following from a command prompt: fixPicturesInDatabase.exe "C:\mygame"
 * The program will backup any map.json files, commonevents.json, and troops.json and find any and all show picture events and fix them to use the stub version of the image
 *
 *
 * VIDEO TUTORIAL:
 * ============================
 * https://youtu.be/07WOFNOOx9I
 * ============================
 *
 * Terms of Use:
 * =======================================================================
 * Free for both commercial and non-commercial use, with credit.
 * More Gimmer_ plugins at: https://github.com/gimmer/RPG-Maker-MV-Plugins
 * =======================================================================

 * @param Disable Smooth
 * @parent ---Parameters---
 * @type Boolean
 * @desc Disable bitmap smoothing (as seen in FixPixel.js)
 * Default: True
 * @default true
 *
 */

var parameters = PluginManager.parameters('Gimmer_FolderPictures');
Gimmer_Core.FolderPictures.disableSmooth = (parameters['Disable Smooth'] === "true");

Gimmer_Core.FolderPictures.showPicture = function(args){
    //ID FileName Origin X Y Scale-W Scale-H BlendOpacity BlendMode
    var x, y, filename;
    var origin = 0;

    if(args[1].includes("var:")){
        filename = $gameVariables.value(args[1].replace("var:",""));
    }
    else{
        filename = args[1];
    }
    dd(filename);

    if(args[2].toUpperCase() === 'CENTER'){
        origin = 1;
    }

    if(args[3].includes("var:")){
        x = parseInt($gameVariables.value(args[3].replace("var:","")));
    }
    else if(args[3].includes('Graphics.')){
        x = eval(args[3]);
    }
    else{
        x = parseInt(args[3]);
    }

    if(args[4].includes("var:")){
        y = parseInt($gameVariables.value(args[4].replace("var:","")));
    }
    else if(args[4].includes('Graphics.')){
        y = eval(args[4]);
    }
    else{
        y = parseInt(args[4]);
    }

    $gameScreen.showPicture(parseInt(args[0]), filename, origin,
        x, y, parseInt(args[5]), parseInt(args[6]), parseInt(args[7]), parseInt(args[8]));
    return true;
}

ImageManager.loadBitmap = function(folder, filename, hue, smooth) {
    if (filename) {
        if(filename.includes("folderpicture_")){
            filename = filename.replace("folderpicture_","");
            filename = filename.replace(/_/g,"/");
        }

        let split = filename.split("/");
        let pathsuffix = "";
        if(split.length > 1){
            filename = split.pop();
            pathsuffix = split.join("/");
            pathsuffix += "/";
        }
        var path = folder + encodeURIComponent(pathsuffix) + encodeURIComponent(filename) + '.png';
        var bitmap = this.loadNormalBitmap(path, hue || 0);
        if(Gimmer_Core.FolderPictures.disableSmooth === false){
            bitmap.smooth = smooth;
        }

        return bitmap;
    } else {
        return this.loadEmptyBitmap();
    }
};

Gimmer_Core.pluginCommands['SHOWPICTURE'] = function(args){
    Gimmer_Core.FolderPictures.showPicture(args);
}