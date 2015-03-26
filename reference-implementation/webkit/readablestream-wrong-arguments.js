require('./resources/testharness');

var test1 = async_test('Empty ReadableStream constructor should not throw.');
test1.step(function() {
    try {
        new ReadableStream();
    } catch (error) {
        assert_unreached('should not throw');
    }
    setTimeout(test1.step_func(function() {
        test1.done();
    }), 0);
});

var test2 = async_test('TypeError: ReadableStream constructor object start property should be functions.');
test2.step(function() {
    var catchedError = undefined;
    try {
        new ReadableStream({ start: "potato" })
    } catch (error) {
        catchedError = error;
    }
    setTimeout(test2.step_func(function() {
        assert_throws(
            new TypeError(),
            catchedError);
        test2.done();
    }), 0);
});

var test3 = async_test('TypeError: ReadableStream constructor object cancel property should be functions.');
test3.step(function() {
    var catchedError = undefined;
    try {
        new ReadableStream({ cancel: "2" });
    } catch (error) {
        catchedError = error;
    }
    setTimeout(test3.step_func(function() {
        assert_throws(
            new TypeError(),
            catchedError);
        test3.done();
    }), 0);
});

var test4 = async_test('TypeError: ReadableStream constructor object pull property should be functions.');
test4.step(function() {
    var catchedError = undefined;
    try {
        new ReadableStream({ pull: { } })
    } catch (error) {
        catchedError = error;
    }
    setTimeout(test4.step_func(function() {
        assert_throws(
            new TypeError(),
            catchedError);
        test4.done();
    }), 0);
});
