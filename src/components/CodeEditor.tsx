import { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { keymap, placeholder } from '@codemirror/view';
import { Prec } from '@codemirror/state';
import { cpp } from '@codemirror/lang-cpp';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState, Compartment } from '@codemirror/state';
import { indentWithTab } from '@codemirror/commands';

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

const editableCompartment = new Compartment();

export const CodeEditor: React.FC<Props> = ({ value, onChange, onSubmit, disabled = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onSubmitRef = useRef(onSubmit);

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
          cpp(),
          oneDark,
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
          placeholder('UP();\nfor (int i = 0; i < 3; i++) {\n    RIGHT();\n    STOP();\n}'),
          EditorView.updateListener.of(update => {
            if (update.docChanged) {
              onChangeRef.current(update.state.doc.toString());
            }
          }),
          editableCompartment.of(EditorView.editable.of(!disabled)),
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
  }, []);

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
      effects: editableCompartment.reconfigure(EditorView.editable.of(!disabled)),
    });
  }, [disabled]);

  return (
    <div
      ref={containerRef}
      style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : undefined }}
    />
  );
};
