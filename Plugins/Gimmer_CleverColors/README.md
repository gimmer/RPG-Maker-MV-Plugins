## Gimmer_CleverColors

Allows you to define a Colors.json file or use the plugin parameters to define specific text strings that, 
if found in a Show Text command, will automatically become certain colors.

An example Colors.json file can be found in the repo. Its format is pretty simplistic, just an object with word as key, 
and colorId as value.

#### Text Tutorial:

1. Fill out the colors.json file or set the plugin parameters for each color an array of words you want to be that color.
2. Add Show Text commands
3. Watch the colors appear!
4. (Optional) Don't want color on a word? Prefix it with an "!"

####Plugin Commands:

Add a color: CC_ADD word_or_phase color_id  
E.G.: CC_ADD LOVE 4  
Note: if you want a multi word phrase, just write it out as well. The code will know it's a phrase even though it might look like you're doing multiple plugin arguments  
E.G. CC_ADD once upon a time 6

Remove a color:CC_REMOVE word_or_phase


## Terms of Use:

Free for both commercial and non-commercial use, with credit.

More Gimmer_ plugins at: https://github.com/gimmer/RPG-Maker-MV-Plugins