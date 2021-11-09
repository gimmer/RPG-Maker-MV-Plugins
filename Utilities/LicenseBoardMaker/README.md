# mapConverter.html
### Convert a map into a license board
### For use the with Gimmer_LicenseBoard plugin

1. Create a new RPG Maker MV project
2. Remove all tile sets
3. Add a new tile set, with everything blank except for A5, which uses the provided License_Tileset.png
4. Create a new map X by Y to match the square of your license board
5. Paint out your tiles however you like, baring in mind that the black tiles cannot be passed through by the cursor. Everything either needs a stat of a black square.
6. Add regionIds to the tiles to have the following effects:
    * On attributes, this is the amount of the attribute they will get
    * On weapons / armor tiles, this is the corresponding weaponId or armorId they will learn to use
    * Skills are different, see below
7. On any skill / magic nodes, add a blank event. Define in this event the following notes:
    * \<description:whatever> to be the description
    * \<cost:whatever> to be the cost
    * \<value:1,2,3> to be the skills learned. Can be a single value as well
8. (optional) On any other node, you can a blank event with the description, cost, or value tags (as seen in step 7) in order to define those statically, otherwise defaults will be calculated / set.
9. Add to the map the following notes that will act as equations used to calculate license costs based on type and value
    * \<hp: ...>
    * \<mp: ...> 
    * \<atk: ...>
    * \<def: ...>
    * \<mat: ...>
    * \<mdf: ...>
    * \<agi: ...>
    * \<luk: ...>
    * \<weapon: ...>
    * \<armor: ...>
    * The values for the equations can either be relative to the value of the node (for attributes):
        * EG: \<hp:v/10> would mean "HP nodes cost the value they give divided by 10 points to buy"
    * Or can be static:
        * EG: \<weapon:10> would mean all weapon nodes cost 10 points.
    * Or can include the function "numLicenses()" to resolve the number of license the actor already has
      * EG: \<hp:1*numLicenses()> would cost 0 LP for the first license, 1 for the second, 2 for the third, 4 for the forth, etc.
    * Or can include the function "numLicensesOfType()" to resolve to the number of licenses the actor has of the same type
      * EG: \<hp:1*numLicensesOfType()> would cost 0 LP for the first license of type HP, 1 for the second, 2 for the third, etc. Getting other licenses wouldn't change this equation.
10. Save the map
11. Double click on "mapConverter.html" and open it in your web browser.
12. Drag the Map000x.json file from the project's data folder onto the "Drag Here" square.
13. Save the Licenses.json file it creates in the data folder of your project

##Credits:
[Codapill](codapill.com) for all graphical assets provided!  
[xiamumomo]() for the updated map tileset for xparams and sparams
