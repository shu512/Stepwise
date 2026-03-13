import { useState } from 'react';
import { COLOR_BG, COLOR_BG_LIGHT, COLOR_LABEL, COLOR_TEXT } from '../constants';
import type { ProgramItem } from '../types';
import { generateCode, LANG_LABELS, type Lang } from '../utils/codegen';

type Props = {
  program: ProgramItem[];
  lang: Lang;
};

export const CodePanel: React.FC<Props> = ({ program, lang }) => {
  const [visible, setVisible] = useState(false);
  const code = generateCode(program, lang);

  return (
    <div style={{ width: '100%', fontFamily: 'monospace' }}>
      <button
        onClick={() => setVisible(v => !v)}
        style={{
          padding: '5px 12px',
          border: '1px solid #b0a090',
          borderRadius: 3,
          background: visible ? COLOR_BG_LIGHT : COLOR_BG,
          cursor: 'pointer',
          fontFamily: 'monospace',
          fontSize: 12,
          fontWeight: 600,
          color: COLOR_LABEL,
          width: '100%',
          textAlign: 'left',
          borderBottom: visible ? 'none' : '1px solid #b0a090',
          borderBottomLeftRadius: visible ? 0 : 3,
          borderBottomRightRadius: visible ? 0 : 3,
        }}
      >
        {visible ? '▾' : '▸'} посмотреть как это выглядит на {LANG_LABELS[lang]}
      </button>

      {visible && (
        <div
          style={{
            background: COLOR_BG_LIGHT,
            border: '1px solid #b0a090',
            borderTop: 'none',
            borderBottomLeftRadius: 3,
            borderBottomRightRadius: 3,
            padding: 12,
            overflowX: 'auto',
          }}
        >
          <pre
            style={{
              margin: 0,
              fontSize: 12,
              lineHeight: 1.6,
              color: COLOR_TEXT,
              whiteSpace: 'pre',
            }}
          >
            {code}
          </pre>
        </div>
      )}
    </div>
  );
};
