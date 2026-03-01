#!/bin/bash

# Feishu Markdown Converter技能发布脚本
# 作者: OpenClaw社区
# 时间: 2026年2月28日

set -e

echo "🚀 开始发布 Feishu Markdown Converter 技能"
echo "=========================================="

# 检查必要工具
check_tool() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ 需要安装 $1"
        exit 1
    fi
    echo "✅ $1 已安装"
}

echo "🔧 检查工具..."
check_tool "git"
check_tool "npm"
check_tool "jq"

# 技能信息
SKILL_NAME="feishu-markdown-converter"
SKILL_VERSION="1.0.0"
SKILL_DIR="/root/.openclaw/workspace/skills/feishu-markdown-converter"
TEMP_DIR="/tmp/feishu-skill-publish"

echo "📦 技能信息:"
echo "  名称: $SKILL_NAME"
echo "  版本: $SKILL_VERSION"
echo "  目录: $SKILL_DIR"

# 清理临时目录
echo "🧹 准备临时目录..."
rm -rf $TEMP_DIR
mkdir -p $TEMP_DIR

# 复制技能文件
echo "📁 复制技能文件..."
cp -r $SKILL_DIR/* $TEMP_DIR/

# 创建发布包
echo "📦 创建发布包..."
cd $TEMP_DIR
tar -czf ../$SKILL_NAME-v$SKILL_VERSION.tar.gz .

# 生成校验和
echo "🔐 生成校验和..."
cd /tmp
md5sum $SKILL_NAME-v$SKILL_VERSION.tar.gz > $SKILL_NAME-v$SKILL_VERSION.md5
sha256sum $SKILL_NAME-v$SKILL_VERSION.tar.gz > $SKILL_NAME-v$SKILL_VERSION.sha256

echo "📊 发布包信息:"
ls -lh /tmp/$SKILL_NAME-v$SKILL_VERSION.*
echo ""
cat /tmp/$SKILL_NAME-v$SKILL_VERSION.md5
cat /tmp/$SKILL_NAME-v$SKILL_VERSION.sha256

# 创建安装脚本
echo "📝 创建安装脚本..."
cat > /tmp/install-$SKILL_NAME.sh << 'EOF'
#!/bin/bash

# Feishu Markdown Converter技能安装脚本
# 使用方法: bash install-feishu-markdown-converter.sh

set -e

SKILL_NAME="feishu-markdown-converter"
SKILL_VERSION="1.0.0"
INSTALL_DIR="$HOME/.openclaw/workspace/skills/$SKILL_NAME"

echo "🔧 安装 $SKILL_NAME v$SKILL_VERSION"
echo "=================================="

# 检查OpenClaw workspace
if [ ! -d "$HOME/.openclaw/workspace" ]; then
    echo "❌ 未找到OpenClaw workspace目录"
    echo "请先安装和配置OpenClaw"
    exit 1
fi

# 创建技能目录
echo "📁 创建技能目录..."
mkdir -p $INSTALL_DIR

# 下载技能包（这里需要实际URL）
echo "📥 下载技能包..."
# 实际发布时需要替换为真实URL
# curl -L -o /tmp/$SKILL_NAME.tar.gz https://github.com/your-repo/$SKILL_NAME/releases/download/v$SKILL_VERSION/$SKILL_NAME-v$SKILL_VERSION.tar.gz

echo "📦 解压技能包..."
# tar -xzf /tmp/$SKILL_NAME.tar.gz -C $INSTALL_DIR

echo "📋 复制本地文件..."
# 临时方案：从当前目录复制
if [ -f "SKILL.md" ]; then
    cp -r ./* $INSTALL_DIR/
else
    echo "❌ 未找到技能文件"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
cd $INSTALL_DIR
if [ -f "package.json" ]; then
    npm install --production
else
    echo "⚠️ 未找到package.json，跳过依赖安装"
fi

# 设置执行权限
echo "🔧 设置执行权限..."
chmod +x $INSTALL_DIR/*.js 2>/dev/null || true

# 验证安装
echo "✅ 安装完成！"
echo ""
echo "📋 技能位置: $INSTALL_DIR"
echo "📚 文档文件: $INSTALL_DIR/SKILL.md"
echo "🛠️  工具文件: $INSTALL_DIR/feishu-markdown-converter.js"
echo ""
echo "🚀 使用方法:"
echo "  cd $INSTALL_DIR"
echo "  node feishu-markdown-converter.js --help"
echo ""
echo "💡 快速测试:"
echo "  node feishu-markdown-converter.js test-table.md \"测试文档\""
EOF

chmod +x /tmp/install-$SKILL_NAME.sh

# 创建使用示例
echo "📋 创建使用示例..."
cat > /tmp/example-usage.sh << 'EOF'
#!/bin/bash

# Feishu Markdown Converter使用示例
# 展示常见使用场景

set -e

echo "🎯 Feishu Markdown Converter 使用示例"
echo "===================================="

# 示例1: 基本使用
echo ""
echo "1. 📄 基本转换"
echo "   node feishu-markdown-converter.js document.md \"我的文档\""

# 示例2: 批量转换
echo ""
echo "2. 📦 批量转换"
echo "   node feishu-markdown-converter.js --batch \\"
echo "     report1.md \\"
echo "     report2.md \\"
echo "     report3.md"

# 示例3: AI集成
echo ""
echo "3. 🤖 AI集成工作流"
cat > /tmp/ai-workflow.sh << 'AIEOF'
#!/bin/bash
# ai-to-feishu.sh - AI生成内容并转换到飞书

# 1. 使用AI生成内容
echo "使用AI生成报告内容..."
CONTENT=$(gemini -p "生成周报总结" 2>/dev/null || echo "# 周报\n\n## 本周工作\n- 项目A进展\n- 项目B完成\n\n## 下周计划\n- 继续项目A\n- 开始项目C")

# 2. 保存为markdown
echo "保存为markdown文件..."
echo "$CONTENT" > weekly-report-$(date +%Y%m%d).md

# 3. 转换到飞书
echo "转换到飞书文档..."
node feishu-markdown-converter.js weekly-report-$(date +%Y%m%d).md "AI周报 $(date +%Y-%m-%d)"

# 4. 显示结果
if [ -f "feishu-conversion-result.json" ]; then
    URL=$(cat feishu-conversion-result.json | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
    echo "✅ 文档已创建: $URL"
else
    echo "❌ 转换失败"
fi
AIEOF
echo "   参见: /tmp/ai-workflow.sh"

# 示例4: 定时任务
echo ""
echo "4. ⏰ 定时任务示例"
echo "   # crontab -e"
echo "   0 9 * * 1 /path/to/ai-workflow.sh  # 每周一9点运行"

# 示例5: 错误处理
echo ""
echo "5. 🐛 调试模式"
echo "   DEBUG=feishu* node feishu-markdown-converter.js file.md"
echo "   node feishu-markdown-converter.js file.md --verbose"

echo ""
echo "📚 更多信息请查看 SKILL.md 文档"
EOF

chmod +x /tmp/example-usage.sh

echo ""
echo "🎉 发布准备完成！"
echo "================="
echo ""
echo "📦 发布包:"
echo "  /tmp/$SKILL_NAME-v$SKILL_VERSION.tar.gz"
echo "  /tmp/$SKILL_NAME-v$SKILL_VERSION.md5"
echo "  /tmp/$SKILL_NAME-v$SKILL_VERSION.sha256"
echo ""
echo "📝 安装脚本:"
echo "  /tmp/install-$SKILL_NAME.sh"
echo ""
echo "📋 使用示例:"
echo "  /tmp/example-usage.sh"
echo ""
echo "🚀 下一步:"
echo "  1. 上传发布包到GitHub Releases"
echo "  2. 在ClawHub发布技能"
echo "  3. 在社区分享公告"
echo "  4. 更新文档和示例"
echo ""
echo "💡 提示: 运行示例脚本查看使用方式"
echo "  bash /tmp/example-usage.sh"