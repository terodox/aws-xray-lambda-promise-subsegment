export interface Metadata {
    [id: string]: string;
}
export interface Annotations extends Metadata {}

export declare function addPromiseSegment<T>(subSegmentName: string, promiseToWrap: Promise<T>, additionalMetaData?: Metadata, annotations?: Annotations): Promise<T>;