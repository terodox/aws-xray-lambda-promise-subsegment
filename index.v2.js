"use strict";

const XRay = require("aws-xray-sdk-core");

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

module.exports.addPromiseSegment = async function ({
    annotations,
    parentSegment,
    promiseFactory,
    metadata,
    segmentName,
}) {
    if (!process.env.LAMBDA_TASK_ROOT) {
        console.warn('WARNING: Skipping adding subsegment because we are not executing inside of aws lambda');
        return promiseFactory();
    }

    return new Promise((resolve, reject) => {
        try {
            XRay.captureAsyncFunc(segmentName, (subSegment) => {
                try {
                    if (!subSegment) {
                        return promiseFactory()
                            .then(val => resolve(val))
                            .catch(err => reject(err));
                    } else {
                        addMetadata(subSegment, metadata);
                        addAnnotations(subSegment, annotations);

                        promiseFactory(subSegment)
                            .then(val => {
                                resolve(val);
                                subSegment.close();
                            })
                            .catch(err => {
                                reject(err);
                                subSegment.close(err);
                            });
                    }
                } catch(err) {
                    reject(err);
                }
            }, parentSegment);
        } catch (err) {
            reject(err);
        }
    });
};