## Gimmer_AnimatedTitle

Allows you to animate your Title Scene by using a video background

#### Text Tutorial:
#####Static Video:
Put in the path to the movie that you want on the title screen in the plugin parameters, 
prefixed with movie/, and without an extension.

Set your title screen image to be a transparent png with your logo.

Watch a lovely video play!

#####Dynamic Video as Game Progresses
* Set "Change Title As Game Progresses" to true
* Set "Game Progress Variable" to the variable you are going to track progress with.
* Set "List Of Video Files" to a list of "movies/firstMove", "movies/secondMovie", etc.
* Update the Game Progress Variable with the number of movie that you want playing at the intro screen during that part of the game.

**Note**: An uninitialized variable is read as the value of 1, and the first video will play.

As the game progresses, the Title Screen will show the video associated with the variable value set in the most recently saved file. 


## Terms of Use:

Free for both commercial and non-commercial use, with credit.

More Gimmer_ plugins at: https://github.com/gimmer/RPG-Maker-MV-Plugins