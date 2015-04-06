require('../resources/testharness');

require('./utils/streams-utils');

var ReadableStreamReader;

test(function() {
    // It's not exposed globally, but we test a few of its properties here.
    ReadableStreamReader = (new ReadableStream()).getReader().constructor;
}, 'Can get the ReadableStreamReader constructor indirectly');

test(function() {
    var rs = new ReadableStream();
    new ReadableStreamReader(rs); // Constructing directly the first time should be fine.
    assert_throws(new TypeError(), function() { new ReadableStreamReader(rs); }, 'constructing directly the second time should fail');
}, 'Constructing a ReadableStreamReader directly should fail if the stream is already locked (via direct construction)');

test(function() {
    var rs = new ReadableStream();
    new ReadableStreamReader(rs); // Constructing directly should be fine.
    assert_throws(new TypeError(), function() { rs.getReader(); }, 'getReader() should fail');
}, 'Getting a ReadableStreamReader via getReader should fail if the stream is already locked (via direct construction');

test(function() {
    var rs = new ReadableStream();
    rs.getReader(); // getReader() should be fine.
    assert_throws(new TypeError(), function() { new ReadableStreamReader(rs); }, 'constructing directly should fail');
}, 'Constructing a ReadableStreamReader directly should fail if the stream is already locked (via getReader)');

test(function() {
    var rs = new ReadableStream({
        start: function(enqueue, close) {
            close();
        }
    });

    new ReadableStreamReader(rs); // Constructing directly should not throw.
}, 'Constructing a ReadableStreamReader directly should be OK if the stream is closed');

test(function() {
    var theError = new Error('don\'t say i didn\'t warn ya');
    var rs = new ReadableStream({
        start: function(enqueue, close, error) {
            error(theError);
        }
    });

    new ReadableStreamReader(rs); // Constructing directly should not throw.
}, 'Constructing a ReadableStreamReader directly should be OK if the stream is errored');

var test1 = async_test('Reading from a reader for an empty stream will wait until a chunk is available');
test1.step(function() {
    var enqueue;
    var rs = new ReadableStream({
        start: function(e) {
            enqueue = e;
        }
    });
    var reader = rs.getReader();

    reader.read().then(test1.step_func(function(result) {
        assert_object_equals(result, { value: 'a', done: false }, 'read() should fulfill with the enqueued chunk');
        test1.done();
    }));

    enqueue('a');
});

var test2 = async_test('cancel() on a reader releases the reader before calling through');
test2.step(function() {
    var cancelCalled = false;
    var passedReason = new Error('it wasn\'t the right time, sorry');
    var rs = new ReadableStream({
        cancel: function(reason) {
            cancelCalled = true;
            rs.getReader(); // Should be able to get another reader without error.
            assert_equals(reason, passedReason, 'the cancellation reason is passed through to the underlying source');
        }
    });

    var reader = rs.getReader();
    reader.cancel(passedReason).then(
        test2.step_func(function() {
            assert_true(cancelCalled);
            test2.done('reader.cancel() should fulfill');
        }),
        test2.step_func(function(e) { assert_unreached('reader.cancel() should not reject'); }));
});

var test3 = async_test('closed should be fulfilled after stream is closed (.closed access before acquiring)');
test3.step(function() {
    var doClose;
    var rs = new ReadableStream({
        start: function(enqueue, close) {
            doClose = close;
        }
    });

    var reader = rs.getReader();
    reader.closed.then(test3.step_func(function() {
        test3.done('reader closed should be fulfilled');
    }));

    doClose();
});

var test4 = async_test('closed should be fulfilled after reader releases its lock (multiple stream locks)');
test4.step(function() {
    var doClose;
    var reader1Closed = false;
    var rs = new ReadableStream({
        start: function(enqueue, close) {
            doClose = close;
        }
    });

    var reader1 = rs.getReader();

    reader1.releaseLock();

    var reader2 = rs.getReader();
    doClose();

    reader1.closed.then(test4.step_func(function() {
        reader1Closed = true;
    }));

    reader2.closed.then(test4.step_func(function() {
        assert_true(reader1Closed);
        test4.done('reader2 closed should be fulfilled');
    }));
});

var test5 = async_test('Multiple readers can access the stream in sequence');
test5.step(function() {
    var readCount = 0;
    var rs = new ReadableStream({
        start: function(enqueue, close) {
            enqueue('a');
            enqueue('b');
            close();
        }
    });

    var reader1 = rs.getReader();
    reader1.read().then(test5.step_func(function(r) {
        assert_object_equals(r, { value: 'a', done: false }, 'reading the first chunk from reader1 works');
        ++readCount;
    }));
    reader1.releaseLock();

    var reader2 = rs.getReader();
    reader2.read().then(test5.step_func(function(r) {
        assert_object_equals(r, { value: 'b', done: false }, 'reading the second chunk from reader2 works');
        ++readCount;
    }));
    reader2.releaseLock();

    setTimeout(test5.step_func(function() {
        assert_equals(readCount, 2);
        test5.done();
    }), 50);
});

var test6 = async_test('Cannot use an already-released reader to unlock a stream again');
test6.step(function() {
    var rs = new ReadableStream({
        start: function(enqueue) {
            enqueue('a');
        }
    });

    var reader1 = rs.getReader();
    reader1.releaseLock();

    var reader2 = rs.getReader();

    reader1.releaseLock();
    reader2.read().then(test6.step_func(function(result) {
        assert_object_equals(result, { value: 'a', done: false }, 'read() should still work on reader2 even after reader1 is released');
        test6.done();
    }));
});

var test7 = async_test('cancel() on a released reader is a no-op and does not pass through');
test7.step(function() {
    var readCounts = 0;
    var cancelled = false;
    var rs = new ReadableStream({
        start: function(enqueue) {
            enqueue('a');
        },
        cancel: function() {
            assert_unreached('underlying source cancel should not be called');
        }
    });

    var reader = rs.getReader();
    reader.releaseLock();
    reader.cancel().then(test7.step_func(function(v) {
        assert_equals(v, undefined, 'cancel() on the reader should fulfill with undefined')
        cancelled = true;
    }));

    var reader2 = rs.getReader();
    reader2.read().then(test7.step_func(function(r) {
        assert_object_equals(r, { value: 'a', done: false }, 'a new reader should be able to read a chunk');
        ++readCounts;
    }));

    setTimeout(test7.step_func(function() {
        assert_true(cancelled);
        assert_equals(readCounts, 1);
        test7.done();
    }), 50);
});

var test8 = async_test('Getting a second reader after erroring the stream should succeed');
test8.step(function() {
    var doError;
    var receivedErrors = 0;
    var theError = new Error('bad');
    var rs = new ReadableStream({
        start: function(enqueue, close, error) {
            doError = error;
        }
    });

    var reader1 = rs.getReader();

    reader1.closed.catch(test8.step_func(function(e) {
        assert_equals(e, theError, 'the first reader closed getter should be rejected with the error');
        ++receivedErrors;
    }));

    reader1.read().catch(test8.step_func(function(e) {
        assert_equals(e, theError, 'the first reader read() should be rejected with the error');
        ++receivedErrors;
    }));

    assert_throws(new TypeError(), function() { rs.getReader(); }, 'trying to get another reader before erroring should throw');

    doError(theError);

    rs.getReader().closed.catch(test8.step_func(function(e) {
        assert_equals(e, theError, 'the second reader closed getter should be rejected with the error');
        ++receivedErrors;
    }));

    rs.getReader().read().catch(test8.step_func(function(e) {
        assert_equals(e, theError, 'the third reader read() should be rejected with the error');
        assert_equals(++receivedErrors, 4);
        test8.done();
    }));
});
