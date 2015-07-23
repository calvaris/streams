require('./resources/testharness');

require('./reference-implementation/utils/streams-utils');

var test1 = async_test('Erroring a ReadableStream should reject ReadableStreamReader close promise');
test1.step(function() {
    var controller;
    var rs = new ReadableStream({
        start: function(c) {
            controller = c;
        }
    });

   rs.getReader().closed.then(test1.step_func(function() {
        assert_unreached("closed promise should not be resolved when stream is errored");
    }), test1.step_func(function(err) {
        assert_equals(rsError, err);
        test1.done();
    }));

    var rsError = "my error";
    controller.error(rsError);
});

var test2 = async_test('Erroring a ReadableStream should reject ReadableStreamReader close promise');
test2.step(function() {
    var controller;
    var rs = new ReadableStream({
        start: function(c) {
            controller = c;
        }
    });

    var rsError = "my error";
    controller.error(rsError);

    // Let's call getReader twice to ensure that stream is not locked to a reader.
    rs.getReader();
    rs.getReader().closed.then(test2.step_func(function() {
        assert_unreached("closed promise should not be resolved when stream is errored");
    }), test2.step_func(function(err) {
        assert_equals(rsError, err);
        test2.done();
    }));
});

var test3 = async_test('Erroring a ReadableStream without any value');
test3.step(function() {
    var controller;
    var rs = new ReadableStream({
        start: function(c) {
            controller = c;
        }
    });

    rs.getReader().closed.then(test3.step_func(function() {
        assert_unreached("closed promise should not be resolved when stream is errored");
    }), test3.step_func(function(err) {
        assert_equals(err, undefined);
        test3.done();
    }));

    controller.error();
});