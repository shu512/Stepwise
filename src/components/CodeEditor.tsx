import { indentWithTab } from '@codemirror/commands';
import { cpp } from '@codemirror/lang-cpp';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { Compartment, EditorState, Prec } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { keymap, placeholder } from '@codemirror/view';
import { EditorView, basicSetup } from 'codemirror';
import { useEffect, useRef } from 'react';
import type { Lang } from '../utils/codegen';

const PLACEHOLDERS: Record<Lang, string> = {
  python: `UP()
  for i in range(3):
    RIGHT()
`,
  c: `#include <stdio.h>

int main() {
  UP();
  for (int i = 0; i < 3; i++) {
    RIGHT();
  }
  return 0;
}`,
  cpp: `#include <iostream>

int main() {
  UP();
  for (int i = 0; i < 3; i++) {
    RIGHT();
  }
  return 0;
}`,
  java: `public class Main {
  public static void main(String[] args) {
    UP();
    for (int i = 0; i < 3; i++) {
      RIGHT();
    }
  }
}`,
  csharp: `class Program {
  static void Main() {
    UP();
    for (int i = 0; i < 3; i++) {
      RIGHT();
    }
  }
}`,
  javascript: `UP();
  for (let i = 0; i < 3; i++) {
    RIGHT();
  }
`,
};

const getLangExtension = (lang: Lang) => {
  switch (lang) {
    case 'python':
      return python();
    case 'javascript':
      return javascript();
    default:
      return cpp();
  }
};

type Props = {
  value: string;
  lang: Lang;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

export const CodeEditor: React.FC<Props> = ({
  value,
  lang,
  onChange,
  onSubmit,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onSubmitRef = useRef(onSubmit);
  const langCompartment = useRef(new Compartment());
  const editableCompartment = useRef(new Compartment());
  const placeholderCompartment = useRef(new Compartment());

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);

  useEffect(() => {
    if (!containerRef.current) return;

    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          oneDark,
          langCompartment.current.of(getLangExtension(lang)),
          placeholderCompartment.current.of(placeholder(PLACEHOLDERS[lang])),
          editableCompartment.current.of(EditorView.editable.of(!disabled)),
          Prec.highest(
            keymap.of([
              {
                key: 'Ctrl-Enter',
                mac: 'Cmd-Enter',
                run: () => {
                  onSubmitRef.current();
                  return true;
                },
              },
              indentWithTab,
            ]),
          ),
          EditorView.updateListener.of(update => {
            if (update.docChanged) onChangeRef.current(update.state.doc.toString());
          }),
          EditorView.theme({
            '&': { fontSize: '12px', fontFamily: 'monospace' },
            '.cm-scroller': { minHeight: '120px', maxHeight: '300px', overflow: 'auto' },
            '.cm-editor': { borderRadius: '3px', border: '1px solid #c0b0a0' },
          }),
        ],
      }),
      parent: containerRef.current,
    });

    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({ changes: { from: 0, to: current.length, insert: value } });
    }
  }, [value]);

  useEffect(() => {
    viewRef.current?.dispatch({
      effects: [
        langCompartment.current.reconfigure(getLangExtension(lang)),
        placeholderCompartment.current.reconfigure(placeholder(PLACEHOLDERS[lang])),
      ],
    });
  }, [lang]);

  useEffect(() => {
    viewRef.current?.dispatch({
      effects: editableCompartment.current.reconfigure(EditorView.editable.of(!disabled)),
    });
  }, [disabled]);

  return (
    <div
      ref={containerRef}
      style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : undefined }}
    />
  );
};
