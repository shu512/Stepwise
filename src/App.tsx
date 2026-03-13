import { useState, useRef } from 'react';
import {
  DndContext,
  PointerSensor,
  pointerWithin,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type Collision,
} from '@dnd-kit/core';
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
import type { DrawMode, ProgramItem, SavedMap } from './types';
import { GitHubIcon } from './components/GitHubIcon';
import { findContainerPath, findContainerPathById, getContainerByPath } from './utils/program';
import { genId } from './utils/ids';
import { LANG_LABELS, type Lang } from './utils/codegen';

function findItemById(items: ProgramItem[], id: string): ProgramItem | null {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.type === 'loop') {
      const found = findItemById(item.body, id);
      if (found) return found;
    }
    if (item.type === 'if') {
      const f1 = findItemById(item.then, id);
      if (f1) return f1;
      const f2 = findItemById(item.else, id);
      if (f2) return f2;
    }
  }
  return null;
}

function containerDepth(id: string, program: ProgramItem[]): number {
  if (id === 'container:root') return 0;
  if (id.startsWith('container:')) {
    const inner = id.slice('container:'.length);
    const [blockId] = inner.split(':');
    const blockPath = findContainerPathById(program, blockId);
    return blockPath ? blockPath.length + 1 : 1;
  }
  return -1;
}

const App: React.FC = () => {
  const [showBlocks, setShowBlocks] = usePersistedState('ui-show-code', false);
  const [showCodeGeneration, setShowCodeGeneration] = usePersistedState(
    'ui-show-c-translation',
    false,
  );
  const [showMaps, setShowMaps] = usePersistedState('ui-show-maps', false);
  const [showDraw, setShowDraw] = usePersistedState('ui-show-draw', true);
  const [showManual, setShowManual] = usePersistedState('ui-show-manual', false);
  const [showCodeInput, setShowCodeInput] = usePersistedState('ui-show-c-input', false);
  const [strictWalls, setStrictWalls] = usePersistedState('ui-strict-walls', false);
  const [gridSize, setGridSize] = usePersistedState('ui-grid-size', DEFAULT_GRID_SIZE);
  const [lang, setLang] = usePersistedState<Lang>('ui-code-lang', 'python');

  const [activeItem, setActiveItem] = useState<ProgramItem | null>(null);
  const [isOverContainer, setIsOverContainer] = useState(false);

  const [code, setCode] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const [modelUsed, setModelUsed] = useState('');

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
    moveItem,
    insertNewItem,
    removeAt,
    removeFromCurrentContext,
    clearProgram,
    loopStart,
    loopEnd,
    updateTimes,
    ifStart,
    ifElse,
    ifEnd,
    loadProgram,
    cancelBlock,
    isInLoop,
    isInIf,
    canElse,
    isEditing,
  } = useProgram();
  const { maps, saveMap, deleteMap, importMap, renameMap, importLearningMaps } = useMaps();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const programRef = useRef(program);
  programRef.current = program;

  type CacheEntry = { items: ProgramItem[]; model: string } | { error: string; model: string };
  const cache = useRef(new Map<string, CacheEntry>());

  const handleParseCode = async () => {
    const codeTrimmed = code.trim();
    if (!codeTrimmed) return;

    if (cache.current.has(codeTrimmed)) {
      try {
        const cached = cache.current.get(codeTrimmed)!;
        if ('model' in cached) setModelUsed(cached.model);
        if ('error' in cached) setParseError(cached.error);
        else loadProgram(cached.items);
      } catch {
        setParseError('Ошибка попытки загрузки программы. Обновите страницу и попробуйте снова.');
      }
      return;
    }

    setIsParsing(true);
    setParseError('');
    clearProgram();
    setModelUsed('');

    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeTrimmed, lang }),
      });
      const data = (await res.json()) as CacheEntry;

      if ('model' in data) {
        cache.current.set(codeTrimmed, data);
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

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.source === 'controls') {
      setActiveItem({ id: '__preview__', type: 'command', cmd: data.cmd });
      return;
    }
    setActiveItem(findItemById(programRef.current, String(event.active.id)) ?? null);
  };

  const handleDragOver = (e: any) => {
    const overId = String(e.over?.id ?? '');
    const isNested = overId.startsWith('container:') && overId !== 'container:root';
    setIsOverContainer(isNested);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveItem(null);
    const { active, over } = event;
    if (!over) return;

    const data = active.data.current;
    const overId = String(over.id);
    const prog = programRef.current;

    if (data?.source === 'controls') {
      const newItem: ProgramItem = { id: genId(), type: 'command', cmd: data.cmd };
      if (overId.startsWith('container:')) {
        const inner = overId.slice('container:'.length);
        if (inner === 'root') {
          insertNewItem(newItem, [], prog.length);
        } else {
          const [blockId, branchKey] = inner.split(':');
          const blockPath = findContainerPathById(prog, blockId);
          if (!blockPath) return;
          let containerPath: number[];
          if (!branchKey || branchKey === 'body') containerPath = blockPath;
          else if (branchKey === 'then') containerPath = [...blockPath, 0];
          else containerPath = [...blockPath, 1];
          insertNewItem(newItem, containerPath, getContainerByPath(prog, containerPath).length);
        }
      } else {
        const containerPath = findContainerPath(prog, overId);
        if (!containerPath) return;
        const container = getContainerByPath(prog, containerPath);
        const index = container.findIndex(item => item.id === overId);
        insertNewItem(newItem, containerPath, index === -1 ? container.length : index);
      }
      return;
    }

    if (active.id === over.id) return;
    const activeId = String(active.id);

    if (overId.startsWith('container:')) {
      const inner = overId.slice('container:'.length);
      if (inner === 'root') {
        moveItem(activeId, '', []);
        return;
      }
      const [blockId, branchKey] = inner.split(':');
      const blockPath = findContainerPathById(prog, blockId);
      if (!blockPath) return;
      let overContainerPath: number[];
      if (!branchKey || branchKey === 'body') overContainerPath = blockPath;
      else if (branchKey === 'then') overContainerPath = [...blockPath, 0];
      else overContainerPath = [...blockPath, 1];
      moveItem(activeId, '', overContainerPath);
    } else {
      const containerPath = findContainerPath(prog, overId);
      if (containerPath === null) return;
      moveItem(activeId, overId, containerPath);
    }
  };

  const collisionDetection = (args: any) => {
    const prog = programRef.current;
    const pointerCollisions: Collision[] = pointerWithin(args);

    const leafHit = pointerCollisions.find((c: Collision) => {
      const id = String(c.id);
      return !id.startsWith('container:') && findItemById(prog, id)?.type === 'command';
    });
    if (leafHit) return [leafHit];

    const deepContainerHit = pointerCollisions
      .filter((c: Collision) => {
        const id = String(c.id);
        return id.startsWith('container:') && id !== 'container:root';
      })
      .sort(
        (a: Collision, b: Collision) =>
          containerDepth(String(b.id), prog) - containerDepth(String(a.id), prog),
      )[0];
    if (deepContainerHit) return [deepContainerHit];

    const centerCollisions: Collision[] = closestCenter(args);
    if (centerCollisions.length > 0) {
      const filtered = centerCollisions.filter((c: Collision) => {
        const id = String(c.id);
        return !id.startsWith('container:') || id === 'container:root';
      });
      return filtered.length > 0 ? [filtered[0]] : centerCollisions;
    }

    return pointerCollisions.length > 0 ? [pointerCollisions[0]] : [];
  };

  const handleGridSizeChange = (raw: string) => {
    const n = parseInt(raw, 10);
    if (isNaN(n) || n < MIN_GRID_SIZE || n > MAX_GRID_SIZE) return;
    setGridSize(n);
    resetGrid(n);
    reset();
  };

  const handleShowBlocks = (v: boolean) => {
    setShowBlocks(v);
    if (v) setShowManual(false);
    else if (!showCodeGeneration) setShowManual(true);
  };

  const handleShowCodeGeneration = (v: boolean) => {
    setShowCodeGeneration(v);
    if (v) setShowManual(false);
    else if (!showBlocks) setShowManual(true);
  };

  const handleShowDraw = (v: boolean) => {
    setShowDraw(v);
    if (v) setShowManual(false);
    else if (!showBlocks && !showCodeGeneration) setShowManual(true);
  };

  const handleShowManual = (v: boolean) => {
    setShowManual(v);
    if (v) {
      setShowBlocks(false);
      setShowCodeGeneration(false);
      setShowDraw(false);
      reset();
    } else setShowDraw(true);
  };

  const handleLoadMap = (map: SavedMap) => {
    setGridSize(map.gridSize);
    setStrictWalls(map.strictWalls ?? false);
    resetGrid(map.gridSize);
    loadGrid(map.start, map.finish, map.walls);
    if (map.program) loadProgram(map.program);
    reset();
  };

  const showLangSelector = showCodeGeneration || showCodeInput;

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
    { mode: 'wall', label: 'Стена', color: '#6b5344' },
    { mode: 'start', label: 'Старт', color: '#457b9d' },
    { mode: 'finish', label: 'Финиш', color: '#e9c46a' },
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
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
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
        {showCodeGeneration && (
          <div style={{ paddingTop: 38 }}>
            <CodePanel program={program} lang={lang} />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          {/* Чекбоксы + размер сетки */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
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
                {checkbox('Блоки кода', showBlocks, handleShowBlocks)}
                {checkbox('Генерация кода', showCodeGeneration, handleShowCodeGeneration)}
                {checkbox('Код ➜ Блоки', showCodeInput, setShowCodeInput)}
              </div>
              {checkbox('Карты', showMaps, setShowMaps)}
              {checkbox('Рисование', showDraw, handleShowDraw)}
              {checkbox('Ручное управление', showManual, handleShowManual)}
              {checkbox('Столкновения со стеной', strictWalls, setStrictWalls)}

              {showLangSelector && (
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
                  Язык
                  <select
                    value={lang}
                    onChange={e => setLang(e.target.value as Lang)}
                    style={{
                      padding: '2px 4px',
                      border: '1px solid #b0a090',
                      borderRadius: 3,
                      background: '#fdfaf4',
                      fontFamily: 'monospace',
                      fontSize: 11,
                      color: '#2a2a2a',
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
                  color: '#6b5344',
                  fontFamily: 'monospace',
                }}
              >
                Сетка
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
          </div>

          {/* Режим рисования */}
          {showDraw && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#a09080' }}>Рисовать:</span>
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

          {showBlocks && (
            <Controls
              isRunning={isRunning || isParsing}
              isInLoop={isInLoop}
              isInIf={isInIf}
              canElse={canElse}
              hasProgram={program.length > 0 || isEditing}
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

          {isEditing && showBlocks && (
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

          {(showBlocks || showCodeInput) && (
            <ProgramPanel
              program={program}
              editStack={editStack as any}
              isRunning={isRunning}
              onRemove={removeAt}
              onRemoveFromContext={removeFromCurrentContext}
              onUpdateTimes={updateTimes}
              onCancelBlock={cancelBlock}
              activeItem={activeItem}
              isOverContainer={isOverContainer}
              showCodeInput={showCodeInput}
              code={code}
              onCodeChange={setCode}
              lang={lang}
              onParseCode={handleParseCode}
              isParsing={isParsing}
              parseError={parseError}
              modelUsed={modelUsed}
            />
          )}

          {message && (
            <div style={{ fontSize: 15, fontWeight: 700, color: '#2a9d8f' }}>{message}</div>
          )}

          <div
            style={{
              fontSize: 10,
              color: '#b0a090',
              display: 'flex',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <GitHubIcon />
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
    </DndContext>
  );
};

export default App;
