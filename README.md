# lpd8806-asyncfx
This is a wrapper library for [lpd8806-async](https://www.npmjs.org/package/lpd8806-async). The intention of this is to act as an animation/led sequence library.

It is based heavily off of a [library](https://github.com/v0od0oChild/MuzzleyGalileoDemos/blob/master/lib/ledStripe.js) written by [v0od0oChild](https://github.com/v0od0oChild)

### Install
```
npm install lpd8806-asyncfx
```

### Example

```javascript
// It takes one parameter, the number of leds on the strip.
// In this example, it's 32 leds.
var leds = require('lpd8806-asycnfx')(32);

leds.rainbow(1, 25);

// After nodejs shuts down (ctrl+c), this runs so it can turn off the LED's
process.on('SIGINT', function() {
    leds.off();
    // Trigger exit process
    process.exit(0);
});
```

TODO: Add more animation sequences!
