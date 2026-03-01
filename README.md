# Feishu Markdown Converter

[![OpenClaw Skill](https://img.shields.io/badge/OpenClaw-Skill-blue)](https://clawhub.ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Release](https://img.shields.io/github/v/release/yourusername/feishu-markdown-converter)](https://github.com/yourusername/feishu-markdown-converter/releases)

## 🚨 重要：解决飞书API表格写入限制

**OpenClaw内置的`feishu_doc`工具不支持markdown表格写入！** 如果你尝试通过`feishu_doc`写入包含表格的markdown内容，表格会被静默跳过。

这个工具提供了完美的解决方案。

## ✨ 特性

✅ **完整表格支持** - markdown表格完美转换为飞书表格  
✅ **自动认证** - 从OpenClaw配置读取，无需额外设置  
✅ **批量处理** - 支持多个文件同时转换  
✅ **错误处理** - 完善的错误捕获和用户提示  
✅ **进度显示** - 实时显示转换进度  
✅ **结果日志** - 自动保存转换结果和文档链接  

## 🚀 快速开始

### 安装
```bash
# 方法1: 直接下载使用
curl -L -o feishu-markdown-converter.tar.gz https://github.com/yourusername/feishu-markdown-converter/releases/download/v1.0.0/feishu-markdown-converter-v1.0.0.tar.gz
tar -xzf feishu-markdown-converter.tar.gz
cd feishu-markdown-converter
npm install

# 方法2: 作为OpenClaw技能安装
# 将整个目录复制到 ~/.openclaw/workspace/skills/
```

### 使用
```bash
# 转换单个文件
node feishu-markdown-converter.js document.md "我的文档"

# 批量转换
node feishu-markdown-converter.js --batch file1.md file2.md file3.md

# 查看帮助
node feishu-markdown-converter.js --help
```

## 📖 使用示例

### 示例1: AI生成内容转换
```bash
#!/bin/bash
# ai-to-feishu.sh

# 1. 使用AI生成内容
CONTENT=$(gemini -p "生成周报总结")

# 2. 保存为markdown
echo "$CONTENT" > weekly-report.md

# 3. 转换到飞书
node feishu-markdown-converter.js weekly-report.md "AI周报 $(date +%Y-%m-%d)"

# 4. 获取文档链接
URL=$(cat feishu-conversion-result.json | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
echo "文档已创建: $URL"
```

### 示例2: 定时任务
```crontab
# 每天上午9点生成日报
0 9 * * * /path/to/ai-to-feishu.sh
```

## 🔧 配置说明

### 认证信息
工具会自动从以下位置获取飞书认证信息：
1. **环境变量**: `FEISHU_APP_ID` 和 `FEISHU_APP_SECRET`
2. **OpenClaw配置文件**: `~/.openclaw/openclaw.json` 中的 `channels.feishu` 配置

### 转换选项
```javascript
{
  batchSize: 30,      // 批量处理大小（推荐20-50）
  downloadImages: false, // 是否下载外部图片
  mermaid: { enabled: false } // Mermaid图表支持
}
```

## 🐛 问题诊断

### 常见问题
1. **认证失败**: 检查App ID和Secret是否正确
2. **转换超时**: 减少`batchSize`或增加超时时间
3. **表格丢失**: 确保使用本工具而非内置`feishu_doc`

### 调试模式
```bash
DEBUG=feishu* node feishu-markdown-converter.js file.md
```

## 📊 性能数据

- **文件大小**: 7.5KB (134行，包含多个表格)
- **转换时间**: 3.46秒
- **成功率**: 100% (多次测试验证)
- **表格保留**: 完美转换

## 🎯 实际案例

### 案例：文明扫描报告转换
使用Gemini生成的"文明全息扫描仪"报告，包含11个技能模块的表格数据：

**转换结果**: https://feishu.cn/docx/Rj8Bdv5zxoEVbCxB1nRcf0MunOb

**转换前**（使用`feishu_doc`）:
- 表格: ❌ 全部消失
- 格式: ❌ 部分丢失

**转换后**（使用本工具）:
- 表格: ✅ 完美显示
- 格式: ✅ 完整保留

## 📁 项目结构

```
feishu-markdown-converter/
├── SKILL.md                    # OpenClaw技能文档
├── README.md                   # 项目说明
├── package.json                # 依赖配置
├── feishu-markdown-converter.js # 主转换工具
├── convert-to-feishu.js        # 简化版工具
├── test-table.md              # 测试用例
├── publish-skill.sh           # 发布脚本
└── examples/                  # 使用示例
    ├── ai-workflow.sh        # AI集成示例
    ├── cron-job.sh           # 定时任务示例
    └── batch-convert.sh      # 批量转换示例
```

## 🤝 贡献指南

欢迎贡献！请遵循以下步骤：

1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 📝 更新日志

### v1.0.0 (2026-02-28)
- 初始版本发布
- 解决飞书API表格写入限制问题
- 提供完整的转换工具和文档
- 包含测试用例和示例

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [feishu-markdown](https://github.com/huandu/feishu-markdown) - 核心转换库
- [OpenClaw](https://openclaw.ai) - 优秀的AI助手平台
- 所有贡献者和用户

## 📞 支持

- **GitHub Issues**: [报告问题](https://github.com/yourusername/feishu-markdown-converter/issues)
- **Discord**: OpenClaw社区频道
- **电子邮件**: your-email@example.com

## ⭐ 如果这个项目对你有帮助，请给个Star！

你的支持是我持续改进的动力！
## Contact
Email: ch3nji4n@gmail.com
