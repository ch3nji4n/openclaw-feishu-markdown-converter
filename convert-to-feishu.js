#!/usr/bin/env node

const { FeishuMarkdown } = require('feishu-markdown');
const fs = require('fs');
const path = require('path');

// 尝试从多个来源获取认证信息
let appId, appSecret;

// 1. 尝试从环境变量获取
appId = process.env.FEISHU_APP_ID;
appSecret = process.env.FEISHU_APP_SECRET;

// 2. 如果环境变量没有，尝试从OpenClaw配置文件读取
if (!appId || !appSecret) {
  try {
    const configPath = path.join(process.env.HOME || '/root', '.openclaw/openclaw.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (config.channels?.feishu?.appId && config.channels?.feishu?.appSecret) {
        appId = config.channels.feishu.appId;
        appSecret = config.channels.feishu.appSecret;
        console.log('从OpenClaw配置文件读取认证信息');
      }
    }
  } catch (err) {
    console.warn('无法读取OpenClaw配置文件:', err.message);
  }
}

// 3. 如果还是没有，提示用户
if (!appId || !appSecret) {
  console.error('错误: 需要飞书应用认证信息');
  console.error('请设置环境变量:');
  console.error('  export FEISHU_APP_ID=your_app_id');
  console.error('  export FEISHU_APP_SECRET=your_app_secret');
  console.error('或者确保OpenClaw配置文件包含feishu配置');
  process.exit(1);
}

console.log(`使用App ID: ${appId}`);
console.log(`使用App Secret: ${appSecret.substring(0, 10)}...`);

// 解析命令行参数
const args = process.argv.slice(2);
let inputFile = 'gemini_civilization_output.txt';
let title = '广州文明扫描报告 - Gemini生成';

if (args.length > 0) {
  inputFile = args[0];
}
if (args.length > 1) {
  title = args[1];
}

// 检查文件是否存在
if (!fs.existsSync(inputFile)) {
  console.error(`错误: 文件不存在: ${inputFile}`);
  console.error('可用文件:');
  try {
    const files = fs.readdirSync('.');
    files.filter(f => f.endsWith('.txt') || f.endsWith('.md')).forEach(f => console.log(`  - ${f}`));
  } catch (err) {
    console.error('无法读取目录');
  }
  process.exit(1);
}

// 读取markdown内容
console.log(`读取文件: ${inputFile}`);
const markdown = fs.readFileSync(inputFile, 'utf-8');
console.log(`文件大小: ${markdown.length} 字符, ${markdown.split('\n').length} 行`);

// 创建FeishuMarkdown实例
console.log('初始化FeishuMarkdown...');
const feishu = new FeishuMarkdown({
  appId,
  appSecret,
  timeout: 60000, // 60秒超时
});

// 转换并上传
async function convert() {
  try {
    console.log('开始转换markdown到飞书文档...');
    console.log(`文档标题: "${title}"`);
    
    const result = await feishu.convert(markdown, {
      title,
      batchSize: 20, // 较小的批量大小，避免超时
      downloadImages: false, // 不下载外部图片
    });
    
    console.log('\n✅ 转换成功！');
    console.log(`文档ID: ${result.documentId}`);
    console.log(`文档URL: ${result.url}`);
    console.log(`版本ID: ${result.revisionId}`);
    
    // 保存结果到文件
    const resultFile = 'feishu-conversion-result.json';
    fs.writeFileSync(resultFile, JSON.stringify(result, null, 2));
    console.log(`结果已保存到: ${resultFile}`);
    
    return result;
  } catch (error) {
    console.error('\n❌ 转换失败:');
    console.error(error.message);
    
    if (error.response) {
      console.error('API响应:', JSON.stringify(error.response.data, null, 2));
    }
    
    process.exit(1);
  }
}

// 执行转换
convert();