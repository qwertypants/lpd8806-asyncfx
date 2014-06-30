var leds = require('lpd8806-asycnfx')(32);

leds.rainbow(1, 25);

// After nodejs shuts down (ctrl+c), this runs so it can turn off the LED's
process.on('SIGINT', function() {
    leds.off();
    // Trigger exit process
    process.exit(0);
});
