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
let usedVehicle = new Map();

let currentVehicleRadio = 0;

// custom object

function radio(station, volume, playing, audio, output){
    this.station = station; 
    this.volume = volume;
    this.playing = playing;
    this.audio = audio;
    this.output = output; 
    this.show=function(){ // method show
      console.log(this.station + " " + this.volume + this.playing + " " + this.audio);
    };

    this.clear=function(){ // method clear
        this.station = 0; 
        this.volume = 0;
        this.playing = false; 
        this.output.destroy();
        this.audio.destroy();
       
      };

  }

// Define range of audio
const category = alt.AudioCategory.getForName("radio");
category.volume =30;

// Disable base game musics

native.startAudioScene('DLC_MPHEIST_TRANSITION_TO_APT_FADE_IN_RADIO_SCENE')


function listUsedVehicles(usedVehicle){
    const iterator1 = usedVehicle.values();

    console.log(iterator1.next().value);

    console.log(iterator1.next().value);
}

// Check if the vehID is in the map usedVehicle
function checkVehicle(vehicleId) {

    const iterator1 = usedVehicle.keys();

    for(let i = 0; i < usedVehicle.size; i++){
        if(iterator1.next().value != vehicleId) {
            // alt.log(iterator1.value +' nope');
        }
        else {
            // alt.log(iterator1.value +' YES');
            return true;
        }
    }
    return false;
}

alt.onServer('playerEnteredVehicle', (vehicle, seat) => {

    alt.emitServer('radio:GetRadioStations');

    browser = new alt.WebView('http://resource/ui/radio.html');

    pedInSeat = seat;
    isInVehicle = true;



    // ALTV V15 AUDIO
    browser.on('radio:isplaying', (radiostat) => {
        if(  !checkVehicle(player.vehicle.id) && radiostat != "off" ){ // Check if the current vehicle isn't already playing
    //    alt.log('vehicle ' + player.vehicle);
        output = new alt.AudioOutputAttached(player.vehicle);
        audio = new alt.Audio(radiostat,0.1,true);
        audio.on("inited", () => { alt.log(`inited`); });
        // console.log(output.filter);
        audio.addOutput(output);
        audio.play();
            // alt.log("Playing " + radiostat)
        let newRadio = new radio(radiostat,audio.volume,true,audio, output);
        newRadio.show();
        usedVehicle.set(player.vehicle.id, newRadio);
        // alt.log(listUsedVehicles(usedVehicle));
        // alt.log("audio " + audio.value)
        } else {
            if(radiostat == "off"){
                let newRadio  = new radio(radiostat, 0, 0, 0, 0);
                usedVehicle.set(player.vehicle.id, newRadio);
            } else {
                browser.emit('changeVolume', usedVehicle.get(player.vehicle.id).audio.volume);
            }
        }
        });
        browser.on('radio:ismoving',() => {
            if(usedVehicle.get(player.vehicle.id).station != "off")
        {
            usedVehicle.get(player.vehicle.id).clear()
        }
            usedVehicle.delete(player.vehicle.id)
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



    if (isInVehicle == true && native.isControlPressed(0, 82) == true  && usedVehicle.get(player.vehicle.id).station != "off") {
        alt.log(usedVehicle.get(player.vehicle.id).station)
        let vehVol = usedVehicle.get(player.vehicle.id);
        vehVol.audio.volume == 0.1? vehVol.audio.volume = 1: vehVol.audio.volume -= 0.1;
        vehVol.volume = vehVol.audio.volume;
        alt.log(audio.volume);
        browser.emit('changeVolume', vehVol.volume);
        browser.focus();
        focused = true;
        browser.emit('focus');
       
    }

    if (isInVehicle == true && native.isControlPressed(0, 81) == true && browser && usedVehicle.get(player.vehicle.id).station != "off") {
        
        let vehVol = usedVehicle.get(player.vehicle.id);
        vehVol.audio.volume == 1? vehVol.audio.volume = 0.1: vehVol.audio.volume += 0.1;
        vehVol.volume = vehVol.audio.volume;
        alt.log(audio.volume);
        browser.emit('changeVolume', vehVol.volume);
        browser.focus();
        focused = true;
        browser.emit('focus');
       
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

    if (isInVehicle == true && native.isControlPressed(0, 82) == false && browser) {
        
        browser.unfocus();
        focused = false;
        browser.emit('unfocus');
       
    }

    if (isInVehicle == true && native.isControlPressed(0, 81) == false && browser) {
        
        browser.unfocus();
        focused = false;
        browser.emit('unfocus');
       
    }
});