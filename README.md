[![Build Status](https://travis-ci.org/terodox/aws-xray-lambda-promise-subsegment.svg?branch=master)](https://travis-ci.org/terodox/aws-xray-lambda-promise-subsegment)

[![NPM](https://nodei.co/npm/aws-xray-lambda-promise-subsegment.png?compact=true)](https://npmjs.org/package/aws-xray-lambda-promise-subsegment)

# aws-xray-lambda-promise-subsegment

This will wrap an existing promise in a new promise that also creates a new subsegment in aws x-ray. It takes advantage of lambda already having an open trace to add a sub-segment to.

## Running locally

If you are running locally an not inside lambda, you will get a warning:

```text
WARNING: Skipping adding subsegment because we are not executing inside of aws lambda
```

This is because there is no open trace to add a segment to.  However, this will allow you to test locally without errors occurring.

## Usage

## Without a parent segment

You have two options available. For the simplest possible addition use:

```javascript
// javascript
const addSegment = require("aws-xray-lambda-promise-subsegment").addSegment;

const promiseWrappedInSubsegment = addSegment('subSegmentName', promiseOfThingsFactory());
```

However, if you want to add metadata or annotations, then you'll need the more complex version:

```javascript
// javascript
const addPromiseSegment = require("aws-xray-lambda-promise-subsegment").addPromiseSegment;

const promiseWrappedInSubsegment = addPromiseSegment({
    segmentName: 'subSegmentName',
    promiseFactory: () => promiseOfThingsFactory(),
    metadata: {
        someMetadata1: greatValue,
        someMetadata2: amazingValue
    },
    annotations: {
        annotation1: bestValue,
        annotation2: biglyValue
    }
});
```

### Es6 Syntax

```javascript
// es6
const { addSegment } = require("aws-xray-lambda-promise-subsegment");

const promiseWrappedInSubsegment = addSegment('subSegmentName', promiseOfThingsFactory());
```

```javascript
// es6
import { addPromiseSegment } from "aws-xray-lambda-promise-subsegment";

const promiseWrappedInSubsegment = addPromiseSegment({
    segmentName: 'subSegmentName',
    promiseFactory: () => promiseOfThingsFactory(),
    metadata: {
        someMetadata1: greatValue,
        someMetadata2: amazingValue
    },
    annotations: {
        annotation1: bestValue,
        annotation2: biglyValue
    }
});
```

### With a parent segment

```javascript
// javascript
const addPromiseSegment = require("aws-xray-lambda-promise-subsegment").addPromiseSegment;

const promiseWrappedInSubsegment = addPromiseSegment({
    segmentName: 'subSegmentName',
    promiseFactory: async (parentSegment) => {
        await doSomeWork();
        await addPromiseSegment({
            segmentName: 'subSegmentName',
            promiseFactory: promiseOfThingsFactory(),
            parentSegment
        });
        await doSomeMoreWork;
    },
    metadata: {
        someMetadata1: greatValue,
        someMetadata2: amazingValue
    },
    annotations: {
        annotation1: bestValue,
        annotation2: biglyValue
    }
});
```

```javascript
// es6
import { addPromiseSegment } from "aws-xray-lambda-promise-subsegment";

const promiseWrappedInSubsegment = addPromiseSegment({
    segmentName: 'subSegmentName',
    promiseFactory: async (parentSegment) => {
        await doSomeWork();
        await addPromiseSegment({
            segmentName: 'subSegmentName',
            promiseFactory: () => promiseOfThingsFactory(),
            parentSegment
        });
        await doSomeMoreWork;
    },
    metadata: {
        someMetadata1: greatValue,
        someMetadata2: amazingValue
    },
    annotations: {
        annotation1: bestValue,
        annotation2: biglyValue
    }
});
```

## Contributors

A special thanks to everyone [who has contributed!](CONTRIBUTORS.md)
