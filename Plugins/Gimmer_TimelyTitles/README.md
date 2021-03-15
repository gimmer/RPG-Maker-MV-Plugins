## Gimmer_TimelyTitles

Show different title screens depending on the time of day (using the local player's timezone

### Text Tutorial:

You will require the following items:
* js/plugins: Gimmer_Core as my root plugin
* js/plugins: Gimmer_TimelyTitles

The only parameter to set is "Title Screen List"

Using the in game editor, double click on an empty entry in the list and it will prompt you to add an object with the following parameters:

* Start Time: time in 24hours to start the title screen
* End Time: time in 24 hours to end the title screen
* Title 1: The file you would pick for title 1
* Title 2: The file you would pick for title 2

On display of the title screen, the game will put the title that fits your provided timeframes.
If there is no title that works, it will display the default