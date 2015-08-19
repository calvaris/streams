require('../resources/testharness');

require('./utils/streams-utils');

var test1 = async_test('Piping with no options and a destination error');
test1.step(function() {
    var cancelCalled = false;
    var theError = new Error('destination error');
    var rs = new ReadableStream({
        start: function(c) {
            c.enqueue('a');
            setTimeout(test1.step_func(function() { c.enqueue('b'); }), 10);
            setTimeout(test1.step_func(function() {
                c.enqueue('c'); // Enqueue after cancel should not throw.
                assert_true(cancelCalled);
                test1.done();
            }), 20);
        },
        cancel: function(r) {
            assert_equals(r, theError, 'reason passed to cancel equals the source error');
            cancelCalled = true;
        }
    });

    var ws = new WritableStream({
        write: function(chunk) {
            if (chunk === 'b') {
                throw theError;
            }
        }
    });

    rs.pipeTo(ws);
});

var test2 = async_test('Piping with { preventCancel: false } and a destination error');
test2.step(function() {
    var cancelCalled = false;
    var theError = new Error('destination error');
    var rs = new ReadableStream({
        start: function(c) {
            c.enqueue('a');
            setTimeout(test2.step_func(function() { c.enqueue('b'); }), 10);
            setTimeout(test2.step_func(function() {
                c.enqueue('c'); // Enqueue after cancel should not throw.
                assert_true(cancelCalled);
                test2.done();
            }), 20);
        },
        cancel: function(r) {
            assert_equals(r, theError, 'reason passed to cancel equals the source error');
            cancelCalled = true;
        }
    });

    var ws = new WritableStream({
        write: function(chunk) {
            if (chunk === 'b') {
                throw theError;
            }
        }
    });

    rs.pipeTo(ws, { preventCancel: false });
});

var test3 = async_test('Piping with { preventCancel: true } and a destination error');
test3.step(function() {
    var theError = new Error('destination error');
    var rs = new ReadableStream({
        start: function(c) {
            c.enqueue('a');
            setTimeout(test3.step_func(function() { c.enqueue('b'); }), 10);
            setTimeout(test3.step_func(function() { c.enqueue('c'); }), 20);
            setTimeout(test3.step_func(function() { c.enqueue('d'); }), 30);
        },
        cancel: function(r) {
            assert_unreached('unexpected call to cancel');
        }
    });

    var ws = new WritableStream({
        write: function(chunk) {
            if (chunk === 'b') {
                throw theError;
            }
        }
    });

    rs.pipeTo(ws, { preventCancel: true }).catch(test3.step_func(function(e) {
        assert_equals(e, theError, 'rejection reason of pipeTo promise is the sink error');

        var reader;
        reader = rs.getReader(); // Should be able to get a stream reader after pipeTo completes.

        // { value: 'c', done: false } gets consumed before we know that ws has errored, and so is lost.

        return reader.read().then(test3.step_func(function(result) {
            assert_object_equals(result, { value: 'd', done: false }, 'should be able to read the remaining chunk from the reader');
            test3.done();
        }));
    })).catch(test3.step_func(function(e) { assert_unreached(e); }));
});
