import { InfoPage } from "../components/info-page";
import { publicPageMetadata } from "../lib/seo";

export const metadata = publicPageMetadata({
  title: "CryptoPilot 方法论 | 来源、AI 解读与风险边界",
  description: "了解 CryptoPilot 如何聚合公开来源、组织市场叙事、生成 AI 解读，并保持非投资建议的研究边界。",
  path: "/methodology"
});

export default function MethodologyPage() {
  return (
    <InfoPage
      eyebrow="Methodology"
      title="CryptoPilot 方法论"
      description="CryptoPilot 的目标不是预测价格，而是把公开市场信息整理成更容易核验和继续研究的情报视图。"
      path="/methodology"
      sections={[
        {
          title: "来源聚合",
          body: "CryptoPilot 从公开市场新闻、行业媒体与相关信息源中整理动态。页面中的来源链接用于帮助用户回到原文核验背景、时间和上下文。"
        },
        {
          title: "AI 解读",
          body: "AI 解读用于压缩信息、提炼叙事主题、标记相关资产和总结可能影响。它不会替代用户判断，也不应被理解为价格预测或交易信号。"
        },
        {
          title: "多来源优先",
          body: "当多个来源围绕同一事件或叙事出现时，CryptoPilot 会优先展示更容易交叉核验的内容。来源不足、证据不足或上下文不完整的信息，应谨慎理解。"
        },
        {
          title: "风险控制",
          body: "CryptoPilot 避免输出直接买入、卖出、做多、做空或加杠杆建议。用户应结合原始来源、个人研究和专业意见独立决策。"
        }
      ]}
    />
  );
}
