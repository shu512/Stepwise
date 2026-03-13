import React from 'react';
import {
  COLOR_BG_LIGHT,
  COLOR_BORDER,
  COLOR_LABEL,
  COLOR_TEXT,
  MAX_GRID_SIZE,
  MIN_GRID_SIZE,
} from '../constants';
import { LANG_LABELS, type Lang } from '../utils/codegen';

type Props = {
  showCode: boolean;
  showCodeGeneration: boolean;
  showMaps: boolean;
  showDraw: boolean;
  showManual: boolean;
  showEditor: boolean;
  strictWalls: boolean;
  gridSize: number;
  lang: Lang;
  onShowCode: (v: boolean) => void;
  onShowCodeGeneration: (v: boolean) => void;
  onShowMaps: (v: boolean) => void;
  onShowDraw: (v: boolean) => void;
  onShowManual: (v: boolean) => void;
  onShowEditor: (v: boolean) => void;
  onStrictWalls: (v: boolean) => void;
  onGridSizeChange: (raw: string) => void;
  onLangChange: (lang: Lang) => void;
};

const Checkbox: React.FC<{ label: string; value: boolean; onChange: (v: boolean) => void }> = ({
  label,
  value,
  onChange,
}) => (
  <label
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 11,
      color: COLOR_LABEL,
      cursor: 'pointer',
      userSelect: 'none',
      fontFamily: 'monospace',
    }}
  >
    <input
      type="checkbox"
      checked={value}
      onChange={e => onChange(e.target.checked)}
      style={{ accentColor: COLOR_LABEL }}
    />
    {label}
  </label>
);

export const SettingsBar: React.FC<Props> = ({
  showCode,
  showCodeGeneration,
  showMaps,
  showDraw,
  showManual,
  showEditor,
  strictWalls,
  gridSize,
  lang,
  onShowCode,
  onShowCodeGeneration,
  onShowMaps,
  onShowDraw,
  onShowManual,
  onShowEditor,
  onStrictWalls,
  onGridSizeChange,
  onLangChange,
}) => {
  const showLangSelector = showCodeGeneration || showEditor;

  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Checkbox label="Блоки кода" value={showCode} onChange={onShowCode} />
        <Checkbox
          label="Генерация кода"
          value={showCodeGeneration}
          onChange={onShowCodeGeneration}
        />
        <Checkbox label="Код ➜ Блоки" value={showEditor} onChange={onShowEditor} />
      </div>
      <Checkbox label="Карты" value={showMaps} onChange={onShowMaps} />
      <Checkbox label="Рисование" value={showDraw} onChange={onShowDraw} />
      <Checkbox label="Ручное управление" value={showManual} onChange={onShowManual} />
      <Checkbox label="Столкновения со стеной" value={strictWalls} onChange={onStrictWalls} />

      {showLangSelector && (
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 11,
            color: COLOR_LABEL,
            fontFamily: 'monospace',
          }}
        >
          Язык
          <select
            value={lang}
            onChange={e => onLangChange(e.target.value as Lang)}
            style={{
              padding: '2px 4px',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: COLOR_BORDER,
              borderRadius: 3,
              background: COLOR_BG_LIGHT,
              fontFamily: 'monospace',
              fontSize: 11,
              color: COLOR_TEXT,
              cursor: 'pointer',
            }}
          >
            {(Object.keys(LANG_LABELS) as Lang[]).map(l => (
              <option key={l} value={l}>
                {LANG_LABELS[l]}
              </option>
            ))}
          </select>
        </label>
      )}

      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          fontSize: 11,
          color: COLOR_LABEL,
          fontFamily: 'monospace',
        }}
      >
        Сетка
        <input
          type="number"
          value={gridSize}
          min={MIN_GRID_SIZE}
          max={MAX_GRID_SIZE}
          onChange={e => onGridSizeChange(e.target.value)}
          style={{
            width: 40,
            padding: '2px 4px',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: COLOR_BORDER,
            borderRadius: 3,
            background: COLOR_BG_LIGHT,
            fontFamily: 'monospace',
            fontSize: 11,
            color: COLOR_TEXT,
            textAlign: 'center',
          }}
        />
      </label>
    </div>
  );
};
