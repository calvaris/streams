require('../resources/testharness');

require('./utils/streams-utils');

// This is updated till https://github.com/whatwg/streams/commit/ec5ffa036308d9f6350d2946560d48cdbf090939

var test1 = async_test('TransformStream errors thrown in transform put the writable and readable in an errored state');
test1.step(function() {
    var promiseCalls = 0;
    var thrownError = new Error('bad things are happening!');
    var ts = new TransformStream({
        transform: function() {
            throw thrownError;
        }
    });

    assert_equals(ts.writable.state, 'writable', 'writable starts in writable');

    var reader = ts.readable.getReader();

    reader.read().then(
        test1.step_func(function() { assert_unreached('readable\'s read() should reject'); }),
        test1.step_func(function(r) {
            assert_equals(r, thrownError, 'readable\'s read should reject with the thrown error');
            assert_equals(++promiseCalls, 2);
        })
    );

    reader.closed.then(
        test1.step_func(function() { assert_unreached('readable\'s closed should not be fulfilled'); }),
        test1.step_func(function(e) {
            assert_equals(e, thrownError, 'readable\'s closed should be rejected with the thrown error');
            assert_equals(++promiseCalls, 3);
            test1.done();
        })
    );

    ts.writable.closed.then(
        test1.step_func(function() { assert_unreached('writable\'s closed should not be fulfilled'); }),
        test1.step_func(function(e) {
            assert_equals(e, thrownError, 'writable\'s closed should be rejected with the thrown error');
            assert_equals(++promiseCalls, 1);
        })
    );

    ts.writable.write('a');
    assert_equals(ts.writable.state, 'waiting', 'writable becomes waiting immediately after throw');
});

var test2 = async_test('TransformStream errors thrown in flush put the writable and readable in an errored state');
test2.step(function() {
    var promiseCalls = 0;
    var thrownError = new Error('bad things are happening!');
    var ts = new TransformStream({
        transform: function(chunk, enqueue, done) {
            done();
        },
        flush: function() {
            throw thrownError;
        }
    });

    var reader = ts.readable.getReader();

    reader.read().then(
        test2.step_func(function() { assert_unreached('readable\'s read() should reject'); }),
        test2.step_func(function(r) {
            assert_equals(r, thrownError, 'readable\'s read should reject with the thrown error');
            assert_equals(++promiseCalls, 2);
        })
    );

    reader.closed.then(
        test2.step_func(function() { assert_unreached('readable\'s closed should not be fulfilled'); }),
        test2.step_func(function(e) {
            assert_equals(e, thrownError, 'readable\'s closed should be rejected with the thrown error');
            assert_equals(++promiseCalls, 3);
            test2.done();
        })
    );

    ts.writable.closed.then(
        test2.step_func(function() { assert_unreached('writable\'s closed should not be fulfilled'); }),
        test2.step_func(function(e) {
            assert_equals(e, thrownError, 'writable\'s closed should be rejected with the thrown error');
            assert_equals(++promiseCalls, 1);
        })
    );

    assert_equals(ts.writable.state, 'writable', 'writable starts in writable');
    ts.writable.write('a');
    assert_equals(ts.writable.state, 'waiting', 'writable becomes waiting after a write');
    ts.writable.close();
    assert_equals(ts.writable.state, 'closing', 'writable becomes closing after the close call');
});
