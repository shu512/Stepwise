import { DndContext } from '@dnd-kit/core';
import { useEffect, useRef } from 'react';
import { CodePanel } from './components/CodePanel';
import { Controls } from './components/Controls';
import { DrawModeSelector } from './components/DrawModeSelector';
import { GitHubIcon } from './components/ui/GitHubIcon';
import { Grid } from './components/Grid';
import { MapsSidebar } from './components/MapsSidebar';
import { ProgramPanel } from './components/ProgramPanel';
import { SettingsBar } from './components/SettingsBar';
import { COLOR_BG, COLOR_BORDER, COLOR_TEXT, MAX_GRID_SIZE, MIN_GRID_SIZE } from './constants';
import { useCodeParser } from './hooks/useCodeParser';
import { useDragHandlers } from './hooks/useDragHandlers';
import { useGrid } from './hooks/useGrid';
import { useMaps } from './hooks/useMaps';
import { useProgram } from './hooks/useProgram';
import { useRobot } from './hooks/useRobot';
import { useUIState } from './hooks/useUIState';
import type { SavedMap } from './types';

const App: React.FC = () => {
  const ui = useUIState();

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
  } = useGrid(ui.gridSize);
  const { robot, isRunning, stopReason, message, speed, runProgram, reset, teleport, changeSpeed } =
    useRobot(wallsRef, start, finish, ui.gridSize, ui.strictWalls);
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
  const {
    maps,
    saveMap,
    deleteMap,
    importMap,
    renameMap,
    importLearningMaps,
    activeMapId,
    loadMap,
    reorderMaps,
  } = useMaps();

  const programRef = useRef(program);
  useEffect(() => {
    programRef.current = program;
  }, [program]);

  const { code, setCode, isParsing, parseError, modelUsed, parse } = useCodeParser({
    lang: ui.lang,
    loadProgram,
    clearProgram,
  });

  const {
    sensors,
    activeItem,
    isOverContainer,
    collisionDetection,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useDragHandlers({ programRef, insertNewItem, moveItem });

  const handleGridSizeChange = (raw: string) => {
    const n = parseInt(raw, 10);
    if (isNaN(n) || n < MIN_GRID_SIZE || n > MAX_GRID_SIZE) return;
    ui.setGridSize(n);
    resetGrid(n);
    reset();
  };

  const handleLoadMap = (map: SavedMap) => {
    loadMap(map);
    ui.setGridSize(map.gridSize);
    ui.setStrictWalls(map.strictWalls ?? false);
    resetGrid(map.gridSize);
    loadGrid(map.start, map.finish, map.walls);
    if (map.program) loadProgram(map.program);
    reset();
  };

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
          minHeight: 'calc(100vh - 24px)',
          background: COLOR_BG,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          gap: 24,
          padding: 24,
          paddingBottom: 0,
          fontFamily: 'monospace',
          color: COLOR_TEXT,
        }}
      >
        {ui.showCodeGeneration && (
          <div style={{ paddingTop: 38, position: 'sticky', top: 24 }}>
            <CodePanel program={program} lang={ui.lang} />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <SettingsBar
            showCode={ui.showCode}
            showCodeGeneration={ui.showCodeGeneration}
            showMaps={ui.showMaps}
            showDraw={ui.showDraw}
            showManual={ui.showManual}
            showEditor={ui.showEditor}
            strictWalls={ui.strictWalls}
            gridSize={ui.gridSize}
            lang={ui.lang}
            onShowCode={ui.handleShowCode}
            onShowCodeGeneration={ui.handleShowCodeGeneration}
            onShowMaps={ui.setShowMaps}
            onShowDraw={ui.handleShowDraw}
            onShowManual={v => ui.handleShowManual(v, reset)}
            onShowEditor={ui.setShowEditor}
            onStrictWalls={ui.setStrictWalls}
            onGridSizeChange={handleGridSizeChange}
            onLangChange={ui.setLang}
          />

          {ui.showDraw && <DrawModeSelector drawMode={drawMode} onDrawModeChange={setDrawMode} />}

          <Grid
            gridSize={ui.gridSize}
            robot={robot}
            start={start}
            finish={finish}
            walls={walls}
            isRunning={isRunning || ui.showManual}
            isManual={ui.showManual}
            stopReason={stopReason}
            onCellClick={(row, col) => {
              if (ui.showManual) {
                teleport({ row, col });
                return;
              }
              if (ui.showDraw && !isRunning) {
                handleCellClick(row, col);
                return;
              }
            }}
          />

          {ui.showCode && (
            <Controls
              isRunning={isRunning || isParsing}
              isInLoop={isInLoop}
              isInIf={isInIf}
              canElse={canElse}
              hasProgram={program.length > 0 || isEditing}
              speed={speed}
              onSpeedChange={changeSpeed}
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

          {isEditing && ui.showCode && (
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

          {(ui.showCode || ui.showEditor) && (
            <ProgramPanel
              program={program}
              editStack={editStack}
              isRunning={isRunning}
              lang={ui.lang}
              onRemove={removeAt}
              onRemoveFromContext={removeFromCurrentContext}
              onUpdateTimes={updateTimes}
              onCancelBlock={cancelBlock}
              activeItem={activeItem}
              isOverContainer={isOverContainer}
              showEditor={ui.showEditor}
              code={code}
              onCodeChange={setCode}
              onParseCode={parse}
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
              color: COLOR_BORDER,
              display: 'flex',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <GitHubIcon />
          </div>
        </div>

        {ui.showMaps && (
          <div style={{ paddingTop: 8, position: 'sticky', top: 24 }}>
            <MapsSidebar
              maps={maps}
              activeMapId={activeMapId}
              currentStart={start}
              currentFinish={finish}
              currentWalls={walls}
              currentProgram={program}
              gridSize={ui.gridSize}
              strictWalls={ui.strictWalls}
              onSave={saveMap}
              onLoad={handleLoadMap}
              onDelete={deleteMap}
              onImport={importMap}
              onRename={renameMap}
              onReorder={reorderMaps}
              onImportBulk={importLearningMaps}
            />
          </div>
        )}
      </div>
    </DndContext>
  );
};

export default App;
