## Gimmer_LicenseBoard

Replaces EXP with LP, and lets your characters advance by buying licenses to gain skill ups, new equipment types, skills, and spells.

### Video Tutorial [The Basics]:

View here: https://www.youtube.com/watch?v=7jTHd0iQoQw
Note: Some of this is a bit out of date as new features have been added.

### Text Tutorial:

You will require the following items:
* js/plugins: Gimmer_Core for the scaffolding needed to run this.
* img/system: LicenseIconSet: a 64x64 icon set needed to draw the board. You can customize this with your own iconset so long as the 64x64 is maintained, and the icon indexes match the one provided
* img/system: LargeLicenseIconSet: If you want to have a success window, you also need a single row of large 170x170 icons for the various gain types. You can customize this as well, but one is provided
* data/Licenses.json: a json list of all the licenses. An example file is provided.

##### Setup Required
Set the note tag for the class of your heroes: &lt;BoardName:default> (change default to whatever you name your own board)

You can have more than one board in the database, and set them individually on each class. 

Characters will start at license point 0,0 automatically at the beginning of a new game.

To change this, add in &lt;StartingLicensePosition:x,y> in a character's classes note area.

A character will also start with no licenses.

To change this, add in &lt;StartingLicenses:x,y|x2,y2|x3,y3> to the classes note section.


**Note: a character can see every node around the ones they own, so if you start them with random nodes around the board it may be a bit disjointed**

Classes level 1 stats and skill lists are still used as the base stats of a character, as are any existing "Can equip" settings for a class.
However, if a class starts with "can equip" parameters set, there is nothing in the code keeping them from claiming a license to learn this again, effectively doing nothing for them, so better to start them with those licenses, or omit them from your board.

Enemies "EXP" will now be LP. You can scale this however you like, but bear in mind characters will only advance with licenses with this system set.
The event command "gain experience" will hand out LP instead.

#### More Info on Required Files
##### LicenseIconSet
Each icon is 64x64, this cannot be changed

Index 0 is background 1

Index 1 is background 2

Index 3 is what a non-navigable board position will look like

Index 4-7 are the different borders around a non-navigable icon

Index 8 is a custom cursor, should you choose to enabled it.

the second row (icon 16 -> 31) are the disabled icons

the third row (icon 32 -> 47) are the active icons

The icons are in a specific order, do not change this when making a custom icon sheet

##### LargeLicenseIconSet
A single row of 170x170 icons to match the same order as the icons in LicenseIconSet.

This is used in the optional success window

#### Licences.json
This is a json encoded array of license objects.

A license object has the following parameters:
* type: (string) attribute, xparam, sparam, equip, skill, or nope. Controls what kind of license it is.
* description: text to show at the top of the screen in the help window. For skill licenses that hand out more than one skill, this is what shows in the success window as well
* target:
    * For attributes: (int) 0-7 (HP, MP, ATK, DEF, MAT, MDF, AGI, LUK)
    * For xparam: (int) 0-8 (HIT, EVA, CRI, CEV, MEV, MRF, CNT, HRG, MRG, TRG)
    * For sparam: (int) 0-9 (TGR, GRD, REC, PHA, MCR, TCR, PDR, MDR, FDR, EXR)
      * (See Game_BattlerBase object for the word definitions of these. They are also listed in order in the plugin's "Labels" settings for you to label yourself)
    * For skills: does nothing
    * For Equip: (string) "weapon" or "armor"
* value:
    * For attributes: (int) the amount you will gain
    * For xparams and sparams: (float) the decimal you will gain. If you want to gain 1% of something, set the value to 0.01
    * For skills: (string) the skillId you will gain. If you want multiple, put them in a comma seperated list: "1,2,3"
* cost: (string) what equation to calculate the cost of the license. Will be eval'd at claim time.
* iconIndex: (int) What icon to show?
* iconIndexInactive: (int) What icon to show when not yet claimed
* x: (int) x position on the board.
* y: (int) y position on the board.
* iconIndexBackground: (optional) (int) 0 or 1 to have backgrounds. Omit if you don't want a background.

## Terms of Use:

Free for both commercial and non-commercial use, with credit.

More Gimmer_ plugins at: https://github.com/gimmer/RPG-Maker-MV-Plugins

##Credits:
[Codapill](codapill.com) for all graphical assets provided!
[xiamumomo]() for the updated regulra and large iconset to support for xparams and sparams!