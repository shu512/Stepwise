import { useRef, useState } from 'react';

type PyodideInstance = {
  runPython: (code: string) => unknown;
};

type State = 'idle' | 'loading' | 'ready' | 'error';

export const usePyodide = () => {
  const [state, setState] = useState<State>('idle');
  const instanceRef = useRef<PyodideInstance | null>(null);
  const loadingPromiseRef = useRef<Promise<PyodideInstance> | null>(null);

  const load = (): Promise<PyodideInstance> => {
    if (instanceRef.current) return Promise.resolve(instanceRef.current);

    // Deduplicate concurrent load() calls
    if (loadingPromiseRef.current) return loadingPromiseRef.current;

    setState('loading');

    const promise = new Promise<PyodideInstance>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.0/full/pyodide.js';
      script.onload = async () => {
        try {
          const pyodide = await (window as any).loadPyodide();
          instanceRef.current = pyodide;
          setState('ready');
          resolve(pyodide);
        } catch (e) {
          setState('error');
          reject(e);
        }
      };
      script.onerror = () => {
        setState('error');
        reject(new Error('Failed to load Pyodide'));
      };
      document.head.appendChild(script);
    });

    loadingPromiseRef.current = promise;
    return promise;
  };

  const validateSyntax = async (code: string): Promise<string | null> => {
    let pyodide: PyodideInstance;
    try {
      pyodide = await load();
    } catch {
      return null; // Pyodide unavailable — skip validation
    }

    const result = pyodide.runPython(`
import ast, json
try:
    ast.parse(${JSON.stringify(code)})
    result = ""
except SyntaxError as e:
    result = f"строка {e.lineno}: {e.msg}"
result
`) as string;

    return result || null;
  };

  return { state, validateSyntax };
};
