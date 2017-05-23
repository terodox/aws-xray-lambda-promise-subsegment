"use strict";

const XRay = require("aws-xray-sdk");

module.exports.addPromiseSegment = function (segmentName, inputPromise) {
    if(!(inputPromise instanceof Promise)) {
        return Promise.reject(new Error("First parameter must be of type Promise"));
    }
    return new Promise((resolve, reject) => {
        XRay.captureAsyncFunc(segmentName, (subSegment) => {
            inputPromise
                .then(val => {
                    resolve(val);
                    subSegment.close();
                })
                .catch(err => {
                    reject(err);
                    subSegment.addErrorFlag();
                    subSegment.close();
                });
        });
    });
};