import type { CleanRssItem } from "./rss-cleaner";

type FeedQualityDecision = {
  shouldPublish: boolean;
  reason?: string;
};

const LOW_VALUE_TITLE_PATTERNS = [
  /(?:今日|昨日|隔夜|昨夜).{0,8}(?:要闻|快讯|消息|新闻|汇总|精选|行情|市场动态)/,
  /(?:要闻|快讯|消息|新闻|市场|行情).{0,8}(?:汇总|合集|一览|速览|精选|回顾|播报)/,
  /(?:早报|晚报|日报|周报|晨报|午报|夜报)/,
  /(?:盘前|盘中|盘后).{0,8}(?:必读|要闻|速览|播报)/,
  /(?:\d+\s*(?:月|\/|-)\s*\d+\s*(?:日)?).{0,8}(?:要闻|快讯|汇总|早报|晚报)/,
  /(?:top|daily|weekly).{0,12}(?:news|roundup|recap|briefing|digest)/i,
  /(?:market|crypto).{0,12}(?:roundup|recap|digest|briefing)/i,
  /(?:price predictions?|five things to know|crypto week ahead|state of crypto)/i
];

const LOW_VALUE_CONTENT_PATTERNS = [
  /以下(?:是|为).{0,12}(?:今日|昨日|本周).{0,12}(?:要闻|快讯|消息|新闻|汇总)/,
  /本文(?:汇总|整理|盘点).{0,20}(?:要闻|快讯|消息|新闻|动态)/,
  /(?:更多|完整).{0,8}(?:快讯|新闻|消息).{0,8}(?:请|见)/,
  /here(?:'s| is).{0,20}(?:today|this week).{0,20}(?:roundup|recap|digest)/i
];

const HIGH_VALUE_PATTERNS = [
  /(?:遭|被|发生|确认|宣布|推出|上线|通过|批准|拒绝|起诉|罚款|攻击|被盗|清算|破产|融资|收购|合并|暂停|恢复|解锁)/,
  /(?:ETF|SEC|美联储|香港证监会|法院|监管|主网|空投|漏洞|黑客|安全事件|融资|收购|并购)/i
];

function hasPattern(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

function looksLikeList(text: string): boolean {
  const bulletMatches = text.match(/(?:^|[\n\s；;])(?:\d+[.、)]|[-•·])\s*/g)?.length ?? 0;
  const separatorMatches = text.match(/[；;]\s*/g)?.length ?? 0;
  return bulletMatches >= 3 || separatorMatches >= 4;
}

export function evaluateFeedQuality(item: CleanRssItem): FeedQualityDecision {
  const title = item.title.trim();
  const content = item.content.replace(/\s+/g, " ").trim();
  const combined = `${title}\n${content}`;

  if (hasPattern(title, HIGH_VALUE_PATTERNS)) {
    return { shouldPublish: true };
  }

  if (hasPattern(title, LOW_VALUE_TITLE_PATTERNS)) {
    return { shouldPublish: false, reason: "low_value_roundup_title" };
  }

  if (hasPattern(content, LOW_VALUE_CONTENT_PATTERNS)) {
    return { shouldPublish: false, reason: "low_value_roundup_content" };
  }

  if (looksLikeList(combined) && hasPattern(combined, [/要闻|快讯|汇总|roundup|digest|recap/i])) {
    return { shouldPublish: false, reason: "low_value_list_digest" };
  }

  return { shouldPublish: true };
}
