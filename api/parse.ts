import { buildSystemPrompt } from './prompts.js';
import type { Lang } from '../src/utils/codegen.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const FREE_MODELS = ['meta-llama/llama-3.3-70b-instruct:free', 'stepfun/step-3.5-flash:free'];
const MODEL_LIMIT = 3;
const SUPPORTED_LANGS: Lang[] = ['python', 'c', 'cpp', 'java', 'csharp', 'javascript'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code, lang } = req.body as { code?: unknown; lang?: unknown };

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Поле code обязательно' });
  }
  if (code.length > 2000) {
    return res.status(400).json({ error: 'Код слишком длинный (макс. 2000 символов)' });
  }
  const resolvedLang: Lang =
    typeof lang === 'string' && SUPPORTED_LANGS.includes(lang as Lang) ? (lang as Lang) : 'c';

  console.log(lang, resolvedLang);

  const escapedCode = '```\n' + code + '\n```';
  const systemPrompt = buildSystemPrompt(resolvedLang);

  const models = [process.env.OPENROUTER_MODEL, ...FREE_MODELS]
    .filter(Boolean)
    .slice(0, MODEL_LIMIT);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : 'https://stepwise-ed.vercel.app',
        'X-OpenRouter-Title': 'Stepwise',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        models,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: escapedCode },
        ],
      }),
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const err = (await response.json()) as { error?: { message?: string } };
      return res.status(502).json({
        error: err.error?.message ?? `OpenRouter error ${response.status}`,
      });
    }

    const data = (await response.json()) as {
      choices: { message: { content: string } }[];
      model: string;
    };
    const text = data.choices[0].message.content;
    const clean = text
      .replace(/^```(?:json)?\n?/, '')
      .replace(/\n?```$/, '')
      .trim();

    try {
      const parsed = JSON.parse(clean) as unknown;
      if (parsed && typeof parsed === 'object' && 'error' in parsed) {
        return res.json({ ...parsed, model: data.model ?? 'unknown' });
      }
      if (!Array.isArray(parsed)) {
        return res
          .status(400)
          .json({ error: 'Модель вернула некорректный формат, попробуйте снова' });
      }

      return res.json({ items: parsed, model: data.model ?? 'unknown' });
    } catch {
      return res.status(400).json({ error: 'Не удалось распарсить ответ модели' });
    }
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof Error && err.name === 'AbortError') {
      return res.status(504).json({ error: 'Превышено время ожидания (10 сек)' });
    }
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
}
