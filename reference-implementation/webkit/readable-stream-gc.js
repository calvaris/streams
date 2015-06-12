require('./resources/testharness');

require('./reference-implementation/utils/streams-utils');

require('./resources/gc');

var window = {}
window.gc = gc;

function garbageCollectAndDo(task)
{
    var timeout = 50;
    if (window.GCController)
        window.GCController.collect();
    else if (window.gc)
        window.gc();
    else
        timeout = 400;
    setTimeout(task, timeout);
}

var test1 = async_test('Readable stream controller methods should continue working properly when scripts are loosing reference to the readable stream');
test1.step(function() {
    var controller;
    new ReadableStream({
        start: function(c) {
            controller = c;
        }
    });

    garbageCollectAndDo(test1.step_func(function() {
        controller.close();
        assert_throws(new TypeError(), function() { controller.close(); });
        assert_throws(new TypeError(), function() { controller.error(); });
        test1.done();
    }));
});

var test2 = async_test('Readable stream closed promise should resolve even if stream and reader JS references are lost');
test2.step(function() {
    var controller;
    new ReadableStream({
        start: function(c) {
            controller = c;
        }
    }).getReader().closed.then(test2.step_func(function() {
        test2.done();
    }));

    garbageCollectAndDo(test2.step_func(function() {
        controller.close();
    }));
});

var test3 = async_test('Readable stream closed promise should reject even if stream and reader JS references are lost');
test3.step(function() {
    var controller;
    new ReadableStream({
        start: function(c) {
            controller = c;
        }
    }).getReader().closed.catch(test3.step_func(function() {
        test3.done();
    }));

    garbageCollectAndDo(test3.step_func(function() {
        controller.error();
    }));
});
