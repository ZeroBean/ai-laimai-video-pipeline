// 本期公共配置（Node 侧）：外部程序路径从环境变量读
export const FF = process.env.FFMPEG || 'ffmpeg';
export const CHROME = process.env.CHROME || '/usr/bin/google-chrome';
