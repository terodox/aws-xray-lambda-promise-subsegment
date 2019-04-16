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
    subSegmentName
}: {
    annotations?: Annotations,
    metaData?: Metadata,
    parentSegment?: object,
    promiseFactory: () => Promise<T>,
    subSegmentName: string
}): Promise<T>;