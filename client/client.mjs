import * as alt from 'alt';
import * as native from 'natives';

let browser = undefined;
let pedInSeat = undefined;
let mounted = false;
let player = alt.Player.local;
let focused = false;
let isInVehicle = false;
let stationsQueue = [];
let audio;
let output;
let playing = 0;
let usedVehicles = [];

let usedVehicle = new Map();

let currentVehicleRadio = 0;

// custom object

function radio(station, volume, playing, audio){
    this.station = station; 
    this.volume = volume;
    this.playing = playing;
    this.audio = audio; 
    this.show=function(){ // method show
      console.log(this.station + " " + this.volume + this.playing + " " + this.audio);
    };
  }

// Define range of audio
const category = alt.AudioCategory.getForName("radio");
category.volume =30;

// Disable base game musics

native.startAudioScene('DLC_MPHEIST_TRANSITION_TO_APT_FADE_IN_RADIO_SCENE')


function checkVehicle(vehicle){

    if(usedVehicles.length != 0){
    for(let i = 0; i < usedVehicles.length; i++){
        alt.log(i)
        if(usedVehicles[i].id != vehicle.id){
            i++
        } 
            return true;

    }

}else {
    return false;
}}

function listUsedVehicles(usedVehicle){
    // for(let i=0; i<usedVehicle.size;i++){
    //     alt.log(usedVehicle.get(i).show());
    // }

    const iterator1 = usedVehicle.values();

    console.log(iterator1.next().value);

    console.log(iterator1.next().value);
}

function getStation(vehicle) {
    // TO DO Get vehicle station
}

function getAudioVolume(vehicle, audio){

}

alt.onServer('playerEnteredVehicle', (vehicle, seat) => {

    alt.emitServer('radio:GetRadioStations');

    browser = new alt.WebView('http://resource/ui/radio.html');

    pedInSeat = seat;
    isInVehicle = true;



    // ALTV V15 AUDIO
    browser.on('radio:isplaying', (radiostat) => {
        alt.log(checkVehicle(player.vehicle));
        if( true ){ 
       alt.log('vehicle ' + player.vehicle);
        output = new alt.AudioOutputAttached(player.vehicle);
        audio = new alt.Audio(radiostat,0.1,true);
        audio.on("inited", () => { alt.log(`inited`); });
        console.log(output.filter);
        audio.addOutput(output);
        audio.play();
        usedVehicles.push(player.vehicle);
        playing = 1;
            alt.log("YOUPI" + radiostat)
        let wow = new radio(radiostat,audio.volume,true,audio);
        wow.show();
        usedVehicle.set(player.vehicle.id, wow);
        alt.log(listUsedVehicles(usedVehicle));
        alt.log("audio " + audio.value)
        }
        // audio.play();
        // alt.log("OUTPUTS " + audio.getOutputs()[0]);
        // alt.log(JSON.stringify(audio)) + " " + JSON.stringify((output));
        });
        browser.on('radio:ismoving',() => {
            if(playing == 1 && audio.playing == true){ alt.log("TYYE")
            audio.destroy()}
            playing = 0;
            });
        
    browser.on('radio:StationChanged', radioStation => {
        
        alt.emitServer('vehicle:RadioChanged', player.vehicle, radioStation);
    });

    browser.on('browser:mounted', () => {
        mounted = true;

        if (stationsQueue.length > 0) {
            stationsQueue.forEach((station, index) => {
                browser.emit('addRadioStation', station);
                delete stationsQueue[index];
            });
        }

        currentVehicleRadio = player.vehicle.getStreamSyncedMeta('radioStation')
            ? player.vehicle.getStreamSyncedMeta('radioStation')
            : currentVehicleRadio;
        browser.emit('switchRadio', currentVehicleRadio);
    });
    
    
  
});

alt.onServer('playerLeftVehicle', (vehicle, seat) => {
    browser.unfocus();
    browser = undefined;
    pedInSeat = undefined;
    isInVehicle = false;
    mounted = false;
});



alt.onServer('radio:AddStation', station => {
    if (mounted) {
        browser.emit('addRadioStation', station);
    } else {
        stationsQueue.push(station);
    }

    alt.log(JSON.stringify(station));
});

alt.on('streamSyncedMetaChange', (entity, key, value) => {
    if (entity != player.vehicle || key != 'radioStation' || player.seat == 1) return;

    if (browser && mounted)
    
        browser.emit('switchRadio', value);

});

alt.everyTick(() => {
    if (isInVehicle) {
        native.disableControlAction(0, 85, true);
    } else {
        native.enableControlAction(0, 85, true);
    }

    if (focused) {
        native.disableControlAction(0, 99, true);
        native.disableControlAction(0, 100, true);
    } else {
        native.enableControlAction(0, 99, true);
        native.enableControlAction(0, 100, true);
    }

   
});

alt.on('keydown', key => {
    if (isInVehicle == true && native.isControlPressed(0, 152) == true && browser) {
        
        const pedInSeat = native.getPedInVehicleSeat(player.vehicle.scriptID, -1, false);
        if (pedInSeat !== player.scriptID) return;

        browser.focus();
        focused = true;
        browser.emit('focus');
    }

    if (isInVehicle == true && native.isControlPressed(0, 82) == true && browser) {
        
        audio.volume == 1? audio.volume = 0.1: audio.volume += 0.1;
        alt.log(audio.volume);
        alt.log("test" + audio.source);
    }
});

alt.on('keyup', key => {
    if (native.isControlPressed(0, 152) == true && browser) {
        const pedInSeat = native.getPedInVehicleSeat(player.vehicle.scriptID, -1, false);
        if (pedInSeat !== player.scriptID) return;

        browser.unfocus();
        focused = false;
        setTimeout(() => {
            if (browser)
                browser.emit('unfocus');
        }, 700);
    }
});