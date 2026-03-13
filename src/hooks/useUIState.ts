import { usePersistedState } from './usePersistedState';
import { DEFAULT_GRID_SIZE } from '../constants';
import type { Lang } from '../utils/codegen';

export const useUIState = () => {
  const [showCode, setShowCode] = usePersistedState('ui-show-code', false);
  const [showCodeGeneration, setShowCodeGeneration] = usePersistedState(
    'ui-show-c-translation',
    false,
  );
  const [showMaps, setShowMaps] = usePersistedState('ui-show-maps', false);
  const [showDraw, setShowDraw] = usePersistedState('ui-show-draw', true);
  const [showManual, setShowManual] = usePersistedState('ui-show-manual', false);
  const [showEditor, setShowEditor] = usePersistedState('ui-show-c-input', false);
  const [strictWalls, setStrictWalls] = usePersistedState('ui-strict-walls', false);
  const [gridSize, setGridSize] = usePersistedState('ui-grid-size', DEFAULT_GRID_SIZE);
  const [lang, setLang] = usePersistedState<Lang>('ui-code-lang', 'python');

  // Handlers that manage mutual exclusion between panels and manual mode.
  // Manual mode is auto-enabled when all visual panels are off.

  const handleShowCode = (v: boolean) => {
    setShowCode(v);
    if (v) setShowManual(false);
    else if (!showCodeGeneration) setShowManual(true);
  };

  const handleShowCodeGeneration = (v: boolean) => {
    setShowCodeGeneration(v);
    if (v) setShowManual(false);
    else if (!showCode) setShowManual(true);
  };

  const handleShowDraw = (v: boolean) => {
    setShowDraw(v);
    if (v) setShowManual(false);
    else if (!showCode && !showCodeGeneration) setShowManual(true);
  };

  const handleShowManual = (v: boolean, onReset: () => void) => {
    setShowManual(v);
    if (v) {
      setShowCode(false);
      setShowCodeGeneration(false);
      setShowDraw(false);
      onReset();
    } else {
      setShowDraw(true);
    }
  };

  return {
    showCode,
    showCodeGeneration,
    showMaps,
    showDraw,
    showManual,
    showEditor,
    strictWalls,
    gridSize,
    lang,
    setShowMaps,
    setShowEditor,
    setStrictWalls,
    setGridSize,
    setLang,
    handleShowCode,
    handleShowCodeGeneration,
    handleShowDraw,
    handleShowManual,
  };
};
