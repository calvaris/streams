require('../resources/testharness');

require('./utils/streams-utils');

// This is updated till https://github.com/whatwg/streams/commit/c942e11025a770d60ab3d4f6541b29e45da518da

var test1 = async_test('Closing a writable stream with in-flight writes below the high water mark delays the close call properly');
test1.step(function() {
    var isDone = false;
    var ws = new WritableStream(
        {
            write: function(chunk) {
                return new Promise(test1.step_func(function(resolve) {
                    setTimeout(test1.step_func(function() {
                        isDone = true;
                        resolve();
                    }), 500);
                }));
            },
            close: function() {
                assert_true(isDone, 'close is only called once the promise has been resolved');
                test1.done();
            }
        },
        new ByteLengthQueuingStrategy({ highWaterMark: 1024 * 16 })
    );

    ws.write({ byteLength: 1024 });
    ws.close();
});
