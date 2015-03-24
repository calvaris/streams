require('../resources/testharness');

require('./utils/streams-utils');

test(function() {
    assert_does_not_throw(function() { new ByteLengthQueuingStrategy({ highWaterMark: 4 }); });
}, 'Can construct a ByteLengthQueuingStrategy with a valid high water mark');
