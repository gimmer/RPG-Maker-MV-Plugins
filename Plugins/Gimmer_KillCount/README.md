## Gimmer_KillCount

Used to track kills of a given enemy. Set the variableId you want to track kills in the plugin parameters.

Run the plugin command to start counting kills of a given enemyId:

**Note**: starting a new tracking will reset the current kill count if the same variable is used

startKillCount enemyId variableId

E.G. "startKillCount 3 10" to track enemyId 3 in variable 10

Run the plugin command to stop counting kills of a given enemyId 

**Note**: Stopping a kill count does not reset the variable. You'll have to reset it manually if you don't run reset kill count first

stopKillCount enemyId

Run the plugin command to reset kill count of a given enemyId

resetKillCount enemyId



## Terms of Use:

Free for both commercial and non-commercial use, with credit.

More Gimmer_ plugins at: https://github.com/gimmer/RPG-Maker-MV-Plugins