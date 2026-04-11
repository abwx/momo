# 本地记忆 (Local Memory App)

这是一个纯本地的记录和文件存储应用，专为安卓系统设计。
你的所有文本、网址和文件都只存储在手机本地，完全不需要网络连接，最大程度地保护您的隐私。

## 功能特性

- 📂 **自定义分类**: 可以随意创建不同的分类，分别存放各种记录
- 📝 **文本记录**: 保存备忘录、笔记或重要的文本片段
- 🔗 **网址收藏**: 收藏经常访问的网址，一键点击打开
- 📄 **文件存储**: 从手机中选择文件保存在应用内，永不丢失
- 🔒 **纯本地化**: 采用 SQLite 和本地文件系统，无任何云端数据收集

## 技术栈

- React Native & Expo Router
- Expo SQLite (本地数据库)
- Expo File System (本地文件存储)
- React Native Paper (Material Design 3 精美 UI)

## 如何在手机上运行

由于应用基于 Expo 框架构建，您可以通过以下方式非常方便地在安卓手机上运行：

### 1. 本地开发与预览
确保已安装 [Node.js](https://nodejs.org/)。

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run start
```
然后在您的安卓手机上安装 **Expo Go** 应用（可从 Google Play 或官网下载），扫描终端中出现的二维码即可直接预览和使用！

### 2. 打包为独立的 APK 文件
如果您希望将它打包为独立的 `.apk` 安装包并长期安装在手机上：

```bash
# 安装 EAS CLI
npm install -g eas-cli

# 登录您的 Expo 账号
eas login

# 配置项目构建 (按提示选择 Android)
eas build:configure

# 执行 Android 本地 APK 构建 (需要本地环境)
eas build -p android --profile preview --local
```

也可以选择云端构建：
```bash
eas build -p android --profile preview
```
构建完成后，下载生成的 `.apk` 文件安装到手机即可。
