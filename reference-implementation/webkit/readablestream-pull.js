require('./resources/testharness');

var test1 = async_test('ReadableStream pull should be able to close a stream.');
test1.step(function() {
    var rs = new ReadableStream({
        pull: function(enqueue, close, error) {
            close();
        }
    });

    var reader = rs.getReader();
    reader.closed.then(test1.step_func(function() {
        test1.done();
    }));
});

var test2 = async_test('ReadableStream pull should be able to queue different objects.');
test2.step(function() {
    var objects = [
    { potato: 'Give me more!'},
    'test',
    1
    ];
    var rs = new ReadableStream({
        pull: function(enqueue, close, error) {
            enqueue(objects[0]);
            enqueue(objects[1]);
            enqueue(objects[2]);
            close()
        }
    });

    rs.closed.then(test2.step_func(function() {
        assert_equals(rs.state, 'closed');
        test2.done();
    }));
    rs.ready.then(test2.step_func(function() {
        assert_equals(rs.read(), objects[0]);
        assert_equals(rs.read(), objects[1]);
        assert_equals(rs.read(), objects[2]);
    }));
});
