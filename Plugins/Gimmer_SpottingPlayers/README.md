## Gimmer_SpottingPlayers

A plugin that allows events to be given cones of vision, and to run a common event when the player enters their line of sight

### Requirements
Gimmer_Core is required for this plugin to function.

### How to Use

#### Video Tutorial

View here: https://youtu.be/sW1RJ_Xm7h0

#### Text Tutorial

Include the following entry in the event's note field:
* canSpotPlayer:up-right-down-left (replacing each word with a number)

The number denotes how many squares the event can see in each given direction.

You'll have to set the following parameters:
* Common Event: the common event to run when spotted
* Map ID Variable: the variable to save the mapId the player is currently on
* Starting X Variable: The starting X for the player on a map
* Starting Y Variable: The starting Y for the player on a map
* Solid Wall Region Id: The regionId that represents something the NPC cannot see through and all vision should stop at.
* Track Spotter for Balloon: If true, when a player is spotted, the event that spotted the player will automatically be the target of the next "Show Balloon" command the game runs, in spite of whatever target you choose for Show Balloon. Don't want this? Change it to no
* Track Map Position: If true, the three variables above will be filled with the new MapId, X an Y position any time "Transfer Player" is done. Don't want to use them? Set this to false

### Plugin Commands

* ResetLevel: this will look for any common events on page that have "change switch to on" commands, and toggle them back off.
Call this if you want the players progress to be reset through a level.
* StopSpotting: call to prevent the player from being spotted anymore.
* StartSpotting: call to all the player to be spotted again.

## Terms of Use:

Free for both commercial and non-commercial use, with credit.

More Gimmer_ plugins at: https://github.com/gimmer/RPG-Maker-MV-Plugins