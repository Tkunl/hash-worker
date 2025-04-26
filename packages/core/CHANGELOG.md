# hash-worker

## 2.0.0

### Major Changes

- refator: 重构了 core 包, 拆分不同环境的打包产物, 不需要在配置 Vite/Webpack 中排除 node 相关依赖

- feat: 现在可以自定义构建 MerkleTree 的 hash 方法

## 1.0.1

### Minor Changes

- fix: 当 0 <= chunkSize < 1 时, 导致分片函数死循环的问题

## 1.0.0

### Major Changes

- release version 1.0.0

## 0.1.3

### Minor Changes

- feat: 添加了 Webpack 下报错的解决方案, 升级了项目到最新的依赖
