
## 使用 pnpm 在指定目录下进行操作
```
pnpm <command> --filter <package_selector>
```

如：

仅在某目录下安装依赖
```
pnpm install lodash --filter <package_selector>
```

仅在某目录下运行单测
```
pnpm run test --filter <package_selector>
```
