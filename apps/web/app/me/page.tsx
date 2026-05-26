import { WebShell } from "../_components/web-shell";
import { noIndexMetadata } from "../lib/seo";
import { MePanel } from "./me-panel";

export const metadata = noIndexMetadata;

export default function MePage() {
  return (
    <WebShell>
      <MePanel />
    </WebShell>
  );
}
