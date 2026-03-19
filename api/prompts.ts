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

export const buildSystemPrompt = (lang: Lang): string =>
  `
Ты парсер учебного ${lang.toUpperCase()}-кода для игры где робот двигается по сетке.

Преобразуй код в JSON массив типа ProgramItem[]:

${TYPES_DEFINITION}

Язык: ${lang}
- Цикл: ${LOOP_SYNTAX[lang]}
- Условие: ${IF_SYNTAX[lang]}

Правила:
- id — случайная строка из 7 символов (буквы a-z и цифры 0-9)
- Команды: ${COMMANDS.join(', ')} — регистрозависимы
- Условия: ${CONDITIONS.join(', ')}
- Верни ТОЛЬКО валидный JSON без markdown и пояснений
- Пустой код — верни []
`.trim();
