if(Gimmer_Core === undefined){
    throw "Gimmer_Core is required for this plugin";
}

Gimmer_Core['TimelyTitles'] = {'loaded':true};
Imported = Imported || {};
Imported['Gimmer_TimelyTitles'] = true;

//=============================================================================
/*:
 * @plugindesc v1.0 - Change the title screen based on what time it is
 * @author Gimmer_
 * @help Put in as many titles in the list as you want, with starting and ending times using a 24 hour clock.
 *
 * ==================
 * Gimmer_TimelyTitles
 * ==================
 *
 * If you overlap the end of the day (IE, 22 hours to 2 hours) it should still work, but I can't stay up that late to check
 *
 * If none of the time conditions fit your custom ones, the default title page you set in System will be used
 *
 * @param ---Parameters---
 * @default
 *
 * Terms of Use:
 * =======================================================================
 * Free for both commercial and non-commercial use, with credit.
 * More Gimmer_ plugins at: https://github.com/gimmer/RPG-Maker-MV-Plugins
 * =======================================================================
 *
 * @param Title Screen List
 * @parent --Parameters--
 * @type struct<TitleScreen>[]
 * @desc Make a list of all the title screens you want and their start and end time
 *
 */
/*~struct~TitleScreen:
 * @param Start Time
 * @type String
 * @desc What time on the 24 hour clock to start the title screen?
 * @default 00:00:00
 * Default 00:00:00
 *
 * @param End Time
 * @type String
 * @desc What time on the 24 hour clock to end the title screen?
 * @default 12:00:00
 * Default 12:00:00
 *
 * @param Title1 Image
 * @type file
 * @dir img/titles1
 * @string what's the image name (don't include the .png) that you'd select in the FIRST box in the title image select screen
 *
 * @param Title2 Image
* @type file
 * @dir img/titles2
 * @string what's the image name (don't include the .png) that you'd select in the SECOND box in the title image select screen
*/

var TTParams = PluginManager.parameters("Gimmer_TimelyTitles");

TTParams["Title Screen List"] = JSON.parse(TTParams["Title Screen List"]);
Gimmer_Core.TimelyTitles.TitleList = [];
TTParams["Title Screen List"].forEach(function(list){
    list = JSON.parse(list);
    let newList = {};
    newList.startTime = list['Start Time'];
    newList.endTime = list['End Time'];
    newList.title1 = list['Title1 Image'];
    newList.title2 = list['Title2 Image'];
    Gimmer_Core.TimelyTitles.TitleList.push(newList);
});


Gimmer_Core.TimelyTitles._Scene_Title_prototype_createBackground = Scene_Title.prototype.createBackground;
Scene_Title.prototype.createBackground = function (){
    let secondsInADay = 24 * 60 * 60;
    Gimmer_Core.TimelyTitles.TitleList.some(function(title){
        let startArray = title.startTime.split(":");
        let startSeconds = (parseInt(startArray[0]) * 60 * 60) + parseInt(startArray[1]) * 60 + parseInt(startArray[2])
        let endArray = title.endTime.split(":");
        let endSeconds = (parseInt(endArray[0]) * 60 * 60) + parseInt(endArray[1]) * 60 + parseInt(endArray[2])
        if(startSeconds > endSeconds){
            endSeconds += secondsInADay
        }

        let date = new Date();
        let time = (date.getHours() * 60 * 60) + (date.getMinutes() * 60) + date.getSeconds();

        if(time >= startSeconds && time < endSeconds){
            $dataSystem.title1Name = title.title1;
            $dataSystem.title2Name = title.title2;
            return true;
        }

        return false;
    });
    Gimmer_Core.TimelyTitles._Scene_Title_prototype_createBackground.call(this);
}