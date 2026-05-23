# AI Provider Integration

The framework supports optional AI-powered narrative enhancement via a vendor-agnostic provider abstraction. Presentations work fully without any AI provider configured (deterministic mode), and gain richer content when one is available.

## Supported Providers

| Provider | Env Variable | Default Model |
|----------|-------------|---------------|
| GitHub Copilot / OpenAI | `OPENAI_API_KEY` | gpt-4o |
| Claude (Anthropic) | `ANTHROPIC_API_KEY` | claude-sonnet-4-20250514 |
| Gemini (Google) | `GOOGLE_AI_KEY` | gemini-2.0-flash |

## Quick Start

Set one environment variable to enable AI enhancement:

```bash
export EASYDECK_AI_PROVIDER=claude
export ANTHROPIC_API_KEY=sk-ant-...
```

Then use the enhanced pipeline:

```typescript
import { createEnhancedPresentation } from '@/lib/pipeline';
import { loadConfigFromEnv } from '@/lib/ai';

const config = loadConfigFromEnv();
const result = await createEnhancedPresentation(brief, config);
// result.aiEnhancements lists what was enriched
```

## Configuration

### Environment Variables

| Variable | Purpose | Values |
|----------|---------|--------|
| `EASYDECK_AI_PROVIDER` | Select provider | `copilot`, `claude`, `gemini` |
| `EASYDECK_AI_MODEL` | Override default model | Any model ID |
| `EASYDECK_AI_BASE_URL` | Custom API endpoint | URL |
| `EASYDECK_AI_ENABLED` | Kill switch | `true` (default), `false` |
| `EASYDECK_AI_ENRICH` | Enrich descriptions | `true` (default), `false` |
| `EASYDECK_AI_TIMING` | Suggest timing | `true`, `false` (default) |
| `EASYDECK_AI_RATIONALE` | Generate rationale | `true` (default), `false` |

### Programmatic Configuration

```typescript
import { createEnhancedPresentation } from '@/lib/pipeline';
import type { AIConfig } from '@/lib/ai';

const aiConfig: AIConfig = {
  provider: { provider: 'gemini', apiKey: process.env.GOOGLE_AI_KEY },
  enabled: true,
  enhancement: {
    enrichDescriptions: true,
    suggestTiming: false,
    generateRationale: true,
  },
};

const result = await createEnhancedPresentation(brief, aiConfig);
```

## Architecture

```text
ContentBrief → designNarrative() → [AIEnhancer] → composeStory() → StorySchema
                                        ↑
                              LLMProvider (optional)
                              ├── CopilotProvider
                              ├── ClaudeProvider
                              └── GeminiProvider
```

The `AIEnhancer` is an optional stage between narrative design and scene composition. It:
- Enriches scene overlay text (more engaging copy)
- Generates transition rationale (explains mode choices)
- Suggests timing adjustments (advisory, within 20% bounds)

## Provider Interface

All providers implement the same interface:

```typescript
interface LLMProvider {
  readonly name: string;
  generate(options: GenerateOptions): Promise<GenerateResult>;
  healthCheck(): Promise<HealthCheckResult>;
}
```

This means you can swap providers without changing any pipeline code.

## Fallback Strategy

Configure a fallback provider for resilience:

```typescript
import { createProviderWithFallback, registry } from '@/lib/ai';

const primary = registry.getProvider({ provider: 'claude' });
const fallback = registry.getProvider({ provider: 'copilot' });
const provider = createProviderWithFallback(primary, fallback);
```

If the primary provider fails, requests automatically route to the fallback.

## Graceful Degradation

The framework never fails due to AI unavailability:
- No provider configured → deterministic pipeline (same as always)
- Provider errors → falls back to deterministic output
- Invalid config → silently ignored, deterministic mode
- `createPresentation()` (sync) always works without AI

## Custom Providers

Register custom providers for local models or specialized endpoints:

```typescript
import { registry } from '@/lib/ai';

registry.register('local', (config) => new MyLocalProvider(config));
const provider = registry.getProvider({ provider: 'local' as any, apiKey: '...' });
```

## Related Docs

- [Architecture Overview](../architecture/README.md)
- [Agent Pipeline](../architecture/agent-pipeline.md)
- [Pipeline Schemas](../schemas/README.md)
