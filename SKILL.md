---
name: feishu-markdown-converter
description: |
  Feishu Markdown转换技能 - 解决飞书API表格写入限制问题
  Automatically convert markdown with tables to Feishu documents using feishu-markdown library
homepage: 
metadata:
  {
    "openclaw":
      {
        "emoji": "📊",
        "requires": { "bins": ["node"] },
        "install": ["pnpm add feishu-markdown"],
        "tags": ["feishu", "markdown", "tables", "converter", "document"],
      },
  }
---

# Feishu Markdown转换技能

## ⚠️ 问题背景

**飞书API有一个重要的限制：内置的`feishu_doc`工具不支持markdown表格！**

当尝试通过OpenClaw的`feishu_doc`工具写入包含表格的markdown内容时，表格会被跳过或转换为纯文本，导致格式丢失。

## 🎯 解决方案

使用第三方库 `feishu-markdown` 来完美解决这个问题。该库专门为markdown到飞书文档转换设计，完整支持表格、代码块、图表等格式。

## 📦 安装

```bash
# 在workspace目录安装依赖
cd /root/.openclaw/workspace
pnpm add feishu-markdown
```

## 🔧 核心工具

### 1. 基础转换脚本 (`convert-to-feishu.js`)
```javascript
// 简单直接的转换脚本
node convert-to-feishu.js <markdown文件> [文档标题]
```

### 2. 高级转换器 (`feishu-markdown-converter.js`)
```javascript
// 功能完整的转换器，推荐使用
node feishu-markdown-converter.js <文件> [标题]
node feishu-markdown-converter.js --batch 文件1 文件2 文件3
```

## 📋 使用示例

### 示例1：转换单个文件
```bash
# 转换gemini输出到飞书文档
node feishu-markdown-converter.js gemini_output.txt "AI生成报告"

# 转换markdown文件
node feishu-markdown-converter.js README.md "项目文档"
```

### 示例2：批量转换
```bash
# 批量转换多个文件
node feishu-markdown-converter.js --batch \
  report1.md \
  report2.md \
  summary.md
```

### 示例3：集成到工作流
```bash
# 1. 生成markdown内容
gemini -p "生成报告" > report.md

# 2. 转换到飞书
node feishu-markdown-converter.js report.md "Gemini生成报告"

# 3. 获取文档链接
cat feishu-conversion-result.json | grep url
```

## ⚙️ 配置说明

### 认证信息获取
工具会自动从以下位置获取飞书认证信息：
1. **环境变量**：`FEISHU_APP_ID` 和 `FEISHU_APP_SECRET`
2. **OpenClaw配置文件**：`~/.openclaw/openclaw.json` 中的 `channels.feishu` 配置

### 转换选项
```javascript
{
  batchSize: 30,      // 批量处理大小
  downloadImages: false, // 是否下载外部图片
  mermaid: { enabled: false } // Mermaid图表支持
}
```

## 🎨 支持的功能

### ✅ 完全支持
- **表格**：markdown表格 → 飞书表格
- **标题**：H1-H6标题
- **列表**：有序列表、无序列表
- **代码块**：语法高亮
- **引用**：块引用
- **文本格式**：粗体、斜体、删除线、行内代码
- **链接**：超链接
- **图片**：外部图片（自动上传）

### ⚠️ 注意事项
- 大型文档建议使用较小的`batchSize`（如20-30）
- 转换过程中会显示实时进度
- 结果自动保存到JSON文件和日志

## 🔍 问题诊断

### 常见问题
1. **认证失败**：检查App ID和Secret是否正确
2. **转换超时**：减少`batchSize`或增加`timeout`
3. **表格丢失**：确保使用本工具而非内置`feishu_doc`

### 调试模式
```bash
# 查看详细错误信息
DEBUG=feishu* node feishu-markdown-converter.js file.md
```

## 📊 性能优化

### 大型文档处理
```javascript
// 对于超过1000行的文档
const options = {
  batchSize: 20,      // 较小的批量大小
  timeout: 180000,    // 3分钟超时
};
```

### 批量处理优化
```bash
# 使用并行处理（如果支持）
for file in *.md; do
  node feishu-markdown-converter.js "$file" &
done
wait
```

## 🔗 相关资源

### 工具源码
- `feishu-markdown-converter.js` - 主转换工具
- `convert-to-feishu.js` - 简化版转换脚本

### 第三方库
- [feishu-markdown](https://github.com/huandu/feishu-markdown) - 核心转换库
- [飞书开放平台](https://open.feishu.cn/) - 官方API文档

### 示例文件
- `test-table.md` - 表格测试文件
- `gemini_civilization_output.txt` - 实际用例

## 🚨 重要提醒

**不要使用OpenClaw内置的`feishu_doc`工具处理包含表格的markdown内容！**

### 错误做法 ❌
```javascript
feishu_doc({
  action: "write",
  doc_token: "xxx",
  content: "| 表头 | 数据 |\n|------|------|\n| 内容 | 内容 |"  // 表格会被跳过！
});
```

### 正确做法 ✅
```bash
# 1. 保存为文件
echo "| 表头 | 数据 |\n|------|------|\n| 内容 | 内容 |" > table.md

# 2. 使用本工具转换
node feishu-markdown-converter.js table.md "包含表格的文档"
```

## 📝 版本历史

- **v1.0.0** (2026-02-28): 初始版本，解决飞书API表格限制问题
- 基于实际项目经验总结
- 包含完整的工作流程和示例

## 🤝 贡献指南

发现问题或改进建议：
1. 在ClawHub提交issue
2. 提交PR改进代码
3. 分享使用经验

## 🎉 成功案例

本技能已成功用于：
- Gemini生成的文明扫描报告转换
- 包含复杂表格的技术文档
- 批量markdown文件处理

**记住：遇到飞书表格问题，就用这个技能！**