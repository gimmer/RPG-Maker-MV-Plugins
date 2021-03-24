## Gimmer_ExtendMadeWithMVMoreFrames

This extends the "MadeWithMv" plugin by Liquidize that comes with MV.

The extension lets you have as many custom splash screens as you want.

Required edit:

Remove the part from line ~138:  
`(function() {`
Remove the part from line ~323:
`})()`

Without doing so, you cannot extend the plugiin as  "Scene_Splash" isn't defined in the global scope.

## Terms of Use:

Free for both commercial and non-commercial use, with credit.

More Gimmer_ plugins at: https://github.com/gimmer/RPG-Maker-MV-Plugins