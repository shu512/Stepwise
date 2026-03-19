import { buildSystemPrompt } from './prompts.js';
import type { Lang } from '../src/utils/codegen.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const FREE_MODELS = ['meta-llama/llama-3.3-70b-instruct:free', 'stepfun/step-3.5-flash:free'];
const MODEL_LIMIT = 3;
const SUPPORTED_LANGS: Lang[] = ['python', 'c', 'cpp', 'java', 'csharp', 'javascript'];

type GodBoltLine = {
  text: string;
  tag?: { line: number; column: number; text: string; severity: number };
};

const ROBOT_STUBS_C = `
void UP(void);
void DOWN(void);
void LEFT(void);
void RIGHT(void);
void STOP(void);
int on_finish(void);
int wall_above(void);
int wall_below(void);
int wall_left(void);
int wall_right(void);
`.trim();

const ROBOT_STUBS_CPP = ROBOT_STUBS_C;

const GODBOLT_COMPILER: Partial<Record<Lang, string>> = {
  c: 'cg132',
  cpp: 'g132',
};

const validateViaGodbolt = async (lang: 'c' | 'cpp', code: string): Promise<string | null> => {
  const stubs = lang === 'c' ? ROBOT_STUBS_C : ROBOT_STUBS_CPP;
  const source = stubs + '\n\n' + code;
  const compilerId = GODBOLT_COMPILER[lang]!;

  let data: { stderr: GodBoltLine[]; code: number };
  try {
    const res = await fetch(`https://godbolt.org/api/compiler/${compilerId}/compile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ source, options: { userArguments: '-fsyntax-only -w' } }),
    });
    data = (await res.json()) as typeof data;
  } catch {
    return null; // godbolt unavailable — skip validation
  }

  const stubLines = stubs.split('\n').length + 1;
  const errors = data.stderr
    .filter(line => line.tag && line.tag.severity >= 3)
    .map(line => {
      const userLine = line.tag!.line - stubLines;
      return userLine > 0 ? `строка ${userLine}: ${line.tag!.text}` : line.tag!.text;
    });

  return errors.length > 0 ? errors.join('\n') : null;
};

const validateC = async (code: string): Promise<string | null> => {
  if (!code.includes('main')) {
    return 'Не найдена функция main. Добавь int main() { ... }';
  }
  if (!code.includes('#include')) {
    return 'Не найдена директива #include. Добавь #include <stdio.h>';
  }
  return validateViaGodbolt('c', code);
};

const validateCpp = async (code: string): Promise<string | null> => {
  if (!code.includes('main')) {
    return 'Не найдена функция main. Добавь int main() { ... }';
  }
  if (!code.includes('#include')) {
    return 'Не найдена директива #include. Добавь #include <iostream>';
  }
  return validateViaGodbolt('cpp', code);
};

const validate: Partial<Record<Lang, (code: string) => Promise<string | null>>> = {
  c: validateC,
  cpp: validateCpp,
};

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

  const validator = validate[resolvedLang];
  if (validator) {
    const syntaxError = await validator(code);
    if (syntaxError) return res.json({ error: syntaxError });
  }

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
