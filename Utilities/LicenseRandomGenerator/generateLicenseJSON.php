<?php
//This is just a quick program to randomly generate some license data
$x = 0;
$y = 0;
$licenses = [];
$skills = [];
$brownOnWhat = "odd";
while(count($licenses) < 500){
	$madeLicenses = false;
	$license = generate($x,$y,$brownOnWhat);
	if($license['type'] !== 'skill' || ($license['type'] === 'skill' && !in_array($license['value'],$skills))){
		$licenses[] = $license;
		if($license['type'] === 'skill'){
			$skills[] = $license['value'];
		}
		$madeLicenses = true;
	}

	if($madeLicenses){
		$x++;
		if($x === 20){
			$y++;
			$x = 0;
			$brownOnWhat = ($brownOnWhat === "odd" ? "even" : "odd");
		}
	}
}

file_put_contents('Licenses.json',json_encode($licenses, JSON_PRETTY_PRINT));
echo "Hooray!";


function generate($x, $y, $brownOnWhat){
    $types = ['attribute','attribute','attribute','attribute','attribute','attribute','attribute','attribute','attribute','skill','nope'];
    shuffle($types);
    $type = $types[0];
    $functionName = "generate_".$type;
    $array = $functionName();
    $array['x'] = $x;
    $array['y'] = $y;
    if($array['type'] !== 'nope'){
        $array['iconIndexBackground'] = (check($x) === $brownOnWhat ? 1 : 0);
    }
    return $array;
}

function getRandFromValid($valid){
	$keys = array_keys($valid);
	$choice = rand(0,count($keys) - 1);
	return ['target'=>$keys[$choice], 'label'=> $valid[$keys[$choice]]];
}

function generate_attribute(){
	$valid = [0 => "HP",1=>"MP", 2=>"STR",3=>"DEF",4=>"MAT",5=>"MDF",6=>"AGI",7=>"LUK"];
	$stuff = getRandFromValid($valid);
    $activeMode = 32;
    $inactiveMod = 16;
	$description = "Gain +10 ".$stuff['label'];
	$type = "attribute";
	$target = (int) $stuff['target'];
	$value = 10;
	$cost = 1;
	$iconIndex = (int) $stuff['target'] + $activeMode;
	$iconIndexInactive = (int) $stuff['target'] + $inactiveMod;

	return compact('description','type','target','value','cost','iconIndex','iconIndexInactive');
}

function generate_nope(){
    return ['type'=>'nope','description'=>'','target'=>'','value'=>'','cost'=>0,'iconIndex'=>2,'iconIndexInactive'=>2];
}

function generate_skill(){
    $valid = [3,4,5,8,9,10,11];
	$stuff = getRandFromValid($valid);

	$description = "Gain New Power";
	$type = "skill";
	$target = "magic";
	$value = $stuff['target']."";
	$cost = 1;
	$iconIndex = 42;
	$iconIndexInactive = 26;

	return compact('description','type','target','value','cost','iconIndex','iconIndexInactive');
}

function dd($whatever){
	var_dump($whatever);
	die();
}

function check($number){
    if($number % 2 == 0){
        return "even";
    }
    else{
        return "odd";
    }
}