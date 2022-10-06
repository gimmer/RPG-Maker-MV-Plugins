const mapZone = $('#import-map');
let width = 0;
let height = 0;
mapZone.on('dragover', handleDragOver);
mapZone.on('drop', handleMapDrop);
function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.originalEvent.dataTransfer.dropEffect= 'copy'; // Explicitly show this is a copy.
}
function handleMapDrop(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    const fileList = evt.originalEvent.dataTransfer.files;
    readImage(fileList[0]);
    mapZone.hide();
}

readImage = (file) => {
    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
        let image = new Image();
        image.src = event.target.result;
        const uploaded_image = event.target.result;
        image.onload = function() {
            width = this.width;
            height = this.height;
            $('#display-map').css('width',width+'px').css('height',height+'px');
            document.querySelector("#display-map").style.backgroundImage = `url(${uploaded_image})`;
            applyGrid();
            $('#startEvent').show();
        };

    });
    reader.readAsDataURL(file);
}

applyGrid = () => {
    const mapHolder = $('#display-map');
    const numPerLine = width / 48;
    const numLines = height / 48;
    for(let y = 0; y < numLines; y++) {
        for (let x = 0; x < numPerLine; x++) {
            mapHolder.append('<div id="'+x+'-'+y+'" data-x="' + x + '" data-y="' + y + '" class="grid-box"></div>')
        }
    }
}

let selectedX = -1;
let selectedY = -1;
let eventStarted = false;
let currentEnemyIndex = 0;
let lines = [];
let enemies = [];
let heroes = [];
let currentHeroIndex = 0;
let enemyDefaults = {};
let settingMode = 'enemy';
let finishedEventTiles = [];
$(document).on('click','.grid-box', function(e){
    e.preventDefault();

    if(settingClick){
        const x = Number($(this).data('x'));
        const y = Number($(this).data('y'));
        const box = $('#'+settingClick);
        $('.grid-box').removeClass('enemy-box').removeClass('hero-box');
        let myClass;
        if(settingMode === 'enemy'){
            myClass = 'enemy-box';
        }
        else{
            myClass = 'hero-box';
        }
        if(x === selectedX && y === selectedY){
            box.val(selectedX+","+selectedY);
            settingClick = false;
            $('.set-position').html('set');
            $('.grid-box').removeClass('hero-box').removeClass('enemy-box');
        }
        else{
            selectedX = x;
            selectedY = y;
            $(this).addClass(myClass);
        }
    }
});

$('#startEvent').on('click', function(e){
    e.preventDefault();
    $(this).hide();
    $('#addEnemy').show();
    $('#addHero').show();
    $('#addEnemyDefaults').show();
    currentEnemyIndex = 0;
    currentHeroIndex = 0;
    enemies = [];
    heroes = [];
    enemyDefaults = {}
    eventStarted = true;
    $('#output').html('');
});

$('#addEnemy').on('click', function(e){
    settingMode = 'enemy';
    e.preventDefault();
    currentEnemyIndex++
    $('.addingButton').hide();
    $('#saveEnemy').show();
    $('#enemyPlacement').show();
    setHeader('Enemy '+currentEnemyIndex);
});

$('#addEnemyDefaults').on('click', function(e){
    settingMode = 'enemy';
    e.preventDefault();
    $('.addingButton').hide();
    $('#saveEnemyDefaults').show();
    $('#enemyPlacement').show();
    setHeader('Enemy Defaults');
});

$('#addHero').on('click', function(e){
    settingMode = 'hero';
    e.preventDefault();
    if(heroes.length >= 4){
        showError('You already planned all 3 heroes');
    }
    else{
        $('.addingButton').hide();
        currentHeroIndex++
        $('#saveHero').show();
        setHeader('Hero '+currentHeroIndex);
        $('#enemyPlacement').show();
        $('.not-for-heroes').hide();
    }
});

$('#saveHero').on('click', function(e){
    e.preventDefault();
    heroes[currentHeroIndex] = {};
    if(saveEnemyData(heroes[currentHeroIndex])){
        $('.addingButton').show();
        $('.savingButton').hide();
        $('#enemyPlacement').hide();
        $('.not-for-heroes').show();
        clearPlacementForm();
        showAllSavedObjectPlacements();
        generateLines();
        checkForFinish();
    }
    else{
        clearPlacementForm();
        $('.addingButton').show();
        $('.savingButton').hide();
        $('#enemyPlacement').hide();
        $('.not-for-heroes').show();
        currentHeroIndex--;
    }
});

$('#saveEnemyDefaults').on('click', function(e){
    e.preventDefault();
    if(saveEnemyData(enemyDefaults)){
        $('.addingButton').show();
        $('.savingButton').hide();
        $('#enemyPlacement').hide();
        clearPlacementForm();
        generateLines();
        showAllSavedObjectPlacements();
        checkForFinish();
    }
    else{
        clearPlacementForm();
        $('.addingButton').show();
        $('.savingButton').hide();
        $('#enemyPlacement').hide();
    }
});

$('#saveEnemy').on('click', function(e){
    e.preventDefault();
    enemies[currentEnemyIndex] = {};
    if(saveEnemyData(enemies[currentEnemyIndex])){
        $('.addingButton').show();
        $('.savingButton').hide();
        $('#enemyPlacement').hide();
        clearPlacementForm();
        generateLines();
        showAllSavedObjectPlacements();
        checkForFinish();
    }
    else{
        clearPlacementForm();
        $('.addingButton').show();
        $('.savingButton').hide();
        $('#enemyPlacement').hide();
        currentEnemyIndex--;
    }
});

let settingClick = false;
$('.set-position').on('click', function(){
    if(!settingClick){
        settingClick = $(this).data('target');
        $(this).html('double click to save');
    }
});

$('#finishEvent').on('click', finishEvent);

function clearPlacementForm() {
    $('#enemyImage').val('');
    $('#enemyImageIndex').val(-1);
    $('#enemyStartPos').val('');
    $('#enemyPos').val('');
    $('#enemyPlacementSelect').val('default');
}

function generateLines(){
    let output = "";

    enemies.forEach((enemy, key) => {
        if(enemy.hasOwnProperty('pos')){
            output += "e"+key+':pos:'+enemy.pos+"\r\n";
        }
        if(enemy.hasOwnProperty('startpos')){
            output += "e"+key+':startpos:'+enemy.pos+"\r\n";
        }
        if(enemy.hasOwnProperty('image')){
            output += "e"+key+':image:'+enemy.image+"\r\n";
        }
        if(enemy.hasOwnProperty('t')){
            output += "e"+key+':t:'+enemy.t+"\r\n";
        }
    })

    heroes.forEach((hero, key) => {
        if(hero.hasOwnProperty('pos')){
            output += "h"+key+':pos:'+hero.pos+"\r\n";
        }
        if(hero.hasOwnProperty('t')){
            output += "h"+key+':t:'+hero.t+"\r\n";
        }
    })

    if(enemyDefaults.hasOwnProperty('startpos')){
        output += "ea:startpos:"+enemyDefaults.startpos+"\r\n";;
    }
    if(enemyDefaults.hasOwnProperty('pos')){
        output += "ea:pos:"+enemyDefaults.pos+"\r\n";;
    }
    if(enemyDefaults.hasOwnProperty('image')){
        output += "ea:image:"+enemyDefaults.image+"\r\n";;
    }
    if(enemyDefaults.hasOwnProperty('t')){
        output += "ea:t:"+enemyDefaults.t+"\r\n";
    }

    $('#output').html(output);
}

function finishEvent(){
    enemies.forEach((enemy) => {
        if(enemy.hasOwnProperty('pos')){
            finishedEventTiles.push(enemy.pos.replace(',','-'));
        }
        if(enemy.hasOwnProperty('startpos')){
            finishedEventTiles.push(enemy.startpos.replace(',','-'));
        }
    });

    heroes.forEach((hero) => {
        if(hero.hasOwnProperty('pos')){
            finishedEventTiles.push(hero.pos.replace(',','-'));
        }
    });

    if(enemyDefaults.hasOwnProperty('startpos')){
        finishedEventTiles.push(enemyDefaults.startpos.replace(',','-'));
    }

    generateLines();
    showOldEvents();

    currentEnemyIndex = 0;
    currentHeroIndex = 0;
    enemies = [];
    heroes = [];
    enemyDefaults = {}
    eventStarted = false;
    $('.step').hide();
    $('#startEvent').show();

}

function showOldEvents(){
    $('.historical-box').removeClass('historical-box');
    finishedEventTiles.forEach((id) => {
       $('#'+id).addClass('historical-box');
    });
}

function showAllSavedObjectPlacements(){
    $('.grid-card').removeClass('hero-box__sticky').removeClass('enemy-box__sticky').removeClass('.enemy-default-box__sticky');
    enemies.forEach((enemy)=>{
       if(enemy.hasOwnProperty('pos') && enemy.pos.length){
           $('#'+enemy.pos.replace(',',"-")).addClass('enemy-box__sticky');
       }
       if(enemy.hasOwnProperty('startpos') && enemy.startpos.length){
           $('#'+enemy.startpos.replace(',',"-")).addClass('enemy-box__sticky');
       }
    });

    heroes.forEach((hero)=>{
        if(hero.hasOwnProperty('pos') && hero.pos.length){
            $('#'+hero.pos.replace(',',"-")).addClass('hero-box__sticky');
        }
    });

    if(enemyDefaults.hasOwnProperty('pos')){
        $('#'+enemyDefaults.pos.replace(',',"-")).addClass('enemy-default-box__sticky');
    }

    if(enemyDefaults.hasOwnProperty('startpos')){
        $('#'+enemyDefaults.startpos.replace(',',"-")).addClass('enemy-default-box__sticky');
    }
}

function saveEnemyData(destination){
    if(destination !== enemyDefaults || validateEnemyForDefaults()){
        if($('#enemyImage').val().length && $('#enemyImageIndex').val() >= 0){
            destination['image'] = $('#enemyImage').val() + ","+$('#enemyImageIndex').val();
        }
        if($('#enemyStartPos').val().length){
            destination['startpos'] = $('#enemyStartPos').val();
        }
        if($('#enemyPos').val().length){
            destination['pos'] = $('#enemyPos').val();
        }
        if($('#enemyPlacementSelect').val() !== 'default'){
            destination['t'] = $('#enemyPlacementSelect').val();
        }
        if(Object.keys(destination).length > 0){
            showSuccess("Data Saved");
            return true;
        }
        else{
            showError("No values are valid, not saved");
            return false;
        }
    }
    return false;
}

function validateEnemyForDefaults() {
    let valid = true;
    if($('#enemyImage').val() === ""){
        showError('You need a default image.');
        valid = false;
    }
    if(Number($('#enemyImageIndex').val()) === -1){
        showError('You need a default image index');
        valid = false;
    }
    if($('#enemyStartPos').val() === ""){
        showError("You need a default start position.");
        valid = false;
    }
    if($('#enemyPlacementSelect').val() === "default"){
        showError("You can't set the default transition to the default");
    }
    return valid;
}

function checkForFinish(){
    if(heroes.length > 0 && enemies.length > 0){
        $('#finishEvent').show();
    }
    else{
        $('#finishEvent').hide();
    }
}

function setHeader(text){
    $('#form-header').html(text);
}

function showError(text){
    const toast =  new bootstrap.Toast(document.getElementById('toaster'));
    toast.hide();
    $('#toaster').removeClass('bg-success').addClass('bg-danger');
    $('.toast-body').html(text);
    toast.show();
}

function showSuccess(text){
    const toast =  new bootstrap.Toast(document.getElementById('toaster'));
    toast.hide();
    $('#toaster').removeClass('bg-danger').addClass('bg-success');
    $('.toast-body').html(text);
    toast.show();
}