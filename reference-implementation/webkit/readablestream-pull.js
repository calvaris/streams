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
