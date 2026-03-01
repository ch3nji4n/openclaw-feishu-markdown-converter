#!/usr/bin/env node

const { FeishuMarkdown } = require('feishu-markdown');
const fs = require('fs');
const path = require('path');

class FeishuMarkdownConverter {
  constructor() {
    this.appId = null;
    this.appSecret = null;
    this.feishu = null;
    this.loadConfig();
  }

  loadConfig() {
    // 1. 尝试从环境变量获取
    this.appId = process.env.FEISHU_APP_ID;
    this.appSecret = process.env.FEISHU_APP_SECRET;

    // 2. 如果环境变量没有，尝试从OpenClaw配置文件读取
    if (!this.appId || !this.appSecret) {
      try {
        const configPath = path.join(process.env.HOME || '/root', '.openclaw/openclaw.json');
        if (fs.existsSync(configPath)) {
          const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
          if (config.channels?.feishu?.appId && config.channels?.feishu?.appSecret) {
            this.appId = config.channels.feishu.appId;
            this.appSecret = config.channels.feishu.appSecret;
            console.log('✅ 从OpenClaw配置文件读取认证信息');
          }
        }
      } catch (err) {
        console.warn('⚠️ 无法读取OpenClaw配置文件:', err.message);
      }
    }

    // 3. 检查是否成功获取认证信息
    if (!this.appId || !this.appSecret) {
      throw new Error(
        '无法获取飞书应用认证信息。请设置环境变量:\n' +
        '  export FEISHU_APP_ID=your_app_id\n' +
        '  export FEISHU_APP_SECRET=your_app_secret'
      );
    }

    console.log(`🔑 使用App ID: ${this.appId}`);
    console.log(`🔑 使用App Secret: ${this.appSecret.substring(0, 10)}...`);

    // 初始化FeishuMarkdown实例
    this.feishu = new FeishuMarkdown({
      appId: this.appId,
      appSecret: this.appSecret,
      timeout: 120000, // 120秒超时，用于大型文档
    });
  }

  async convertFile(inputFile, title = null, options = {}) {
    console.log(`\n📄 开始处理文件: ${inputFile}`);

    // 检查文件是否存在
    if (!fs.existsSync(inputFile)) {
      throw new Error(`文件不存在: ${inputFile}`);
    }

    // 读取文件内容
    const markdown = fs.readFileSync(inputFile, 'utf-8');
    const fileStats = {
      size: markdown.length,
      lines: markdown.split('\n').length,
      hasTables: markdown.includes('|') && markdown.includes('---'),
    };

    console.log(`📊 文件统计:`);
    console.log(`  大小: ${fileStats.size} 字符`);
    console.log(`  行数: ${fileStats.lines} 行`);
    console.log(`  包含表格: ${fileStats.hasTables ? '✅ 是' : '❌ 否'}`);

    // 如果没有提供标题，使用文件名
    const docTitle = title || path.basename(inputFile, path.extname(inputFile));
    console.log(`📝 文档标题: "${docTitle}"`);

    // 默认选项
    const defaultOptions = {
      title: docTitle,
      batchSize: 30, // 批量大小
      downloadImages: false, // 不下载外部图片
      mermaid: { enabled: false }, // 禁用Mermaid图表
    };

    const finalOptions = { ...defaultOptions, ...options };

    console.log('🔄 开始转换markdown到飞书文档...');
    console.log(`⚙️ 选项: 批量大小=${finalOptions.batchSize}`);

    try {
      const startTime = Date.now();
      const result = await this.feishu.convert(markdown, finalOptions);
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      console.log(`\n🎉 转换成功！耗时: ${duration}秒`);
      console.log(`📋 文档ID: ${result.documentId}`);
      console.log(`🔗 文档URL: ${result.url}`);
      console.log(`🔄 版本ID: ${result.revisionId}`);

      // 保存结果
      this.saveResult(result, inputFile);

      return result;
    } catch (error) {
      console.error('\n❌ 转换失败:');
      console.error(`错误类型: ${error.name}`);
      console.error(`错误信息: ${error.message}`);

      if (error.response) {
        console.error('API响应状态:', error.response.status);
        console.error('API响应数据:', JSON.stringify(error.response.data, null, 2));
      }

      throw error;
    }
  }

  saveResult(result, inputFile) {
    const resultFile = `feishu-conversion-${Date.now()}.json`;
    const resultData = {
      ...result,
      inputFile: path.basename(inputFile),
      convertedAt: new Date().toISOString(),
      converter: 'feishu-markdown-converter',
    };

    fs.writeFileSync(resultFile, JSON.stringify(resultData, null, 2));
    console.log(`💾 转换结果已保存到: ${resultFile}`);

    // 同时保存一个简单的日志文件
    const logFile = 'feishu-conversion-log.txt';
    const logEntry = `[${new Date().toISOString()}] ${inputFile} -> ${result.url}\n`;
    fs.appendFileSync(logFile, logEntry);
    console.log(`📝 日志已追加到: ${logFile}`);
  }

  async batchConvert(files, options = {}) {
    console.log(`\n🔄 开始批量转换 ${files.length} 个文件`);
    
    const results = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`\n📦 处理文件 ${i + 1}/${files.length}: ${file}`);
      
      try {
        const title = options.titles?.[i] || null;
        const result = await this.convertFile(file, title, options);
        results.push(result);
      } catch (error) {
        console.error(`❌ 文件 ${file} 转换失败:`, error.message);
        results.push({ file, error: error.message, success: false });
      }
    }

    console.log(`\n📊 批量转换完成:`);
    console.log(`✅ 成功: ${results.filter(r => r.success !== false).length}`);
    console.log(`❌ 失败: ${results.filter(r => r.success === false).length}`);

    return results;
  }
}

// 命令行接口
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Feishu Markdown 转换工具
========================

用法:
  node feishu-markdown-converter.js <文件> [标题]
  node feishu-markdown-converter.js --batch <文件1> <文件2> ...

选项:
  --help, -h     显示帮助信息
  --batch        批量转换模式
  --title "标题" 指定文档标题

示例:
  # 转换单个文件
  node feishu-markdown-converter.js gemini_output.txt "广州报告"
  
  # 批量转换
  node feishu-markdown-converter.js --batch file1.md file2.md file3.md
  
  # 使用默认标题（文件名）
  node feishu-markdown-converter.js document.md
    `);
    return;
  }

  const converter = new FeishuMarkdownConverter();

  if (args[0] === '--batch') {
    // 批量转换模式
    const files = args.slice(1);
    if (files.length === 0) {
      console.error('错误: 批量模式需要指定文件列表');
      process.exit(1);
    }
    await converter.batchConvert(files);
  } else {
    // 单个文件转换模式
    const inputFile = args[0];
    const title = args[1] || null;
    await converter.convertFile(inputFile, title);
  }
}

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 程序执行失败:', error.message);
    process.exit(1);
  });
}

module.exports = FeishuMarkdownConverter;