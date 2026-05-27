import { CryptoPilotHomePage } from "./home/home-page";
import { defaultDescription, publicPageMetadata } from "./lib/seo";

export const metadata = publicPageMetadata({
  title: "CryptoPilot | AI 加密市场情报终端",
  description: defaultDescription,
  path: "/"
});

export const dynamic = "force-dynamic";

export default CryptoPilotHomePage;
