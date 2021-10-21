export {SegmentLike, Segment, Subsegment, TraceID, SegmentUtils} from 'aws-xray-sdk-core';

export interface Metadata {
    [id: string]: string | object | number | boolean;
}
export interface Annotations {
    [id: string]: string | number | boolean;
}

export declare function addPromiseSegment<T>({
    annotations,
    metaData,
    parentSegment,
    promiseFactory,
    segmentName
}: {
    annotations?: Annotations,
    metaData?: Metadata,
    parentSegment?: object,
    promiseFactory: (subsegment) => Promise<T>,
    segmentName: string
}): Promise<T>;

export declare function addSegment<T>(segmentName: string, promise: Promise<any>): Promise<T>;