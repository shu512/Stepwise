import { useRef, useState } from 'react';
import type { ProgramItem } from '../types';
import type { Lang } from '../utils/codegen';

type CacheEntry = { items: ProgramItem[]; model: string } | { error: string; model: string };

type Options = {
  lang: Lang;
  loadProgram: (items: ProgramItem[]) => void;
  clearProgram: () => void;
};

export const useCodeParser = ({ lang, loadProgram, clearProgram }: Options) => {
  const [code, setCode] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const [modelUsed, setModelUsed] = useState('');

  const cache = useRef(new Map<string, CacheEntry>());

  const parse = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;

    const cached = cache.current.get(trimmed);
    if (cached) {
      if ('model' in cached) setModelUsed(cached.model);
      if ('error' in cached) setParseError(cached.error);
      else loadProgram(cached.items);
      return;
    }

    setIsParsing(true);
    setParseError('');
    setModelUsed('');
    clearProgram();

    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed, lang }),
      });
      const data = (await res.json()) as CacheEntry;
      if ('model' in data) {
        cache.current.set(trimmed, data);
        setModelUsed(data.model);
      }
      if ('error' in data) setParseError(data.error);
      else loadProgram(data.items);
    } catch {
      setParseError('Ошибка соединения с сервером');
    } finally {
      setIsParsing(false);
    }
  };

  return { code, setCode, isParsing, parseError, modelUsed, parse };
};
