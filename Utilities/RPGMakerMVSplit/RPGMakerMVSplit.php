<?php 

define("OUTPUT_PATH","");
define("SOURCE_PATH","");

if(SOURCE_PATH == ""){
	die("Remember to set SOURCE_PATH");
}

if(OUTPUT_PATH == ""){
	die("Remember to set OUTPUT_PATH");
}

$files = [
	'core' => 'rpg_core.js',
	'managers'=>'rpg_managers.js',
	'objects'=>'rpg_objects.js',
	'scenes'=>'rpg_scenes.js',
	'sprites'=>'rpg_sprites.js',
	'windows' => 'rpg_windows.js'
];

$filesCreated = [];

if(!is_dir(OUTPUT_PATH)){
		mkdir(OUTPUT_PATH);
	}

foreach($files as $dir => $sourceFile){
	$contents = file_get_contents(SOURCE_PATH . $sourceFile);
	$contents = preg_replace( "/(?:(?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/)|(?:(?<!\:)\/\/.*))/", "", $contents); //Yancharuk's code/regex for stripping comments

	if(!is_dir(OUTPUT_PATH . $dir)){
		mkdir(OUTPUT_PATH . $dir);
	}

	preg_match_all("/function ([a-zA-Z_]+\(\))/",$contents,$matches);

	$fileBreakDown = [];
	if(isset($matches[1])){
		foreach($matches[1] as $pos => $function){
			$outputFile = str_replace(["(",")"],"",$function);
			$position = strpos($contents,$matches[0][$pos]);
			$fileBreakDown[$outputFile] = $position;
		}
	}


	$startPosition = -1;
	$lastFile = null;
	foreach($fileBreakDown as $outputFile => $endPosition){
		if($startPosition >= 0){
			file_put_contents(OUTPUT_PATH . $dir . DIRECTORY_SEPARATOR  . $lastFile.".js", trim(substr($contents,$startPosition,$endPosition-$startPosition)));
			$filesCreated[] = $dir . "/" . $lastFile.".js";
		}
		$startPosition = $endPosition;
		$lastFile = $outputFile;
	}

	file_put_contents(OUTPUT_PATH. $dir . DIRECTORY_SEPARATOR  . $outputFile.".js", trim(substr($contents, $startPosition, strlen($contents) - $startPosition)));
	$filesCreated[] = $dir . "/"  . $lastFile.".js";
}
echo "Remove the source files from your index.html, and add these lines instead:".PHP_EOL;
foreach($filesCreated as $path){
	echo '<script type="text/javascript" src="js/output/'.$path.'"></script>'.PHP_EOL;
}	