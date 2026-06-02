import { InfoPage } from "../components/info-page";
import { defaultDescription, publicPageMetadata } from "../lib/seo";

export const metadata = publicPageMetadata({
  title: "关于 CryptoPilot | AI 加密市场情报终端",
  description: defaultDescription,
  path: "/about"
});

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="About"
      title="关于 CryptoPilot"
      description="CryptoPilot 是面向研究者和加密市场观察者的 AI 加密市场情报终端，用于聚合多来源市场动态、叙事变化、资产信号与 AI 解读。"
      sections={[
        {
          title: "CryptoPilot 是什么",
          body: "CryptoPilot 帮助用户从公开来源中快速理解 Web3 市场变化：哪些叙事正在升温、哪些资产被反复提及、哪些事件值得继续核验。它不是交易机器人，也不提供自动交易、收益承诺或买卖建议。"
        },
        {
          title: "适合谁使用",
          body: "CryptoPilot 适合需要持续跟踪加密新闻、市场叙事和资产信号的研究者、运营人员、内容创作者与个人观察者。产品重点是节省筛选信息的时间，并保留来源供用户自行判断。"
        },
        {
          title: "核心原则",
          body: "CryptoPilot 优先展示可追溯来源、清晰摘要和风险边界。所有 AI 解读都应被视为研究辅助，而不是事实终局或投资决策依据。"
        }
      ]}
    />
  );
}
