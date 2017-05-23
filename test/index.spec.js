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
            addErrorFlag: () => {},
            close: () => {}
        };
        captureAsyncFuncValidation = (name, funcToInvoke) => { funcToInvoke(subSegment); };
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

    it("calls XRay.captureAsyncFunc", (done) => {
        captureAsyncFuncValidation = () => {
            done();
        };
        return assert.isFulfilled(addPromiseSegment(segmentName, Promise.resolve()));
    });

    it("call close on subSegment when promise rejects", (done) => {
        const subSegment = {
            addErrorFlag: () => {},
            close: () => {
                done();
            }
        };
        captureAsyncFuncValidation = (name, func) => {
            func(subSegment);
        };

        addPromiseSegment(segmentName, Promise.reject());
    });

    it("call addErrorFlag on subSegment when promise rejects", (done) => {
        const subSegment = {
            addErrorFlag: () => {
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
            addErrorFlag: () => {},
            close: () => {
                done();
            }
        };
        captureAsyncFuncValidation = (name, func) => {
            func(subSegment);
        };

        addPromiseSegment(segmentName, Promise.resolve());
    });
});