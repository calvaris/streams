require('./resources/testharness');

test(function() {
    try {
        new ReadableStream();
    } catch (error) {
        assert_unreached('should not throw');
    }
}, 'Empty ReadableStream constructor should not throw.');

test(function() {
    var catchedError = undefined;
    try {
        new ReadableStream({ start: "potato" })
    } catch (error) {
        catchedError = error;
    }
    assert_throws(new TypeError(), catchedError);
}, 'TypeError: ReadableStream constructor object start property should be functions.');

test(function() {
    var catchedError = undefined;
    try {
        new ReadableStream({ cancel: "2" });
    } catch (error) {
        catchedError = error;
    }
    assert_throws(new TypeError(), catchedError);
}, 'TypeError: ReadableStream constructor object cancel property should be functions.');

test(function() {
    var catchedError = undefined;
    try {
        new ReadableStream({ pull: { } })
    } catch (error) {
        catchedError = error;
    }
    assert_throws(new TypeError(), catchedError);
}, 'TypeError: ReadableStream constructor object pull property should be functions.');
