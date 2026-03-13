import type { Lang } from '../src/utils/codegen.js';

const COMMANDS = ['UP', 'DOWN', 'LEFT', 'RIGHT', 'STOP'];
const CONDITIONS = ['on_finish', 'wall_above', 'wall_below', 'wall_left', 'wall_right'];

const TYPES_DEFINITION = `
type CommandKind = ${COMMANDS.map(c => `'${c}'`).join(' | ')};
type Condition = ${CONDITIONS.map(c => `'${c}'`).join(' | ')};
type Command = { id: string; type: 'command'; cmd: CommandKind };
type LoopBlock = { id: string; type: 'loop'; times: number; body: ProgramItem[] };
type IfBlock = { id: string; type: 'if'; condition: Condition; then: ProgramItem[]; else: ProgramItem[] };
type ProgramItem = Command | LoopBlock | IfBlock;
`.trim();

const LOOP_SYNTAX: Record<Lang, string> = {
  python: 'for i in range(N):',
  c: 'for (int i = 0; i < N; i++)',
  cpp: 'for (int i = 0; i < N; i++)',
  java: 'for (int i = 0; i < N; i++)',
  csharp: 'for (int i = 0; i < N; i++)',
  javascript: 'for (let i = 0; i < N; i++)',
};

const IF_SYNTAX: Record<Lang, string> = {
  python: 'if condition:',
  c: 'if (condition)',
  cpp: 'if (condition)',
  java: 'if (condition)',
  csharp: 'if (condition)',
  javascript: 'if (condition)',
};

const LANG_NOTES: Record<Lang, string> = {
  python: 'Отступы вместо фигурных скобок. Нет точек с запятой. Команды без точки с запятой.',
  c: 'Точки с запятой после каждой команды обязательны.',
  cpp: 'Точки с запятой после каждой команды обязательны.',
  java: 'Точки с запятой после каждой команды обязательны. Код может быть обёрнут в class/method — игнорируй обёртку.',
  csharp:
    'Точки с запятой после каждой команды обязательны. Код может быть обёрнут в class/method — игнорируй обёртку.',
  javascript: 'Точки с запятой после каждой команды рекомендуются, но не обязательны.',
};

export const buildSystemPrompt = (lang: Lang): string =>
  `
Ты парсер учебного ${lang.toUpperCase()}-кода для игры где робот двигается по сетке.

Преобразуй код в JSON массив типа ProgramItem[]:

${TYPES_DEFINITION}

Синтаксис языка: ${lang}
- Цикл: ${LOOP_SYNTAX[lang]}
- Условие: ${IF_SYNTAX[lang]}
- ${LANG_NOTES[lang]}

Правила:
- id — случайная строка из 7 символов (буквы a-z и цифры 0-9)
- Поддерживаются только команды: ${COMMANDS.join(', ')}
- Поддерживаются только условия: ${CONDITIONS.join(', ')}
- Весь представленный код должен быть проанализирован на предмет ошибок. При обнаружении любой ошибки вернуть JSON с ошибкой.
- Верни ТОЛЬКО валидный JSON без markdown, без пояснений, без \`\`\`
- Если встречается неизвестная функция — верни { "error": "Неизвестная команда: FOO()" }
- Если синтаксическая ошибка — верни { "error": "описание ошибки" }
- Команды и условия регистрозависимы: up(), Up() — неизвестные команды, только UP() валидно
- Пустой код — верни []
`.trim();
