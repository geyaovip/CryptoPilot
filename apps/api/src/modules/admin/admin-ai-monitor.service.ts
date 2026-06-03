import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AdminAiMonitorService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getStats() {
    const start = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const logs = await this.prisma.llmCallLog.findMany({
      where: { createdAt: { gte: start } },
      orderBy: { createdAt: "desc" }
    });

    const callsToday = logs.length;
    const tokensToday = logs.reduce((sum, log) => sum + log.inputTokens + log.outputTokens, 0);
    const costUsdToday = logs.reduce((sum, log) => sum + Number(log.costUsd), 0);
    const failed = logs.filter((log) => log.status === "FAILED").length;
    const providerErrorRate = callsToday === 0 ? 0 : failed / callsToday;
    const avgLatencyMs =
      callsToday === 0 ? 0 : Math.round(logs.reduce((sum, log) => sum + log.latencyMs, 0) / callsToday);

    const distribution = new Map<string, number>();
    for (const log of logs) {
      distribution.set(log.promptKey, (distribution.get(log.promptKey) ?? 0) + 1);
    }

    const recentErrors = await this.prisma.llmCallLog.findMany({
      where: { status: "FAILED" },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    return {
      calls_today: callsToday,
      tokens_today: tokensToday,
      cost_usd_today: Number(costUsdToday.toFixed(4)),
      prompt_distribution: [...distribution.entries()].map(([prompt_key, count]) => ({ prompt_key, count })),
      provider_error_rate: Number(providerErrorRate.toFixed(4)),
      avg_latency_ms: avgLatencyMs,
      recent_errors: recentErrors.map((log) => ({
        id: log.id,
        prompt_key: log.promptKey,
        provider: log.provider,
        model: log.model,
        error_message: log.errorMessage,
        created_at: log.createdAt.toISOString()
      }))
    };
  }
}
