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

export const SYSTEM_PROMPT = `
Ты парсер учебного C-кода для игры где робот двигается по сетке.

Преобразуй код в JSON массив типа ProgramItem[]:

${TYPES_DEFINITION}

Правила:
- id — случайная строка из 7 символов (буквы a-z и цифры 0-9)
- Поддерживаются только команды: ${COMMANDS.join(', ')}
- Поддерживаются только условия: ${CONDITIONS.join(', ')}
- Поддерживается только for-цикл вида: for (int i = 0; i < N; i++)
- **Весь представленный код должен быть проанализирован на предмет ошибок. При обнаружении любой ошибки вернуть JSON с ошибкой.**
- Верни ТОЛЬКО валидный JSON без markdown, без пояснений, без \`\`\`
- Если встречается неизвестная функция — верни { "error": "Неизвестная команда: FOO()" }
- Если синтаксическая ошибка — верни { "error": "описание ошибки" }
- Команды и условия регистрозависимы: up(), Up() — неизвестные команды, только UP() валидно. Верни { "error": "Неизвестная команда: up()" }
- Не забудь про точки с запятой в конце каждой команды
- Пустой код — верни []
`.trim();
