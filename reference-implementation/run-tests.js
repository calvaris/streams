const glob = require('glob');
const path = require('path');

import ReadableStream from './lib/readable-stream';
import WritableStream from './lib/writable-stream';
import ByteLengthQueuingStrategy from './lib/byte-length-queuing-strategy';
import CountQueuingStrategy from './lib/count-queuing-strategy';
import TransformStream from './lib/transform-stream';
import ReadableByteStream from './lib/readable-byte-stream';

global.ReadableStream = ReadableStream;
global.WritableStream = WritableStream;
global.ByteLengthQueuingStrategy = ByteLengthQueuingStrategy;
global.CountQueuingStrategy = CountQueuingStrategy;
global.TransformStream = TransformStream;
global.ReadableByteStream = ReadableByteStream;

const tests = glob.sync(path.resolve(__dirname, 'webkit/*.js'));
const reference_tests = glob.sync(path.resolve(__dirname, 'webkit/reference-implementation/*.js'));
tests.forEach(require);
reference_tests.forEach(require);
