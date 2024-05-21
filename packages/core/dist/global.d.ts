interface IMetaData {
    name: string;
    size: number;
    lastModified: number;
    type: string;
}
/**
 * @param file 待计算 Hash 的文件
 * @param chunkSize 分片大小 MB
 * @param maxWorkers worker 线程数量
 */
declare function getFileHashInfo(file: File, chunkSize?: number, maxWorkers?: number): Promise<{
    chunksBlob: Blob[];
    chunksHash: string[];
    merkleHash: string;
    metadata: IMetaData;
}>;

declare const kunHash_getFileHashInfo: typeof getFileHashInfo;
declare namespace kunHash {
  export { kunHash_getFileHashInfo as getFileHashInfo };
}

export { kunHash as default };
