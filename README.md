# BETTER alt:V Radio support v15 audio API

ONLY AVAILABLE FOR alt:V 15.xx version

BETTER alt:V Radio resource replaces the default GTA V vehicle radio with custom online 
radio stations.

I'm using the vehicle as audio emitter

3d AUDIO
Volume Control

Previews: 
https://streamable.com/9eejd6

https://streamable.com/ccbvrr

https://streamable.com/ehu3ct


## Installation

Download the resource and add it to resources folder of your server and 
add it to the `server.toml`.

## Usage

There are currently some default stations loaded into the radio. If you 
wish to change them and add yours, go to `/server/config.mjs`. There 
you will find an array of radio stations.

Audio API requires 2 channels, 16 bit, 48000 Hz audio format

You can edit maximum audio range in client.mjs line 17
```js
    category.volume =30;
```

For QWERTY keyboard, replace "eu" by "us" in radio.html line 139 and 147

### Radio Station Object format

```js
{
    name: 'Name of the radio station',
    url: 'Radio station\'s stream url',
    image: 'Radio station\'s logo image',
    volume: 60 // This is optional, default volume is 40
}
```

##  TO DO

Remove logs

Add ui for volume change

Manage multiple audio sources

Key bindings

### In-game usage

While in a vehicle, scroll the mouse wheel while holding the A key.
Change volume using , (; for EU) INPUT_VEH_PREV_RADIO


## Known issues

Only one station is available

##  CREDITS

https://github.com/jovanivanovic/altv-radio for the menu

alt:V team for the wonderful audio API and platform

Thanks to splak for the optimization help

Jlawster for the improvements 

## License

[MIT](http://opensource.org/licenses/MIT)
