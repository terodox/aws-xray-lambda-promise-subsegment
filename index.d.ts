export interface Metadata {
    [id: string]: string;
}
export interface Annotations extends Metadata {}

export interface addPromiseSubsegmentOptions<T> {
    annotations?: Annotations,
    metaData?: Metadata,
    parentSegment: object,
    promiseFactory: () => Promise<T>,
    subSegmentName: string,
}

export declare function addPromiseSegment<T>(options: addPromiseSubsegmentOptions<T>): Promise<T>;