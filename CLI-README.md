# Feishu Markdown Converter - 命令行工具

这是一个解决飞书API表格写入限制的命令行工具。

## 快速安装

```bash
# 方法1: 直接使用（推荐）
curl -O https://raw.githubusercontent.com/your-repo/feishu-markdown-converter/main/feishu-markdown-converter.js
npm install feishu-markdown

# 方法2: 作为全局工具
npm install -g feishu-markdown-converter-tool
```

## 基本使用

### 转换单个文件
```bash
feishu-convert document.md "我的文档"
```

### 批量转换
```bash
feishu-convert --batch file1.md file2.md file3.md
```

### 指定输出目录
```bash
feishu-convert input.md --output-dir ./feishu-docs/
```

## 高级选项

### 认证配置
```bash
# 使用环境变量
export FEISHU_APP_ID=your_id
export FEISHU_APP_SECRET=your_secret

# 或使用配置文件
feishu-convert --config ~/.feishu/config.json
```

### 转换选项
```bash
# 设置批量大小
feishu-convert file.md --batch-size 20

# 启用Mermaid图表支持
feishu-convert file.md --mermaid

# 禁用图片下载
feishu-convert file.md --no-images
```

### 输出控制
```bash
# 静默模式（仅输出URL）
feishu-convert file.md --quiet

# 详细模式（调试信息）
feishu-convert file.md --verbose

# 仅解析不上传
feishu-convert file.md --dry-run
```

## 集成示例

### 与AI工具集成
```bash
#!/bin/bash
# ai-to-feishu.sh

# 1. 使用AI生成内容
CONTENT=$(gemini -p "生成周报总结")

# 2. 保存为markdown
echo "$CONTENT" > weekly-report.md

# 3. 转换到飞书
feishu-convert weekly-report.md "AI周报 $(date +%Y-%m-%d)"

# 4. 发送通知
URL=$(cat feishu-conversion-result.json | jq -r '.url')
echo "文档已创建: $URL"
```

### 定时任务
```crontab
# 每天上午9点生成日报
0 9 * * * /path/to/ai-to-feishu.sh
```

## 配置文件示例

```json
{
  "appId": "cli_xxx",
  "appSecret": "xxx",
  "defaults": {
    "batchSize": 30,
    "downloadImages": false,
    "timeout": 120000,
    "outputDir": "./feishu-docs/"
  },
  "templates": {
    "report": {
      "title": "报告 - {date}",
      "folderToken": "fldcnxxx"
    }
  }
}
```

## 错误处理

### 常见错误
```bash
# 认证失败
Error: Invalid app_id or app_secret

# 网络问题
Error: Request timeout

# 文件问题
Error: File not found or unreadable
```

### 调试模式
```bash
DEBUG=feishu* feishu-convert file.md
```

## 性能优化

### 大型文件处理
```bash
# 分块处理大文件
feishu-convert large-file.md --chunk-size 1000

# 并行处理多个文件
parallel feishu-convert ::: *.md
```

### 内存优化
```bash
# 流式处理（如果支持）
feishu-convert file.md --stream
```

## 更新与维护

### 检查更新
```bash
feishu-convert --version
feishu-convert --check-update
```

### 卸载
```bash
npm uninstall -g feishu-markdown-converter-tool
```

## 支持与反馈

- GitHub Issues: 报告问题
- Discord: 实时交流
- 文档: 查看完整文档

## 许可证

MIT License