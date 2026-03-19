import { useEffect, useRef, useState } from 'react';
import { SCAFFOLDS } from '../constants';
import type { ProgramItem } from '../types';
import type { Lang } from '../utils/codegen';
import { usePyodide } from './usePyodide';

type CacheEntry = { items: ProgramItem[]; model: string } | { error: string; model: string };

const validateJS = (code: string): string | null => {
  try {
    new Function(code);
    return null;
  } catch (e) {
    return e instanceof SyntaxError ? `Синтаксическая ошибка: ${e.message}` : null;
  }
};

type Options = {
  lang: Lang;
  loadProgram: (items: ProgramItem[]) => void;
  clearProgram: () => void;
};

export const useCodeParser = ({ lang, loadProgram, clearProgram }: Options) => {
  const [code, setCode] = useState(SCAFFOLDS[lang]);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const [modelUsed, setModelUsed] = useState('');

  const cache = useRef(new Map<string, CacheEntry>());
  const { state: pyodideState, validateSyntax: validatePython } = usePyodide();

  const prevLang = useRef(lang);
  useEffect(() => {
    if (lang !== prevLang.current) {
      prevLang.current = lang;
      setCode(SCAFFOLDS[lang]);
      setParseError('');
    }
  }, [lang]);

  const parse = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;

    if (lang === 'javascript') {
      const err = validateJS(trimmed);
      if (err) {
        setParseError(err);
        return;
      }
    }

    if (lang === 'python') {
      const err = await validatePython(trimmed);
      if (err) {
        setParseError(err);
        return;
      }
    }

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

  return {
    code,
    setCode,
    isParsing: isParsing || pyodideState === 'loading',
    parseError,
    modelUsed,
    parse,
  };
};
