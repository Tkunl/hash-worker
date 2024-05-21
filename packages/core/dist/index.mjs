function generateUUID() {
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : r & 0x3 | 0x8;
        return v.toString(16);
    });
}

/**
 * [1, 2, 3, 4] => [[1, 2], [3, 4]]
 * @param chunks 原始数组
 * @param size 分 part 大小
 */ function getArrParts(chunks, size) {
    const result = [];
    let tempPart = [];
    chunks.forEach((chunk)=>{
        tempPart.push(chunk);
        if (tempPart.length === size) {
            result.push(tempPart);
            tempPart = [];
        }
    });
    if (tempPart.length !== 0) result.push(tempPart);
    return result;
}

class MiniSubject {
    _value;
    subscribers = new Map();
    constructor(value){
        this._value = value;
    }
    get value() {
        return this._value;
    }
    next(value) {
        this._value = value;
        this.subscribers.forEach((cb)=>cb(value));
    }
    subscribe(cb) {
        const id = generateUUID();
        this.subscribers.set(id, cb);
        cb(this.value);
        return id;
    }
    unsubscribe(id) {
        this.subscribers.delete(id);
    }
}

/**
 * 分割文件
 * @param file
 * @param baseSize 默认分块大小为 1MB
 * @private
 */ function sliceFile(file, baseSize = 1) {
    const chunkSize = baseSize * 1024 * 1024 // KB
    ;
    const chunks = [];
    let startPos = 0;
    while(startPos < file.size){
        chunks.push(file.slice(startPos, startPos + chunkSize));
        startPos += chunkSize;
    }
    return chunks;
}
/**
 * 将 File 转成 ArrayBuffer
 * 注意: Blob 无法直接移交到 Worker 中, 所以需要放到主线程中执行
 * @param chunks
 * @private
 */ async function getArrayBufFromBlobs(chunks) {
    return Promise.all(chunks.map((chunk)=>chunk.arrayBuffer()));
}

/*!
 * hash-wasm (https://www.npmjs.com/package/hash-wasm)
 * (c) Dani Biro
 * @license MIT
 */

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

class Mutex {
    constructor() {
        this.mutex = Promise.resolve();
    }
    lock() {
        let begin = () => { };
        this.mutex = this.mutex.then(() => new Promise(begin));
        return new Promise((res) => {
            begin = res;
        });
    }
    dispatch(fn) {
        return __awaiter(this, void 0, void 0, function* () {
            const unlock = yield this.lock();
            try {
                return yield Promise.resolve(fn());
            }
            finally {
                unlock();
            }
        });
    }
}

/* eslint-disable import/prefer-default-export */
/* eslint-disable no-bitwise */
var _a;
function getGlobal() {
    if (typeof globalThis !== 'undefined')
        return globalThis;
    // eslint-disable-next-line no-restricted-globals
    if (typeof self !== 'undefined')
        return self;
    if (typeof window !== 'undefined')
        return window;
    return global;
}
const globalObject = getGlobal();
const nodeBuffer = (_a = globalObject.Buffer) !== null && _a !== void 0 ? _a : null;
const textEncoder = globalObject.TextEncoder ? new globalObject.TextEncoder() : null;
function hexCharCodesToInt(a, b) {
    return (((a & 0xF) + ((a >> 6) | ((a >> 3) & 0x8))) << 4) | ((b & 0xF) + ((b >> 6) | ((b >> 3) & 0x8)));
}
function writeHexToUInt8(buf, str) {
    const size = str.length >> 1;
    for (let i = 0; i < size; i++) {
        const index = i << 1;
        buf[i] = hexCharCodesToInt(str.charCodeAt(index), str.charCodeAt(index + 1));
    }
}
function hexStringEqualsUInt8(str, buf) {
    if (str.length !== buf.length * 2) {
        return false;
    }
    for (let i = 0; i < buf.length; i++) {
        const strIndex = i << 1;
        if (buf[i] !== hexCharCodesToInt(str.charCodeAt(strIndex), str.charCodeAt(strIndex + 1))) {
            return false;
        }
    }
    return true;
}
const alpha = 'a'.charCodeAt(0) - 10;
const digit = '0'.charCodeAt(0);
function getDigestHex(tmpBuffer, input, hashLength) {
    let p = 0;
    /* eslint-disable no-plusplus */
    for (let i = 0; i < hashLength; i++) {
        let nibble = input[i] >>> 4;
        tmpBuffer[p++] = nibble > 9 ? nibble + alpha : nibble + digit;
        nibble = input[i] & 0xF;
        tmpBuffer[p++] = nibble > 9 ? nibble + alpha : nibble + digit;
    }
    /* eslint-enable no-plusplus */
    return String.fromCharCode.apply(null, tmpBuffer);
}
const getUInt8Buffer = nodeBuffer !== null
    ? (data) => {
        if (typeof data === 'string') {
            const buf = nodeBuffer.from(data, 'utf8');
            return new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
        }
        if (nodeBuffer.isBuffer(data)) {
            return new Uint8Array(data.buffer, data.byteOffset, data.length);
        }
        if (ArrayBuffer.isView(data)) {
            return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
        }
        throw new Error('Invalid data type!');
    }
    : (data) => {
        if (typeof data === 'string') {
            return textEncoder.encode(data);
        }
        if (ArrayBuffer.isView(data)) {
            return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
        }
        throw new Error('Invalid data type!');
    };
const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const base64Lookup = new Uint8Array(256);
for (let i = 0; i < base64Chars.length; i++) {
    base64Lookup[base64Chars.charCodeAt(i)] = i;
}
function getDecodeBase64Length(data) {
    let bufferLength = Math.floor(data.length * 0.75);
    const len = data.length;
    if (data[len - 1] === '=') {
        bufferLength -= 1;
        if (data[len - 2] === '=') {
            bufferLength -= 1;
        }
    }
    return bufferLength;
}
function decodeBase64$2(data) {
    const bufferLength = getDecodeBase64Length(data);
    const len = data.length;
    const bytes = new Uint8Array(bufferLength);
    let p = 0;
    for (let i = 0; i < len; i += 4) {
        const encoded1 = base64Lookup[data.charCodeAt(i)];
        const encoded2 = base64Lookup[data.charCodeAt(i + 1)];
        const encoded3 = base64Lookup[data.charCodeAt(i + 2)];
        const encoded4 = base64Lookup[data.charCodeAt(i + 3)];
        bytes[p] = (encoded1 << 2) | (encoded2 >> 4);
        p += 1;
        bytes[p] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
        p += 1;
        bytes[p] = ((encoded3 & 3) << 6) | (encoded4 & 63);
        p += 1;
    }
    return bytes;
}

const MAX_HEAP = 16 * 1024;
const WASM_FUNC_HASH_LENGTH = 4;
const wasmMutex = new Mutex();
const wasmModuleCache = new Map();
function WASMInterface(binary, hashLength) {
    return __awaiter(this, void 0, void 0, function* () {
        let wasmInstance = null;
        let memoryView = null;
        let initialized = false;
        if (typeof WebAssembly === 'undefined') {
            throw new Error('WebAssembly is not supported in this environment!');
        }
        const writeMemory = (data, offset = 0) => {
            memoryView.set(data, offset);
        };
        const getMemory = () => memoryView;
        const getExports = () => wasmInstance.exports;
        const setMemorySize = (totalSize) => {
            wasmInstance.exports.Hash_SetMemorySize(totalSize);
            const arrayOffset = wasmInstance.exports.Hash_GetBuffer();
            const memoryBuffer = wasmInstance.exports.memory.buffer;
            memoryView = new Uint8Array(memoryBuffer, arrayOffset, totalSize);
        };
        const getStateSize = () => {
            const view = new DataView(wasmInstance.exports.memory.buffer);
            const stateSize = view.getUint32(wasmInstance.exports.STATE_SIZE, true);
            return stateSize;
        };
        const loadWASMPromise = wasmMutex.dispatch(() => __awaiter(this, void 0, void 0, function* () {
            if (!wasmModuleCache.has(binary.name)) {
                const asm = decodeBase64$2(binary.data);
                const promise = WebAssembly.compile(asm);
                wasmModuleCache.set(binary.name, promise);
            }
            const module = yield wasmModuleCache.get(binary.name);
            wasmInstance = yield WebAssembly.instantiate(module, {
            // env: {
            //   emscripten_memcpy_big: (dest, src, num) => {
            //     const memoryBuffer = wasmInstance.exports.memory.buffer;
            //     const memView = new Uint8Array(memoryBuffer, 0);
            //     memView.set(memView.subarray(src, src + num), dest);
            //   },
            //   print_memory: (offset, len) => {
            //     const memoryBuffer = wasmInstance.exports.memory.buffer;
            //     const memView = new Uint8Array(memoryBuffer, 0);
            //     console.log('print_int32', memView.subarray(offset, offset + len));
            //   },
            // },
            });
            // wasmInstance.exports._start();
        }));
        const setupInterface = () => __awaiter(this, void 0, void 0, function* () {
            if (!wasmInstance) {
                yield loadWASMPromise;
            }
            const arrayOffset = wasmInstance.exports.Hash_GetBuffer();
            const memoryBuffer = wasmInstance.exports.memory.buffer;
            memoryView = new Uint8Array(memoryBuffer, arrayOffset, MAX_HEAP);
        });
        const init = (bits = null) => {
            initialized = true;
            wasmInstance.exports.Hash_Init(bits);
        };
        const updateUInt8Array = (data) => {
            let read = 0;
            while (read < data.length) {
                const chunk = data.subarray(read, read + MAX_HEAP);
                read += chunk.length;
                memoryView.set(chunk);
                wasmInstance.exports.Hash_Update(chunk.length);
            }
        };
        const update = (data) => {
            if (!initialized) {
                throw new Error('update() called before init()');
            }
            const Uint8Buffer = getUInt8Buffer(data);
            updateUInt8Array(Uint8Buffer);
        };
        const digestChars = new Uint8Array(hashLength * 2);
        const digest = (outputType, padding = null) => {
            if (!initialized) {
                throw new Error('digest() called before init()');
            }
            initialized = false;
            wasmInstance.exports.Hash_Final(padding);
            if (outputType === 'binary') {
                // the data is copied to allow GC of the original memory object
                return memoryView.slice(0, hashLength);
            }
            return getDigestHex(digestChars, memoryView, hashLength);
        };
        const save = () => {
            if (!initialized) {
                throw new Error('save() can only be called after init() and before digest()');
            }
            const stateOffset = wasmInstance.exports.Hash_GetState();
            const stateLength = getStateSize();
            const memoryBuffer = wasmInstance.exports.memory.buffer;
            const internalState = new Uint8Array(memoryBuffer, stateOffset, stateLength);
            // prefix is 4 bytes from SHA1 hash of the WASM binary
            // it is used to detect incompatible internal states between different versions of hash-wasm
            const prefixedState = new Uint8Array(WASM_FUNC_HASH_LENGTH + stateLength);
            writeHexToUInt8(prefixedState, binary.hash);
            prefixedState.set(internalState, WASM_FUNC_HASH_LENGTH);
            return prefixedState;
        };
        const load = (state) => {
            if (!(state instanceof Uint8Array)) {
                throw new Error('load() expects an Uint8Array generated by save()');
            }
            const stateOffset = wasmInstance.exports.Hash_GetState();
            const stateLength = getStateSize();
            const overallLength = WASM_FUNC_HASH_LENGTH + stateLength;
            const memoryBuffer = wasmInstance.exports.memory.buffer;
            if (state.length !== overallLength) {
                throw new Error(`Bad state length (expected ${overallLength} bytes, got ${state.length})`);
            }
            if (!hexStringEqualsUInt8(binary.hash, state.subarray(0, WASM_FUNC_HASH_LENGTH))) {
                throw new Error('This state was written by an incompatible hash implementation');
            }
            const internalState = state.subarray(WASM_FUNC_HASH_LENGTH);
            new Uint8Array(memoryBuffer, stateOffset, stateLength).set(internalState);
            initialized = true;
        };
        const isDataShort = (data) => {
            if (typeof data === 'string') {
                // worst case is 4 bytes / char
                return data.length < MAX_HEAP / 4;
            }
            return data.byteLength < MAX_HEAP;
        };
        let canSimplify = isDataShort;
        switch (binary.name) {
            case 'argon2':
            case 'scrypt':
                canSimplify = () => true;
                break;
            case 'blake2b':
            case 'blake2s':
                // if there is a key at blake2 then cannot simplify
                canSimplify = (data, initParam) => initParam <= 512 && isDataShort(data);
                break;
            case 'blake3':
                // if there is a key at blake3 then cannot simplify
                canSimplify = (data, initParam) => initParam === 0 && isDataShort(data);
                break;
            case 'xxhash64': // cannot simplify
            case 'xxhash3':
            case 'xxhash128':
                canSimplify = () => false;
                break;
        }
        // shorthand for (init + update + digest) for better performance
        const calculate = (data, initParam = null, digestParam = null) => {
            if (!canSimplify(data, initParam)) {
                init(initParam);
                update(data);
                return digest('hex', digestParam);
            }
            const buffer = getUInt8Buffer(data);
            memoryView.set(buffer);
            wasmInstance.exports.Hash_Calculate(buffer.length, initParam, digestParam);
            return getDigestHex(digestChars, memoryView, hashLength);
        };
        yield setupInterface();
        return {
            getMemory,
            writeMemory,
            getExports,
            setMemorySize,
            init,
            update,
            digest,
            save,
            load,
            calculate,
            hashLength,
        };
    });
}

function lockedCreate(mutex, binary, hashLength) {
    return __awaiter(this, void 0, void 0, function* () {
        const unlock = yield mutex.lock();
        const wasm = yield WASMInterface(binary, hashLength);
        unlock();
        return wasm;
    });
}

new Mutex();

new Mutex();

new Mutex();

new Mutex();

new Mutex();

new Mutex();

new Mutex();

var name$d = "md5";
var data$d = "AGFzbQEAAAABEgRgAAF/YAAAYAF/AGACf38BfwMIBwABAgMBAAIFBAEBAgIGDgJ/AUGgigULfwBBgAgLB3AIBm1lbW9yeQIADkhhc2hfR2V0QnVmZmVyAAAJSGFzaF9Jbml0AAELSGFzaF9VcGRhdGUAAgpIYXNoX0ZpbmFsAAQNSGFzaF9HZXRTdGF0ZQAFDkhhc2hfQ2FsY3VsYXRlAAYKU1RBVEVfU0laRQMBCooaBwUAQYAJCy0AQQBC/rnrxemOlZkQNwKQiQFBAEKBxpS6lvHq5m83AoiJAUEAQgA3AoCJAQu+BQEHf0EAQQAoAoCJASIBIABqQf////8BcSICNgKAiQFBAEEAKAKEiQEgAiABSWogAEEddmo2AoSJAQJAAkACQAJAAkACQCABQT9xIgMNAEGACSEEDAELQcAAIANrIgUgAEsNASAFQQNxIQZBACEBAkAgA0E/c0EDSQ0AIANBgIkBaiEEIAVB/ABxIQdBACEBA0AgBCABaiICQRhqIAFBgAlqLQAAOgAAIAJBGWogAUGBCWotAAA6AAAgAkEaaiABQYIJai0AADoAACACQRtqIAFBgwlqLQAAOgAAIAcgAUEEaiIBRw0ACwsCQCAGRQ0AIANBmIkBaiECA0AgAiABaiABQYAJai0AADoAACABQQFqIQEgBkF/aiIGDQALC0GYiQFBwAAQAxogACAFayEAIAVBgAlqIQQLIABBwABPDQEgACECDAILIABFDQIgAEEDcSEGQQAhAQJAIABBBEkNACADQYCJAWohBCAAQXxxIQBBACEBA0AgBCABaiICQRhqIAFBgAlqLQAAOgAAIAJBGWogAUGBCWotAAA6AAAgAkEaaiABQYIJai0AADoAACACQRtqIAFBgwlqLQAAOgAAIAAgAUEEaiIBRw0ACwsgBkUNAiADQZiJAWohAgNAIAIgAWogAUGACWotAAA6AAAgAUEBaiEBIAZBf2oiBg0ADAMLCyAAQT9xIQIgBCAAQUBxEAMhBAsgAkUNACACQQNxIQZBACEBAkAgAkEESQ0AIAJBPHEhAEEAIQEDQCABQZiJAWogBCABaiICLQAAOgAAIAFBmYkBaiACQQFqLQAAOgAAIAFBmokBaiACQQJqLQAAOgAAIAFBm4kBaiACQQNqLQAAOgAAIAAgAUEEaiIBRw0ACwsgBkUNAANAIAFBmIkBaiAEIAFqLQAAOgAAIAFBAWohASAGQX9qIgYNAAsLC4cQARl/QQAoApSJASECQQAoApCJASEDQQAoAoyJASEEQQAoAoiJASEFA0AgACgCCCIGIAAoAhgiByAAKAIoIgggACgCOCIJIAAoAjwiCiAAKAIMIgsgACgCHCIMIAAoAiwiDSAMIAsgCiANIAkgCCAHIAMgBmogAiAAKAIEIg5qIAUgBCACIANzcSACc2ogACgCACIPakH4yKq7fWpBB3cgBGoiECAEIANzcSADc2pB1u6exn5qQQx3IBBqIhEgECAEc3EgBHNqQdvhgaECakERdyARaiISaiAAKAIUIhMgEWogACgCECIUIBBqIAQgC2ogEiARIBBzcSAQc2pB7p33jXxqQRZ3IBJqIhAgEiARc3EgEXNqQa+f8Kt/akEHdyAQaiIRIBAgEnNxIBJzakGqjJ+8BGpBDHcgEWoiEiARIBBzcSAQc2pBk4zBwXpqQRF3IBJqIhVqIAAoAiQiFiASaiAAKAIgIhcgEWogDCAQaiAVIBIgEXNxIBFzakGBqppqakEWdyAVaiIQIBUgEnNxIBJzakHYsYLMBmpBB3cgEGoiESAQIBVzcSAVc2pBr++T2nhqQQx3IBFqIhIgESAQc3EgEHNqQbG3fWpBEXcgEmoiFWogACgCNCIYIBJqIAAoAjAiGSARaiANIBBqIBUgEiARc3EgEXNqQb6v88p4akEWdyAVaiIQIBUgEnNxIBJzakGiosDcBmpBB3cgEGoiESAQIBVzcSAVc2pBk+PhbGpBDHcgEWoiFSARIBBzcSAQc2pBjofls3pqQRF3IBVqIhJqIAcgFWogDiARaiAKIBBqIBIgFSARc3EgEXNqQaGQ0M0EakEWdyASaiIQIBJzIBVxIBJzakHiyviwf2pBBXcgEGoiESAQcyAScSAQc2pBwOaCgnxqQQl3IBFqIhIgEXMgEHEgEXNqQdG0+bICakEOdyASaiIVaiAIIBJqIBMgEWogDyAQaiAVIBJzIBFxIBJzakGqj9vNfmpBFHcgFWoiECAVcyAScSAVc2pB3aC8sX1qQQV3IBBqIhEgEHMgFXEgEHNqQdOokBJqQQl3IBFqIhIgEXMgEHEgEXNqQYHNh8V9akEOdyASaiIVaiAJIBJqIBYgEWogFCAQaiAVIBJzIBFxIBJzakHI98++fmpBFHcgFWoiECAVcyAScSAVc2pB5puHjwJqQQV3IBBqIhEgEHMgFXEgEHNqQdaP3Jl8akEJdyARaiISIBFzIBBxIBFzakGHm9Smf2pBDncgEmoiFWogBiASaiAYIBFqIBcgEGogFSAScyARcSASc2pB7anoqgRqQRR3IBVqIhAgFXMgEnEgFXNqQYXSj896akEFdyAQaiIRIBBzIBVxIBBzakH4x75nakEJdyARaiISIBFzIBBxIBFzakHZhby7BmpBDncgEmoiFWogFyASaiATIBFqIBkgEGogFSAScyARcSASc2pBipmp6XhqQRR3IBVqIhAgFXMiFSASc2pBwvJoakEEdyAQaiIRIBVzakGB7ce7eGpBC3cgEWoiEiARcyIaIBBzakGiwvXsBmpBEHcgEmoiFWogFCASaiAOIBFqIAkgEGogFSAac2pBjPCUb2pBF3cgFWoiECAVcyIVIBJzakHE1PulempBBHcgEGoiESAVc2pBqZ/73gRqQQt3IBFqIhIgEXMiCSAQc2pB4JbttX9qQRB3IBJqIhVqIA8gEmogGCARaiAIIBBqIBUgCXNqQfD4/vV7akEXdyAVaiIQIBVzIhUgEnNqQcb97cQCakEEdyAQaiIRIBVzakH6z4TVfmpBC3cgEWoiEiARcyIIIBBzakGF4bynfWpBEHcgEmoiFWogGSASaiAWIBFqIAcgEGogFSAIc2pBhbqgJGpBF3cgFWoiESAVcyIQIBJzakG5oNPOfWpBBHcgEWoiEiAQc2pB5bPutn5qQQt3IBJqIhUgEnMiByARc2pB+PmJ/QFqQRB3IBVqIhBqIAwgFWogDyASaiAGIBFqIBAgB3NqQeWssaV8akEXdyAQaiIRIBVBf3NyIBBzakHExKShf2pBBncgEWoiEiAQQX9zciARc2pBl/+rmQRqQQp3IBJqIhAgEUF/c3IgEnNqQafH0Nx6akEPdyAQaiIVaiALIBBqIBkgEmogEyARaiAVIBJBf3NyIBBzakG5wM5kakEVdyAVaiIRIBBBf3NyIBVzakHDs+2qBmpBBncgEWoiECAVQX9zciARc2pBkpmz+HhqQQp3IBBqIhIgEUF/c3IgEHNqQf3ov39qQQ93IBJqIhVqIAogEmogFyAQaiAOIBFqIBUgEEF/c3IgEnNqQdG7kax4akEVdyAVaiIQIBJBf3NyIBVzakHP/KH9BmpBBncgEGoiESAVQX9zciAQc2pB4M2zcWpBCncgEWoiEiAQQX9zciARc2pBlIaFmHpqQQ93IBJqIhVqIA0gEmogFCARaiAYIBBqIBUgEUF/c3IgEnNqQaGjoPAEakEVdyAVaiIQIBJBf3NyIBVzakGC/c26f2pBBncgEGoiESAVQX9zciAQc2pBteTr6XtqQQp3IBFqIhIgEEF/c3IgEXNqQbul39YCakEPdyASaiIVIARqIBYgEGogFSARQX9zciASc2pBkaeb3H5qQRV3aiEEIBUgA2ohAyASIAJqIQIgESAFaiEFIABBwABqIQAgAUFAaiIBDQALQQAgAjYClIkBQQAgAzYCkIkBQQAgBDYCjIkBQQAgBTYCiIkBIAALzwMBBH9BACgCgIkBQT9xIgBBmIkBakGAAToAACAAQQFqIQECQAJAAkACQCAAQT9zIgJBB0sNACACRQ0BIAFBmIkBakEAOgAAIAJBAUYNASAAQZqJAWpBADoAACACQQJGDQEgAEGbiQFqQQA6AAAgAkEDRg0BIABBnIkBakEAOgAAIAJBBEYNASAAQZ2JAWpBADoAACACQQVGDQEgAEGeiQFqQQA6AAAgAkEGRg0BIABBn4kBakEAOgAADAELIAJBCEYNAkE2IABrIQMCQCACQQNxIgANACADIQIMAgtBACAAayECQQAhAANAIABBz4kBakEAOgAAIAIgAEF/aiIARw0ACyADIABqIQIMAQtBmIkBQcAAEAMaQQAhAUE3IQNBNyECCyADQQNJDQAgAUGAiQFqIQBBfyEBA0AgACACakEVakEANgAAIABBfGohACACIAFBBGoiAUcNAAsLQQBBACgChIkBNgLUiQFBAEEAKAKAiQEiAEEVdjoA04kBQQAgAEENdjoA0okBQQAgAEEFdjoA0YkBQQAgAEEDdCIAOgDQiQFBACAANgKAiQFBmIkBQcAAEAMaQQBBACkCiIkBNwOACUEAQQApApCJATcDiAkLBgBBgIkBCzMAQQBC/rnrxemOlZkQNwKQiQFBAEKBxpS6lvHq5m83AoiJAUEAQgA3AoCJASAAEAIQBAsLCwEAQYAICwSYAAAA";
var hash$d = "42fa4d29";
var wasmJson$d = {
	name: name$d,
	data: data$d,
	hash: hash$d
};

const mutex$e = new Mutex();
let wasmCache$e = null;
/**
 * Calculates MD5 hash
 * @param data Input data (string, Buffer or TypedArray)
 * @returns Computed hash as a hexadecimal string
 */
function md5(data) {
    if (wasmCache$e === null) {
        return lockedCreate(mutex$e, wasmJson$d, 16)
            .then((wasm) => {
            wasmCache$e = wasm;
            return wasmCache$e.calculate(data);
        });
    }
    try {
        const hash = wasmCache$e.calculate(data);
        return Promise.resolve(hash);
    }
    catch (err) {
        return Promise.reject(err);
    }
}

new Mutex();

new Mutex();

new Mutex();

new Mutex();

new Mutex();

new Mutex();

new Mutex();

new Mutex();

new Mutex();

new Mutex();

new Mutex();

new Mutex();

new Mutex();

new Mutex();

var WorkerLabelsEnum;
(function(WorkerLabelsEnum) {
    WorkerLabelsEnum[WorkerLabelsEnum["INIT"] = 0] = "INIT";
    WorkerLabelsEnum[WorkerLabelsEnum["CHUNK"] = 1] = "CHUNK";
    WorkerLabelsEnum[WorkerLabelsEnum["DONE"] = 2] = "DONE";
})(WorkerLabelsEnum || (WorkerLabelsEnum = {}));

var StatusEnum;
(function(StatusEnum) {
    StatusEnum["RUNNING"] = "running";
    StatusEnum["WAITING"] = "waiting";
})(StatusEnum || (StatusEnum = {}));
class WorkerWrapper {
    worker;
    status;
    constructor(worker){
        this.worker = worker;
        this.status = "waiting";
    }
    run(param, params, index) {
        this.status = "running";
        return new Promise((rs, rj)=>{
            this.worker.onmessage = ({ data })=>{
                const { label, content } = data;
                if (label === WorkerLabelsEnum.DONE && content) {
                    params[index] = content.chunk;
                    this.status = "waiting";
                    rs(content.result);
                }
            };
            this.worker.onerror = (e)=>{
                this.status = "waiting";
                rj(e);
            };
            this.worker.postMessage(param, [
                param
            ]);
        });
    }
}

class WorkerPool {
    pool = [];
    maxWorkerCount;
    curRunningCount = new MiniSubject(0);
    results = [];
    constructor(maxWorkers = navigator.hardwareConcurrency || 4){
        this.maxWorkerCount = maxWorkers;
    }
    exec(params) {
        this.results.length = 0;
        const workerParams = params.map((param, index)=>({
                data: param,
                index
            }));
        return new Promise((rs)=>{
            this.curRunningCount.subscribe((count)=>{
                if (count < this.maxWorkerCount && workerParams.length !== 0) {
                    // 当前能跑的任务数量
                    let curTaskCount = this.maxWorkerCount - count;
                    if (curTaskCount > params.length) {
                        curTaskCount = params.length;
                    }
                    // 此时可以用来执行任务的 Worker
                    const canUseWorker = [];
                    for (const worker of this.pool){
                        if (worker.status === StatusEnum.WAITING) {
                            canUseWorker.push(worker);
                            if (canUseWorker.length === curTaskCount) {
                                break;
                            }
                        }
                    }
                    const paramsToRun = workerParams.splice(0, curTaskCount);
                    // 更新当前正在跑起来的 worker 数量
                    this.curRunningCount.next(this.curRunningCount.value + curTaskCount);
                    canUseWorker.forEach((workerApp, index)=>{
                        const param = paramsToRun[index];
                        workerApp.run(param.data, params, param.index).then((res)=>{
                            this.results[param.index] = res;
                        }).catch((e)=>{
                            this.results[param.index] = e;
                        }).finally(()=>{
                            this.curRunningCount.next(this.curRunningCount.value - 1);
                        });
                    });
                }
                if (this.curRunningCount.value === 0 && workerParams.length === 0) {
                    rs(this.results);
                }
            });
        });
    }
}

var WorkerClass = null;

try {
    var WorkerThreads =
        typeof module !== 'undefined' && typeof module.require === 'function' && module.require('worker_threads') ||
        typeof __non_webpack_require__ === 'function' && __non_webpack_require__('worker_threads') ||
        typeof require === 'function' && require('worker_threads');
    WorkerClass = WorkerThreads.Worker;
} catch(e) {} // eslint-disable-line

function decodeBase64$1(base64, enableUnicode) {
    return Buffer.from(base64, 'base64').toString('utf8');
}

function createBase64WorkerFactory$2(base64, sourcemapArg, enableUnicodeArg) {
    var source = decodeBase64$1(base64);
    var start = source.indexOf('\n', 10) + 1;
    var body = source.substring(start) + ('');
    return function WorkerFactory(options) {
        return new WorkerClass(body, Object.assign({}, options, { eval: true }));
    };
}

function decodeBase64(base64, enableUnicode) {
    var binaryString = atob(base64);
    return binaryString;
}

function createURL(base64, sourcemapArg, enableUnicodeArg) {
    var source = decodeBase64(base64);
    var start = source.indexOf('\n', 10) + 1;
    var body = source.substring(start) + ('');
    var blob = new Blob([body], { type: 'application/javascript' });
    return URL.createObjectURL(blob);
}

function createBase64WorkerFactory$1(base64, sourcemapArg, enableUnicodeArg) {
    var url;
    return function WorkerFactory(options) {
        url = url || createURL(base64);
        return new Worker(url, options);
    };
}

var kIsNodeJS = Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]';

function isNodeJS() {
    return kIsNodeJS;
}

function createBase64WorkerFactory(base64, sourcemapArg, enableUnicodeArg) {
    if (isNodeJS()) {
        return createBase64WorkerFactory$2(base64);
    }
    return createBase64WorkerFactory$1(base64);
}

var WorkerFactory$1 = createBase64WorkerFactory('Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwooZnVuY3Rpb24gKCkgewogICd1c2Ugc3RyaWN0JzsKCiAgY2xhc3MgV29ya2VyTWVzc2FnZSB7CiAgICAgIGxhYmVsOwogICAgICBjb250ZW50OwogICAgICBjb25zdHJ1Y3RvcihsYWJlbCwgY29udGVudCl7CiAgICAgICAgICB0aGlzLmxhYmVsID0gbGFiZWw7CiAgICAgICAgICB0aGlzLmNvbnRlbnQgPSBjb250ZW50OwogICAgICB9CiAgfQoKICB2YXIgV29ya2VyTGFiZWxzRW51bTsKICAoZnVuY3Rpb24oV29ya2VyTGFiZWxzRW51bSkgewogICAgICBXb3JrZXJMYWJlbHNFbnVtW1dvcmtlckxhYmVsc0VudW1bIklOSVQiXSA9IDBdID0gIklOSVQiOwogICAgICBXb3JrZXJMYWJlbHNFbnVtW1dvcmtlckxhYmVsc0VudW1bIkNIVU5LIl0gPSAxXSA9ICJDSFVOSyI7CiAgICAgIFdvcmtlckxhYmVsc0VudW1bV29ya2VyTGFiZWxzRW51bVsiRE9ORSJdID0gMl0gPSAiRE9ORSI7CiAgfSkoV29ya2VyTGFiZWxzRW51bSB8fCAoV29ya2VyTGFiZWxzRW51bSA9IHt9KSk7CgogIC8qIQogICAqIGhhc2gtd2FzbSAoaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvaGFzaC13YXNtKQogICAqIChjKSBEYW5pIEJpcm8KICAgKiBAbGljZW5zZSBNSVQKICAgKi8KCiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKg0KICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4NCg0KICBQZXJtaXNzaW9uIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBhbmQvb3IgZGlzdHJpYnV0ZSB0aGlzIHNvZnR3YXJlIGZvciBhbnkNCiAgcHVycG9zZSB3aXRoIG9yIHdpdGhvdXQgZmVlIGlzIGhlcmVieSBncmFudGVkLg0KDQogIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCAiQVMgSVMiIEFORCBUSEUgQVVUSE9SIERJU0NMQUlNUyBBTEwgV0FSUkFOVElFUyBXSVRIDQogIFJFR0FSRCBUTyBUSElTIFNPRlRXQVJFIElOQ0xVRElORyBBTEwgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWQ0KICBBTkQgRklUTkVTUy4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUiBCRSBMSUFCTEUgRk9SIEFOWSBTUEVDSUFMLCBESVJFQ1QsDQogIElORElSRUNULCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgT1IgQU5ZIERBTUFHRVMgV0hBVFNPRVZFUiBSRVNVTFRJTkcgRlJPTQ0KICBMT1NTIE9GIFVTRSwgREFUQSBPUiBQUk9GSVRTLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgTkVHTElHRU5DRSBPUg0KICBPVEhFUiBUT1JUSU9VUyBBQ1RJT04sIEFSSVNJTkcgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgVVNFIE9SDQogIFBFUkZPUk1BTkNFIE9GIFRISVMgU09GVFdBUkUuDQogICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovDQogIC8qIGdsb2JhbCBSZWZsZWN0LCBQcm9taXNlLCBTdXBwcmVzc2VkRXJyb3IsIFN5bWJvbCAqLw0KDQoNCiAgZnVuY3Rpb24gX19hd2FpdGVyKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikgew0KICAgICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9DQogICAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHsNCiAgICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9DQogICAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbInRocm93Il0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfQ0KICAgICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9DQogICAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIFtdKSkubmV4dCgpKTsNCiAgICAgIH0pOw0KICB9DQoNCiAgdHlwZW9mIFN1cHByZXNzZWRFcnJvciA9PT0gImZ1bmN0aW9uIiA/IFN1cHByZXNzZWRFcnJvciA6IGZ1bmN0aW9uIChlcnJvciwgc3VwcHJlc3NlZCwgbWVzc2FnZSkgew0KICAgICAgdmFyIGUgPSBuZXcgRXJyb3IobWVzc2FnZSk7DQogICAgICByZXR1cm4gZS5uYW1lID0gIlN1cHByZXNzZWRFcnJvciIsIGUuZXJyb3IgPSBlcnJvciwgZS5zdXBwcmVzc2VkID0gc3VwcHJlc3NlZCwgZTsNCiAgfTsKCiAgY2xhc3MgTXV0ZXggewogICAgICBjb25zdHJ1Y3RvcigpIHsKICAgICAgICAgIHRoaXMubXV0ZXggPSBQcm9taXNlLnJlc29sdmUoKTsKICAgICAgfQogICAgICBsb2NrKCkgewogICAgICAgICAgbGV0IGJlZ2luID0gKCkgPT4geyB9OwogICAgICAgICAgdGhpcy5tdXRleCA9IHRoaXMubXV0ZXgudGhlbigoKSA9PiBuZXcgUHJvbWlzZShiZWdpbikpOwogICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXMpID0+IHsKICAgICAgICAgICAgICBiZWdpbiA9IHJlczsKICAgICAgICAgIH0pOwogICAgICB9CiAgICAgIGRpc3BhdGNoKGZuKSB7CiAgICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkgewogICAgICAgICAgICAgIGNvbnN0IHVubG9jayA9IHlpZWxkIHRoaXMubG9jaygpOwogICAgICAgICAgICAgIHRyeSB7CiAgICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCBQcm9taXNlLnJlc29sdmUoZm4oKSk7CiAgICAgICAgICAgICAgfQogICAgICAgICAgICAgIGZpbmFsbHkgewogICAgICAgICAgICAgICAgICB1bmxvY2soKTsKICAgICAgICAgICAgICB9CiAgICAgICAgICB9KTsKICAgICAgfQogIH0KCiAgLyogZXNsaW50LWRpc2FibGUgaW1wb3J0L3ByZWZlci1kZWZhdWx0LWV4cG9ydCAqLwogIC8qIGVzbGludC1kaXNhYmxlIG5vLWJpdHdpc2UgKi8KICB2YXIgX2E7CiAgZnVuY3Rpb24gZ2V0R2xvYmFsKCkgewogICAgICBpZiAodHlwZW9mIGdsb2JhbFRoaXMgIT09ICd1bmRlZmluZWQnKQogICAgICAgICAgcmV0dXJuIGdsb2JhbFRoaXM7CiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1yZXN0cmljdGVkLWdsb2JhbHMKICAgICAgaWYgKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJykKICAgICAgICAgIHJldHVybiBzZWxmOwogICAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpCiAgICAgICAgICByZXR1cm4gd2luZG93OwogICAgICByZXR1cm4gZ2xvYmFsOwogIH0KICBjb25zdCBnbG9iYWxPYmplY3QgPSBnZXRHbG9iYWwoKTsKICBjb25zdCBub2RlQnVmZmVyID0gKF9hID0gZ2xvYmFsT2JqZWN0LkJ1ZmZlcikgIT09IG51bGwgJiYgX2EgIT09IHZvaWQgMCA/IF9hIDogbnVsbDsKICBjb25zdCB0ZXh0RW5jb2RlciA9IGdsb2JhbE9iamVjdC5UZXh0RW5jb2RlciA/IG5ldyBnbG9iYWxPYmplY3QuVGV4dEVuY29kZXIoKSA6IG51bGw7CiAgZnVuY3Rpb24gaGV4Q2hhckNvZGVzVG9JbnQoYSwgYikgewogICAgICByZXR1cm4gKCgoYSAmIDB4RikgKyAoKGEgPj4gNikgfCAoKGEgPj4gMykgJiAweDgpKSkgPDwgNCkgfCAoKGIgJiAweEYpICsgKChiID4+IDYpIHwgKChiID4+IDMpICYgMHg4KSkpOwogIH0KICBmdW5jdGlvbiB3cml0ZUhleFRvVUludDgoYnVmLCBzdHIpIHsKICAgICAgY29uc3Qgc2l6ZSA9IHN0ci5sZW5ndGggPj4gMTsKICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaXplOyBpKyspIHsKICAgICAgICAgIGNvbnN0IGluZGV4ID0gaSA8PCAxOwogICAgICAgICAgYnVmW2ldID0gaGV4Q2hhckNvZGVzVG9JbnQoc3RyLmNoYXJDb2RlQXQoaW5kZXgpLCBzdHIuY2hhckNvZGVBdChpbmRleCArIDEpKTsKICAgICAgfQogIH0KICBmdW5jdGlvbiBoZXhTdHJpbmdFcXVhbHNVSW50OChzdHIsIGJ1ZikgewogICAgICBpZiAoc3RyLmxlbmd0aCAhPT0gYnVmLmxlbmd0aCAqIDIpIHsKICAgICAgICAgIHJldHVybiBmYWxzZTsKICAgICAgfQogICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJ1Zi5sZW5ndGg7IGkrKykgewogICAgICAgICAgY29uc3Qgc3RySW5kZXggPSBpIDw8IDE7CiAgICAgICAgICBpZiAoYnVmW2ldICE9PSBoZXhDaGFyQ29kZXNUb0ludChzdHIuY2hhckNvZGVBdChzdHJJbmRleCksIHN0ci5jaGFyQ29kZUF0KHN0ckluZGV4ICsgMSkpKSB7CiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlOwogICAgICAgICAgfQogICAgICB9CiAgICAgIHJldHVybiB0cnVlOwogIH0KICBjb25zdCBhbHBoYSA9ICdhJy5jaGFyQ29kZUF0KDApIC0gMTA7CiAgY29uc3QgZGlnaXQgPSAnMCcuY2hhckNvZGVBdCgwKTsKICBmdW5jdGlvbiBnZXREaWdlc3RIZXgodG1wQnVmZmVyLCBpbnB1dCwgaGFzaExlbmd0aCkgewogICAgICBsZXQgcCA9IDA7CiAgICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXBsdXNwbHVzICovCiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGFzaExlbmd0aDsgaSsrKSB7CiAgICAgICAgICBsZXQgbmliYmxlID0gaW5wdXRbaV0gPj4+IDQ7CiAgICAgICAgICB0bXBCdWZmZXJbcCsrXSA9IG5pYmJsZSA+IDkgPyBuaWJibGUgKyBhbHBoYSA6IG5pYmJsZSArIGRpZ2l0OwogICAgICAgICAgbmliYmxlID0gaW5wdXRbaV0gJiAweEY7CiAgICAgICAgICB0bXBCdWZmZXJbcCsrXSA9IG5pYmJsZSA+IDkgPyBuaWJibGUgKyBhbHBoYSA6IG5pYmJsZSArIGRpZ2l0OwogICAgICB9CiAgICAgIC8qIGVzbGludC1lbmFibGUgbm8tcGx1c3BsdXMgKi8KICAgICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgdG1wQnVmZmVyKTsKICB9CiAgY29uc3QgZ2V0VUludDhCdWZmZXIgPSBub2RlQnVmZmVyICE9PSBudWxsCiAgICAgID8gKGRhdGEpID0+IHsKICAgICAgICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycpIHsKICAgICAgICAgICAgICBjb25zdCBidWYgPSBub2RlQnVmZmVyLmZyb20oZGF0YSwgJ3V0ZjgnKTsKICAgICAgICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYnVmLmJ1ZmZlciwgYnVmLmJ5dGVPZmZzZXQsIGJ1Zi5sZW5ndGgpOwogICAgICAgICAgfQogICAgICAgICAgaWYgKG5vZGVCdWZmZXIuaXNCdWZmZXIoZGF0YSkpIHsKICAgICAgICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoZGF0YS5idWZmZXIsIGRhdGEuYnl0ZU9mZnNldCwgZGF0YS5sZW5ndGgpOwogICAgICAgICAgfQogICAgICAgICAgaWYgKEFycmF5QnVmZmVyLmlzVmlldyhkYXRhKSkgewogICAgICAgICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShkYXRhLmJ1ZmZlciwgZGF0YS5ieXRlT2Zmc2V0LCBkYXRhLmJ5dGVMZW5ndGgpOwogICAgICAgICAgfQogICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGRhdGEgdHlwZSEnKTsKICAgICAgfQogICAgICA6IChkYXRhKSA9PiB7CiAgICAgICAgICBpZiAodHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnKSB7CiAgICAgICAgICAgICAgcmV0dXJuIHRleHRFbmNvZGVyLmVuY29kZShkYXRhKTsKICAgICAgICAgIH0KICAgICAgICAgIGlmIChBcnJheUJ1ZmZlci5pc1ZpZXcoZGF0YSkpIHsKICAgICAgICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoZGF0YS5idWZmZXIsIGRhdGEuYnl0ZU9mZnNldCwgZGF0YS5ieXRlTGVuZ3RoKTsKICAgICAgICAgIH0KICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBkYXRhIHR5cGUhJyk7CiAgICAgIH07CiAgY29uc3QgYmFzZTY0Q2hhcnMgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLyc7CiAgY29uc3QgYmFzZTY0TG9va3VwID0gbmV3IFVpbnQ4QXJyYXkoMjU2KTsKICBmb3IgKGxldCBpID0gMDsgaSA8IGJhc2U2NENoYXJzLmxlbmd0aDsgaSsrKSB7CiAgICAgIGJhc2U2NExvb2t1cFtiYXNlNjRDaGFycy5jaGFyQ29kZUF0KGkpXSA9IGk7CiAgfQogIGZ1bmN0aW9uIGdldERlY29kZUJhc2U2NExlbmd0aChkYXRhKSB7CiAgICAgIGxldCBidWZmZXJMZW5ndGggPSBNYXRoLmZsb29yKGRhdGEubGVuZ3RoICogMC43NSk7CiAgICAgIGNvbnN0IGxlbiA9IGRhdGEubGVuZ3RoOwogICAgICBpZiAoZGF0YVtsZW4gLSAxXSA9PT0gJz0nKSB7CiAgICAgICAgICBidWZmZXJMZW5ndGggLT0gMTsKICAgICAgICAgIGlmIChkYXRhW2xlbiAtIDJdID09PSAnPScpIHsKICAgICAgICAgICAgICBidWZmZXJMZW5ndGggLT0gMTsKICAgICAgICAgIH0KICAgICAgfQogICAgICByZXR1cm4gYnVmZmVyTGVuZ3RoOwogIH0KICBmdW5jdGlvbiBkZWNvZGVCYXNlNjQoZGF0YSkgewogICAgICBjb25zdCBidWZmZXJMZW5ndGggPSBnZXREZWNvZGVCYXNlNjRMZW5ndGgoZGF0YSk7CiAgICAgIGNvbnN0IGxlbiA9IGRhdGEubGVuZ3RoOwogICAgICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlckxlbmd0aCk7CiAgICAgIGxldCBwID0gMDsKICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkgKz0gNCkgewogICAgICAgICAgY29uc3QgZW5jb2RlZDEgPSBiYXNlNjRMb29rdXBbZGF0YS5jaGFyQ29kZUF0KGkpXTsKICAgICAgICAgIGNvbnN0IGVuY29kZWQyID0gYmFzZTY0TG9va3VwW2RhdGEuY2hhckNvZGVBdChpICsgMSldOwogICAgICAgICAgY29uc3QgZW5jb2RlZDMgPSBiYXNlNjRMb29rdXBbZGF0YS5jaGFyQ29kZUF0KGkgKyAyKV07CiAgICAgICAgICBjb25zdCBlbmNvZGVkNCA9IGJhc2U2NExvb2t1cFtkYXRhLmNoYXJDb2RlQXQoaSArIDMpXTsKICAgICAgICAgIGJ5dGVzW3BdID0gKGVuY29kZWQxIDw8IDIpIHwgKGVuY29kZWQyID4+IDQpOwogICAgICAgICAgcCArPSAxOwogICAgICAgICAgYnl0ZXNbcF0gPSAoKGVuY29kZWQyICYgMTUpIDw8IDQpIHwgKGVuY29kZWQzID4+IDIpOwogICAgICAgICAgcCArPSAxOwogICAgICAgICAgYnl0ZXNbcF0gPSAoKGVuY29kZWQzICYgMykgPDwgNikgfCAoZW5jb2RlZDQgJiA2Myk7CiAgICAgICAgICBwICs9IDE7CiAgICAgIH0KICAgICAgcmV0dXJuIGJ5dGVzOwogIH0KCiAgY29uc3QgTUFYX0hFQVAgPSAxNiAqIDEwMjQ7CiAgY29uc3QgV0FTTV9GVU5DX0hBU0hfTEVOR1RIID0gNDsKICBjb25zdCB3YXNtTXV0ZXggPSBuZXcgTXV0ZXgoKTsKICBjb25zdCB3YXNtTW9kdWxlQ2FjaGUgPSBuZXcgTWFwKCk7CiAgZnVuY3Rpb24gV0FTTUludGVyZmFjZShiaW5hcnksIGhhc2hMZW5ndGgpIHsKICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHsKICAgICAgICAgIGxldCB3YXNtSW5zdGFuY2UgPSBudWxsOwogICAgICAgICAgbGV0IG1lbW9yeVZpZXcgPSBudWxsOwogICAgICAgICAgbGV0IGluaXRpYWxpemVkID0gZmFsc2U7CiAgICAgICAgICBpZiAodHlwZW9mIFdlYkFzc2VtYmx5ID09PSAndW5kZWZpbmVkJykgewogICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignV2ViQXNzZW1ibHkgaXMgbm90IHN1cHBvcnRlZCBpbiB0aGlzIGVudmlyb25tZW50IScpOwogICAgICAgICAgfQogICAgICAgICAgY29uc3Qgd3JpdGVNZW1vcnkgPSAoZGF0YSwgb2Zmc2V0ID0gMCkgPT4gewogICAgICAgICAgICAgIG1lbW9yeVZpZXcuc2V0KGRhdGEsIG9mZnNldCk7CiAgICAgICAgICB9OwogICAgICAgICAgY29uc3QgZ2V0TWVtb3J5ID0gKCkgPT4gbWVtb3J5VmlldzsKICAgICAgICAgIGNvbnN0IGdldEV4cG9ydHMgPSAoKSA9PiB3YXNtSW5zdGFuY2UuZXhwb3J0czsKICAgICAgICAgIGNvbnN0IHNldE1lbW9yeVNpemUgPSAodG90YWxTaXplKSA9PiB7CiAgICAgICAgICAgICAgd2FzbUluc3RhbmNlLmV4cG9ydHMuSGFzaF9TZXRNZW1vcnlTaXplKHRvdGFsU2l6ZSk7CiAgICAgICAgICAgICAgY29uc3QgYXJyYXlPZmZzZXQgPSB3YXNtSW5zdGFuY2UuZXhwb3J0cy5IYXNoX0dldEJ1ZmZlcigpOwogICAgICAgICAgICAgIGNvbnN0IG1lbW9yeUJ1ZmZlciA9IHdhc21JbnN0YW5jZS5leHBvcnRzLm1lbW9yeS5idWZmZXI7CiAgICAgICAgICAgICAgbWVtb3J5VmlldyA9IG5ldyBVaW50OEFycmF5KG1lbW9yeUJ1ZmZlciwgYXJyYXlPZmZzZXQsIHRvdGFsU2l6ZSk7CiAgICAgICAgICB9OwogICAgICAgICAgY29uc3QgZ2V0U3RhdGVTaXplID0gKCkgPT4gewogICAgICAgICAgICAgIGNvbnN0IHZpZXcgPSBuZXcgRGF0YVZpZXcod2FzbUluc3RhbmNlLmV4cG9ydHMubWVtb3J5LmJ1ZmZlcik7CiAgICAgICAgICAgICAgY29uc3Qgc3RhdGVTaXplID0gdmlldy5nZXRVaW50MzIod2FzbUluc3RhbmNlLmV4cG9ydHMuU1RBVEVfU0laRSwgdHJ1ZSk7CiAgICAgICAgICAgICAgcmV0dXJuIHN0YXRlU2l6ZTsKICAgICAgICAgIH07CiAgICAgICAgICBjb25zdCBsb2FkV0FTTVByb21pc2UgPSB3YXNtTXV0ZXguZGlzcGF0Y2goKCkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkgewogICAgICAgICAgICAgIGlmICghd2FzbU1vZHVsZUNhY2hlLmhhcyhiaW5hcnkubmFtZSkpIHsKICAgICAgICAgICAgICAgICAgY29uc3QgYXNtID0gZGVjb2RlQmFzZTY0KGJpbmFyeS5kYXRhKTsKICAgICAgICAgICAgICAgICAgY29uc3QgcHJvbWlzZSA9IFdlYkFzc2VtYmx5LmNvbXBpbGUoYXNtKTsKICAgICAgICAgICAgICAgICAgd2FzbU1vZHVsZUNhY2hlLnNldChiaW5hcnkubmFtZSwgcHJvbWlzZSk7CiAgICAgICAgICAgICAgfQogICAgICAgICAgICAgIGNvbnN0IG1vZHVsZSA9IHlpZWxkIHdhc21Nb2R1bGVDYWNoZS5nZXQoYmluYXJ5Lm5hbWUpOwogICAgICAgICAgICAgIHdhc21JbnN0YW5jZSA9IHlpZWxkIFdlYkFzc2VtYmx5Lmluc3RhbnRpYXRlKG1vZHVsZSwgewogICAgICAgICAgICAgIC8vIGVudjogewogICAgICAgICAgICAgIC8vICAgZW1zY3JpcHRlbl9tZW1jcHlfYmlnOiAoZGVzdCwgc3JjLCBudW0pID0+IHsKICAgICAgICAgICAgICAvLyAgICAgY29uc3QgbWVtb3J5QnVmZmVyID0gd2FzbUluc3RhbmNlLmV4cG9ydHMubWVtb3J5LmJ1ZmZlcjsKICAgICAgICAgICAgICAvLyAgICAgY29uc3QgbWVtVmlldyA9IG5ldyBVaW50OEFycmF5KG1lbW9yeUJ1ZmZlciwgMCk7CiAgICAgICAgICAgICAgLy8gICAgIG1lbVZpZXcuc2V0KG1lbVZpZXcuc3ViYXJyYXkoc3JjLCBzcmMgKyBudW0pLCBkZXN0KTsKICAgICAgICAgICAgICAvLyAgIH0sCiAgICAgICAgICAgICAgLy8gICBwcmludF9tZW1vcnk6IChvZmZzZXQsIGxlbikgPT4gewogICAgICAgICAgICAgIC8vICAgICBjb25zdCBtZW1vcnlCdWZmZXIgPSB3YXNtSW5zdGFuY2UuZXhwb3J0cy5tZW1vcnkuYnVmZmVyOwogICAgICAgICAgICAgIC8vICAgICBjb25zdCBtZW1WaWV3ID0gbmV3IFVpbnQ4QXJyYXkobWVtb3J5QnVmZmVyLCAwKTsKICAgICAgICAgICAgICAvLyAgICAgY29uc29sZS5sb2coJ3ByaW50X2ludDMyJywgbWVtVmlldy5zdWJhcnJheShvZmZzZXQsIG9mZnNldCArIGxlbikpOwogICAgICAgICAgICAgIC8vICAgfSwKICAgICAgICAgICAgICAvLyB9LAogICAgICAgICAgICAgIH0pOwogICAgICAgICAgICAgIC8vIHdhc21JbnN0YW5jZS5leHBvcnRzLl9zdGFydCgpOwogICAgICAgICAgfSkpOwogICAgICAgICAgY29uc3Qgc2V0dXBJbnRlcmZhY2UgPSAoKSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7CiAgICAgICAgICAgICAgaWYgKCF3YXNtSW5zdGFuY2UpIHsKICAgICAgICAgICAgICAgICAgeWllbGQgbG9hZFdBU01Qcm9taXNlOwogICAgICAgICAgICAgIH0KICAgICAgICAgICAgICBjb25zdCBhcnJheU9mZnNldCA9IHdhc21JbnN0YW5jZS5leHBvcnRzLkhhc2hfR2V0QnVmZmVyKCk7CiAgICAgICAgICAgICAgY29uc3QgbWVtb3J5QnVmZmVyID0gd2FzbUluc3RhbmNlLmV4cG9ydHMubWVtb3J5LmJ1ZmZlcjsKICAgICAgICAgICAgICBtZW1vcnlWaWV3ID0gbmV3IFVpbnQ4QXJyYXkobWVtb3J5QnVmZmVyLCBhcnJheU9mZnNldCwgTUFYX0hFQVApOwogICAgICAgICAgfSk7CiAgICAgICAgICBjb25zdCBpbml0ID0gKGJpdHMgPSBudWxsKSA9PiB7CiAgICAgICAgICAgICAgaW5pdGlhbGl6ZWQgPSB0cnVlOwogICAgICAgICAgICAgIHdhc21JbnN0YW5jZS5leHBvcnRzLkhhc2hfSW5pdChiaXRzKTsKICAgICAgICAgIH07CiAgICAgICAgICBjb25zdCB1cGRhdGVVSW50OEFycmF5ID0gKGRhdGEpID0+IHsKICAgICAgICAgICAgICBsZXQgcmVhZCA9IDA7CiAgICAgICAgICAgICAgd2hpbGUgKHJlYWQgPCBkYXRhLmxlbmd0aCkgewogICAgICAgICAgICAgICAgICBjb25zdCBjaHVuayA9IGRhdGEuc3ViYXJyYXkocmVhZCwgcmVhZCArIE1BWF9IRUFQKTsKICAgICAgICAgICAgICAgICAgcmVhZCArPSBjaHVuay5sZW5ndGg7CiAgICAgICAgICAgICAgICAgIG1lbW9yeVZpZXcuc2V0KGNodW5rKTsKICAgICAgICAgICAgICAgICAgd2FzbUluc3RhbmNlLmV4cG9ydHMuSGFzaF9VcGRhdGUoY2h1bmsubGVuZ3RoKTsKICAgICAgICAgICAgICB9CiAgICAgICAgICB9OwogICAgICAgICAgY29uc3QgdXBkYXRlID0gKGRhdGEpID0+IHsKICAgICAgICAgICAgICBpZiAoIWluaXRpYWxpemVkKSB7CiAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndXBkYXRlKCkgY2FsbGVkIGJlZm9yZSBpbml0KCknKTsKICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgY29uc3QgVWludDhCdWZmZXIgPSBnZXRVSW50OEJ1ZmZlcihkYXRhKTsKICAgICAgICAgICAgICB1cGRhdGVVSW50OEFycmF5KFVpbnQ4QnVmZmVyKTsKICAgICAgICAgIH07CiAgICAgICAgICBjb25zdCBkaWdlc3RDaGFycyA9IG5ldyBVaW50OEFycmF5KGhhc2hMZW5ndGggKiAyKTsKICAgICAgICAgIGNvbnN0IGRpZ2VzdCA9IChvdXRwdXRUeXBlLCBwYWRkaW5nID0gbnVsbCkgPT4gewogICAgICAgICAgICAgIGlmICghaW5pdGlhbGl6ZWQpIHsKICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdkaWdlc3QoKSBjYWxsZWQgYmVmb3JlIGluaXQoKScpOwogICAgICAgICAgICAgIH0KICAgICAgICAgICAgICBpbml0aWFsaXplZCA9IGZhbHNlOwogICAgICAgICAgICAgIHdhc21JbnN0YW5jZS5leHBvcnRzLkhhc2hfRmluYWwocGFkZGluZyk7CiAgICAgICAgICAgICAgaWYgKG91dHB1dFR5cGUgPT09ICdiaW5hcnknKSB7CiAgICAgICAgICAgICAgICAgIC8vIHRoZSBkYXRhIGlzIGNvcGllZCB0byBhbGxvdyBHQyBvZiB0aGUgb3JpZ2luYWwgbWVtb3J5IG9iamVjdAogICAgICAgICAgICAgICAgICByZXR1cm4gbWVtb3J5Vmlldy5zbGljZSgwLCBoYXNoTGVuZ3RoKTsKICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgcmV0dXJuIGdldERpZ2VzdEhleChkaWdlc3RDaGFycywgbWVtb3J5VmlldywgaGFzaExlbmd0aCk7CiAgICAgICAgICB9OwogICAgICAgICAgY29uc3Qgc2F2ZSA9ICgpID0+IHsKICAgICAgICAgICAgICBpZiAoIWluaXRpYWxpemVkKSB7CiAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignc2F2ZSgpIGNhbiBvbmx5IGJlIGNhbGxlZCBhZnRlciBpbml0KCkgYW5kIGJlZm9yZSBkaWdlc3QoKScpOwogICAgICAgICAgICAgIH0KICAgICAgICAgICAgICBjb25zdCBzdGF0ZU9mZnNldCA9IHdhc21JbnN0YW5jZS5leHBvcnRzLkhhc2hfR2V0U3RhdGUoKTsKICAgICAgICAgICAgICBjb25zdCBzdGF0ZUxlbmd0aCA9IGdldFN0YXRlU2l6ZSgpOwogICAgICAgICAgICAgIGNvbnN0IG1lbW9yeUJ1ZmZlciA9IHdhc21JbnN0YW5jZS5leHBvcnRzLm1lbW9yeS5idWZmZXI7CiAgICAgICAgICAgICAgY29uc3QgaW50ZXJuYWxTdGF0ZSA9IG5ldyBVaW50OEFycmF5KG1lbW9yeUJ1ZmZlciwgc3RhdGVPZmZzZXQsIHN0YXRlTGVuZ3RoKTsKICAgICAgICAgICAgICAvLyBwcmVmaXggaXMgNCBieXRlcyBmcm9tIFNIQTEgaGFzaCBvZiB0aGUgV0FTTSBiaW5hcnkKICAgICAgICAgICAgICAvLyBpdCBpcyB1c2VkIHRvIGRldGVjdCBpbmNvbXBhdGlibGUgaW50ZXJuYWwgc3RhdGVzIGJldHdlZW4gZGlmZmVyZW50IHZlcnNpb25zIG9mIGhhc2gtd2FzbQogICAgICAgICAgICAgIGNvbnN0IHByZWZpeGVkU3RhdGUgPSBuZXcgVWludDhBcnJheShXQVNNX0ZVTkNfSEFTSF9MRU5HVEggKyBzdGF0ZUxlbmd0aCk7CiAgICAgICAgICAgICAgd3JpdGVIZXhUb1VJbnQ4KHByZWZpeGVkU3RhdGUsIGJpbmFyeS5oYXNoKTsKICAgICAgICAgICAgICBwcmVmaXhlZFN0YXRlLnNldChpbnRlcm5hbFN0YXRlLCBXQVNNX0ZVTkNfSEFTSF9MRU5HVEgpOwogICAgICAgICAgICAgIHJldHVybiBwcmVmaXhlZFN0YXRlOwogICAgICAgICAgfTsKICAgICAgICAgIGNvbnN0IGxvYWQgPSAoc3RhdGUpID0+IHsKICAgICAgICAgICAgICBpZiAoIShzdGF0ZSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpKSB7CiAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignbG9hZCgpIGV4cGVjdHMgYW4gVWludDhBcnJheSBnZW5lcmF0ZWQgYnkgc2F2ZSgpJyk7CiAgICAgICAgICAgICAgfQogICAgICAgICAgICAgIGNvbnN0IHN0YXRlT2Zmc2V0ID0gd2FzbUluc3RhbmNlLmV4cG9ydHMuSGFzaF9HZXRTdGF0ZSgpOwogICAgICAgICAgICAgIGNvbnN0IHN0YXRlTGVuZ3RoID0gZ2V0U3RhdGVTaXplKCk7CiAgICAgICAgICAgICAgY29uc3Qgb3ZlcmFsbExlbmd0aCA9IFdBU01fRlVOQ19IQVNIX0xFTkdUSCArIHN0YXRlTGVuZ3RoOwogICAgICAgICAgICAgIGNvbnN0IG1lbW9yeUJ1ZmZlciA9IHdhc21JbnN0YW5jZS5leHBvcnRzLm1lbW9yeS5idWZmZXI7CiAgICAgICAgICAgICAgaWYgKHN0YXRlLmxlbmd0aCAhPT0gb3ZlcmFsbExlbmd0aCkgewogICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEJhZCBzdGF0ZSBsZW5ndGggKGV4cGVjdGVkICR7b3ZlcmFsbExlbmd0aH0gYnl0ZXMsIGdvdCAke3N0YXRlLmxlbmd0aH0pYCk7CiAgICAgICAgICAgICAgfQogICAgICAgICAgICAgIGlmICghaGV4U3RyaW5nRXF1YWxzVUludDgoYmluYXJ5Lmhhc2gsIHN0YXRlLnN1YmFycmF5KDAsIFdBU01fRlVOQ19IQVNIX0xFTkdUSCkpKSB7CiAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGhpcyBzdGF0ZSB3YXMgd3JpdHRlbiBieSBhbiBpbmNvbXBhdGlibGUgaGFzaCBpbXBsZW1lbnRhdGlvbicpOwogICAgICAgICAgICAgIH0KICAgICAgICAgICAgICBjb25zdCBpbnRlcm5hbFN0YXRlID0gc3RhdGUuc3ViYXJyYXkoV0FTTV9GVU5DX0hBU0hfTEVOR1RIKTsKICAgICAgICAgICAgICBuZXcgVWludDhBcnJheShtZW1vcnlCdWZmZXIsIHN0YXRlT2Zmc2V0LCBzdGF0ZUxlbmd0aCkuc2V0KGludGVybmFsU3RhdGUpOwogICAgICAgICAgICAgIGluaXRpYWxpemVkID0gdHJ1ZTsKICAgICAgICAgIH07CiAgICAgICAgICBjb25zdCBpc0RhdGFTaG9ydCA9IChkYXRhKSA9PiB7CiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBkYXRhID09PSAnc3RyaW5nJykgewogICAgICAgICAgICAgICAgICAvLyB3b3JzdCBjYXNlIGlzIDQgYnl0ZXMgLyBjaGFyCiAgICAgICAgICAgICAgICAgIHJldHVybiBkYXRhLmxlbmd0aCA8IE1BWF9IRUFQIC8gNDsKICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgcmV0dXJuIGRhdGEuYnl0ZUxlbmd0aCA8IE1BWF9IRUFQOwogICAgICAgICAgfTsKICAgICAgICAgIGxldCBjYW5TaW1wbGlmeSA9IGlzRGF0YVNob3J0OwogICAgICAgICAgc3dpdGNoIChiaW5hcnkubmFtZSkgewogICAgICAgICAgICAgIGNhc2UgJ2FyZ29uMic6CiAgICAgICAgICAgICAgY2FzZSAnc2NyeXB0JzoKICAgICAgICAgICAgICAgICAgY2FuU2ltcGxpZnkgPSAoKSA9PiB0cnVlOwogICAgICAgICAgICAgICAgICBicmVhazsKICAgICAgICAgICAgICBjYXNlICdibGFrZTJiJzoKICAgICAgICAgICAgICBjYXNlICdibGFrZTJzJzoKICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlcmUgaXMgYSBrZXkgYXQgYmxha2UyIHRoZW4gY2Fubm90IHNpbXBsaWZ5CiAgICAgICAgICAgICAgICAgIGNhblNpbXBsaWZ5ID0gKGRhdGEsIGluaXRQYXJhbSkgPT4gaW5pdFBhcmFtIDw9IDUxMiAmJiBpc0RhdGFTaG9ydChkYXRhKTsKICAgICAgICAgICAgICAgICAgYnJlYWs7CiAgICAgICAgICAgICAgY2FzZSAnYmxha2UzJzoKICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlcmUgaXMgYSBrZXkgYXQgYmxha2UzIHRoZW4gY2Fubm90IHNpbXBsaWZ5CiAgICAgICAgICAgICAgICAgIGNhblNpbXBsaWZ5ID0gKGRhdGEsIGluaXRQYXJhbSkgPT4gaW5pdFBhcmFtID09PSAwICYmIGlzRGF0YVNob3J0KGRhdGEpOwogICAgICAgICAgICAgICAgICBicmVhazsKICAgICAgICAgICAgICBjYXNlICd4eGhhc2g2NCc6IC8vIGNhbm5vdCBzaW1wbGlmeQogICAgICAgICAgICAgIGNhc2UgJ3h4aGFzaDMnOgogICAgICAgICAgICAgIGNhc2UgJ3h4aGFzaDEyOCc6CiAgICAgICAgICAgICAgICAgIGNhblNpbXBsaWZ5ID0gKCkgPT4gZmFsc2U7CiAgICAgICAgICAgICAgICAgIGJyZWFrOwogICAgICAgICAgfQogICAgICAgICAgLy8gc2hvcnRoYW5kIGZvciAoaW5pdCArIHVwZGF0ZSArIGRpZ2VzdCkgZm9yIGJldHRlciBwZXJmb3JtYW5jZQogICAgICAgICAgY29uc3QgY2FsY3VsYXRlID0gKGRhdGEsIGluaXRQYXJhbSA9IG51bGwsIGRpZ2VzdFBhcmFtID0gbnVsbCkgPT4gewogICAgICAgICAgICAgIGlmICghY2FuU2ltcGxpZnkoZGF0YSwgaW5pdFBhcmFtKSkgewogICAgICAgICAgICAgICAgICBpbml0KGluaXRQYXJhbSk7CiAgICAgICAgICAgICAgICAgIHVwZGF0ZShkYXRhKTsKICAgICAgICAgICAgICAgICAgcmV0dXJuIGRpZ2VzdCgnaGV4JywgZGlnZXN0UGFyYW0pOwogICAgICAgICAgICAgIH0KICAgICAgICAgICAgICBjb25zdCBidWZmZXIgPSBnZXRVSW50OEJ1ZmZlcihkYXRhKTsKICAgICAgICAgICAgICBtZW1vcnlWaWV3LnNldChidWZmZXIpOwogICAgICAgICAgICAgIHdhc21JbnN0YW5jZS5leHBvcnRzLkhhc2hfQ2FsY3VsYXRlKGJ1ZmZlci5sZW5ndGgsIGluaXRQYXJhbSwgZGlnZXN0UGFyYW0pOwogICAgICAgICAgICAgIHJldHVybiBnZXREaWdlc3RIZXgoZGlnZXN0Q2hhcnMsIG1lbW9yeVZpZXcsIGhhc2hMZW5ndGgpOwogICAgICAgICAgfTsKICAgICAgICAgIHlpZWxkIHNldHVwSW50ZXJmYWNlKCk7CiAgICAgICAgICByZXR1cm4gewogICAgICAgICAgICAgIGdldE1lbW9yeSwKICAgICAgICAgICAgICB3cml0ZU1lbW9yeSwKICAgICAgICAgICAgICBnZXRFeHBvcnRzLAogICAgICAgICAgICAgIHNldE1lbW9yeVNpemUsCiAgICAgICAgICAgICAgaW5pdCwKICAgICAgICAgICAgICB1cGRhdGUsCiAgICAgICAgICAgICAgZGlnZXN0LAogICAgICAgICAgICAgIHNhdmUsCiAgICAgICAgICAgICAgbG9hZCwKICAgICAgICAgICAgICBjYWxjdWxhdGUsCiAgICAgICAgICAgICAgaGFzaExlbmd0aCwKICAgICAgICAgIH07CiAgICAgIH0pOwogIH0KCiAgZnVuY3Rpb24gbG9ja2VkQ3JlYXRlKG11dGV4LCBiaW5hcnksIGhhc2hMZW5ndGgpIHsKICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHsKICAgICAgICAgIGNvbnN0IHVubG9jayA9IHlpZWxkIG11dGV4LmxvY2soKTsKICAgICAgICAgIGNvbnN0IHdhc20gPSB5aWVsZCBXQVNNSW50ZXJmYWNlKGJpbmFyeSwgaGFzaExlbmd0aCk7CiAgICAgICAgICB1bmxvY2soKTsKICAgICAgICAgIHJldHVybiB3YXNtOwogICAgICB9KTsKICB9CgogIG5ldyBNdXRleCgpOwoKICBuZXcgTXV0ZXgoKTsKCiAgbmV3IE11dGV4KCk7CgogIG5ldyBNdXRleCgpOwoKICBuZXcgTXV0ZXgoKTsKCiAgbmV3IE11dGV4KCk7CgogIG5ldyBNdXRleCgpOwoKICB2YXIgbmFtZSRkID0gIm1kNSI7CiAgdmFyIGRhdGEkZCA9ICJBR0Z6YlFFQUFBQUJFZ1JnQUFGL1lBQUFZQUYvQUdBQ2YzOEJmd01JQndBQkFnTUJBQUlGQkFFQkFnSUdEZ0ovQVVHZ2lnVUxmd0JCZ0FnTEIzQUlCbTFsYlc5eWVRSUFEa2hoYzJoZlIyVjBRblZtWm1WeUFBQUpTR0Z6YUY5SmJtbDBBQUVMU0dGemFGOVZjR1JoZEdVQUFncElZWE5vWDBacGJtRnNBQVFOU0dGemFGOUhaWFJUZEdGMFpRQUZEa2hoYzJoZlEyRnNZM1ZzWVhSbEFBWUtVMVJCVkVWZlUwbGFSUU1CQ29vYUJ3VUFRWUFKQ3kwQVFRQkMvcm5yeGVtT2xaa1FOd0tRaVFGQkFFS0J4cFM2bHZIcTVtODNBb2lKQVVFQVFnQTNBb0NKQVF1K0JRRUhmMEVBUVFBb0FvQ0pBU0lCSUFCcVFmLy8vLzhCY1NJQ05nS0FpUUZCQUVFQUtBS0VpUUVnQWlBQlNXb2dBRUVkZG1vMkFvU0pBUUpBQWtBQ1FBSkFBa0FDUUNBQlFUOXhJZ01OQUVHQUNTRUVEQUVMUWNBQUlBTnJJZ1VnQUVzTkFTQUZRUU54SVFaQkFDRUJBa0FnQTBFL2MwRURTUTBBSUFOQmdJa0JhaUVFSUFWQi9BQnhJUWRCQUNFQkEwQWdCQ0FCYWlJQ1FSaHFJQUZCZ0FscUxRQUFPZ0FBSUFKQkdXb2dBVUdCQ1dvdEFBQTZBQUFnQWtFYWFpQUJRWUlKYWkwQUFEb0FBQ0FDUVJ0cUlBRkJnd2xxTFFBQU9nQUFJQWNnQVVFRWFpSUJSdzBBQ3dzQ1FDQUdSUTBBSUFOQm1Ja0JhaUVDQTBBZ0FpQUJhaUFCUVlBSmFpMEFBRG9BQUNBQlFRRnFJUUVnQmtGL2FpSUdEUUFMQzBHWWlRRkJ3QUFRQXhvZ0FDQUZheUVBSUFWQmdBbHFJUVFMSUFCQndBQlBEUUVnQUNFQ0RBSUxJQUJGRFFJZ0FFRURjU0VHUVFBaEFRSkFJQUJCQkVrTkFDQURRWUNKQVdvaEJDQUFRWHh4SVFCQkFDRUJBMEFnQkNBQmFpSUNRUmhxSUFGQmdBbHFMUUFBT2dBQUlBSkJHV29nQVVHQkNXb3RBQUE2QUFBZ0FrRWFhaUFCUVlJSmFpMEFBRG9BQUNBQ1FSdHFJQUZCZ3dscUxRQUFPZ0FBSUFBZ0FVRUVhaUlCUncwQUN3c2dCa1VOQWlBRFFaaUpBV29oQWdOQUlBSWdBV29nQVVHQUNXb3RBQUE2QUFBZ0FVRUJhaUVCSUFaQmYyb2lCZzBBREFNTEN5QUFRVDl4SVFJZ0JDQUFRVUJ4RUFNaEJBc2dBa1VOQUNBQ1FRTnhJUVpCQUNFQkFrQWdBa0VFU1EwQUlBSkJQSEVoQUVFQUlRRURRQ0FCUVppSkFXb2dCQ0FCYWlJQ0xRQUFPZ0FBSUFGQm1Za0JhaUFDUVFGcUxRQUFPZ0FBSUFGQm1va0JhaUFDUVFKcUxRQUFPZ0FBSUFGQm00a0JhaUFDUVFOcUxRQUFPZ0FBSUFBZ0FVRUVhaUlCUncwQUN3c2dCa1VOQUFOQUlBRkJtSWtCYWlBRUlBRnFMUUFBT2dBQUlBRkJBV29oQVNBR1FYOXFJZ1lOQUFzTEM0Y1FBUmwvUVFBb0FwU0pBU0VDUVFBb0FwQ0pBU0VEUVFBb0FveUpBU0VFUVFBb0FvaUpBU0VGQTBBZ0FDZ0NDQ0lHSUFBb0FoZ2lCeUFBS0FJb0lnZ2dBQ2dDT0NJSklBQW9BandpQ2lBQUtBSU1JZ3NnQUNnQ0hDSU1JQUFvQWl3aURTQU1JQXNnQ2lBTklBa2dDQ0FISUFNZ0Jtb2dBaUFBS0FJRUlnNXFJQVVnQkNBQ0lBTnpjU0FDYzJvZ0FDZ0NBQ0lQYWtINHlLcTdmV3BCQjNjZ0JHb2lFQ0FFSUFOemNTQURjMnBCMXU2ZXhuNXFRUXgzSUJCcUloRWdFQ0FFYzNFZ0JITnFRZHZoZ2FFQ2FrRVJkeUFSYWlJU2FpQUFLQUlVSWhNZ0VXb2dBQ2dDRUNJVUlCQnFJQVFnQzJvZ0VpQVJJQkJ6Y1NBUWMycEI3cDMzalh4cVFSWjNJQkpxSWhBZ0VpQVJjM0VnRVhOcVFhK2Y4S3QvYWtFSGR5QVFhaUlSSUJBZ0VuTnhJQkp6YWtHcWpKKzhCR3BCREhjZ0VXb2lFaUFSSUJCemNTQVFjMnBCazR6QndYcHFRUkYzSUJKcUloVnFJQUFvQWlRaUZpQVNhaUFBS0FJZ0loY2dFV29nRENBUWFpQVZJQklnRVhOeElCRnpha0dCcXBwcWFrRVdkeUFWYWlJUUlCVWdFbk54SUJKemFrSFlzWUxNQm1wQkIzY2dFR29pRVNBUUlCVnpjU0FWYzJwQnIrK1QybmhxUVF4M0lCRnFJaElnRVNBUWMzRWdFSE5xUWJHM2ZXcEJFWGNnRW1vaUZXb2dBQ2dDTkNJWUlCSnFJQUFvQWpBaUdTQVJhaUFOSUJCcUlCVWdFaUFSYzNFZ0VYTnFRYjZ2ODhwNGFrRVdkeUFWYWlJUUlCVWdFbk54SUJKemFrR2lvc0RjQm1wQkIzY2dFR29pRVNBUUlCVnpjU0FWYzJwQmsrUGhiR3BCREhjZ0VXb2lGU0FSSUJCemNTQVFjMnBCam9mbHMzcHFRUkYzSUJWcUloSnFJQWNnRldvZ0RpQVJhaUFLSUJCcUlCSWdGU0FSYzNFZ0VYTnFRYUdRME0wRWFrRVdkeUFTYWlJUUlCSnpJQlZ4SUJKemFrSGl5dml3ZjJwQkJYY2dFR29pRVNBUWN5QVNjU0FRYzJwQndPYUNnbnhxUVFsM0lCRnFJaElnRVhNZ0VIRWdFWE5xUWRHMCtiSUNha0VPZHlBU2FpSVZhaUFJSUJKcUlCTWdFV29nRHlBUWFpQVZJQkp6SUJGeElCSnpha0dxajl2TmZtcEJGSGNnRldvaUVDQVZjeUFTY1NBVmMycEIzYUM4c1gxcVFRVjNJQkJxSWhFZ0VITWdGWEVnRUhOcVFkT29rQkpxUVFsM0lCRnFJaElnRVhNZ0VIRWdFWE5xUVlITmg4Vjlha0VPZHlBU2FpSVZhaUFKSUJKcUlCWWdFV29nRkNBUWFpQVZJQkp6SUJGeElCSnpha0hJOTgrK2ZtcEJGSGNnRldvaUVDQVZjeUFTY1NBVmMycEI1cHVIandKcVFRVjNJQkJxSWhFZ0VITWdGWEVnRUhOcVFkYVAzSmw4YWtFSmR5QVJhaUlTSUJGeklCQnhJQkZ6YWtHSG05U21mMnBCRG5jZ0Vtb2lGV29nQmlBU2FpQVlJQkZxSUJjZ0VHb2dGU0FTY3lBUmNTQVNjMnBCN2Fub3FnUnFRUlIzSUJWcUloQWdGWE1nRW5FZ0ZYTnFRWVhTajg5NmFrRUZkeUFRYWlJUklCQnpJQlZ4SUJCemFrSDR4NzVuYWtFSmR5QVJhaUlTSUJGeklCQnhJQkZ6YWtIWmhieTdCbXBCRG5jZ0Vtb2lGV29nRnlBU2FpQVRJQkZxSUJrZ0VHb2dGU0FTY3lBUmNTQVNjMnBCaXBtcDZYaHFRUlIzSUJWcUloQWdGWE1pRlNBU2MycEJ3dkpvYWtFRWR5QVFhaUlSSUJWemFrR0I3Y2U3ZUdwQkMzY2dFV29pRWlBUmN5SWFJQkJ6YWtHaXd2WHNCbXBCRUhjZ0Vtb2lGV29nRkNBU2FpQU9JQkZxSUFrZ0VHb2dGU0FhYzJwQmpQQ1ViMnBCRjNjZ0ZXb2lFQ0FWY3lJVklCSnpha0hFMVB1bGVtcEJCSGNnRUdvaUVTQVZjMnBCcVovNzNnUnFRUXQzSUJGcUloSWdFWE1pQ1NBUWMycEI0SmJ0dFg5cVFSQjNJQkpxSWhWcUlBOGdFbW9nR0NBUmFpQUlJQkJxSUJVZ0NYTnFRZkQ0L3ZWN2FrRVhkeUFWYWlJUUlCVnpJaFVnRW5OcVFjYjk3Y1FDYWtFRWR5QVFhaUlSSUJWemFrSDZ6NFRWZm1wQkMzY2dFV29pRWlBUmN5SUlJQkJ6YWtHRjRieW5mV3BCRUhjZ0Vtb2lGV29nR1NBU2FpQVdJQkZxSUFjZ0VHb2dGU0FJYzJwQmhicWdKR3BCRjNjZ0ZXb2lFU0FWY3lJUUlCSnpha0c1b05QT2ZXcEJCSGNnRVdvaUVpQVFjMnBCNWJQdXRuNXFRUXQzSUJKcUloVWdFbk1pQnlBUmMycEIrUG1KL1FGcVFSQjNJQlZxSWhCcUlBd2dGV29nRHlBU2FpQUdJQkZxSUJBZ0IzTnFRZVdzc2FWOGFrRVhkeUFRYWlJUklCVkJmM055SUJCemFrSEV4S1NoZjJwQkJuY2dFV29pRWlBUVFYOXpjaUFSYzJwQmwvK3JtUVJxUVFwM0lCSnFJaEFnRVVGL2MzSWdFbk5xUWFmSDBOeDZha0VQZHlBUWFpSVZhaUFMSUJCcUlCa2dFbW9nRXlBUmFpQVZJQkpCZjNOeUlCQnpha0c1d001a2FrRVZkeUFWYWlJUklCQkJmM055SUJWemFrSERzKzJxQm1wQkJuY2dFV29pRUNBVlFYOXpjaUFSYzJwQmtwbXorSGhxUVFwM0lCQnFJaElnRVVGL2MzSWdFSE5xUWYzb3YzOXFRUTkzSUJKcUloVnFJQW9nRW1vZ0Z5QVFhaUFPSUJGcUlCVWdFRUYvYzNJZ0VuTnFRZEc3a2F4NGFrRVZkeUFWYWlJUUlCSkJmM055SUJWemFrSFAvS0g5Qm1wQkJuY2dFR29pRVNBVlFYOXpjaUFRYzJwQjRNMnpjV3BCQ25jZ0VXb2lFaUFRUVg5emNpQVJjMnBCbElhRm1IcHFRUTkzSUJKcUloVnFJQTBnRW1vZ0ZDQVJhaUFZSUJCcUlCVWdFVUYvYzNJZ0VuTnFRYUdqb1BBRWFrRVZkeUFWYWlJUUlCSkJmM055SUJWemFrR0MvYzI2ZjJwQkJuY2dFR29pRVNBVlFYOXpjaUFRYzJwQnRlVHI2WHRxUVFwM0lCRnFJaElnRUVGL2MzSWdFWE5xUWJ1bDM5WUNha0VQZHlBU2FpSVZJQVJxSUJZZ0VHb2dGU0FSUVg5emNpQVNjMnBCa2FlYjNINXFRUlYzYWlFRUlCVWdBMm9oQXlBU0lBSnFJUUlnRVNBRmFpRUZJQUJCd0FCcUlRQWdBVUZBYWlJQkRRQUxRUUFnQWpZQ2xJa0JRUUFnQXpZQ2tJa0JRUUFnQkRZQ2pJa0JRUUFnQlRZQ2lJa0JJQUFMendNQkJIOUJBQ2dDZ0lrQlFUOXhJZ0JCbUlrQmFrR0FBVG9BQUNBQVFRRnFJUUVDUUFKQUFrQUNRQ0FBUVQ5eklnSkJCMHNOQUNBQ1JRMEJJQUZCbUlrQmFrRUFPZ0FBSUFKQkFVWU5BU0FBUVpxSkFXcEJBRG9BQUNBQ1FRSkdEUUVnQUVHYmlRRnFRUUE2QUFBZ0FrRURSZzBCSUFCQm5Ja0Jha0VBT2dBQUlBSkJCRVlOQVNBQVFaMkpBV3BCQURvQUFDQUNRUVZHRFFFZ0FFR2VpUUZxUVFBNkFBQWdBa0VHUmcwQklBQkJuNGtCYWtFQU9nQUFEQUVMSUFKQkNFWU5Ba0UySUFCcklRTUNRQ0FDUVFOeElnQU5BQ0FESVFJTUFndEJBQ0FBYXlFQ1FRQWhBQU5BSUFCQno0a0Jha0VBT2dBQUlBSWdBRUYvYWlJQVJ3MEFDeUFESUFCcUlRSU1BUXRCbUlrQlFjQUFFQU1hUVFBaEFVRTNJUU5CTnlFQ0N5QURRUU5KRFFBZ0FVR0FpUUZxSVFCQmZ5RUJBMEFnQUNBQ2FrRVZha0VBTmdBQUlBQkJmR29oQUNBQ0lBRkJCR29pQVVjTkFBc0xRUUJCQUNnQ2hJa0JOZ0xVaVFGQkFFRUFLQUtBaVFFaUFFRVZkam9BMDRrQlFRQWdBRUVOZGpvQTBva0JRUUFnQUVFRmRqb0EwWWtCUVFBZ0FFRURkQ0lBT2dEUWlRRkJBQ0FBTmdLQWlRRkJtSWtCUWNBQUVBTWFRUUJCQUNrQ2lJa0JOd09BQ1VFQVFRQXBBcENKQVRjRGlBa0xCZ0JCZ0lrQkN6TUFRUUJDL3JucnhlbU9sWmtRTndLUWlRRkJBRUtCeHBTNmx2SHE1bTgzQW9pSkFVRUFRZ0EzQW9DSkFTQUFFQUlRQkFzTEN3RUFRWUFJQ3dTWUFBQUEiOwogIHZhciBoYXNoJGQgPSAiNDJmYTRkMjkiOwogIHZhciB3YXNtSnNvbiRkID0gewogIAluYW1lOiBuYW1lJGQsCiAgCWRhdGE6IGRhdGEkZCwKICAJaGFzaDogaGFzaCRkCiAgfTsKCiAgY29uc3QgbXV0ZXgkZSA9IG5ldyBNdXRleCgpOwogIGxldCB3YXNtQ2FjaGUkZSA9IG51bGw7CiAgLyoqCiAgICogQ2FsY3VsYXRlcyBNRDUgaGFzaAogICAqIEBwYXJhbSBkYXRhIElucHV0IGRhdGEgKHN0cmluZywgQnVmZmVyIG9yIFR5cGVkQXJyYXkpCiAgICogQHJldHVybnMgQ29tcHV0ZWQgaGFzaCBhcyBhIGhleGFkZWNpbWFsIHN0cmluZwogICAqLwogIGZ1bmN0aW9uIG1kNShkYXRhKSB7CiAgICAgIGlmICh3YXNtQ2FjaGUkZSA9PT0gbnVsbCkgewogICAgICAgICAgcmV0dXJuIGxvY2tlZENyZWF0ZShtdXRleCRlLCB3YXNtSnNvbiRkLCAxNikKICAgICAgICAgICAgICAudGhlbigod2FzbSkgPT4gewogICAgICAgICAgICAgIHdhc21DYWNoZSRlID0gd2FzbTsKICAgICAgICAgICAgICByZXR1cm4gd2FzbUNhY2hlJGUuY2FsY3VsYXRlKGRhdGEpOwogICAgICAgICAgfSk7CiAgICAgIH0KICAgICAgdHJ5IHsKICAgICAgICAgIGNvbnN0IGhhc2ggPSB3YXNtQ2FjaGUkZS5jYWxjdWxhdGUoZGF0YSk7CiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGhhc2gpOwogICAgICB9CiAgICAgIGNhdGNoIChlcnIpIHsKICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnIpOwogICAgICB9CiAgfQoKICBuZXcgTXV0ZXgoKTsKCiAgbmV3IE11dGV4KCk7CgogIG5ldyBNdXRleCgpOwoKICBuZXcgTXV0ZXgoKTsKCiAgbmV3IE11dGV4KCk7CgogIG5ldyBNdXRleCgpOwoKICBuZXcgTXV0ZXgoKTsKCiAgbmV3IE11dGV4KCk7CgogIG5ldyBNdXRleCgpOwoKICBuZXcgTXV0ZXgoKTsKCiAgbmV3IE11dGV4KCk7CgogIG5ldyBNdXRleCgpOwoKICBuZXcgTXV0ZXgoKTsKCiAgbmV3IE11dGV4KCk7CgogIC8vLyA8cmVmZXJlbmNlIGxpYj0id2Vid29ya2VyIiAvPgogIC8qKgogICAqIOeugOWNleeahOebtOaOpeeul+aWh+S7tueahCBtZDUKICAgKi8gYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGFzeW5jICh7IGRhdGEgfSk9PnsKICAgICAgY29uc3QgaGFzaCA9IGF3YWl0IG1kNShuZXcgVWludDhBcnJheShkYXRhKSk7CiAgICAgIHBvc3RNZXNzYWdlKG5ldyBXb3JrZXJNZXNzYWdlKFdvcmtlckxhYmVsc0VudW0uRE9ORSwgewogICAgICAgICAgcmVzdWx0OiBoYXNoLAogICAgICAgICAgY2h1bms6IGRhdGEKICAgICAgfSksIFsKICAgICAgICAgIGRhdGEKICAgICAgXSk7CiAgfSk7Cgp9KSgpOwovLyMgc291cmNlTWFwcGluZ1VSTD1tZDUtc2luZ2xlLndlYi13b3JrZXIuanMubWFwCgo=');
/* eslint-enable */

class WorkerPoolForMd5s extends WorkerPool {
    constructor(maxWorkers){
        super(maxWorkers);
        this.pool = Array.from({
            length: this.maxWorkerCount
        }).map(()=>new WorkerWrapper(new WorkerFactory$1()));
    }
}

var WorkerFactory = createBase64WorkerFactory('Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwooZnVuY3Rpb24gKCkgewogICAgJ3VzZSBzdHJpY3QnOwoKICAgIC8qIQogICAgICogaGFzaC13YXNtIChodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9oYXNoLXdhc20pCiAgICAgKiAoYykgRGFuaSBCaXJvCiAgICAgKiBAbGljZW5zZSBNSVQKICAgICAqLwoKICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioNCiAgICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4NCg0KICAgIFBlcm1pc3Npb24gdG8gdXNlLCBjb3B5LCBtb2RpZnksIGFuZC9vciBkaXN0cmlidXRlIHRoaXMgc29mdHdhcmUgZm9yIGFueQ0KICAgIHB1cnBvc2Ugd2l0aCBvciB3aXRob3V0IGZlZSBpcyBoZXJlYnkgZ3JhbnRlZC4NCg0KICAgIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCAiQVMgSVMiIEFORCBUSEUgQVVUSE9SIERJU0NMQUlNUyBBTEwgV0FSUkFOVElFUyBXSVRIDQogICAgUkVHQVJEIFRPIFRISVMgU09GVFdBUkUgSU5DTFVESU5HIEFMTCBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZDQogICAgQU5EIEZJVE5FU1MuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1IgQkUgTElBQkxFIEZPUiBBTlkgU1BFQ0lBTCwgRElSRUNULA0KICAgIElORElSRUNULCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgT1IgQU5ZIERBTUFHRVMgV0hBVFNPRVZFUiBSRVNVTFRJTkcgRlJPTQ0KICAgIExPU1MgT0YgVVNFLCBEQVRBIE9SIFBST0ZJVFMsIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBORUdMSUdFTkNFIE9SDQogICAgT1RIRVIgVE9SVElPVVMgQUNUSU9OLCBBUklTSU5HIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFVTRSBPUg0KICAgIFBFUkZPUk1BTkNFIE9GIFRISVMgU09GVFdBUkUuDQogICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi8NCiAgICAvKiBnbG9iYWwgUmVmbGVjdCwgUHJvbWlzZSwgU3VwcHJlc3NlZEVycm9yLCBTeW1ib2wgKi8NCg0KDQogICAgZnVuY3Rpb24gX19hd2FpdGVyKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikgew0KICAgICAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH0NCiAgICAgICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7DQogICAgICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9DQogICAgICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvclsidGhyb3ciXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9DQogICAgICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfQ0KICAgICAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIFtdKSkubmV4dCgpKTsNCiAgICAgICAgfSk7DQogICAgfQ0KDQogICAgdHlwZW9mIFN1cHByZXNzZWRFcnJvciA9PT0gImZ1bmN0aW9uIiA/IFN1cHByZXNzZWRFcnJvciA6IGZ1bmN0aW9uIChlcnJvciwgc3VwcHJlc3NlZCwgbWVzc2FnZSkgew0KICAgICAgICB2YXIgZSA9IG5ldyBFcnJvcihtZXNzYWdlKTsNCiAgICAgICAgcmV0dXJuIGUubmFtZSA9ICJTdXBwcmVzc2VkRXJyb3IiLCBlLmVycm9yID0gZXJyb3IsIGUuc3VwcHJlc3NlZCA9IHN1cHByZXNzZWQsIGU7DQogICAgfTsKCiAgICBjbGFzcyBNdXRleCB7CiAgICAgICAgY29uc3RydWN0b3IoKSB7CiAgICAgICAgICAgIHRoaXMubXV0ZXggPSBQcm9taXNlLnJlc29sdmUoKTsKICAgICAgICB9CiAgICAgICAgbG9jaygpIHsKICAgICAgICAgICAgbGV0IGJlZ2luID0gKCkgPT4geyB9OwogICAgICAgICAgICB0aGlzLm11dGV4ID0gdGhpcy5tdXRleC50aGVuKCgpID0+IG5ldyBQcm9taXNlKGJlZ2luKSk7CiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzKSA9PiB7CiAgICAgICAgICAgICAgICBiZWdpbiA9IHJlczsKICAgICAgICAgICAgfSk7CiAgICAgICAgfQogICAgICAgIGRpc3BhdGNoKGZuKSB7CiAgICAgICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7CiAgICAgICAgICAgICAgICBjb25zdCB1bmxvY2sgPSB5aWVsZCB0aGlzLmxvY2soKTsKICAgICAgICAgICAgICAgIHRyeSB7CiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkIFByb21pc2UucmVzb2x2ZShmbigpKTsKICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIGZpbmFsbHkgewogICAgICAgICAgICAgICAgICAgIHVubG9jaygpOwogICAgICAgICAgICAgICAgfQogICAgICAgICAgICB9KTsKICAgICAgICB9CiAgICB9CgogICAgLyogZXNsaW50LWRpc2FibGUgaW1wb3J0L3ByZWZlci1kZWZhdWx0LWV4cG9ydCAqLwogICAgLyogZXNsaW50LWRpc2FibGUgbm8tYml0d2lzZSAqLwogICAgdmFyIF9hOwogICAgZnVuY3Rpb24gZ2V0R2xvYmFsKCkgewogICAgICAgIGlmICh0eXBlb2YgZ2xvYmFsVGhpcyAhPT0gJ3VuZGVmaW5lZCcpCiAgICAgICAgICAgIHJldHVybiBnbG9iYWxUaGlzOwogICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1yZXN0cmljdGVkLWdsb2JhbHMKICAgICAgICBpZiAodHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnKQogICAgICAgICAgICByZXR1cm4gc2VsZjsKICAgICAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpCiAgICAgICAgICAgIHJldHVybiB3aW5kb3c7CiAgICAgICAgcmV0dXJuIGdsb2JhbDsKICAgIH0KICAgIGNvbnN0IGdsb2JhbE9iamVjdCA9IGdldEdsb2JhbCgpOwogICAgY29uc3Qgbm9kZUJ1ZmZlciA9IChfYSA9IGdsb2JhbE9iamVjdC5CdWZmZXIpICE9PSBudWxsICYmIF9hICE9PSB2b2lkIDAgPyBfYSA6IG51bGw7CiAgICBjb25zdCB0ZXh0RW5jb2RlciA9IGdsb2JhbE9iamVjdC5UZXh0RW5jb2RlciA/IG5ldyBnbG9iYWxPYmplY3QuVGV4dEVuY29kZXIoKSA6IG51bGw7CiAgICBmdW5jdGlvbiBoZXhDaGFyQ29kZXNUb0ludChhLCBiKSB7CiAgICAgICAgcmV0dXJuICgoKGEgJiAweEYpICsgKChhID4+IDYpIHwgKChhID4+IDMpICYgMHg4KSkpIDw8IDQpIHwgKChiICYgMHhGKSArICgoYiA+PiA2KSB8ICgoYiA+PiAzKSAmIDB4OCkpKTsKICAgIH0KICAgIGZ1bmN0aW9uIHdyaXRlSGV4VG9VSW50OChidWYsIHN0cikgewogICAgICAgIGNvbnN0IHNpemUgPSBzdHIubGVuZ3RoID4+IDE7CiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaXplOyBpKyspIHsKICAgICAgICAgICAgY29uc3QgaW5kZXggPSBpIDw8IDE7CiAgICAgICAgICAgIGJ1ZltpXSA9IGhleENoYXJDb2Rlc1RvSW50KHN0ci5jaGFyQ29kZUF0KGluZGV4KSwgc3RyLmNoYXJDb2RlQXQoaW5kZXggKyAxKSk7CiAgICAgICAgfQogICAgfQogICAgZnVuY3Rpb24gaGV4U3RyaW5nRXF1YWxzVUludDgoc3RyLCBidWYpIHsKICAgICAgICBpZiAoc3RyLmxlbmd0aCAhPT0gYnVmLmxlbmd0aCAqIDIpIHsKICAgICAgICAgICAgcmV0dXJuIGZhbHNlOwogICAgICAgIH0KICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJ1Zi5sZW5ndGg7IGkrKykgewogICAgICAgICAgICBjb25zdCBzdHJJbmRleCA9IGkgPDwgMTsKICAgICAgICAgICAgaWYgKGJ1ZltpXSAhPT0gaGV4Q2hhckNvZGVzVG9JbnQoc3RyLmNoYXJDb2RlQXQoc3RySW5kZXgpLCBzdHIuY2hhckNvZGVBdChzdHJJbmRleCArIDEpKSkgewogICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlOwogICAgICAgICAgICB9CiAgICAgICAgfQogICAgICAgIHJldHVybiB0cnVlOwogICAgfQogICAgY29uc3QgYWxwaGEgPSAnYScuY2hhckNvZGVBdCgwKSAtIDEwOwogICAgY29uc3QgZGlnaXQgPSAnMCcuY2hhckNvZGVBdCgwKTsKICAgIGZ1bmN0aW9uIGdldERpZ2VzdEhleCh0bXBCdWZmZXIsIGlucHV0LCBoYXNoTGVuZ3RoKSB7CiAgICAgICAgbGV0IHAgPSAwOwogICAgICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXBsdXNwbHVzICovCiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoYXNoTGVuZ3RoOyBpKyspIHsKICAgICAgICAgICAgbGV0IG5pYmJsZSA9IGlucHV0W2ldID4+PiA0OwogICAgICAgICAgICB0bXBCdWZmZXJbcCsrXSA9IG5pYmJsZSA+IDkgPyBuaWJibGUgKyBhbHBoYSA6IG5pYmJsZSArIGRpZ2l0OwogICAgICAgICAgICBuaWJibGUgPSBpbnB1dFtpXSAmIDB4RjsKICAgICAgICAgICAgdG1wQnVmZmVyW3ArK10gPSBuaWJibGUgPiA5ID8gbmliYmxlICsgYWxwaGEgOiBuaWJibGUgKyBkaWdpdDsKICAgICAgICB9CiAgICAgICAgLyogZXNsaW50LWVuYWJsZSBuby1wbHVzcGx1cyAqLwogICAgICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIHRtcEJ1ZmZlcik7CiAgICB9CiAgICBjb25zdCBnZXRVSW50OEJ1ZmZlciA9IG5vZGVCdWZmZXIgIT09IG51bGwKICAgICAgICA/IChkYXRhKSA9PiB7CiAgICAgICAgICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycpIHsKICAgICAgICAgICAgICAgIGNvbnN0IGJ1ZiA9IG5vZGVCdWZmZXIuZnJvbShkYXRhLCAndXRmOCcpOwogICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGJ1Zi5idWZmZXIsIGJ1Zi5ieXRlT2Zmc2V0LCBidWYubGVuZ3RoKTsKICAgICAgICAgICAgfQogICAgICAgICAgICBpZiAobm9kZUJ1ZmZlci5pc0J1ZmZlcihkYXRhKSkgewogICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGRhdGEuYnVmZmVyLCBkYXRhLmJ5dGVPZmZzZXQsIGRhdGEubGVuZ3RoKTsKICAgICAgICAgICAgfQogICAgICAgICAgICBpZiAoQXJyYXlCdWZmZXIuaXNWaWV3KGRhdGEpKSB7CiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoZGF0YS5idWZmZXIsIGRhdGEuYnl0ZU9mZnNldCwgZGF0YS5ieXRlTGVuZ3RoKTsKICAgICAgICAgICAgfQogICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZGF0YSB0eXBlIScpOwogICAgICAgIH0KICAgICAgICA6IChkYXRhKSA9PiB7CiAgICAgICAgICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycpIHsKICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0RW5jb2Rlci5lbmNvZGUoZGF0YSk7CiAgICAgICAgICAgIH0KICAgICAgICAgICAgaWYgKEFycmF5QnVmZmVyLmlzVmlldyhkYXRhKSkgewogICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGRhdGEuYnVmZmVyLCBkYXRhLmJ5dGVPZmZzZXQsIGRhdGEuYnl0ZUxlbmd0aCk7CiAgICAgICAgICAgIH0KICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGRhdGEgdHlwZSEnKTsKICAgICAgICB9OwogICAgY29uc3QgYmFzZTY0Q2hhcnMgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLyc7CiAgICBjb25zdCBiYXNlNjRMb29rdXAgPSBuZXcgVWludDhBcnJheSgyNTYpOwogICAgZm9yIChsZXQgaSA9IDA7IGkgPCBiYXNlNjRDaGFycy5sZW5ndGg7IGkrKykgewogICAgICAgIGJhc2U2NExvb2t1cFtiYXNlNjRDaGFycy5jaGFyQ29kZUF0KGkpXSA9IGk7CiAgICB9CiAgICBmdW5jdGlvbiBnZXREZWNvZGVCYXNlNjRMZW5ndGgoZGF0YSkgewogICAgICAgIGxldCBidWZmZXJMZW5ndGggPSBNYXRoLmZsb29yKGRhdGEubGVuZ3RoICogMC43NSk7CiAgICAgICAgY29uc3QgbGVuID0gZGF0YS5sZW5ndGg7CiAgICAgICAgaWYgKGRhdGFbbGVuIC0gMV0gPT09ICc9JykgewogICAgICAgICAgICBidWZmZXJMZW5ndGggLT0gMTsKICAgICAgICAgICAgaWYgKGRhdGFbbGVuIC0gMl0gPT09ICc9JykgewogICAgICAgICAgICAgICAgYnVmZmVyTGVuZ3RoIC09IDE7CiAgICAgICAgICAgIH0KICAgICAgICB9CiAgICAgICAgcmV0dXJuIGJ1ZmZlckxlbmd0aDsKICAgIH0KICAgIGZ1bmN0aW9uIGRlY29kZUJhc2U2NChkYXRhKSB7CiAgICAgICAgY29uc3QgYnVmZmVyTGVuZ3RoID0gZ2V0RGVjb2RlQmFzZTY0TGVuZ3RoKGRhdGEpOwogICAgICAgIGNvbnN0IGxlbiA9IGRhdGEubGVuZ3RoOwogICAgICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyTGVuZ3RoKTsKICAgICAgICBsZXQgcCA9IDA7CiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkgKz0gNCkgewogICAgICAgICAgICBjb25zdCBlbmNvZGVkMSA9IGJhc2U2NExvb2t1cFtkYXRhLmNoYXJDb2RlQXQoaSldOwogICAgICAgICAgICBjb25zdCBlbmNvZGVkMiA9IGJhc2U2NExvb2t1cFtkYXRhLmNoYXJDb2RlQXQoaSArIDEpXTsKICAgICAgICAgICAgY29uc3QgZW5jb2RlZDMgPSBiYXNlNjRMb29rdXBbZGF0YS5jaGFyQ29kZUF0KGkgKyAyKV07CiAgICAgICAgICAgIGNvbnN0IGVuY29kZWQ0ID0gYmFzZTY0TG9va3VwW2RhdGEuY2hhckNvZGVBdChpICsgMyldOwogICAgICAgICAgICBieXRlc1twXSA9IChlbmNvZGVkMSA8PCAyKSB8IChlbmNvZGVkMiA+PiA0KTsKICAgICAgICAgICAgcCArPSAxOwogICAgICAgICAgICBieXRlc1twXSA9ICgoZW5jb2RlZDIgJiAxNSkgPDwgNCkgfCAoZW5jb2RlZDMgPj4gMik7CiAgICAgICAgICAgIHAgKz0gMTsKICAgICAgICAgICAgYnl0ZXNbcF0gPSAoKGVuY29kZWQzICYgMykgPDwgNikgfCAoZW5jb2RlZDQgJiA2Myk7CiAgICAgICAgICAgIHAgKz0gMTsKICAgICAgICB9CiAgICAgICAgcmV0dXJuIGJ5dGVzOwogICAgfQoKICAgIGNvbnN0IE1BWF9IRUFQID0gMTYgKiAxMDI0OwogICAgY29uc3QgV0FTTV9GVU5DX0hBU0hfTEVOR1RIID0gNDsKICAgIGNvbnN0IHdhc21NdXRleCA9IG5ldyBNdXRleCgpOwogICAgY29uc3Qgd2FzbU1vZHVsZUNhY2hlID0gbmV3IE1hcCgpOwogICAgZnVuY3Rpb24gV0FTTUludGVyZmFjZShiaW5hcnksIGhhc2hMZW5ndGgpIHsKICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkgewogICAgICAgICAgICBsZXQgd2FzbUluc3RhbmNlID0gbnVsbDsKICAgICAgICAgICAgbGV0IG1lbW9yeVZpZXcgPSBudWxsOwogICAgICAgICAgICBsZXQgaW5pdGlhbGl6ZWQgPSBmYWxzZTsKICAgICAgICAgICAgaWYgKHR5cGVvZiBXZWJBc3NlbWJseSA9PT0gJ3VuZGVmaW5lZCcpIHsKICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignV2ViQXNzZW1ibHkgaXMgbm90IHN1cHBvcnRlZCBpbiB0aGlzIGVudmlyb25tZW50IScpOwogICAgICAgICAgICB9CiAgICAgICAgICAgIGNvbnN0IHdyaXRlTWVtb3J5ID0gKGRhdGEsIG9mZnNldCA9IDApID0+IHsKICAgICAgICAgICAgICAgIG1lbW9yeVZpZXcuc2V0KGRhdGEsIG9mZnNldCk7CiAgICAgICAgICAgIH07CiAgICAgICAgICAgIGNvbnN0IGdldE1lbW9yeSA9ICgpID0+IG1lbW9yeVZpZXc7CiAgICAgICAgICAgIGNvbnN0IGdldEV4cG9ydHMgPSAoKSA9PiB3YXNtSW5zdGFuY2UuZXhwb3J0czsKICAgICAgICAgICAgY29uc3Qgc2V0TWVtb3J5U2l6ZSA9ICh0b3RhbFNpemUpID0+IHsKICAgICAgICAgICAgICAgIHdhc21JbnN0YW5jZS5leHBvcnRzLkhhc2hfU2V0TWVtb3J5U2l6ZSh0b3RhbFNpemUpOwogICAgICAgICAgICAgICAgY29uc3QgYXJyYXlPZmZzZXQgPSB3YXNtSW5zdGFuY2UuZXhwb3J0cy5IYXNoX0dldEJ1ZmZlcigpOwogICAgICAgICAgICAgICAgY29uc3QgbWVtb3J5QnVmZmVyID0gd2FzbUluc3RhbmNlLmV4cG9ydHMubWVtb3J5LmJ1ZmZlcjsKICAgICAgICAgICAgICAgIG1lbW9yeVZpZXcgPSBuZXcgVWludDhBcnJheShtZW1vcnlCdWZmZXIsIGFycmF5T2Zmc2V0LCB0b3RhbFNpemUpOwogICAgICAgICAgICB9OwogICAgICAgICAgICBjb25zdCBnZXRTdGF0ZVNpemUgPSAoKSA9PiB7CiAgICAgICAgICAgICAgICBjb25zdCB2aWV3ID0gbmV3IERhdGFWaWV3KHdhc21JbnN0YW5jZS5leHBvcnRzLm1lbW9yeS5idWZmZXIpOwogICAgICAgICAgICAgICAgY29uc3Qgc3RhdGVTaXplID0gdmlldy5nZXRVaW50MzIod2FzbUluc3RhbmNlLmV4cG9ydHMuU1RBVEVfU0laRSwgdHJ1ZSk7CiAgICAgICAgICAgICAgICByZXR1cm4gc3RhdGVTaXplOwogICAgICAgICAgICB9OwogICAgICAgICAgICBjb25zdCBsb2FkV0FTTVByb21pc2UgPSB3YXNtTXV0ZXguZGlzcGF0Y2goKCkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkgewogICAgICAgICAgICAgICAgaWYgKCF3YXNtTW9kdWxlQ2FjaGUuaGFzKGJpbmFyeS5uYW1lKSkgewogICAgICAgICAgICAgICAgICAgIGNvbnN0IGFzbSA9IGRlY29kZUJhc2U2NChiaW5hcnkuZGF0YSk7CiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvbWlzZSA9IFdlYkFzc2VtYmx5LmNvbXBpbGUoYXNtKTsKICAgICAgICAgICAgICAgICAgICB3YXNtTW9kdWxlQ2FjaGUuc2V0KGJpbmFyeS5uYW1lLCBwcm9taXNlKTsKICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIGNvbnN0IG1vZHVsZSA9IHlpZWxkIHdhc21Nb2R1bGVDYWNoZS5nZXQoYmluYXJ5Lm5hbWUpOwogICAgICAgICAgICAgICAgd2FzbUluc3RhbmNlID0geWllbGQgV2ViQXNzZW1ibHkuaW5zdGFudGlhdGUobW9kdWxlLCB7CiAgICAgICAgICAgICAgICAvLyBlbnY6IHsKICAgICAgICAgICAgICAgIC8vICAgZW1zY3JpcHRlbl9tZW1jcHlfYmlnOiAoZGVzdCwgc3JjLCBudW0pID0+IHsKICAgICAgICAgICAgICAgIC8vICAgICBjb25zdCBtZW1vcnlCdWZmZXIgPSB3YXNtSW5zdGFuY2UuZXhwb3J0cy5tZW1vcnkuYnVmZmVyOwogICAgICAgICAgICAgICAgLy8gICAgIGNvbnN0IG1lbVZpZXcgPSBuZXcgVWludDhBcnJheShtZW1vcnlCdWZmZXIsIDApOwogICAgICAgICAgICAgICAgLy8gICAgIG1lbVZpZXcuc2V0KG1lbVZpZXcuc3ViYXJyYXkoc3JjLCBzcmMgKyBudW0pLCBkZXN0KTsKICAgICAgICAgICAgICAgIC8vICAgfSwKICAgICAgICAgICAgICAgIC8vICAgcHJpbnRfbWVtb3J5OiAob2Zmc2V0LCBsZW4pID0+IHsKICAgICAgICAgICAgICAgIC8vICAgICBjb25zdCBtZW1vcnlCdWZmZXIgPSB3YXNtSW5zdGFuY2UuZXhwb3J0cy5tZW1vcnkuYnVmZmVyOwogICAgICAgICAgICAgICAgLy8gICAgIGNvbnN0IG1lbVZpZXcgPSBuZXcgVWludDhBcnJheShtZW1vcnlCdWZmZXIsIDApOwogICAgICAgICAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKCdwcmludF9pbnQzMicsIG1lbVZpZXcuc3ViYXJyYXkob2Zmc2V0LCBvZmZzZXQgKyBsZW4pKTsKICAgICAgICAgICAgICAgIC8vICAgfSwKICAgICAgICAgICAgICAgIC8vIH0sCiAgICAgICAgICAgICAgICB9KTsKICAgICAgICAgICAgICAgIC8vIHdhc21JbnN0YW5jZS5leHBvcnRzLl9zdGFydCgpOwogICAgICAgICAgICB9KSk7CiAgICAgICAgICAgIGNvbnN0IHNldHVwSW50ZXJmYWNlID0gKCkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkgewogICAgICAgICAgICAgICAgaWYgKCF3YXNtSW5zdGFuY2UpIHsKICAgICAgICAgICAgICAgICAgICB5aWVsZCBsb2FkV0FTTVByb21pc2U7CiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICBjb25zdCBhcnJheU9mZnNldCA9IHdhc21JbnN0YW5jZS5leHBvcnRzLkhhc2hfR2V0QnVmZmVyKCk7CiAgICAgICAgICAgICAgICBjb25zdCBtZW1vcnlCdWZmZXIgPSB3YXNtSW5zdGFuY2UuZXhwb3J0cy5tZW1vcnkuYnVmZmVyOwogICAgICAgICAgICAgICAgbWVtb3J5VmlldyA9IG5ldyBVaW50OEFycmF5KG1lbW9yeUJ1ZmZlciwgYXJyYXlPZmZzZXQsIE1BWF9IRUFQKTsKICAgICAgICAgICAgfSk7CiAgICAgICAgICAgIGNvbnN0IGluaXQgPSAoYml0cyA9IG51bGwpID0+IHsKICAgICAgICAgICAgICAgIGluaXRpYWxpemVkID0gdHJ1ZTsKICAgICAgICAgICAgICAgIHdhc21JbnN0YW5jZS5leHBvcnRzLkhhc2hfSW5pdChiaXRzKTsKICAgICAgICAgICAgfTsKICAgICAgICAgICAgY29uc3QgdXBkYXRlVUludDhBcnJheSA9IChkYXRhKSA9PiB7CiAgICAgICAgICAgICAgICBsZXQgcmVhZCA9IDA7CiAgICAgICAgICAgICAgICB3aGlsZSAocmVhZCA8IGRhdGEubGVuZ3RoKSB7CiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2h1bmsgPSBkYXRhLnN1YmFycmF5KHJlYWQsIHJlYWQgKyBNQVhfSEVBUCk7CiAgICAgICAgICAgICAgICAgICAgcmVhZCArPSBjaHVuay5sZW5ndGg7CiAgICAgICAgICAgICAgICAgICAgbWVtb3J5Vmlldy5zZXQoY2h1bmspOwogICAgICAgICAgICAgICAgICAgIHdhc21JbnN0YW5jZS5leHBvcnRzLkhhc2hfVXBkYXRlKGNodW5rLmxlbmd0aCk7CiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgIH07CiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZSA9IChkYXRhKSA9PiB7CiAgICAgICAgICAgICAgICBpZiAoIWluaXRpYWxpemVkKSB7CiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1cGRhdGUoKSBjYWxsZWQgYmVmb3JlIGluaXQoKScpOwogICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgY29uc3QgVWludDhCdWZmZXIgPSBnZXRVSW50OEJ1ZmZlcihkYXRhKTsKICAgICAgICAgICAgICAgIHVwZGF0ZVVJbnQ4QXJyYXkoVWludDhCdWZmZXIpOwogICAgICAgICAgICB9OwogICAgICAgICAgICBjb25zdCBkaWdlc3RDaGFycyA9IG5ldyBVaW50OEFycmF5KGhhc2hMZW5ndGggKiAyKTsKICAgICAgICAgICAgY29uc3QgZGlnZXN0ID0gKG91dHB1dFR5cGUsIHBhZGRpbmcgPSBudWxsKSA9PiB7CiAgICAgICAgICAgICAgICBpZiAoIWluaXRpYWxpemVkKSB7CiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdkaWdlc3QoKSBjYWxsZWQgYmVmb3JlIGluaXQoKScpOwogICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgaW5pdGlhbGl6ZWQgPSBmYWxzZTsKICAgICAgICAgICAgICAgIHdhc21JbnN0YW5jZS5leHBvcnRzLkhhc2hfRmluYWwocGFkZGluZyk7CiAgICAgICAgICAgICAgICBpZiAob3V0cHV0VHlwZSA9PT0gJ2JpbmFyeScpIHsKICAgICAgICAgICAgICAgICAgICAvLyB0aGUgZGF0YSBpcyBjb3BpZWQgdG8gYWxsb3cgR0Mgb2YgdGhlIG9yaWdpbmFsIG1lbW9yeSBvYmplY3QKICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWVtb3J5Vmlldy5zbGljZSgwLCBoYXNoTGVuZ3RoKTsKICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIHJldHVybiBnZXREaWdlc3RIZXgoZGlnZXN0Q2hhcnMsIG1lbW9yeVZpZXcsIGhhc2hMZW5ndGgpOwogICAgICAgICAgICB9OwogICAgICAgICAgICBjb25zdCBzYXZlID0gKCkgPT4gewogICAgICAgICAgICAgICAgaWYgKCFpbml0aWFsaXplZCkgewogICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignc2F2ZSgpIGNhbiBvbmx5IGJlIGNhbGxlZCBhZnRlciBpbml0KCkgYW5kIGJlZm9yZSBkaWdlc3QoKScpOwogICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgY29uc3Qgc3RhdGVPZmZzZXQgPSB3YXNtSW5zdGFuY2UuZXhwb3J0cy5IYXNoX0dldFN0YXRlKCk7CiAgICAgICAgICAgICAgICBjb25zdCBzdGF0ZUxlbmd0aCA9IGdldFN0YXRlU2l6ZSgpOwogICAgICAgICAgICAgICAgY29uc3QgbWVtb3J5QnVmZmVyID0gd2FzbUluc3RhbmNlLmV4cG9ydHMubWVtb3J5LmJ1ZmZlcjsKICAgICAgICAgICAgICAgIGNvbnN0IGludGVybmFsU3RhdGUgPSBuZXcgVWludDhBcnJheShtZW1vcnlCdWZmZXIsIHN0YXRlT2Zmc2V0LCBzdGF0ZUxlbmd0aCk7CiAgICAgICAgICAgICAgICAvLyBwcmVmaXggaXMgNCBieXRlcyBmcm9tIFNIQTEgaGFzaCBvZiB0aGUgV0FTTSBiaW5hcnkKICAgICAgICAgICAgICAgIC8vIGl0IGlzIHVzZWQgdG8gZGV0ZWN0IGluY29tcGF0aWJsZSBpbnRlcm5hbCBzdGF0ZXMgYmV0d2VlbiBkaWZmZXJlbnQgdmVyc2lvbnMgb2YgaGFzaC13YXNtCiAgICAgICAgICAgICAgICBjb25zdCBwcmVmaXhlZFN0YXRlID0gbmV3IFVpbnQ4QXJyYXkoV0FTTV9GVU5DX0hBU0hfTEVOR1RIICsgc3RhdGVMZW5ndGgpOwogICAgICAgICAgICAgICAgd3JpdGVIZXhUb1VJbnQ4KHByZWZpeGVkU3RhdGUsIGJpbmFyeS5oYXNoKTsKICAgICAgICAgICAgICAgIHByZWZpeGVkU3RhdGUuc2V0KGludGVybmFsU3RhdGUsIFdBU01fRlVOQ19IQVNIX0xFTkdUSCk7CiAgICAgICAgICAgICAgICByZXR1cm4gcHJlZml4ZWRTdGF0ZTsKICAgICAgICAgICAgfTsKICAgICAgICAgICAgY29uc3QgbG9hZCA9IChzdGF0ZSkgPT4gewogICAgICAgICAgICAgICAgaWYgKCEoc3RhdGUgaW5zdGFuY2VvZiBVaW50OEFycmF5KSkgewogICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignbG9hZCgpIGV4cGVjdHMgYW4gVWludDhBcnJheSBnZW5lcmF0ZWQgYnkgc2F2ZSgpJyk7CiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICBjb25zdCBzdGF0ZU9mZnNldCA9IHdhc21JbnN0YW5jZS5leHBvcnRzLkhhc2hfR2V0U3RhdGUoKTsKICAgICAgICAgICAgICAgIGNvbnN0IHN0YXRlTGVuZ3RoID0gZ2V0U3RhdGVTaXplKCk7CiAgICAgICAgICAgICAgICBjb25zdCBvdmVyYWxsTGVuZ3RoID0gV0FTTV9GVU5DX0hBU0hfTEVOR1RIICsgc3RhdGVMZW5ndGg7CiAgICAgICAgICAgICAgICBjb25zdCBtZW1vcnlCdWZmZXIgPSB3YXNtSW5zdGFuY2UuZXhwb3J0cy5tZW1vcnkuYnVmZmVyOwogICAgICAgICAgICAgICAgaWYgKHN0YXRlLmxlbmd0aCAhPT0gb3ZlcmFsbExlbmd0aCkgewogICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQmFkIHN0YXRlIGxlbmd0aCAoZXhwZWN0ZWQgJHtvdmVyYWxsTGVuZ3RofSBieXRlcywgZ290ICR7c3RhdGUubGVuZ3RofSlgKTsKICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIGlmICghaGV4U3RyaW5nRXF1YWxzVUludDgoYmluYXJ5Lmhhc2gsIHN0YXRlLnN1YmFycmF5KDAsIFdBU01fRlVOQ19IQVNIX0xFTkdUSCkpKSB7CiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGlzIHN0YXRlIHdhcyB3cml0dGVuIGJ5IGFuIGluY29tcGF0aWJsZSBoYXNoIGltcGxlbWVudGF0aW9uJyk7CiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICBjb25zdCBpbnRlcm5hbFN0YXRlID0gc3RhdGUuc3ViYXJyYXkoV0FTTV9GVU5DX0hBU0hfTEVOR1RIKTsKICAgICAgICAgICAgICAgIG5ldyBVaW50OEFycmF5KG1lbW9yeUJ1ZmZlciwgc3RhdGVPZmZzZXQsIHN0YXRlTGVuZ3RoKS5zZXQoaW50ZXJuYWxTdGF0ZSk7CiAgICAgICAgICAgICAgICBpbml0aWFsaXplZCA9IHRydWU7CiAgICAgICAgICAgIH07CiAgICAgICAgICAgIGNvbnN0IGlzRGF0YVNob3J0ID0gKGRhdGEpID0+IHsKICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycpIHsKICAgICAgICAgICAgICAgICAgICAvLyB3b3JzdCBjYXNlIGlzIDQgYnl0ZXMgLyBjaGFyCiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRhdGEubGVuZ3RoIDwgTUFYX0hFQVAgLyA0OwogICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgcmV0dXJuIGRhdGEuYnl0ZUxlbmd0aCA8IE1BWF9IRUFQOwogICAgICAgICAgICB9OwogICAgICAgICAgICBsZXQgY2FuU2ltcGxpZnkgPSBpc0RhdGFTaG9ydDsKICAgICAgICAgICAgc3dpdGNoIChiaW5hcnkubmFtZSkgewogICAgICAgICAgICAgICAgY2FzZSAnYXJnb24yJzoKICAgICAgICAgICAgICAgIGNhc2UgJ3NjcnlwdCc6CiAgICAgICAgICAgICAgICAgICAgY2FuU2ltcGxpZnkgPSAoKSA9PiB0cnVlOwogICAgICAgICAgICAgICAgICAgIGJyZWFrOwogICAgICAgICAgICAgICAgY2FzZSAnYmxha2UyYic6CiAgICAgICAgICAgICAgICBjYXNlICdibGFrZTJzJzoKICAgICAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSBpcyBhIGtleSBhdCBibGFrZTIgdGhlbiBjYW5ub3Qgc2ltcGxpZnkKICAgICAgICAgICAgICAgICAgICBjYW5TaW1wbGlmeSA9IChkYXRhLCBpbml0UGFyYW0pID0+IGluaXRQYXJhbSA8PSA1MTIgJiYgaXNEYXRhU2hvcnQoZGF0YSk7CiAgICAgICAgICAgICAgICAgICAgYnJlYWs7CiAgICAgICAgICAgICAgICBjYXNlICdibGFrZTMnOgogICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoZXJlIGlzIGEga2V5IGF0IGJsYWtlMyB0aGVuIGNhbm5vdCBzaW1wbGlmeQogICAgICAgICAgICAgICAgICAgIGNhblNpbXBsaWZ5ID0gKGRhdGEsIGluaXRQYXJhbSkgPT4gaW5pdFBhcmFtID09PSAwICYmIGlzRGF0YVNob3J0KGRhdGEpOwogICAgICAgICAgICAgICAgICAgIGJyZWFrOwogICAgICAgICAgICAgICAgY2FzZSAneHhoYXNoNjQnOiAvLyBjYW5ub3Qgc2ltcGxpZnkKICAgICAgICAgICAgICAgIGNhc2UgJ3h4aGFzaDMnOgogICAgICAgICAgICAgICAgY2FzZSAneHhoYXNoMTI4JzoKICAgICAgICAgICAgICAgICAgICBjYW5TaW1wbGlmeSA9ICgpID0+IGZhbHNlOwogICAgICAgICAgICAgICAgICAgIGJyZWFrOwogICAgICAgICAgICB9CiAgICAgICAgICAgIC8vIHNob3J0aGFuZCBmb3IgKGluaXQgKyB1cGRhdGUgKyBkaWdlc3QpIGZvciBiZXR0ZXIgcGVyZm9ybWFuY2UKICAgICAgICAgICAgY29uc3QgY2FsY3VsYXRlID0gKGRhdGEsIGluaXRQYXJhbSA9IG51bGwsIGRpZ2VzdFBhcmFtID0gbnVsbCkgPT4gewogICAgICAgICAgICAgICAgaWYgKCFjYW5TaW1wbGlmeShkYXRhLCBpbml0UGFyYW0pKSB7CiAgICAgICAgICAgICAgICAgICAgaW5pdChpbml0UGFyYW0pOwogICAgICAgICAgICAgICAgICAgIHVwZGF0ZShkYXRhKTsKICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGlnZXN0KCdoZXgnLCBkaWdlc3RQYXJhbSk7CiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICBjb25zdCBidWZmZXIgPSBnZXRVSW50OEJ1ZmZlcihkYXRhKTsKICAgICAgICAgICAgICAgIG1lbW9yeVZpZXcuc2V0KGJ1ZmZlcik7CiAgICAgICAgICAgICAgICB3YXNtSW5zdGFuY2UuZXhwb3J0cy5IYXNoX0NhbGN1bGF0ZShidWZmZXIubGVuZ3RoLCBpbml0UGFyYW0sIGRpZ2VzdFBhcmFtKTsKICAgICAgICAgICAgICAgIHJldHVybiBnZXREaWdlc3RIZXgoZGlnZXN0Q2hhcnMsIG1lbW9yeVZpZXcsIGhhc2hMZW5ndGgpOwogICAgICAgICAgICB9OwogICAgICAgICAgICB5aWVsZCBzZXR1cEludGVyZmFjZSgpOwogICAgICAgICAgICByZXR1cm4gewogICAgICAgICAgICAgICAgZ2V0TWVtb3J5LAogICAgICAgICAgICAgICAgd3JpdGVNZW1vcnksCiAgICAgICAgICAgICAgICBnZXRFeHBvcnRzLAogICAgICAgICAgICAgICAgc2V0TWVtb3J5U2l6ZSwKICAgICAgICAgICAgICAgIGluaXQsCiAgICAgICAgICAgICAgICB1cGRhdGUsCiAgICAgICAgICAgICAgICBkaWdlc3QsCiAgICAgICAgICAgICAgICBzYXZlLAogICAgICAgICAgICAgICAgbG9hZCwKICAgICAgICAgICAgICAgIGNhbGN1bGF0ZSwKICAgICAgICAgICAgICAgIGhhc2hMZW5ndGgsCiAgICAgICAgICAgIH07CiAgICAgICAgfSk7CiAgICB9CgogICAgZnVuY3Rpb24gbG9ja2VkQ3JlYXRlKG11dGV4LCBiaW5hcnksIGhhc2hMZW5ndGgpIHsKICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkgewogICAgICAgICAgICBjb25zdCB1bmxvY2sgPSB5aWVsZCBtdXRleC5sb2NrKCk7CiAgICAgICAgICAgIGNvbnN0IHdhc20gPSB5aWVsZCBXQVNNSW50ZXJmYWNlKGJpbmFyeSwgaGFzaExlbmd0aCk7CiAgICAgICAgICAgIHVubG9jaygpOwogICAgICAgICAgICByZXR1cm4gd2FzbTsKICAgICAgICB9KTsKICAgIH0KCiAgICBuZXcgTXV0ZXgoKTsKCiAgICBuZXcgTXV0ZXgoKTsKCiAgICBuZXcgTXV0ZXgoKTsKCiAgICBuZXcgTXV0ZXgoKTsKCiAgICB2YXIgbmFtZSRmID0gImNyYzMyIjsKICAgIHZhciBkYXRhJGYgPSAiQUdGemJRRUFBQUFCRVFSZ0FBRi9ZQUYvQUdBQUFHQUNmMzhBQXdnSEFBRUJBUUlBQXdVRUFRRUNBZ1lPQW44QlFaREpCUXQvQUVHQUNBc0hjQWdHYldWdGIzSjVBZ0FPU0dGemFGOUhaWFJDZFdabVpYSUFBQWxJWVhOb1gwbHVhWFFBQWd0SVlYTm9YMVZ3WkdGMFpRQURDa2hoYzJoZlJtbHVZV3dBQkExSVlYTm9YMGRsZEZOMFlYUmxBQVVPU0dGemFGOURZV3hqZFd4aGRHVUFCZ3BUVkVGVVJWOVRTVnBGQXdFS2tnZ0hCUUJCZ0FrTHd3TUJBMzlCZ0lrQklRRkJBQ0VDQTBBZ0FVRUFRUUJCQUVFQVFRQkJBRUVBUVFBZ0FrRUJjV3NnQUhFZ0FrRUJkbk1pQTBFQmNXc2dBSEVnQTBFQmRuTWlBMEVCY1dzZ0FIRWdBMEVCZG5NaUEwRUJjV3NnQUhFZ0EwRUJkbk1pQTBFQmNXc2dBSEVnQTBFQmRuTWlBMEVCY1dzZ0FIRWdBMEVCZG5NaUEwRUJjV3NnQUhFZ0EwRUJkbk1pQTBFQmNXc2dBSEVnQTBFQmRuTTJBZ0FnQVVFRWFpRUJJQUpCQVdvaUFrR0FBa2NOQUF0QkFDRUFBMEFnQUVHRWtRRnFJQUJCaElrQmFpZ0NBQ0lDUWY4QmNVRUNkRUdBaVFGcUtBSUFJQUpCQ0haeklnSTJBZ0FnQUVHRW1RRnFJQUpCL3dGeFFRSjBRWUNKQVdvb0FnQWdBa0VJZG5NaUFqWUNBQ0FBUVlTaEFXb2dBa0gvQVhGQkFuUkJnSWtCYWlnQ0FDQUNRUWgyY3lJQ05nSUFJQUJCaEtrQmFpQUNRZjhCY1VFQ2RFR0FpUUZxS0FJQUlBSkJDSFp6SWdJMkFnQWdBRUdFc1FGcUlBSkIvd0Z4UVFKMFFZQ0pBV29vQWdBZ0FrRUlkbk1pQWpZQ0FDQUFRWVM1QVdvZ0FrSC9BWEZCQW5SQmdJa0JhaWdDQUNBQ1FRaDJjeUlDTmdJQUlBQkJoTUVCYWlBQ1FmOEJjVUVDZEVHQWlRRnFLQUlBSUFKQkNIWnpOZ0lBSUFCQkJHb2lBRUg4QjBjTkFBc0xKd0FDUUVFQUtBS0F5UUVnQUVZTkFDQUFFQUZCQUNBQU5nS0F5UUVMUVFCQkFEWUNoTWtCQzRnREFRTi9RUUFvQW9USkFVRi9jeUVCUVlBSklRSUNRQ0FBUVFoSkRRQkJnQWtoQWdOQUlBSkJCR29vQWdBaUEwRU9ka0g4QjNGQmdKRUJhaWdDQUNBRFFSWjJRZndIY1VHQWlRRnFLQUlBY3lBRFFRWjJRZndIY1VHQW1RRnFLQUlBY3lBRFFmOEJjVUVDZEVHQW9RRnFLQUlBY3lBQ0tBSUFJQUZ6SWdGQkZuWkIvQWR4UVlDcEFXb29BZ0J6SUFGQkRuWkIvQWR4UVlDeEFXb29BZ0J6SUFGQkJuWkIvQWR4UVlDNUFXb29BZ0J6SUFGQi93RnhRUUowUVlEQkFXb29BZ0J6SVFFZ0FrRUlhaUVDSUFCQmVHb2lBRUVIU3cwQUN3c0NRQ0FBUlEwQUFrQUNRQ0FBUVFGeERRQWdBQ0VEREFFTElBRkIvd0Z4SUFJdEFBQnpRUUowUVlDSkFXb29BZ0FnQVVFSWRuTWhBU0FDUVFGcUlRSWdBRUYvYWlFREN5QUFRUUZHRFFBRFFDQUJRZjhCY1NBQ0xRQUFjMEVDZEVHQWlRRnFLQUlBSUFGQkNIWnpJZ0ZCL3dGeElBSkJBV290QUFCelFRSjBRWUNKQVdvb0FnQWdBVUVJZG5NaEFTQUNRUUpxSVFJZ0EwRithaUlERFFBTEMwRUFJQUZCZjNNMkFvVEpBUXN5QVFGL1FRQkJBQ2dDaE1rQklnQkJHSFFnQUVHQS9nTnhRUWgwY2lBQVFRaDJRWUQrQTNFZ0FFRVlkbkp5TmdLQUNRc0dBRUdFeVFFTFdRQUNRRUVBS0FLQXlRRWdBVVlOQUNBQkVBRkJBQ0FCTmdLQXlRRUxRUUJCQURZQ2hNa0JJQUFRQTBFQVFRQW9Bb1RKQVNJQlFSaDBJQUZCZ1A0RGNVRUlkSElnQVVFSWRrR0EvZ054SUFGQkdIWnljallDZ0FrTEN3c0JBRUdBQ0FzRUJBQUFBQT09IjsKICAgIHZhciBoYXNoJGYgPSAiZDJlYmE1ODciOwogICAgdmFyIHdhc21Kc29uJGYgPSB7CiAgICAJbmFtZTogbmFtZSRmLAogICAgCWRhdGE6IGRhdGEkZiwKICAgIAloYXNoOiBoYXNoJGYKICAgIH07CgogICAgY29uc3QgbXV0ZXgkaCA9IG5ldyBNdXRleCgpOwogICAgbGV0IHdhc21DYWNoZSRoID0gbnVsbDsKICAgIC8qKgogICAgICogQ2FsY3VsYXRlcyBDUkMtMzIgaGFzaAogICAgICogQHBhcmFtIGRhdGEgSW5wdXQgZGF0YSAoc3RyaW5nLCBCdWZmZXIgb3IgVHlwZWRBcnJheSkKICAgICAqIEByZXR1cm5zIENvbXB1dGVkIGhhc2ggYXMgYSBoZXhhZGVjaW1hbCBzdHJpbmcKICAgICAqLwogICAgZnVuY3Rpb24gY3JjMzIoZGF0YSkgewogICAgICAgIGlmICh3YXNtQ2FjaGUkaCA9PT0gbnVsbCkgewogICAgICAgICAgICByZXR1cm4gbG9ja2VkQ3JlYXRlKG11dGV4JGgsIHdhc21Kc29uJGYsIDQpCiAgICAgICAgICAgICAgICAudGhlbigod2FzbSkgPT4gewogICAgICAgICAgICAgICAgd2FzbUNhY2hlJGggPSB3YXNtOwogICAgICAgICAgICAgICAgcmV0dXJuIHdhc21DYWNoZSRoLmNhbGN1bGF0ZShkYXRhLCAweEVEQjg4MzIwKTsKICAgICAgICAgICAgfSk7CiAgICAgICAgfQogICAgICAgIHRyeSB7CiAgICAgICAgICAgIGNvbnN0IGhhc2ggPSB3YXNtQ2FjaGUkaC5jYWxjdWxhdGUoZGF0YSwgMHhFREI4ODMyMCk7CiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoaGFzaCk7CiAgICAgICAgfQogICAgICAgIGNhdGNoIChlcnIpIHsKICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycik7CiAgICAgICAgfQogICAgfQoKICAgIG5ldyBNdXRleCgpOwoKICAgIG5ldyBNdXRleCgpOwoKICAgIG5ldyBNdXRleCgpOwoKICAgIG5ldyBNdXRleCgpOwoKICAgIG5ldyBNdXRleCgpOwoKICAgIG5ldyBNdXRleCgpOwoKICAgIG5ldyBNdXRleCgpOwoKICAgIG5ldyBNdXRleCgpOwoKICAgIG5ldyBNdXRleCgpOwoKICAgIG5ldyBNdXRleCgpOwoKICAgIG5ldyBNdXRleCgpOwoKICAgIG5ldyBNdXRleCgpOwoKICAgIG5ldyBNdXRleCgpOwoKICAgIG5ldyBNdXRleCgpOwoKICAgIG5ldyBNdXRleCgpOwoKICAgIG5ldyBNdXRleCgpOwoKICAgIG5ldyBNdXRleCgpOwoKICAgIGNsYXNzIFdvcmtlck1lc3NhZ2UgewogICAgICAgIGxhYmVsOwogICAgICAgIGNvbnRlbnQ7CiAgICAgICAgY29uc3RydWN0b3IobGFiZWwsIGNvbnRlbnQpewogICAgICAgICAgICB0aGlzLmxhYmVsID0gbGFiZWw7CiAgICAgICAgICAgIHRoaXMuY29udGVudCA9IGNvbnRlbnQ7CiAgICAgICAgfQogICAgfQoKICAgIHZhciBXb3JrZXJMYWJlbHNFbnVtOwogICAgKGZ1bmN0aW9uKFdvcmtlckxhYmVsc0VudW0pIHsKICAgICAgICBXb3JrZXJMYWJlbHNFbnVtW1dvcmtlckxhYmVsc0VudW1bIklOSVQiXSA9IDBdID0gIklOSVQiOwogICAgICAgIFdvcmtlckxhYmVsc0VudW1bV29ya2VyTGFiZWxzRW51bVsiQ0hVTksiXSA9IDFdID0gIkNIVU5LIjsKICAgICAgICBXb3JrZXJMYWJlbHNFbnVtW1dvcmtlckxhYmVsc0VudW1bIkRPTkUiXSA9IDJdID0gIkRPTkUiOwogICAgfSkoV29ya2VyTGFiZWxzRW51bSB8fCAoV29ya2VyTGFiZWxzRW51bSA9IHt9KSk7CgogICAgLy8vIDxyZWZlcmVuY2UgbGliPSJ3ZWJ3b3JrZXIiIC8+CiAgICAvKioKICAgICAqIOeugOWNleeahOebtOaOpeeul+aWh+S7tueahCBjcmMzMgogICAgICovIGFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBhc3luYyAoeyBkYXRhIH0pPT57CiAgICAgICAgY29uc3QgaGFzaCA9IGF3YWl0IGNyYzMyKG5ldyBVaW50OEFycmF5KGRhdGEpKTsKICAgICAgICBwb3N0TWVzc2FnZShuZXcgV29ya2VyTWVzc2FnZShXb3JrZXJMYWJlbHNFbnVtLkRPTkUsIHsKICAgICAgICAgICAgcmVzdWx0OiBoYXNoLAogICAgICAgICAgICBjaHVuazogZGF0YQogICAgICAgIH0pLCBbCiAgICAgICAgICAgIGRhdGEKICAgICAgICBdKTsKICAgIH0pOwoKfSkoKTsKLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y3JjMzItc2luZ2xlLndlYi13b3JrZXIuanMubWFwCgo=');
/* eslint-enable */

class WorkerPoolForCrc32s extends WorkerPool {
    constructor(maxWorkers = navigator.hardwareConcurrency || 4){
        super(maxWorkers);
        this.pool = Array.from({
            length: this.maxWorkerCount
        }).map(()=>new WorkerWrapper(new WorkerFactory()));
    }
}

class WorkerService {
    MAX_WORKERS;
    md5SingleWorkerPool;
    crc32SingleWorkerPool;
    constructor(maxWorkers){
        this.MAX_WORKERS = maxWorkers;
    }
    /**
   * 直接计算文件的 MD5
   * @param chunks 将每个 chunk 视作独立的文件
   */ getMD5ForFiles(chunks) {
        if (this.md5SingleWorkerPool === undefined) {
            this.md5SingleWorkerPool = new WorkerPoolForMd5s(this.MAX_WORKERS);
        }
        return this.md5SingleWorkerPool.exec(chunks);
    }
    /**
   * 直接计算文件的 CRC32
   * @param chunks 将每个 chunk 视作独立的文件
   */ getCRC32ForFiles(chunks) {
        if (this.crc32SingleWorkerPool === undefined) {
            this.crc32SingleWorkerPool = new WorkerPoolForCrc32s(this.MAX_WORKERS);
        }
        return this.crc32SingleWorkerPool.exec(chunks);
    }
}

// Merkle 树节点的类实现
class MerkleNode {
    h;
    l;
    r;
    constructor(hash, left = null, right = null){
        this.h = hash;
        this.l = left;
        this.r = right;
    }
}
// Merkle 树的类实现
class MerkleTree {
    root = new MerkleNode('');
    leafs = [];
    async init(nodes) {
        if (nodes.length === 0) {
            throw new Error('Empty Nodes');
        }
        if (typeof nodes[0] === 'string') {
            this.leafs = nodes.map((node)=>new MerkleNode(node));
        } else {
            this.leafs = nodes;
        }
        this.root = await this.buildTree();
    }
    getRootHash() {
        return this.root.h;
    }
    async buildTree() {
        // 实现构建 Merkle 树的逻辑。根据叶子节点创建父节点，一直到根节点。
        let currentLevelNodes = this.leafs;
        while(currentLevelNodes.length > 1){
            const parentNodes = [];
            for(let i = 0; i < currentLevelNodes.length; i += 2){
                const left = currentLevelNodes[i];
                const right = i + 1 < currentLevelNodes.length ? currentLevelNodes[i + 1] : null;
                // 具体的哈希计算方法
                const parentHash = await this.calculateHash(left, right);
                parentNodes.push(new MerkleNode(parentHash, left, right));
            }
            currentLevelNodes = parentNodes;
        }
        return currentLevelNodes[0] // 返回根节点
        ;
    }
    // 序列化 Merkle 树
    serialize() {
        const serializeNode = (node)=>{
            if (node === null) {
                return null;
            }
            return {
                h: node.h,
                l: serializeNode(node.l),
                r: serializeNode(node.r)
            };
        };
        const serializedRoot = serializeNode(this.root);
        return JSON.stringify(serializedRoot);
    }
    // 反序列化 Merkle 树
    static async deserialize(serializedTree) {
        const parsedData = JSON.parse(serializedTree);
        const deserializeNode = (data)=>{
            if (data === null) {
                return null;
            }
            return new MerkleNode(data.h, deserializeNode(data.l), deserializeNode(data.r));
        };
        const root = deserializeNode(parsedData);
        if (!root) {
            throw new Error('Invalid serialized tree data');
        }
        // 创建一个包含所有叶子节点的数组，这是为了与 MerkleTree 的构造函数兼容
        // 没有保存这些叶子节点的序列化版本，所以这里需要一些额外的逻辑来处理
        // 如果你需要将整个树的所有节点存储为序列化版本，那么可能需要修改这部分逻辑
        const extractLeafNodes = (node)=>{
            if (node.l === null && node.r === null) {
                return [
                    node
                ];
            }
            return [
                ...node.l ? extractLeafNodes(node.l) : [],
                ...node.r ? extractLeafNodes(node.r) : []
            ];
        };
        const leafNodes = extractLeafNodes(root);
        const merkleTree = new MerkleTree();
        await merkleTree.init(leafNodes);
        return merkleTree;
    }
    async calculateHash(left, right) {
        return right ? md5(left.h + right.h) : left.h;
    }
}

let workerService = null;
const defaultMaxWorkers = 8;
/**
 * @param file 待计算 Hash 的文件
 * @param chunkSize 分片大小 MB
 * @param maxWorkers worker 线程数量
 */ async function getFileHashInfo(file, chunkSize = 10, maxWorkers = defaultMaxWorkers) {
    if (workerService === null) {
        workerService = new WorkerService(maxWorkers);
    }
    // 分片数量小于 borderCount 用 MD5, 否则用 CRC32 算 Hash
    const BORDER_COUNT = 100;
    // 文件大小
    const fileSize = file.size / 1000;
    // 文件元数据
    const metadata = {
        name: file.name,
        size: fileSize,
        lastModified: file.lastModified,
        type: file.type
    };
    // 文件分片
    const chunksBlob = sliceFile(file, chunkSize);
    let chunksHash = [];
    if (chunksBlob.length === 1) {
        chunksHash = [
            await md5(new Uint8Array(await chunksBlob[0].arrayBuffer()))
        ];
    } else {
        let chunksBuf = [];
        // 将文件分片进行分组, 组内任务并行执行, 组外任务串行执行
        const chunksPart = getArrParts(chunksBlob, defaultMaxWorkers);
        console.log('chunksBlob', chunksBlob.length);
        console.log('BORDER_COUNT', BORDER_COUNT);
        const tasks = chunksPart.map((part)=>async ()=>{
                // 手动释放上一次用于计算 Hash 的 ArrayBuffer
                // !!! 现在只会占用 MAX_WORKERS * 分片数量大小的内存 !!!
                chunksBuf.length = 0;
                chunksBuf = await getArrayBufFromBlobs(part);
                // 按文件分片数量执行不同 Hash 策略
                return chunksBlob.length <= BORDER_COUNT ? await workerService.getMD5ForFiles(chunksBuf) : await workerService.getCRC32ForFiles(chunksBuf);
            });
        for (const task of tasks){
            const result = await task();
            chunksHash.push(...result);
        }
    }
    const merkleTree = new MerkleTree();
    await merkleTree.init(chunksHash);
    const fileHash = merkleTree.getRootHash();
    return {
        chunksBlob,
        chunksHash,
        merkleHash: fileHash,
        metadata
    };
}

export { getFileHashInfo };
