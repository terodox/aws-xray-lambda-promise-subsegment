"use strict";

let captureAsyncFuncValidation;
require("proxyquire")(
    "../index", {
        "aws-xray-sdk" : {
            captureAsyncFunc: (name, func) => {
                captureAsyncFuncValidation(name, func);
            }
        }
    }
);

const mocha = require("mocha");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const addPromiseSegment = require("../index").addPromiseSegment;

const describe = mocha.describe;
const it = mocha.it;

chai.use(chaiAsPromised);
const assert = chai.assert;

describe("addPromiseSegment", function () {
    const segmentName = "woohoo";

    before(() => {
        const subSegment = {
            addError: () => {},
            close: () => {}
        };
        captureAsyncFuncValidation = (name, funcToInvoke) => { funcToInvoke(subSegment); };
    });

    beforeEach(() => { 
        process.env.LAMBDA_TASK_ROOT = "Very root much task";        
    });

    it("is a function", () => {
        assert.equal(typeof addPromiseSegment, typeof function () {});
    });

    it("rejects if second param is not a promise", () => {
        return assert.isRejected(addPromiseSegment(segmentName, "nope nope nope"));
    });

    it("returns a promise", () => {
        assert.instanceOf(addPromiseSegment(segmentName, Promise.resolve()), Promise);
    });

    it("rejects if passed promise rejects", () => {
        return assert.isRejected(addPromiseSegment(segmentName, Promise.reject()));
    });

    it("resolves if passed promise resolves", () => {
        return assert.isFulfilled(addPromiseSegment(segmentName, Promise.resolve()));
    });

    it("will return passed promise if not running in a lambda", () => {
        delete process.env.LAMBDA_TASK_ROOT;
        const passedPromise = Promise.resolve({});
        return assert.strictEqual(addPromiseSegment(segmentName, passedPromise), passedPromise);
    });

    it("calls XRay.captureAsyncFunc", (done) => {
        captureAsyncFuncValidation = () => {
            done();
        };
        return assert.isFulfilled(addPromiseSegment(segmentName, Promise.resolve()));
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

        addPromiseSegment(segmentName, Promise.reject());
    });

    it("call addError on subSegment when promise rejects", (done) => {
        const subSegment = {
            addError: () => {
                done();
            },
            close: () => {}
        };
        captureAsyncFuncValidation = (name, func) => {
            func(subSegment);
        };

        addPromiseSegment(segmentName, Promise.reject());
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

        addPromiseSegment(segmentName, Promise.resolve());
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

        addPromiseSegment(segmentName, Promise.resolve(), metadata);
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

        addPromiseSegment(segmentName, Promise.resolve(), {}, annotations);
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
    
        addPromiseSegment(segmentName, Promise.resolve(), {}, annotations)
            .then(() => {
                done();
            }).catch((err) => {
                done(new Error("Failed: " + err));
            });
    });
    
    
});