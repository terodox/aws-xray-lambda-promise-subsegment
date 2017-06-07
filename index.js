"use strict";

const XRay = require("aws-xray-sdk");

function addMetadata(subSegment, metadata) {
    if(metadata) {
        for(const key in metadata) {
            if(metadata.hasOwnProperty(key)) {
                subSegment.addMetadata(key, metadata[key]);
            }
        }
    }
}

function addAnnotations(subSegment, annotations) {
    if(annotations) {
        for(const key in annotations) {
            if(annotations.hasOwnProperty(key)) {
                subSegment.addAnnotation(key, annotations[key]);
            }
        }
    }
}

module.exports.addPromiseSegment = function (segmentName, inputPromise, metadata, annotations) {
    return new Promise((resolve, reject) => {
        try {
            XRay.captureAsyncFunc(segmentName, (subSegment) => {
                try {

                    if (!subSegment) {
                        return inputPromise
                            .then(val => resolve(val))
                            .catch(err => reject(err));
                    } else {
                        addMetadata(subSegment, metadata);
                        addAnnotations(subSegment, annotations);

                        inputPromise
                            .then(val => {
                                resolve(val);
                                subSegment.close();
                            })
                            .catch(err => {
                                reject(err);
                                subSegment.addError(err);
                                subSegment.close();
                            });
                    }
                } catch(err) {
                    reject(err);
                }
            });
        } catch (err) {
            reject(err);
        }
    });
};