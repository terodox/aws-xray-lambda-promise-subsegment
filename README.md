# aws-xray-lambda-promise-subsegment
Allows a new subsegment to be added to XRay around any promise

## Usage
```
// javascript
const addPromiseSegment = require("aws-xray-lambda-promise-subsegment").addPromiseSegment;

const promiseOfThings = promiseOfThingsFactory();

addPromiseSegment("subSegmentName", promiseOfThings, {
      someMetadata1: greatValue,
      someMetadata2: amazingValue
  },
  {
      annotation1: bestValue,
      annotation2: biglyValue
  });
```

```
// typescript
import { addPromiseSegment } from "aws-xray-lambda-promise-subsegment";

const promiseOfThings = promiseOfThingsFactory();

addPromiseSegment("subSegmentName", promiseOfThings, {
      someMetadata1: greatValue,
      someMetadata2: amazingValue
  },
  {
      annotation1: bestValue,
      annotation2: biglyValue
  });
```

