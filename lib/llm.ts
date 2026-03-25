type LlmProvider = 'anthropic' | 'openrouter'

type GenerateTextInput = {
  prompt: string
  maxTokens?: number
  temperature?: number
}

function getProvider(): LlmProvider {
  const provider = process.env.LLM_PROVIDER?.toLowerCase()

  if (provider === 'anthropic' || provider === 'openrouter') {
    return provider
  }

  if (process.env.OPENROUTER_API_KEY) {
    return 'openrouter'
  }

  return 'anthropic'
}

function getAnthropicConfig() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  const model = process.env.ANTHROPIC_MODEL ?? process.env.LLM_MODEL ?? 'claude-sonnet-4-20250514'

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set')
  }

  return {
    apiKey,
    model,
    baseUrl: 'https://api.anthropic.com/v1/messages',
  }
}

function getOpenRouterConfig() {
  const apiKey = process.env.OPENROUTER_API_KEY ?? process.env.LLM_API_KEY
  const model = process.env.OPENROUTER_MODEL ?? process.env.LLM_MODEL

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set')
  }

  if (!model) {
    throw new Error('OPENROUTER_MODEL or LLM_MODEL is not set')
  }

  return {
    apiKey,
    model,
    baseUrl: process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1/chat/completions',
    siteUrl: process.env.OPENROUTER_SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL,
    appName: process.env.OPENROUTER_APP_NAME ?? 'ds-web',
  }
}

async function generateWithAnthropic({
  prompt,
  maxTokens = 4000,
  temperature,
}: GenerateTextInput): Promise<string> {
  const config = getAnthropicConfig()

  const response = await fetch(config.baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: maxTokens,
      ...(temperature !== undefined ? { temperature } : {}),
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`Anthropic API error: ${response.status}${errorText ? ` - ${errorText}` : ''}`)
  }

  const data = (await response.json()) as {
    content?: Array<{ type?: string; text?: string }>
  }

  const text = data.content
    ?.filter(part => part.type === 'text' && typeof part.text === 'string')
    .map(part => part.text)
    .join('\n')
    .trim()

  if (!text) {
    throw new Error('Anthropic response did not contain any text output')
  }

  return text
}

async function generateWithOpenRouter({
  prompt,
  maxTokens = 4000,
  temperature,
}: GenerateTextInput): Promise<string> {
  const config = getOpenRouterConfig()

  const response = await fetch(config.baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
      ...(config.siteUrl ? { 'HTTP-Referer': config.siteUrl } : {}),
      ...(config.appName ? { 'X-Title': config.appName } : {}),
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: maxTokens,
      ...(temperature !== undefined ? { temperature } : {}),
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`OpenRouter API error: ${response.status}${errorText ? ` - ${errorText}` : ''}`)
  }

  const data = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string | Array<{ type?: string; text?: string }>
      }
    }>
  }

  const content = data.choices?.[0]?.message?.content

  if (typeof content === 'string' && content.trim()) {
    return content.trim()
  }

  if (Array.isArray(content)) {
    const text = content
      .filter(part => part.type === 'text' && typeof part.text === 'string')
      .map(part => part.text)
      .join('\n')
      .trim()

    if (text) {
      return text
    }
  }

  throw new Error('OpenRouter response did not contain any text output')
}

export async function generateLlmText(input: GenerateTextInput): Promise<string> {
  const provider = getProvider()

  if (provider === 'openrouter') {
    return generateWithOpenRouter(input)
  }

  return generateWithAnthropic(input)
}

export function stripMarkdownCodeFences(text: string): string {
  return text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
}

export function getLlmDebugConfig() {
  const provider = getProvider()

  if (provider === 'openrouter') {
    const { model, baseUrl } = getOpenRouterConfig()
    return { provider, model, baseUrl }
  }

  const { model, baseUrl } = getAnthropicConfig()
  return { provider, model, baseUrl }
}
