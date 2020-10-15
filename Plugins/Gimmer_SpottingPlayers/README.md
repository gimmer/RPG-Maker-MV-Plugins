## Gimmer_SpottingPlayers

A plugin that allows events to be given cones of vision, and to run a common event when the player enters their line of sight

### How to Use
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