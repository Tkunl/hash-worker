var HashWorker = (function (A) {
  'use strict'
  var e,
    t,
    i,
    r = 'undefined' != typeof document ? document.currentScript : null
  /*!
   * hash-wasm (https://www.npmjs.com/package/hash-wasm)
   * (c) Dani Biro
   * @license MIT
   */ function n(A, e, t, i) {
    return new (t || (t = Promise))(function (e, r) {
      function n(A) {
        try {
          o(i.next(A))
        } catch (A) {
          r(A)
        }
      }
      function B(A) {
        try {
          o(i.throw(A))
        } catch (A) {
          r(A)
        }
      }
      function o(A) {
        var i
        A.done
          ? e(A.value)
          : ((i = A.value) instanceof t
              ? i
              : new t(function (A) {
                  A(i)
                })
            ).then(n, B)
      }
      o((i = i.apply(A, [])).next())
    })
  }
  'function' == typeof SuppressedError && SuppressedError
  class B {
    constructor() {
      this.mutex = Promise.resolve()
    }
    lock() {
      let A = () => {}
      return (
        (this.mutex = this.mutex.then(() => new Promise(A))),
        new Promise((e) => {
          A = e
        })
      )
    }
    dispatch(A) {
      return n(this, void 0, void 0, function* () {
        let e = yield this.lock()
        try {
          return yield Promise.resolve(A())
        } finally {
          e()
        }
      })
    }
  }
  let o =
      'undefined' != typeof globalThis
        ? globalThis
        : 'undefined' != typeof self
          ? self
          : 'undefined' != typeof window
            ? window
            : global,
    a = null !== (i = o.Buffer) && void 0 !== i ? i : null,
    Q = o.TextEncoder ? new o.TextEncoder() : null
  function I(A, e) {
    return (
      (((15 & A) + ((A >> 6) | ((A >> 3) & 8))) << 4) | ((15 & e) + ((e >> 6) | ((e >> 3) & 8)))
    )
  }
  function g(A, e, t) {
    let i = 0
    for (let r = 0; r < t; r++) {
      let t = e[r] >>> 4
      ;(A[i++] = t > 9 ? t + 87 : t + 48), (t = 15 & e[r]), (A[i++] = t > 9 ? t + 87 : t + 48)
    }
    return String.fromCharCode.apply(null, A)
  }
  let s =
      null !== a
        ? (A) => {
            if ('string' == typeof A) {
              let e = a.from(A, 'utf8')
              return new Uint8Array(e.buffer, e.byteOffset, e.length)
            }
            if (a.isBuffer(A)) return new Uint8Array(A.buffer, A.byteOffset, A.length)
            if (ArrayBuffer.isView(A)) return new Uint8Array(A.buffer, A.byteOffset, A.byteLength)
            throw Error('Invalid data type!')
          }
        : (A) => {
            if ('string' == typeof A) return Q.encode(A)
            if (ArrayBuffer.isView(A)) return new Uint8Array(A.buffer, A.byteOffset, A.byteLength)
            throw Error('Invalid data type!')
          },
    E = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
    l = new Uint8Array(256)
  for (let A = 0; A < E.length; A++) l[E.charCodeAt(A)] = A
  let C = new B(),
    c = new Map()
  function h(A, e, t) {
    return n(this, void 0, void 0, function* () {
      let i = yield A.lock(),
        r = yield (function (A, e) {
          return n(this, void 0, void 0, function* () {
            let t = null,
              i = null,
              r = !1
            if ('undefined' == typeof WebAssembly)
              throw Error('WebAssembly is not supported in this environment!')
            let B = () => new DataView(t.exports.memory.buffer).getUint32(t.exports.STATE_SIZE, !0),
              o = C.dispatch(() =>
                n(this, void 0, void 0, function* () {
                  if (!c.has(A.name)) {
                    let e = (function (A) {
                        let e = (function (A) {
                            let e = Math.floor(0.75 * A.length),
                              t = A.length
                            return '=' === A[t - 1] && ((e -= 1), '=' === A[t - 2] && (e -= 1)), e
                          })(A),
                          t = A.length,
                          i = new Uint8Array(e),
                          r = 0
                        for (let e = 0; e < t; e += 4) {
                          let t = l[A.charCodeAt(e)],
                            n = l[A.charCodeAt(e + 1)],
                            B = l[A.charCodeAt(e + 2)],
                            o = l[A.charCodeAt(e + 3)]
                          ;(i[r] = (t << 2) | (n >> 4)),
                            (i[(r += 1)] = ((15 & n) << 4) | (B >> 2)),
                            (i[(r += 1)] = ((3 & B) << 6) | (63 & o)),
                            (r += 1)
                        }
                        return i
                      })(A.data),
                      t = WebAssembly.compile(e)
                    c.set(A.name, t)
                  }
                  let e = yield c.get(A.name)
                  t = yield WebAssembly.instantiate(e, {})
                }),
              ),
              a = (A = null) => {
                ;(r = !0), t.exports.Hash_Init(A)
              },
              Q = (A) => {
                let e = 0
                for (; e < A.length; ) {
                  let r = A.subarray(e, e + 16384)
                  ;(e += r.length), i.set(r), t.exports.Hash_Update(r.length)
                }
              },
              E = (A) => {
                if (!r) throw Error('update() called before init()')
                Q(s(A))
              },
              h = new Uint8Array(2 * e),
              f = (A, n = null) => {
                if (!r) throw Error('digest() called before init()')
                return ((r = !1), t.exports.Hash_Final(n), 'binary' === A)
                  ? i.slice(0, e)
                  : g(h, i, e)
              },
              u = (A) => ('string' == typeof A ? A.length < 4096 : A.byteLength < 16384),
              w = u
            switch (A.name) {
              case 'argon2':
              case 'scrypt':
                w = () => !0
                break
              case 'blake2b':
              case 'blake2s':
                w = (A, e) => e <= 512 && u(A)
                break
              case 'blake3':
                w = (A, e) => 0 === e && u(A)
                break
              case 'xxhash64':
              case 'xxhash3':
              case 'xxhash128':
              case 'crc64':
                w = () => !1
            }
            return (
              yield n(this, void 0, void 0, function* () {
                t || (yield o)
                let A = t.exports.Hash_GetBuffer()
                i = new Uint8Array(t.exports.memory.buffer, A, 16384)
              }),
              {
                getMemory: () => i,
                writeMemory: (A, e = 0) => {
                  i.set(A, e)
                },
                getExports: () => t.exports,
                setMemorySize: (A) => {
                  t.exports.Hash_SetMemorySize(A)
                  let e = t.exports.Hash_GetBuffer()
                  i = new Uint8Array(t.exports.memory.buffer, e, A)
                },
                init: a,
                update: E,
                digest: f,
                save: () => {
                  if (!r) throw Error('save() can only be called after init() and before digest()')
                  let e = t.exports.Hash_GetState(),
                    i = B(),
                    n = new Uint8Array(t.exports.memory.buffer, e, i),
                    o = new Uint8Array(4 + i)
                  return (
                    (function (A, e) {
                      let t = e.length >> 1
                      for (let i = 0; i < t; i++) {
                        let t = i << 1
                        A[i] = I(e.charCodeAt(t), e.charCodeAt(t + 1))
                      }
                    })(o, A.hash),
                    o.set(n, 4),
                    o
                  )
                },
                load: (e) => {
                  if (!(e instanceof Uint8Array))
                    throw Error('load() expects an Uint8Array generated by save()')
                  let i = t.exports.Hash_GetState(),
                    n = B(),
                    o = 4 + n,
                    a = t.exports.memory.buffer
                  if (e.length !== o)
                    throw Error(`Bad state length (expected ${o} bytes, got ${e.length})`)
                  if (
                    !(function (A, e) {
                      if (A.length !== 2 * e.length) return !1
                      for (let t = 0; t < e.length; t++) {
                        let i = t << 1
                        if (e[t] !== I(A.charCodeAt(i), A.charCodeAt(i + 1))) return !1
                      }
                      return !0
                    })(A.hash, e.subarray(0, 4))
                  )
                    throw Error('This state was written by an incompatible hash implementation')
                  let Q = e.subarray(4)
                  new Uint8Array(a, i, n).set(Q), (r = !0)
                },
                calculate: (A, r = null, n = null) => {
                  if (!w(A, r)) return a(r), E(A), f('hex', n)
                  let B = s(A)
                  return i.set(B), t.exports.Hash_Calculate(B.length, r, n), g(h, i, e)
                },
                hashLength: e,
              }
            )
          })
        })(e, t)
      return i(), r
    })
  }
  new B(), new B(), new B(), new B()
  var f = {
    name: 'crc32',
    data: 'AGFzbQEAAAABEQRgAAF/YAF/AGAAAGACf38AAwgHAAEBAQIAAwUEAQECAgYOAn8BQZDJBQt/AEGACAsHcAgGbWVtb3J5AgAOSGFzaF9HZXRCdWZmZXIAAAlIYXNoX0luaXQAAgtIYXNoX1VwZGF0ZQADCkhhc2hfRmluYWwABA1IYXNoX0dldFN0YXRlAAUOSGFzaF9DYWxjdWxhdGUABgpTVEFURV9TSVpFAwEKkggHBQBBgAkLwwMBA39BgIkBIQFBACECA0AgAUEAQQBBAEEAQQBBAEEAQQAgAkEBcWsgAHEgAkEBdnMiA0EBcWsgAHEgA0EBdnMiA0EBcWsgAHEgA0EBdnMiA0EBcWsgAHEgA0EBdnMiA0EBcWsgAHEgA0EBdnMiA0EBcWsgAHEgA0EBdnMiA0EBcWsgAHEgA0EBdnMiA0EBcWsgAHEgA0EBdnM2AgAgAUEEaiEBIAJBAWoiAkGAAkcNAAtBACEAA0AgAEGEkQFqIABBhIkBaigCACICQf8BcUECdEGAiQFqKAIAIAJBCHZzIgI2AgAgAEGEmQFqIAJB/wFxQQJ0QYCJAWooAgAgAkEIdnMiAjYCACAAQYShAWogAkH/AXFBAnRBgIkBaigCACACQQh2cyICNgIAIABBhKkBaiACQf8BcUECdEGAiQFqKAIAIAJBCHZzIgI2AgAgAEGEsQFqIAJB/wFxQQJ0QYCJAWooAgAgAkEIdnMiAjYCACAAQYS5AWogAkH/AXFBAnRBgIkBaigCACACQQh2cyICNgIAIABBhMEBaiACQf8BcUECdEGAiQFqKAIAIAJBCHZzNgIAIABBBGoiAEH8B0cNAAsLJwACQEEAKAKAyQEgAEYNACAAEAFBACAANgKAyQELQQBBADYChMkBC4gDAQN/QQAoAoTJAUF/cyEBQYAJIQICQCAAQQhJDQBBgAkhAgNAIAJBBGooAgAiA0EOdkH8B3FBgJEBaigCACADQRZ2QfwHcUGAiQFqKAIAcyADQQZ2QfwHcUGAmQFqKAIAcyADQf8BcUECdEGAoQFqKAIAcyACKAIAIAFzIgFBFnZB/AdxQYCpAWooAgBzIAFBDnZB/AdxQYCxAWooAgBzIAFBBnZB/AdxQYC5AWooAgBzIAFB/wFxQQJ0QYDBAWooAgBzIQEgAkEIaiECIABBeGoiAEEHSw0ACwsCQCAARQ0AAkACQCAAQQFxDQAgACEDDAELIAFB/wFxIAItAABzQQJ0QYCJAWooAgAgAUEIdnMhASACQQFqIQIgAEF/aiEDCyAAQQFGDQADQCABQf8BcSACLQAAc0ECdEGAiQFqKAIAIAFBCHZzIgFB/wFxIAJBAWotAABzQQJ0QYCJAWooAgAgAUEIdnMhASACQQJqIQIgA0F+aiIDDQALC0EAIAFBf3M2AoTJAQsyAQF/QQBBACgChMkBIgBBGHQgAEGA/gNxQQh0ciAAQQh2QYD+A3EgAEEYdnJyNgKACQsGAEGEyQELWQACQEEAKAKAyQEgAUYNACABEAFBACABNgKAyQELQQBBADYChMkBIAAQA0EAQQAoAoTJASIBQRh0IAFBgP4DcUEIdHIgAUEIdkGA/gNxIAFBGHZycjYCgAkLCwsBAEGACAsEBAAAAA==',
    hash: 'd2eba587',
  }
  let u = new B(),
    w = null
  function F(A) {
    return !Number.isInteger(A) || A < 0 || A > 0xffffffff
      ? Error('Polynomial must be a valid 32-bit long unsigned integer')
      : null
  }
  function k(A, e = 0xedb88320) {
    if (F(e)) return Promise.reject(F(e))
    if (null === w) return h(u, f, 4).then((t) => (w = t).calculate(A, e))
    try {
      let t = w.calculate(A, e)
      return Promise.resolve(t)
    } catch (A) {
      return Promise.reject(A)
    }
  }
  new B(), new B()
  var p = {
    name: 'md5',
    data: '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',
    hash: 'e6508e4b',
  }
  let d = new B(),
    y = null
  function m(A) {
    if (null === y) return h(d, p, 16).then((e) => (y = e).calculate(A))
    try {
      let e = y.calculate(A)
      return Promise.resolve(e)
    } catch (A) {
      return Promise.reject(A)
    }
  }
  new B(), new B(), new B(), new B(), new B(), new B(), new B(), new B()
  var J = {
    name: 'xxhash64',
    data: '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',
    hash: '177fbfa3',
  }
  let q = new B(),
    x = null,
    b = new Uint8Array(8)
  function G(A) {
    return !Number.isInteger(A) || A < 0 || A > 0xffffffff
      ? Error('Seed must be given as two valid 32-bit long unsigned integers (lo + high).')
      : null
  }
  function S(A, e, t) {
    let i = new DataView(A)
    i.setUint32(0, e, !0), i.setUint32(4, t, !0)
  }
  function H(A, e = 0, t = 0) {
    if (G(e)) return Promise.reject(G(e))
    if (G(t)) return Promise.reject(G(t))
    if (null === x)
      return h(q, J, 8).then((i) => ((x = i), S(b.buffer, e, t), x.writeMemory(b), x.calculate(A)))
    try {
      S(b.buffer, e, t), x.writeMemory(b)
      let i = x.calculate(A)
      return Promise.resolve(i)
    } catch (A) {
      return Promise.reject(A)
    }
  }
  new B(), new B(), new B(), new B(), new B()
  class U {
    h
    l
    r
    constructor(A, e = null, t = null) {
      ;(this.h = A), (this.l = e), (this.r = t)
    }
  }
  class W {
    root = new U('')
    leafs = []
    async init(A) {
      if (0 === A.length) throw Error('Empty Nodes')
      'string' == typeof A[0] ? (this.leafs = A.map((A) => new U(A))) : (this.leafs = A),
        (this.root = await this.buildTree())
    }
    getRootHash() {
      return this.root.h
    }
    async buildTree() {
      let A = this.leafs
      for (; A.length > 1; ) {
        let e = []
        for (let t = 0; t < A.length; t += 2) {
          let i = A[t],
            r = t + 1 < A.length ? A[t + 1] : null,
            n = await this.calculateHash(i, r)
          e.push(new U(n, i, r))
        }
        A = e
      }
      return A[0]
    }
    async calculateHash(A, e) {
      return e ? m(A.h + e.h) : A.h
    }
  }
  function D(A, e) {
    let t = [],
      i = []
    return (
      A.forEach((A) => {
        i.push(A), i.length === e && (t.push(i), (i = []))
      }),
      0 !== i.length && t.push(i),
      t
    )
  }
  function N() {
    return 'undefined' != typeof window && void 0 !== window.document
  }
  function R() {
    return (
      'undefined' != typeof global &&
      'undefined' != typeof process &&
      void 0 !== process.versions &&
      void 0 !== process.versions.node
    )
  }
  function v(A, e = 1) {
    let t = e << 20,
      i = [],
      r = 0
    for (; r < A.size; ) i.push(A.slice(r, r + t)), (r += t)
    return i
  }
  async function V(A, e = 1) {
    let t = await import('fs/promises'),
      i = e << 20,
      r = (await t.stat(A)).size,
      n = []
    for (let A = 0; A < r; A += i) n.push([A, A + i - 1])
    return { sliceLocation: n, endLocation: r }
  }
  async function z(A) {
    return Promise.all(A.map((A) => A.arrayBuffer()))
  }
  async function L(A, e, t) {
    let i = (await import('fs')).createReadStream(A, { start: e, end: t }),
      r = []
    return new Promise((A, e) => {
      i.on('data', (A) => {
        r.push(A)
      }),
        i.on('end', () => {
          let e = Buffer.concat(r)
          A(e.buffer.slice(e.byteOffset, e.byteOffset + e.byteLength))
        }),
        i.on('error', (A) => {
          e(A)
        })
    })
  }
  async function Y(A, e) {
    if (A && N()) {
      let e = ''
      return (
        A.name.includes('.') && (e = void 0 !== (e = A.name.split('.').pop()) ? '.' + e : ''),
        { name: A.name, size: A.size / 1024, lastModified: A.lastModified, type: e }
      )
    }
    if (e && R()) {
      let A = await import('fs/promises'),
        t = await import('path'),
        i = await A.stat(e)
      return {
        name: t.basename(e),
        size: i.size / 1024,
        lastModified: i.mtime.getTime(),
        type: t.extname(e),
      }
    }
    throw Error('Unsupported environment')
  }
  function M() {
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (A) {
      let e = (16 * Math.random()) | 0
      return ('x' === A ? e : (3 & e) | 8).toString(16)
    })
  }
  class X {
    _value
    subscribers = new Map()
    constructor(A) {
      this._value = A
    }
    get value() {
      return this._value
    }
    next(A) {
      ;(this._value = A), this.subscribers.forEach((e) => e(A))
    }
    subscribe(A) {
      let e = M()
      return this.subscribers.set(e, A), A(this.value), e
    }
    unsubscribe(A) {
      this.subscribers.delete(A)
    }
  }
  var K = (((e = {}).RUNNING = 'running'), (e.WAITING = 'waiting'), e)
  class O {
    worker
    status
    constructor(A) {
      ;(this.worker = A), (this.status = 'waiting')
    }
    run(A, e, t, i) {
      this.status = 'running'
      let r = (A) => (t) => {
          let r
          N() && (r = t.data), R() && (r = t)
          let { result: n, chunk: B } = r
          n && B && (i({ buf: B, index: e }), (this.status = 'waiting'), A(n))
        },
        n = (A) => (e) => {
          ;(this.status = 'waiting'), A(e)
        }
      if (N()) {
        let e = this.worker
        return new Promise((i, B) => {
          ;(e.onmessage = r(i)), (e.onerror = n(B)), e.postMessage(A, [t(A)])
        })
      }
      if (R()) {
        let e = this.worker
        return new Promise((i, B) => {
          e.setMaxListeners(1024),
            e.on('message', r(i)),
            e.on('error', n(B)),
            e.postMessage(A, [t(A)])
        })
      }
      throw Error('Unsupported environment')
    }
    terminate() {
      this.worker.terminate()
    }
  }
  class P {
    pool = []
    maxWorkerCount
    curRunningCount = new X(0)
    results = []
    constructor(A) {
      this.maxWorkerCount = A
    }
    exec(A, e, t) {
      this.results.length = 0
      let i = A.map((A, e) => ({ data: A, index: e }))
      return new Promise((A) => {
        this.curRunningCount.subscribe((r) => {
          if (r < this.maxWorkerCount && 0 !== i.length) {
            let A = this.maxWorkerCount - r
            A > i.length && (A = i.length)
            let n = []
            for (let e of this.pool)
              if (e.status === K.WAITING && (n.push(e), n.length === A)) break
            let B = i.splice(0, A)
            this.curRunningCount.next(this.curRunningCount.value + A),
              n.forEach((A, i) => {
                let r = B[i]
                A.run(r.data, r.index, e, t)
                  .then((A) => {
                    this.results[r.index] = A
                  })
                  .catch((A) => {
                    this.results[r.index] = A
                  })
                  .finally(() => {
                    this.curRunningCount.next(this.curRunningCount.value - 1)
                  })
              })
          }
          0 === this.curRunningCount.value && 0 === i.length && A(this.results)
        })
      })
    }
    terminate() {
      this.pool.forEach((A) => A.terminate())
    }
  }
  var T =
    (((t = {}).md5 = 'md5'), (t.crc32 = 'crc32'), (t.xxHash64 = 'xxHash64'), (t.mixed = 'mixed'), t)
  class Z extends P {
    constructor(A) {
      super(A)
    }
    static async create(A) {
      let e = new Z(A),
        t = Array.from({ length: A })
      if (
        (N() &&
          (e.pool = t.map(
            () =>
              new O(
                new Worker(
                  new URL(
                    './worker/hash.worker.mjs',
                    (r && 'SCRIPT' === r.tagName.toUpperCase() && r.src) ||
                      new URL('global.js', document.baseURI).href,
                  ),
                  { type: 'module' },
                ),
              ),
          )),
        R())
      ) {
        let { Worker: A } = await import('worker_threads')
        e.pool = t.map(
          () =>
            new O(
              new A(
                new URL(
                  './worker/hash.worker.mjs',
                  (r && 'SCRIPT' === r.tagName.toUpperCase() && r.src) ||
                    new URL('global.js', document.baseURI).href,
                ),
              ),
            ),
        )
      }
      return e
    }
  }
  class j {
    MAX_WORKERS
    pool
    constructor(A) {
      this.MAX_WORKERS = A
    }
    async getHashForFiles(A, e) {
      void 0 === this.pool && (this.pool = await Z.create(this.MAX_WORKERS))
      let t = A.map((A) => ({ chunk: A, strategy: e }))
      return this.pool.exec(
        t,
        (A) => A.chunk,
        (e) => {
          let { index: t, buf: i } = e
          A[t] = i
        },
      )
    }
    getMD5ForFiles(A) {
      return this.getHashForFiles(A, T.md5)
    }
    getCRC32ForFiles(A) {
      return this.getHashForFiles(A, T.crc32)
    }
    getXxHash64ForFiles(A) {
      return this.getHashForFiles(A, T.xxHash64)
    }
    terminate() {
      this.pool && this.pool.terminate(), (this.pool = void 0)
    }
  }
  async function _(A) {
    let e = new W()
    return await e.init(A), e.getRootHash()
  }
  async function $(A, e) {
    let t = new Uint8Array(e)
    return [
      await ((A) => {
        if (A === T.md5) return m
        if (A === T.crc32) return k
        if (A === T.xxHash64) return H
        throw Error('Unknown strategy')
      })(A === T.mixed ? T.md5 : A)(t),
    ]
  }
  async function AA(A, e, t, i, r) {
    return {
      [T.xxHash64]: () => r.getXxHash64ForFiles(e),
      [T.md5]: () => r.getMD5ForFiles(e),
      [T.crc32]: () => r.getCRC32ForFiles(e),
      [T.mixed]: () => (t <= i ? r.getMD5ForFiles(e) : r.getCRC32ForFiles(e)),
    }[A]()
  }
  async function Ae(A, e, t, i = $, r = AA) {
    let { chunkSize: n, strategy: B, workerCount: o, borderCount: a } = e,
      Q = v(A, n),
      I = [],
      g = async () => {
        let A = await Q[0].arrayBuffer()
        I = await i(B, A)
      },
      s = async () => {
        let A = []
        for (let e of D(Q, o).map(
          (e) => async () => ((A.length = 0), r(B, (A = await z(e)), Q.length, a, t)),
        )) {
          let A = await e()
          I.push(...A)
        }
        A && (A.length = 0)
      }
    1 === Q.length ? await g() : await s()
    let E = await _(I)
    return { chunksBlob: Q, chunksHash: I, fileHash: E }
  }
  async function At(A, e, t, i = $, r = AA) {
    let { chunkSize: n, strategy: B, workerCount: o, borderCount: a } = e,
      { sliceLocation: Q, endLocation: I } = await V(A, n),
      g = [],
      s = async () => {
        let e = await L(A, 0, I)
        g = await i(B, e)
      },
      E = async () => {
        let e = []
        for (let i of D(Q, o).map(
          (i) => async () => (
            (e.length = 0),
            r(B, (e = await Promise.all(i.map((e) => L(A, e[0], e[1])))), Q.length, a, t)
          ),
        )) {
          let A = await i()
          g.push(...A)
        }
        e.length = 0
      }
    1 === Q.length ? await s() : await E()
    let l = await _(g)
    return { chunksHash: g, fileHash: l }
  }
  let Ai = null,
    Ar = 0
  async function An(A) {
    let {
        config: e,
        file: t,
        filePath: i,
      } = (function (A) {
        let e = (() => {
            if (R()) return 'node'
            if (N()) return 'browser'
            throw Error('Unsupported environment')
          })(),
          {
            chunkSize: t,
            workerCount: i,
            strategy: r,
            borderCount: n,
            isCloseWorkerImmediately: B,
            isShowLog: o,
          } = A.config ?? {},
          a = {
            chunkSize: t ?? 10,
            workerCount: i ?? 8,
            strategy: r ?? T.mixed,
            borderCount: n ?? 100,
            isCloseWorkerImmediately: B ?? !0,
            isShowLog: o ?? !1,
          }
        if ('node' === e) {
          if (!A.filePath) throw Error('The filePath attribute is required in node environment')
          return { ...A, config: a, filePath: A.filePath }
        }
        if ('browser' === e) {
          if (!A.file) throw Error('The file attribute is required in browser environment')
          return { ...A, config: a, file: A.file }
        }
        throw Error('Unsupported environment')
      })(A),
      { isCloseWorkerImmediately: r, isShowLog: n, workerCount: B } = e
    ;(null === Ai || Ar !== B) && (AB(), (Ai = new j(e.workerCount)))
    let o = await Y(t, i),
      a = [],
      Q = [],
      I = '',
      g = 0,
      s = 0
    if ((n && (g = Date.now()), N() && t)) {
      let A = await Ae(t, e, Ai)
      ;(a = A.chunksBlob), (Q = A.chunksHash), (I = A.fileHash)
    }
    if (R() && i) {
      let A = await At(i, e, Ai)
      ;(Q = A.chunksHash), (I = A.fileHash)
    }
    n && (s = Date.now() - g),
      n &&
        console.log(
          `get file hash in: ${s} ms by using ${e.workerCount} worker, speed: ${o.size / 1024 / (s / 1e3)} Mb/s`,
        )
    let E = { chunksHash: Q, merkleHash: I, metadata: o }
    return N() && (E.chunksBlob = a), r && AB(), E
  }
  function AB() {
    Ai && Ai.terminate(), (Ai = null), (Ar = 0)
  }
  return (
    (A.MerkleNode = U),
    (A.MerkleTree = W),
    (A.MiniSubject = X),
    (A.StatusEnum = K),
    (A.Strategy = T),
    (A.WorkerPool = P),
    (A.WorkerWrapper = O),
    (A.destroyWorkerPool = AB),
    (A.generateUUID = M),
    (A.getArrParts = D),
    (A.getArrayBufFromBlobs = z),
    (A.getFileHashChunks = An),
    (A.getFileMetadata = Y),
    (A.getFileSliceLocations = V),
    (A.getRootHashByChunks = _),
    (A.isBrowser = N),
    (A.isBrowser2 = function () {
      return 'undefined' != typeof self && 'function' == typeof self.postMessage
    }),
    (A.isEmpty = function (A) {
      return (
        null == A ||
        '' === A ||
        (Array.isArray(A)
          ? 0 === A.length
          : A instanceof Map || A instanceof Set
            ? 0 === A.size
            : !('object' != typeof A || Array.isArray(A)) &&
              !(A instanceof Date) &&
              0 === Object.keys(A).length)
      )
    }),
    (A.isNode = R),
    (A.readFileAsArrayBuffer = L),
    (A.sliceFile = v),
    A
  )
})({})
