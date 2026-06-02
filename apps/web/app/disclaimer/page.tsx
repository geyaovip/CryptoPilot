import { InfoPage } from "../components/info-page";
import { publicPageMetadata } from "../lib/seo";

export const metadata = publicPageMetadata({
  title: "CryptoPilot 免责声明 | 非投资建议",
  description: "CryptoPilot 内容仅供研究参考，不构成投资、交易、法律、税务或财务建议。",
  path: "/disclaimer"
});

export default function DisclaimerPage() {
  return (
    <InfoPage
      eyebrow="Disclaimer"
      title="免责声明"
      description="CryptoPilot 提供的信息用于市场研究和信息整理，不应被视为投资建议或交易指令。"
      sections={[
        {
          title: "非投资建议",
          body: "CryptoPilot 不提供买入、卖出、做多、做空、加杠杆或持仓建议。页面中的新闻、摘要、AI 解读和市场信号仅供研究参考。"
        },
        {
          title: "信息可能变化",
          body: "加密市场信息变化很快，公开来源可能存在延迟、错误或上下文缺失。用户应回到原始来源核验，并结合自己的研究判断。"
        },
        {
          title: "风险自担",
          body: "加密资产具有高波动性和高风险。任何基于 CryptoPilot 内容作出的决策，均由用户自行承担责任。"
        },
        {
          title: "AI 输出限制",
          body: "AI 生成内容可能存在遗漏、误判或表达不完整。CryptoPilot 会尽量保留来源和边界说明，但不能保证内容绝对准确、完整或适用于特定目的。"
        }
      ]}
    />
  );
}
