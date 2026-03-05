import React, { useState } from 'react';
import type { ProgramItem } from '../types';
import { generateC } from '../utils/codegen';

type Props = {
  program: ProgramItem[];
};

export const CodePanel: React.FC<Props> = ({ program }) => {
  const [visible, setVisible] = useState(false);
  const code = generateC(program);

  return (
    <div style={{ width: '100%', maxWidth: 500, fontFamily: 'monospace' }}>
      <button
        onClick={() => setVisible(v => !v)}
        style={{
          padding: '5px 12px',
          border: '1px solid #b0a090',
          borderRadius: 3,
          background: visible ? '#fdfaf4' : '#f5f0e8',
          cursor: 'pointer',
          fontFamily: 'monospace',
          fontSize: 12,
          fontWeight: 600,
          color: '#6b5344',
          width: '100%',
          textAlign: 'left',
          borderBottom: visible ? 'none' : '1px solid #b0a090',
          borderBottomLeftRadius: visible ? 0 : 3,
          borderBottomRightRadius: visible ? 0 : 3,
        }}
      >
        {visible ? '▾' : '▸'} посмотреть как это выглядит на C
      </button>

      {visible && (
        <div
          style={{
            background: '#fdfaf4',
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
              color: '#2a2a2a',
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
