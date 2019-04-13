"use strict";

const mocha = require("mocha");
const mock = require("mock-require");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

const describe = mocha.describe;
const it = mocha.it;

chai.use(chaiAsPromised);
const assert = chai.assert;

describe("addPromiseSegment", function () {
    let addPromiseSegment;
    let captureAsyncFuncValidation;
    let options;
    const segmentName = "woohoo";

    before(() => {
        mock("aws-xray-sdk-core", {
            captureAsyncFunc: (name, func) => {
                captureAsyncFuncValidation(name, func);
            }
        });
        addPromiseSegment = mock.reRequire("../index.v2").addPromiseSegment;
    });
    after(() => mock.stopAll());


    before(() => {
        const subSegment = {
            addError: () => {},
            close: () => {}
        };
        captureAsyncFuncValidation = (name, funcToInvoke) => { funcToInvoke(subSegment); };
    });

    beforeEach(() => {
        process.env.LAMBDA_TASK_ROOT = "Very root much task";

        options = {
            annotations: {},
            metadata: {},
            parentSegment: {},
            promiseFactory: () => Promise.resolve(),
            segmentName
        }
    });

    it("is a function", () => {
        assert.equal(typeof addPromiseSegment, typeof function () {});
    });

    it("rejects if promiseFactory is not a function", () => {
        options.promiseFactory = {};

        assert.isRejected(addPromiseSegment(options));
    });

    it("returns a promise", () => {
        assert.instanceOf(addPromiseSegment(options), Promise);
    });

    it("rejects if passed promiseFactory promise rejects", () => {
        options.promiseFactory = () => Promise.reject();

        assert.isRejected(addPromiseSegment(options));
    });

    it("resolves if passed promise resolves", () => {
        options.promiseFactory = () => Promise.resolve();

        return assert.isFulfilled(addPromiseSegment(options));
    });

    it("will return passed promise if not running in a lambda", async () => {
        delete process.env.LAMBDA_TASK_ROOT;
        const passedPromise = Promise.resolve({Things: 'n stuff'});
        options.promiseFactory = () => passedPromise;

        captureAsyncFuncValidation = () => {
            assert.fail('Should not be capturing anything!');
        };

        assert.strictEqual(await addPromiseSegment(options), await passedPromise);
    });

    it("calls XRay.captureAsyncFunc", (done) => {
        captureAsyncFuncValidation = () => {
            done();
        };
        assert.isFulfilled(addPromiseSegment(options));
    });

    it("call close on subSegment when promise rejects", (done) => {
        const subSegment = {
            addError: () => {},
            close: () => {
                done();
            }
        };
        captureAsyncFuncValidation = (name, func) => {
            func(subSegment);
        };

        addPromiseSegment(options);
    });

    it("close with error on subSegment when promise rejects", (done) => {
        const subSegment = {
            close: (error) => {
                assert.ok(error);
                done();
            }
        };
        captureAsyncFuncValidation = (name, func) => {
            func(subSegment);
        };

        options.promiseFactory = () => Promise.reject({ boooom: 'goes the dynamite'});

        addPromiseSegment(options).catch(() => {
            //This is expected to throw but I hate unhandled exception warnings
        });
    });

    it("call close on subSegment when promise resolves", (done) => {
        const subSegment = {
            addError: () => {},
            close: () => {
                done();
            }
        };
        captureAsyncFuncValidation = (name, func) => {
            func(subSegment);
        };

        addPromiseSegment(options);
    });

    it("adds metadata to subSegment if any is provided", (done) => {
        const metadata = {
            "one": 1,
            "two": "22",
            "three": 333
        };
        let callCount = 0;

        const subSegment = {
            addError: () => {},
            close: () => {},
            addMetadata: (key, value) => {
                callCount++;
                assert.equal(metadata[key], value);
                if(callCount > 3) {
                    done(new Error("Called add metadata too many times"));
                }
                if(callCount === 3) {
                    done();
                }
            }
        };
        captureAsyncFuncValidation = (name, func) => {
            func(subSegment);
        };

        options.metadata = metadata;

        addPromiseSegment(options);
    });

    it("adds annotations to subSegment if any is provided", (done) => {
        const annotations = {
            "one": 1,
            "two": "22",
            "three": 333
        };
        let callCount = 0;

        const subSegment = {
            addError: () => {},
            close: () => {},
            addAnnotation: (key, value) => {
                callCount++;
                assert.equal(annotations[key], value);
                if(callCount > 3) {
                    done(new Error("Called add annotations too many times"));
                }
                if(callCount === 3) {
                    done();
                }
            }
        };
        captureAsyncFuncValidation = (name, func) => {
            func(subSegment);
        };

        options.annotations = annotations;

        addPromiseSegment(options);
    });

    it("handles xray being disabled", (done) => {
        const annotations = {
            "one": 1,
            "two": "22",
            "three": 333
        };
        let callCount = 0;

        // when xray is disabled, captureAsyncFunc is called without a sub-segment
        const subSegment = undefined;

        captureAsyncFuncValidation = (name, func) => {
            func(subSegment);
        };

        options.annotations = annotations;

        addPromiseSegment(options)
            .then(() => {
                done();
            }).catch((err) => {
                done(new Error("Failed: " + err));
            });
    });
});