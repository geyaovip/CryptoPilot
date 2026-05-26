import { CryptoPilotHomePage } from "./home-page";
import { defaultDescription, publicPageMetadata } from "../lib/seo";

export const metadata = publicPageMetadata({
  title: "CryptoPilot | AI 加密市场雷达",
  description: defaultDescription,
  path: "/"
});

export const dynamic = "force-dynamic";

export default CryptoPilotHomePage;
