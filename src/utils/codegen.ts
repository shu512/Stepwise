import type { Condition, ProgramItem } from '../types';

export type Lang = 'python' | 'c' | 'cpp' | 'java' | 'csharp' | 'javascript';

export const LANG_LABELS: Record<Lang, string> = {
  python: 'Python',
  c: 'C',
  cpp: 'C++',
  java: 'Java',
  csharp: 'C#',
  javascript: 'JavaScript',
};

const INDENT = '    ';
const LOOP_VARS = ['i', 'j', 'k', 'l', 'm'];

const conditionToCode = (condition: Condition): string => {
  switch (condition) {
    case 'on_finish':
      return 'on_finish()';
    case 'wall_above':
      return 'wall_above()';
    case 'wall_below':
      return 'wall_below()';
    case 'wall_left':
      return 'wall_left()';
    case 'wall_right':
      return 'wall_right()';
  }
};

const generatePython = (items: ProgramItem[], indent: number, loopDepth: number): string => {
  const pad = INDENT.repeat(indent);
  const lines: string[] = [];
  for (const item of items) {
    if (item.type === 'command') {
      lines.push(`${pad}${item.cmd}()`);
    } else if (item.type === 'loop') {
      const v = LOOP_VARS[loopDepth] ?? `i${loopDepth}`;
      lines.push(`${pad}for ${v} in range(${item.times}):`);
      lines.push(generatePython(item.body, indent + 1, loopDepth + 1));
    } else if (item.type === 'if') {
      lines.push(`${pad}if ${conditionToCode(item.condition)}:`);
      lines.push(
        item.then.length > 0
          ? generatePython(item.then, indent + 1, loopDepth)
          : `${pad}${INDENT}pass`,
      );
      if (item.else.length > 0) {
        lines.push(`${pad}else:`);
        lines.push(generatePython(item.else, indent + 1, loopDepth));
      }
    }
  }
  return lines.join('\n');
};

const generateCFamily = (
  items: ProgramItem[],
  indent: number,
  loopDepth: number,
  loopVar: 'int' | 'let',
): string => {
  const pad = INDENT.repeat(indent);
  const lines: string[] = [];
  for (const item of items) {
    if (item.type === 'command') {
      lines.push(`${pad}${item.cmd}();`);
    } else if (item.type === 'loop') {
      const v = LOOP_VARS[loopDepth] ?? `i${loopDepth}`;
      lines.push(`${pad}for (${loopVar} ${v} = 0; ${v} < ${item.times}; ${v}++) {`);
      lines.push(generateCFamily(item.body, indent + 1, loopDepth + 1, loopVar));
      lines.push(`${pad}}`);
    } else if (item.type === 'if') {
      lines.push(`${pad}if (${conditionToCode(item.condition)}) {`);
      lines.push(
        item.then.length > 0
          ? generateCFamily(item.then, indent + 1, loopDepth, loopVar)
          : `${pad}${INDENT}// пусто`,
      );
      if (item.else.length > 0) {
        lines.push(`${pad}} else {`);
        lines.push(generateCFamily(item.else, indent + 1, loopDepth, loopVar));
      }
      lines.push(`${pad}}`);
    }
  }
  return lines.join('\n');
};

const EMPTY: Record<Lang, string> = {
  python: '    # программа пуста',
  c: '    // программа пуста',
  cpp: '    // программа пуста',
  java: '        // программа пуста',
  csharp: '        // программа пуста',
  javascript: '    // программа пуста',
};

const wrap: Record<Lang, (body: string) => string> = {
  python: body => `def main():\n${body}\n\nmain()`,
  c: body => `#include <stdio.h>\n\nint main() {\n${body}\n    return 0;\n}`,
  cpp: body => `#include <iostream>\n\nint main() {\n${body}\n    return 0;\n}`,
  java: body => `class Main {\n    public static void main(String[] args) {\n${body}\n    }\n}`,
  csharp: body => `class Program {\n    static void Main() {\n${body}\n    }\n}`,
  javascript: body => `function main() {\n${body}\n}\n\nmain();`,
};

export const generateCode = (items: ProgramItem[], lang: Lang): string => {
  if (!Array.isArray(items) || items.length === 0) return wrap[lang](EMPTY[lang]);
  const isEmpty = items.length === 0;

  if (isEmpty) return wrap[lang](EMPTY[lang]);

  let body: string;
  switch (lang) {
    case 'python':
      body = generatePython(items, 1, 0);
      break;
    case 'javascript':
      body = generateCFamily(items, 1, 0, 'let');
      break;
    case 'java':
    case 'csharp':
      body = generateCFamily(items, 2, 0, 'int');
      break;
    default:
      body = generateCFamily(items, 1, 0, 'int');
  }

  return wrap[lang](body);
};
