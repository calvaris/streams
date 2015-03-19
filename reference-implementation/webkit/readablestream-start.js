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
            return Promise(function(resolve, reject) {
                setTimeout(function() {
                    resolve();
                    setTimeout(test1.step_func(function() {
                        assert_equals(rs.state, 'close');
                    }), 0);
                }, 50);
            });
        },
        pull: function(enqueue, close) {
            enqueue('potato');
            close();
        }
    });

    assert_equals(rs.state, 'waiting');

    rs.ready.then(test1.step_func(function() {
        assert_equals(rs.read(), 'potato');
    }));

    rs.closed.then(test1.step_func(function() {
        assert_equals(rs.state, 'closed');
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
            close();
        }
    });

    assert_equals(rs.state, 'waiting');

    rs.closed.catch(test2.step_func(function() {
        assert_equals(rs.state, 'errored');
        test2.done();
    }));
});
