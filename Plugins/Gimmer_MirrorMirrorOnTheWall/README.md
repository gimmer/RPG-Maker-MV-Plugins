## Gimmer_MirrorMirrorOnTheWall

Plugin to create mirrors on the map

1. Create a transparent tile on the map
2. Put an event on the map. It can have a tile if you want, but that tile needs to be at least somewhat translucent
3. Add <mirror> to the event's note tag.
4. Walk in front of the tile, see the reflection!

Any event with a _characterName set will be reflected in the mirror.
Tiles in front of the mirror will be reflected

#### Note: Tiles are not inverted when reflected, try to make the terrain direction agnostic when in front of a mirror

### Version History:
- 0.1: Released
- 1.1: Added optional alternative reflection support for the main character
- 1.1.1: Fix bug with character index not working if you overwrote the character
- 1.2: Added a plugin command for swapping the play override
- 1.2.1: Added a plugin command for to clear player overrides
- 1.3: Bug fix for direction fix

## Terms of Use:

Free for both commercial and non-commercial use, with credit.

More Gimmer_ plugins at: https://github.com/gimmer/RPG-Maker-MV-Plugins
