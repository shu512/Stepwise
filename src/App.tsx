import React from 'react';
import { Grid } from './components/Grid';
import { Controls } from './components/Controls';
import { ProgramPanel } from './components/ProgramPanel';
import { MapsSidebar } from './components/MapsSidebar';
import { CodePanel } from './components/CodePanel';
import { useRobot } from './hooks/useRobot';
import { useGrid } from './hooks/useGrid';
import { useProgram } from './hooks/useProgram';
import { useMaps } from './hooks/useMaps';
import { usePersistedState } from './hooks/usePersistedState';
import { DEFAULT_GRID_SIZE, MIN_GRID_SIZE, MAX_GRID_SIZE } from './constants';
import type { DrawMode, SavedMap } from './types';
import { GitHubIcon } from './components/GitHubIcon';

const App: React.FC = () => {
  const [showCode, setShowCode] = usePersistedState('ui-show-code', false);
  const [showCTranslation, setShowCTranslation] = usePersistedState('ui-show-c-translation', false);
  const [showMaps, setShowMaps] = usePersistedState('ui-show-maps', false);
  const [showDraw, setShowDraw] = usePersistedState('ui-show-draw', true);
  const [showManual, setShowManual] = usePersistedState('ui-show-manual', false);
  const [strictWalls, setStrictWalls] = usePersistedState('ui-strict-walls', false);
  const [gridSize, setGridSize] = usePersistedState('ui-grid-size', DEFAULT_GRID_SIZE);

  const {
    start,
    finish,
    walls,
    wallsRef,
    drawMode,
    setDrawMode,
    handleCellClick,
    loadGrid,
    resetGrid,
  } = useGrid(gridSize);
  const { robot, isRunning, isError, message, runProgram, reset, teleport } = useRobot(
    wallsRef,
    start,
    finish,
    gridSize,
    strictWalls,
  );
  const {
    program,
    editStack,
    addCommand,
    removeAt,
    clearProgram,
    loopStart,
    loopEnd,
    ifStart,
    ifElse,
    ifEnd,
    loadProgram,
    isInLoop,
    isInIf,
    canElse,
    isEditing,
  } = useProgram();
  const { maps, saveMap, deleteMap, importMap, renameMap, importLearningMaps } = useMaps();

  const handleGridSizeChange = (raw: string) => {
    const n = parseInt(raw, 10);
    if (isNaN(n) || n < MIN_GRID_SIZE || n > MAX_GRID_SIZE) return;
    setGridSize(n);
    resetGrid(n);
    reset();
  };

  const handleShowCode = (v: boolean) => {
    setShowCode(v);
    if (v) setShowManual(false);
    else if (!v && !showCTranslation) setShowManual(true);
  };

  const handleShowCTranslation = (v: boolean) => {
    setShowCTranslation(v);
    if (v) setShowManual(false);
    else if (!showCode && !v) setShowManual(true);
  };

  const handleShowDraw = (v: boolean) => {
    setShowDraw(v);
    if (v) setShowManual(false);
    else if (!showCode && !showCTranslation && !v) setShowManual(true);
  };

  const handleShowManual = (v: boolean) => {
    setShowManual(v);
    if (v) {
      setShowCode(false);
      setShowCTranslation(false);
      setShowDraw(false);
      reset();
    } else {
      setShowDraw(true);
    }
  };

  const handleLoadMap = (map: SavedMap) => {
    setGridSize(map.gridSize);
    setStrictWalls(map.strictWalls ?? false);
    resetGrid(map.gridSize);
    loadGrid(map.start, map.finish, map.walls);
    if (map.program) loadProgram(map.program);
    reset();
  };

  const checkbox = (label: string, value: boolean, onChange: (v: boolean) => void) => (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 11,
        color: '#6b5344',
        cursor: 'pointer',
        userSelect: 'none',
        fontFamily: 'monospace',
      }}
    >
      <input
        type="checkbox"
        checked={value}
        onChange={e => onChange(e.target.checked)}
        style={{ accentColor: '#6b5344' }}
      />
      {label}
    </label>
  );

  const DRAW_MODES: { mode: DrawMode; label: string; color: string }[] = [
    { mode: 'wall', label: 'стена', color: '#6b5344' },
    { mode: 'start', label: 'старт', color: '#457b9d' },
    { mode: 'finish', label: 'финиш', color: '#2a9d8f' },
  ];

  const btn = (extra?: React.CSSProperties): React.CSSProperties => ({
    padding: '5px 12px',
    border: '1px solid #b0a090',
    borderRadius: 3,
    background: '#f5f0e8',
    cursor: 'pointer',
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: 600,
    color: '#2a2a2a',
    ...extra,
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5f0e8',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 24,
        padding: 24,
        fontFamily: 'monospace',
        color: '#2a2a2a',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        {/* Чекбоксы + размер сетки */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {checkbox('код', showCode, handleShowCode)}
          {checkbox('перевод на C', showCTranslation, handleShowCTranslation)}
          {checkbox('карты', showMaps, setShowMaps)}
          {checkbox('рисование', showDraw, handleShowDraw)}
          {checkbox('ручное управление', showManual, handleShowManual)}
          {checkbox('столкновения со стеной', strictWalls, setStrictWalls)}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 11,
              color: '#6b5344',
              fontFamily: 'monospace',
            }}
          >
            сетка
            <input
              type="number"
              value={gridSize}
              min={MIN_GRID_SIZE}
              max={MAX_GRID_SIZE}
              onChange={e => handleGridSizeChange(e.target.value)}
              style={{
                width: 40,
                padding: '2px 4px',
                border: '1px solid #b0a090',
                borderRadius: 3,
                background: '#fdfaf4',
                fontFamily: 'monospace',
                fontSize: 11,
                color: '#2a2a2a',
                textAlign: 'center',
              }}
            />
          </label>
        </div>

        {/* Режим рисования */}
        {showDraw && (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#a09080' }}>рисовать:</span>
            {DRAW_MODES.map(({ mode, label, color }) => (
              <button
                key={mode}
                onClick={() => setDrawMode(mode)}
                style={btn({
                  color,
                  borderColor: drawMode === mode ? color : '#b0a090',
                  background: drawMode === mode ? '#fdfaf4' : '#f0ebe0',
                  fontWeight: drawMode === mode ? 700 : 500,
                  boxShadow: drawMode === mode ? `inset 0 -2px 0 ${color}` : 'none',
                })}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <Grid
          gridSize={gridSize}
          robot={robot}
          start={start}
          finish={finish}
          walls={walls}
          isRunning={isRunning || showManual}
          isManual={showManual}
          isError={isError}
          onCellClick={(row, col) => {
            if (showManual) {
              teleport({ row, col });
              return;
            }
            if (showDraw && !isRunning) {
              handleCellClick(row, col);
              return;
            }
          }}
        />

        {showCode && (
          <Controls
            isRunning={isRunning}
            isInLoop={isInLoop}
            isInIf={isInIf}
            canElse={canElse}
            hasProgram={program.length > 0}
            onCommand={addCommand}
            onLoopStart={loopStart}
            onLoopEnd={loopEnd}
            onIfStart={ifStart}
            onIfElse={ifElse}
            onIfEnd={ifEnd}
            onClear={clearProgram}
            onRun={() => {
              if (isEditing) {
                alert('Закрой открытый блок!');
                return;
              }
              runProgram(program);
            }}
            onReset={reset}
          />
        )}

        {isEditing && showCode && (
          <div
            style={{
              fontSize: 12,
              color: '#a0522d',
              border: '1px dashed #a0522d',
              padding: '4px 10px',
              borderRadius: 3,
            }}
          >
            записываю тело блока (глубина {editStack.length - 1}) — закрой блок
          </div>
        )}

        {showCode && (
          <ProgramPanel
            program={program}
            editStack={editStack as any}
            isRunning={isRunning}
            onRemove={removeAt}
          />
        )}

        {showCTranslation && <CodePanel program={program} />}

        {message && (
          <div style={{ fontSize: 15, fontWeight: 700, color: '#2a9d8f' }}>{message}</div>
        )}

        {/* Подсказка + github внизу */}
        <div
          style={{
            fontSize: 10,
            color: '#b0a090',
            display: 'flex',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <span>
            {showManual
              ? 'клик по клетке — переместить робота'
              : showDraw
                ? 'клик по ячейке — рисовать'
                : 'клик по команде — удалить'}
          </span>
          <div
            style={{
              fontSize: 10,
              color: '#b0a090',
              display: 'flex',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <span>
              {showManual
                ? 'клик по клетке — переместить робота'
                : showDraw
                  ? 'клик по ячейке — рисовать'
                  : 'клик по команде — удалить'}
            </span>
            <GitHubIcon />
          </div>
        </div>
      </div>

      {showMaps && (
        <div style={{ paddingTop: 8 }}>
          <MapsSidebar
            maps={maps}
            currentStart={start}
            currentFinish={finish}
            currentWalls={walls}
            currentProgram={program}
            gridSize={gridSize}
            strictWalls={strictWalls}
            onSave={saveMap}
            onLoad={handleLoadMap}
            onDelete={deleteMap}
            onImport={importMap}
            onRename={renameMap}
            onImportBulk={importLearningMaps}
          />
        </div>
      )}
    </div>
  );
};

export default App;
