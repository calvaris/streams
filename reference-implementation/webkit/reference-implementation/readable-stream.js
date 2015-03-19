require('../resources/testharness');

import RandomPushSource from './utils/streams-utils';
import readableStreamToArray from './utils/streams-utils';
import sequentialReadableStream from './utils/streams-utils';

test(function() {
    assert_does_not_throw(function() { new ReadableStream(); }, 'ReadableStream constructed with no errors');
}, 'ReadableStream can be constructed with no arguments');

test(function() {
    const error = new Error('aaaugh!!');

    assert_throws(error, function() { new ReadableStream({ start() { throw error; } }) }, 'error should be re-thrown');
}, 'ReadableStream: if start throws an error, it should be re-thrown');

var test1 = async_test('ReadableStream: if pull rejects, it should error the stream');
test1.step(function() {
    const error = new Error('pull failure');
    const rs = new ReadableStream({
        pull: function() {
            return Promise.reject(error);
        }
    });

    const reader = rs.getReader();

    var closed = false;
    var read = false;

    reader.closed.catch(test1.step_func(function(e) {
        closed = true;
        assert_false(read);
        assert_equals(e, error, 'closed should reject with the thrown error');
    }));

    reader.read().catch(test1.step_func(function(e) {
        read = true;
        assert_true(closed);
        assert_equals(e, error, 'read() should reject with the thrown error');
        test1.done();
    }));
});

var test2 = async_test('ReadableStream: calling close twice should be a no-op');
test2.step(function() {
    new ReadableStream({
        start: function(enqueue, close) {
            close();
            assert_does_not_throw(close);
        }
    }).getReader().closed.then(test2.step_func(function() { test2.done('closed should fulfill'); }));
});

var test3 = async_test('ReadableStream: calling error twice should be a no-op');
test3.step(function() {
    const theError = new Error('boo!');
    const error2 = new Error('not me!');
    new ReadableStream({
        start: function(enqueue, close, error) {
            error(theError);
            assert_does_not_throw(function() { error(error2); } );
        }
    }).getReader().closed.catch(test3.step_func(function(e) {
        assert_equals(e, theError, 'closed should reject with the first error');
        test3.done();
    }));
});

var test4 = async_test('ReadableStream: calling error after close should be a no-op');
test4.step(function() {
    new ReadableStream({
        start: function(enqueue, close, error) {
            close();
            assert_does_not_throw(error);
        }
    }).getReader().closed.then(test4.step_func(function() { test4.done('closed should fulfill'); } ));
});

var test5 = async_test('ReadableStream: calling close after error should be a no-op');
test5.step(function() {
    const theError = new Error('boo!');
    new ReadableStream({
        start: function(enqueue, close, error) {
            error(theError);
            assert_does_not_throw(close);
        }
    }).getReader().closed.catch(test5.step_func(function(e) {
        assert_equals(e, theError, 'closed should reject with the first error')
        test5.done();
    }));
});

var test6 = async_test('ReadableStream: should only call pull once upon starting the stream');
test6.step(function() {
    var pullCount = 0;
    const startPromise = Promise.resolve();
    const rs = new ReadableStream({
        start: function() {
            return startPromise;
        },
        pull: function() {
            pullCount++;
        }
    });

    startPromise.then(test6.step_func(function() {
        assert_equals(pullCount, 1, 'pull should be called once start finishes');
    }));

    setTimeout(test6.step_func(function() {
        assert_equals(pullCount, 1, 'pull should be called exactly once');
        test6.done();
    }), 50);
});

var test7 = async_test('ReadableStream: should only call pull once for a forever-empty stream, even after reading');
test7.step(function() {
    var pullCount = 0;
    const startPromise = Promise.resolve();
    const rs = new ReadableStream({
        start: function() {
            return startPromise;
        },
        pull: function() {
            pullCount++;
        }
    });

    startPromise.then(test7.step_func(function() {
        assert_equals(pullCount, 1, 'pull should be called once start finishes');
    }));

    rs.getReader().read();

    setTimeout(test7.step_func(function() {
        assert_equals(pullCount, 1, 'pull should be called exactly once');
        test7.done();
    }), 50);
});

var test8 = async_test('ReadableStream: should only call pull once on a non-empty stream read from before start fulfills');
test8.step(function() {
    var pullCount = 0;
    const startPromise = Promise.resolve();
    const rs = new ReadableStream({
        start: function(enqueue) {
            enqueue('a');
            return startPromise;
        },
        pull: function() {
            pullCount++;
        }
    });

    startPromise.then(test8.step_func(function() {
        assert_equals(pullCount, 1, 'pull should be called once start finishes');
    }));

    rs.getReader().read().then(test8.step_func(function(r) {
        assert_object_equals(r, { value: 'a', done: false }, 'first read() should return first chunk');
        assert_equals(pullCount, 1, 'pull should not have been called again');
    }));

    assert_equals(pullCount, 0, 'calling read() should not cause pull to be called yet');

    setTimeout(test8.step_func(function() {
        assert_equals(pullCount, 1, 'pull should be called exactly once');
        test8.done();
    }), 50);
});
