// Dependencies
var Color = require('color');
var LPD8806 = require('lpd8806-async');
var async = require('async');

module.exports = function(_ledCount) {
    var ledCount;
    if (typeof _ledCount !== 'number') {
        throw 'Invalid number of led\'s.';
    } else {
        ledCount = parseInt(_ledCount, 10);
    }
    // Internal reference to lpd8806-async
    var leds = new LPD8806(ledCount, '/dev/spidev1.0');
    leds.fillRGB(0, 0, 0); // Initialize off

    // Public methods
    // Base functions (mostly exposed fn's from 'lpd8806-async')
    // *****************************************************************************
    return {
        setBrightness: function(brightness) {
            if (brightness) leds.setMasterBrightness(brightness);
            console.log('[info]', 'Setting brightness', brightness);
        },
        // Returns an array of color values based on the passed in type. Defaults to RGB
        wheelColor: function(wheelPosition, type) {
            var color;
            if (wheelPosition) {
                switch (type) {
                    case 'rgb':
                        color = leds.wheel_color(wheelPosition).values[type];
                        break;
                    case 'hsl':
                        color = leds.wheel_color(wheelPosition).values[type];
                        break;
                    case 'hsv':
                        color = leds.wheel_color(wheelPosition).values[type];
                        break;
                    case 'cmyk':
                        color = leds.wheel_color(wheelPosition).values[type];
                        break;

                    default:
                        color = leds.wheel_color(wheelPosition).values.rgb;
                        break;
                }
            }
            return color;
        },
        // Stops current animation if one is running
        stopAnimation: function() {
            if (animationRunning) {
                stopAnimationRequest = true;
            }
        },
        update: function() {
            leds.update();
        },
        fillRGB: function(r, g, b) {
            switchAnimation(function() {
                console.log('[info]', 'Filling leds with', r, g, b);
                leds.fillRGB(r, g, b);
                stopAnimation();
            });
        },
        fillHSV: function(h, s, v) {
            switchAnimation(function() {
                console.log('[info]', 'Filling leds with', h, s, v);
                leds.fillHSV(h, s, v);
                stopAnimation();
            });
        },
        off: function() {
            console.log('[info]', 'Setting Leds Off');
            leds.allOFF();
            stopAnimation();
        },
        setPixelRGB: function(pixel, r, g, b) {
            switchAnimation(function() {
                leds.setPixelRGB(pixel, r, g, b);
                leds.update();
            });
        },
        setPixelHSV: function(pixel, h, s, v) {
            switchAnimation(function() {
                leds.setPixelHSV(pixel, h, s, v);
                leds.update();
            });
        },
        setPixelOff: function(pixel) {
            switchAnimation(function() {
                leds.setPixelOff(pixel);
            });
        },
        // Animation effects
        // *****************************************************************************
        // Lights a pixel on either end of the strip and joins them
        joinEffect: function(r, g, b, brightness) {
            switchAnimation(function() {
                console.log('[info]', 'Playing join animation', r, g, b, brightness);
                if (ledCount % 2 !== 0)--ledCount;
                brightness = brightness || 1.0;
                leds.setMasterBrightness(brightness);

                function performStep() {
                    if (stopAnimationRequest) {
                        stopAnimation();
                        return;
                    }
                    var j = 0;
                    leds.allOFF();
                    async.whilst(function() {
                        return (j < ledCount && !stopAnimationRequest);
                    }, function(callback) {
                        setTimeout(function() {
                            if (j < ledCount / 2) {
                                leds.setPixelRGB(j, r, g, b);
                                if (j > 0) leds.setPixelRGB(j - 1, 0, 0, 0);
                                leds.setPixelRGB(ledCount - j - 1, r, g, b);
                                if (j > 0) leds.setPixelRGB(ledCount - j, 0, 0, 0);
                                if (j == ledCount) {
                                    leds.setPixelRGB(ledCount, 0, 0, 0);
                                    leds.setPixelRGB(0, 0, 0, 0);
                                }
                                leds.update();
                            }
                            j++;
                            callback();
                        }, 40);
                    }, function(err) {
                        process.nextTick(performStep);
                    });
                }
                performStep();
            });
        },
        // Knight Rider style animation
        flow: function(r, g, b, brightness) {
            switchAnimation(function() {
                console.log('[info]', 'Playing knight rider animation', r, g, b, brightness);
                brightness = brightness || 1.0;
                leds.setMasterBrightness(brightness);

                function performStep() {
                    if (stopAnimationRequest) {
                        stopAnimation();
                        return;
                    }
                    leds.allOFF();
                    var j = 0;
                    async.whilst(function() {
                        return (j < ledCount && !stopAnimationRequest);
                    }, function(callback) {

                        setTimeout(function() {
                            leds.setPixelRGB(j, r, g, b);
                            if (j > 0) leds.setPixelRGB(j - 1, 0, 0, 0);
                            leds.update();
                            j++;
                            callback();
                        }, 4);
                    }, function(err) {
                        if (stopAnimationRequest) {
                            stopAnimation();
                            return;
                        }
                        process.nextTick(function() {
                            var i = 0;
                            async.whilst(function() {
                                return (i < ledCount && !stopAnimationRequest);
                            }, function(callback) {
                                setTimeout(function() {
                                    leds.setPixelRGB(ledCount - i - 1, r, g, b);
                                    if (i > 0) leds.setPixelRGB(ledCount - i, 0, 0, 0);
                                    leds.update();
                                    i++;
                                    callback();
                                }, 7);
                            }, function(err) {
                                process.nextTick(performStep);
                            });
                        });
                    });
                }
                performStep();
            });
        },
        // Fade's the LED's in and out
        pulseColor: function(r, g, b, speed) {
            switchAnimation(function() {
                console.log('[info]', 'Flashing color', r, g, b);
                speed = speed || 0.09;
                flashEffect(r, g, b, speed);
            });
        },
        rainbow: function(brightness, speed) {
            switchAnimation(function() {
                console.log('[info]', 'Playing rainbow animation', brightness);
                var _step = 0;
                var start = 0;
                leds.allOFF();
                brightness = brightness || 1.0;
                speed = speed || 25;
                leds.setMasterBrightness(brightness);
                var i = 0;

                function performStep() {
                    if (stopAnimationRequest) {
                        stopAnimation();
                        return;
                    }
                    var amt = 1;
                    for (var p = 0; p < ledCount; p++) {
                        var color = (p + _step) % 384;
                        leds.setPixel(start + p, leds.wheel_color(color));
                    }
                    leds.update();
                    _step += amt;
                    var overflow = _step - 384;
                    if (overflow >= 0) {
                        _step = overflow;
                    }

                    if (++i >= 384) {
                        i = 0;
                    }
                    setTimeout(performStep, speed);
                }
                performStep();
            });
        },
        // Single pixel running down the strip
        colorChase: function(r, g, b, speed) {
            speed = speed || 25;
            switchAnimation(function() {
                function performStep() {
                    if (stopAnimationRequest) {
                        stopAnimation();
                        return;
                    }
                    leds.allOFF();
                    var i = 0;
                    async.whilst(function() {
                        return (i < ledCount && !stopAnimationRequest);
                    }, function(callback) {
                        setTimeout(function() {
                            leds.setPixelRGB(i, r, g, b);
                            leds.update();
                            leds.setPixelOff(i);
                            i++;
                            callback();
                        }, speed);

                    }, function(err) {
                        if (stopAnimationRequest) {
                            stopAnimation();
                            return;
                        }
                        leds.update();
                        process.nextTick(performStep);
                    });
                }
                performStep();
            });
        }
    };
};

// Private utility functions & variables
// *****************************************************************************
var animationRunning = false;
var stopAnimationRequest = false;

// Used in 'pulseColor', blinks led's
function flashEffect(r, g, b, speed) {
    var step = speed;

    function performStep() {
        if (stopAnimationRequest) {
            stopAnimation();
            return;
        }
        var level = 0.01,
            dir = step;

        async.whilst(function() {
            return (level >= 0.0 && !stopAnimationRequest);
        }, function(callback) {
            setTimeout(function() {
                leds.setMasterBrightness(level);
                leds.fill(new Color({
                    r: r,
                    g: g,
                    b: b
                }));
                if (level >= 0.99) {
                    dir = -step;
                }
                level += dir;
                callback();
            }, 4);
        }, function(err) {
            process.nextTick(performStep);
        });
    }
    performStep();




    return lpd8806AsyncFX;
}

function switchAnimation(cb) {
    if (!animationRunning) {
        return startAnimation(cb);
    }

    stopAnimationRequest = true;

    if (animationRunning) {
        setTimeout(function() {
            switchAnimation(cb);
        }, 100);
    } else {
        startAnimation(cb);
    }
}

function startAnimation(cb) {
    console.log('Starting animation..');
    stopAnimationRequest = false;
    animationRunning = true;
    return cb();
}

function stopAnimation() {
    console.log('Animation stopped.');
    animationRunning = false;
    return;
}
