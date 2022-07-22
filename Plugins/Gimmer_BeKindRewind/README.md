## Gimmer_BeKindRewind

A plugin to let your character rewind time on the map screen. 
Press TAB to do so when outside a map on the event screen.

I made this plugin for the [Vagabond Relay Game Jam](http://www.vagabonddog.com/blog/relay-jam).
As such it's not as polished as some others, but is certainly fine.


#### Text Tutorial:

1) Put this plugin, along with Gimmer_Core, in to the pluginss folder. 
2) Put TapeRewindSe.ogg in the SE folder. 
3) Define a switch to turn the power on, or turn the power via the debug option in the plugin parameters
4) (Optional) Define any switches, self switches, or variables you don't want to rewind when time rewinds.
5) Play the game, do things, be merry.
6) Uh oh, you got stuck forever because you made the wrong choice.
7) Quick, press "TAB"
8) Watch time rewind, make the choice again afterwards.

#### Motion Blur Filter
Want to use the motion blur filter? You'll need pixi-filters.js.
I've included version 2.7.1 in this repo as it's kind of a pain to find on their regular site, as it's super old.

To use it, you'll have to go save it in the js/libraries folder of your project, and then add the following line to index.html:

    <script type="text/javascript" src="js/libs/pixi-filters.js"></script>

It's best if you do it right under the line for pixi-picture.js to keep it with the other pixi files.

### Known Issues:

This plugin is current only compatible with 4-way movement. There are simply too many 8-way movement plugins out there
for me to try to fix it for all of them.

If I ever make my own 8-way movement plugin, this will probably be updated.

Feel free to extend it for your choice of 8-way movement!

## Terms of Use:

Free for both commercial and non-commercial use, with credit.

More Gimmer_ plugins at: https://github.com/gimmer/RPG-Maker-MV-Plugins