import { JsonLd } from "../components/json-ld";
import { InfoPage } from "../components/info-page";
import { faqPageJsonLd, publicPageMetadata } from "../lib/seo";

export const metadata = publicPageMetadata({
  title: "CryptoPilot FAQ | 常见问题",
  description: "阅读 CryptoPilot 常见问题，了解产品定位、数据来源、AI 解读、市场雷达与非投资建议边界。",
  path: "/faq"
});

const faqItems = [
  {
    title: "CryptoPilot 是交易机器人吗？",
    body: "不是。CryptoPilot 是 AI 加密市场情报终端，用于研究公开市场信息、新闻、叙事和资产信号，不执行交易，也不提供自动交易策略。"
  },
  {
    title: "CryptoPilot 的内容来自哪里？",
    body: "CryptoPilot 使用公开来源和已收录信息源整理市场动态。具体内容页会尽量保留来源链接，方便用户继续核验。"
  },
  {
    title: "AI 市场雷达有什么用？",
    body: "AI 市场雷达用于帮助用户快速发现值得关注的变化，例如叙事升温、突发动态、相关资产和多来源重复出现的市场信号。"
  },
  {
    title: "CryptoPilot 会给投资建议吗？",
    body: "不会。CryptoPilot 的信息仅供研究参考，不构成投资、法律、税务或财务建议。加密资产波动较大，用户应自行判断风险。"
  }
];

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqPageJsonLd(faqItems.map((item) => ({ question: item.title, answer: item.body })))} />
      <InfoPage
        eyebrow="FAQ"
        title="CryptoPilot 常见问题"
        description="这里整理 CryptoPilot 的常见问题，帮助用户和搜索引擎快速理解产品用途与边界。"
        sections={faqItems}
      />
    </>
  );
}
