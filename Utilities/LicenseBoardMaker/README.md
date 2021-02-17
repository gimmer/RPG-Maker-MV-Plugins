# mapConverter.html
### Convert a map into a license board
### For use the with Gimmer_LicenseBoard plugin

1. Create a new RPG Maker MV project
2. Remove all tile sets
3. Add a new tile set, with everything blank except for A5, which uses the provided License_Tileset.png
4. Create a new map X by Y to match the square of your license board
5. Paint out your tiles however you like, baring in mind that the black tiles cannot be passed through by the cursor
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
    * \<hp: ...> : This would mean .
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
10. Save the map
11. Double click on "mapConverter.html" and open it in your web browser.
12. Drag the Map000x.json file from the project's data folder onto the "Drag Here" square.
13. Save the Licenses.json file it creates in the data folder of your project

##Credits:
[Codapill](codapill.com) for all graphical assets provided!  