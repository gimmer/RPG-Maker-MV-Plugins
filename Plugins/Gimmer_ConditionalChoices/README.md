## Gimmer_ConditionalChoices

Allows you to run plugin commands before a choice box that determins how the set of choices will be displayed

Requires Gimmer_Core

### Text Tutorial

1. Install plugin
2. Install Gimmer_Core
3. In the event page, before the choice command, run the plugin command that does what you want:

* To Hide or disable an option:

```cchoices hide/disable \[choiceNumberInList\] "equation using var:num or switch:number and ==, &&, and \|\| operators"```

* To change the text of an option:

```cchoices change \[choiceNumberInList\] "equation using var:num or switch:number and ==, &&, and \|\| operators" "Replacement text"```

**NOTE**: For both options, the quotation marks are not optional: they allow for spaces between the commands that MV normally does not allow

4. Run the choice box with all the options in the order that you want them to appear.


## Terms of Use:

Free for both commercial and non-commercial use, with credit.

More Gimmer_ plugins at: https://github.com/gimmer/RPG-Maker-MV-Plugins