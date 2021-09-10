##Gimmer_LanguageHelper

A plugin to help with translation.

Scenario: you've already made a game. It's got so many words.
Translating it would take forever.

###Let's Get Going
1. Run the BuildLanguageFile.exe program with the first parameter being the path to your game project
   1. This will produce .backups of every map.json, troops.json, and commonevents.json
   2. This will produce .updated files of each of those same things, having replace all dialog with hash codes
   3. This will produce a LanguageEN.json file with all your game dialogue, and a clone of of all your system dialog
2. Replace the original Map.json, troops.json, and commonEvents.json with the updated counterpart.
3. Install the plugin requirements
   1. Gimmer_Core >= 1.6
   2. Gimmer_Boot >= 1.0
   3. Gimmer_LanguageHelper >= 0.1
4. Setup Gimmer_LanguageHelper by setting the languages array
   1. Label: "English"
   2. Suffix: "EN"
5. Starting the game will now let you pick English as the only langauge choice
6. Take away the LanguageEN.json file and translate it. Each line is an entry in strings.
7. Add that new language's Label and Suffix to the Gimmer_LanguageHelper parameter list

###Limitations
* Because RPGMaker MV copies data from the database files into game objects, and then copies the game objects into memory as save files, a game that starts on one language has to stay on that language
  * E.G. Actors.json has the first character as "Jeff" and you translate his name in French to "FrenchJeff"
  * After the game starts, the Game_Actor object for "Jeff" will have the English or French name in it forever. Changing languages can't replace that name with the other language variant, because the player might have named the character themselves. 
  * (In theory I could use direct string matching to figure this out and try to change things, but it felt really messy, e.g. the player names the character Francois in the English version, and it autocorrects back to Francis)
