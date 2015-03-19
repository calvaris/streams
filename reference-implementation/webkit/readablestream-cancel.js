require('./resources/testharness');

var t1 = async_test('ReadableStream cancel should fulfill promise when cancel callback went fine');
t1.step(function()
{
    var cancelReceived = false;
    var cancelReason = "I am tired of this stream, I prefer to cancel it";
    var rs = new ReadableStream({
        cancel: function(reason) {
            cancelReceived = true;
            assert_equals(reason, cancelReason);
        }
    });
    rs.cancel(cancelReason).then(
        t1.step_func(function() {
            assert_true(cancelReceived);
            t1.done();
        }),
        t1.step_func(function(e) {
            assert_unreached("received error " + e)
        }));
});

var t2 = async_test('ReadableStream cancel should reject promise when cancel callback raises an exception');
t2.step(function()
{
    var thrownError = undefined;

    var rs = new ReadableStream({
        cancel: function(error) {
            thrownError = new Error(error);
            throw thrownError;
        }
    });

    rs.cancel("test").then(
        t2.step_func(function() {
            assert_unreached("FAILED: cancel should fail")
        }),
        t2.step_func(function(e) {
            assert_not_equals(thrownError, undefined);
            assert_equals(e, thrownError);
            t2.done();
        })
    );
});

var t3 = async_test('ReadableStream cancel should fulfill promise when cancel callback went fine after returning a promise');
t3.step(function()
{
    var cancelReason = "test";

    var rs = new ReadableStream({
        cancel: function(error) {
            assert_equals(error, cancelReason);
            return new Promise(t3.step_func(function(resolve, reject) {
                setTimeout(t3.step_func(function() {
                    resolve();
                }), 50);
            }))
        }
    })

    rs.cancel(cancelReason).then(
        t3.step_func(function() {
            t3.done();
        }),
        t3.step_func(function(e) {
            assert_unreached("FAILED: received " + e)
        }))
});
