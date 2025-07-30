# hash-worker

## 2.0.0

### Major Changes

- feat: 移除了 crc32 和 mix 策略的支持, 因为 crc32 非常容易导致 hash 碰撞, 现在只支持 md5 和 xxHash128 两种 hash 算法

- feat: 更新了 getFileHashChunks 方法的相关类型命名

## 1.1.3

### Patch Changes

- 1.1.1 版本打包产物没有问题, 运行报错是需要将 hash-worker 排除在 vite 的预构建之外

- chore: 更新了 playground 中的相关依赖, 更新了子包与主包之间的依赖管理

## 1.1.2

### Patch Changes

- 1.1.1 版本重构后, 打包产物存在问题, 在 playground 中未测试出, 从 npm 中安装包或使用 yalc 链接本地打包产物后, 正常使用会报错, 暂时回滚 1.0.1 的代码, 待修复后, 发布 1.1.3 版本

## 1.1.1

### Minor Changes

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