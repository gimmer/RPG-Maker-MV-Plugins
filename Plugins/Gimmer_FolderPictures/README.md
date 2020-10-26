## Gimmer_FolderPictures

Allows you to save pictures into folders, and use them.

There are two ways to use them.

#### Video Tutorial:

View Here: https://youtu.be/07WOFNOOx9I

#### Text Tutorial:

The plugin command:

ShowPicture ID Filename X Y Scale-W Scale-H BlendOpacity BlendMode

Required Arguments and their accepted inputs:
 * ID = Any number handle you want to use to manipulate the image
 * Filename = Filename/with/unlimited/folders/relative/to/the/pictures/directory
 * X = Integer, var:num if you want to use the value in a variable, anything with Graphics. in it will be evaluated like a javascript entry
 * Y = Integer, var:num if you want to use the value in a variable, anything with Graphics. in it will be evaluated like a javascript entry
 * Scale-W = Number
 * Scale-H = Number
 * BlendOpacity = 0 to 255
 * BlendMode = 0,1,2,3 (Normal, Additive, Multiply, Screen). Tbh, not sure if these work because I don't know what they mean

 #### Or
 Follow the following steps:
  * Make a picture in the root img/pictures directory with the following format (it can be 0 kb):
  folderpicture_path_to_the_image.png
  * Put Show Picture into your code, and select that picture. The interface will let you choose it. What will really load is the real picture that you put in img/pictures/path/to/the/image.png
  * Be done