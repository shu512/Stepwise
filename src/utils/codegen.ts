import type { ProgramItem, Condition } from '../types';

const INDENT = '    ';

const conditionToC = (condition: Condition): string => {
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

const LOOP_VARS = ['i', 'j', 'k', 'l', 'm'];
const itemsToC = (items: ProgramItem[], depth: number, loopDepth: number = 0): string => {
  const pad = INDENT.repeat(depth);
  const lines: string[] = [];

  for (const item of items) {
    if (item.type === 'command') {
      lines.push(`${pad}${item.cmd}();`);
    } else if (item.type === 'loop') {
      const v = LOOP_VARS[loopDepth] ?? `i${loopDepth}`;
      lines.push(`${pad}for (int ${v} = 0; ${v} < ${item.times}; ${v}++) {`);
      lines.push(itemsToC(item.body, depth + 1, loopDepth + 1));
      lines.push(`${pad}}`);
    } else if (item.type === 'if') {
      lines.push(`${pad}if (${conditionToC(item.condition)}) {`);
      if (item.then.length > 0) {
        lines.push(itemsToC(item.then, depth + 1, loopDepth));
      } else {
        lines.push(`${pad}${INDENT}// пусто`);
      }
      if (item.else.length > 0) {
        lines.push(`${pad}} else {`);
        lines.push(itemsToC(item.else, depth + 1, loopDepth));
      }
      lines.push(`${pad}}`);
    }
  }

  return lines.join('\n');
};

export const generateC = (items: ProgramItem[]): string => {
  const body = itemsToC(items, 1);
  return `#include <stdio.h>

int main() {
${body || `    // программа пуста`}
    return 0;
}`;
};
