console.log('----------------------------------------');
console.log('----------------------------------------');
console.log('-----  MAKE SURE DAEMON IS RUNNING  ----');
console.log('--------  npm run start-daemon  --------');
console.log('----------------------------------------');
console.log('----------------------------------------');

const AWSXRay = require('aws-xray-sdk-core');
const addPromiseSegment = require('../index.v2.js').addPromiseSegment;
const Enquirer = require('enquirer');

async function runWithTracing(functionToHaveTraced) {
    return new Promise(resolve => {
        AWSXRay.setDaemonAddress('127.0.0.1:2000');
        AWSXRay.enableAutomaticMode();

        const segment = new AWSXRay.Segment('aws-xray-lambda-promise-subsegment');
        const namespace = AWSXRay.getNamespace();

        namespace.run(async function () {
            AWSXRay.setSegment(segment);
console.log('segment', segment);
            try {
                await functionToHaveTraced(segment);
                segment.close();
            } catch (error) {
                console.error(error);
                segment.close(error);
            }
            resolve();
        });
    });
}

function addAnotherSubsegment(name, promiseFactory, parentSegment) {
    return addPromiseSegment({
        segmentName: name,
        promiseFactory,
        metadata: {
            sampleMetadata: 'example'
        },
        annotations: {
            sampleAnnotation: 'example'
        },
        parentSegment,
        __ignoreLambdaSafetyCheck: true
    });
}

async function nestedTracing() {
    await runWithTracing(() => addAnotherSubsegment('layer 0', (parentSegment) => new Promise(resolve => {
        setTimeout(() => {
            addAnotherSubsegment('layer 1', () => new Promise(innerResolve => {
                setTimeout(() => {
                    innerResolve();
                    resolve();
                }, 300);
            }), parentSegment);
        }, 300);
    })));
}

async function basicTracing() {
    await runWithTracing(() => addPromiseSegment({
        segmentName: 'no metadata annotations parentSegment',
        promiseFactory: () => new Promise(resolve => setTimeout(resolve, 300)),
        __ignoreLambdaSafetyCheck: true
    }));
}

(async function() {
    const BASIC_EXAMPLE = 'Basic';
    const NESTED_EXAMPLE = 'Nested';

    enquirer = new Enquirer();
    const response = await enquirer.prompt({
        type: 'select',
        name: 'example',
        message: 'Which example?',
        choices: [
            BASIC_EXAMPLE,
            NESTED_EXAMPLE
        ]
    });

    if(response.example === BASIC_EXAMPLE) {
        return basicTracing();
    } else if(response.example === NESTED_EXAMPLE) {
        return nestedTracing();
    }
})()
    .then(console.log)
    .catch(console.error);

