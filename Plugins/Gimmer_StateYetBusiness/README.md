## Gimmer_StateYerBusiness

This plugin is meant for debugging / testing, and likely shouldn't ship enabled unless you're using it in a unique way.

This replaces the title screen.

Use the plugin parameters to set collections of states for fast game testing.
You can also set a global state that all the other states will use.
Individual states will win out over global states.

The values you can set are:
- A label to indicate what state it is.
- A set of switches to turn on.
- A set of variables and their values (either numeric or text).
- A set of selfswitches to be set on.
- A set of items and their quantity.
- Transfer coordinates to indicate where to start the player.
- A common event to run when the game starts.
- A set of plugin commands to execute.
- A raw javascript snippet to execute.

Loading a given state will give you the same things that a new game does, and then all the state's values will be applied.

Happy testing!


### Terms of Use:

Free for both commercial and non-commercial use, with credit.

More Gimmer_ plugins at: https://github.com/gimmer/RPG-Maker-MV-Plugins