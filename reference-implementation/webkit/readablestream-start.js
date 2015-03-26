require('./resources/testharness');

test(function() {
    assert_throws(
       new TypeError(),
       function() {
           new ReadableStream({ 'start' : 'potato'});
       });
}, 'ReadableStream constructor should get a function as start argument');

var test1 = async_test('ReadableStream start should be able to return a promise');
test1.step(function()
{
    var rs = new ReadableStream({
        start: function(enqueue, close, error) {
            return new Promise(test1.step_func(function(resolve, reject) {
                setTimeout(test1.step_func(function() {
                    enqueue('potato');
                    close();
                    resolve();
                }), 50);
            }));
        },
    });

    var reader = rs.getReader();

    reader.read().then(test1.step_func(function(r) {
        assert_equals(r.value, 'potato');
    }));

    reader.closed.then(test1.step_func(function() {
        test1.done();
    }));
});

var test2 = async_test('ReadableStream start should be able to return a promise and reject it');
test2.step(function()
{
    var rs = new ReadableStream({
        start: function(enqueue, close, error) {
            return Promise(function(resolve, reject) {
                setTimeout(function() {
                    reject();
                }, 50);
            });
        },
        pull: function(enqueue, close) {
    }));
});

var test3 = async_test('ReadableStream pull should be able to queue different objects.');
test3.step(function() {
    var readCalls = 0;
    var objects = [
    { potato: 'Give me more!'},
    'test',
    1
    ];

    var rs = new ReadableStream({
        start: function(enqueue, close, error) {
            for (var i = 0; i < objects.length; i++) {
                enqueue(objects[i]);
            }
            close();
        }
    });

    var reader = rs.getReader();

    reader.read().then(test3.step_func(function(r) {
        assert_equals(r.value, objects[readCalls++]);
    }));

    reader.read().then(test3.step_func(function(r) {
        assert_equals(r.value, objects[readCalls++]);
    }));

    reader.read().then(test3.step_func(function(r) {
        assert_equals(r.value, objects[readCalls++]);
    }));

    reader.closed.then(test3.step_func(function() {
        assert_equals(readCalls, 3);
        test3.done();
    }));
});
