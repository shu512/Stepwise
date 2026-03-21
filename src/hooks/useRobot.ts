import confetti from 'canvas-confetti';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { STEP_DELAY } from '../constants';
import type { CommandKind, Position, ProgramItem } from '../types';
import { isSame, move } from '../utils/grid';
import { interpret } from '../utils/interpreter';

export type StopReason = 'wall' | 'stop' | null;

export const useRobot = (
  wallsRef: RefObject<Position[]>,
  start: Position,
  finish: Position,
  gridSize: number,
  strictWalls: boolean,
) => {
  const [robot, setRobot] = useState<Position>(start);
  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState('');
  const [stopReason, setStopReason] = useState<StopReason>(null);
  const [speed, setSpeed] = useState(1);

  const robotRef = useRef<Position>(start);
  const intervalRef = useRef<number | null>(null);
  const generatorRef = useRef<Generator<string> | null>(null);
  const stepDelayRef = useRef(STEP_DELAY);

  const startRef = useRef(start);
  const finishRef = useRef(finish);
  const gridSizeRef = useRef(gridSize);
  const strictWallsRef = useRef(strictWalls);
  useEffect(() => {
    startRef.current = start;
  }, [start]);
  useEffect(() => {
    finishRef.current = finish;
  }, [finish]);
  useEffect(() => {
    gridSizeRef.current = gridSize;
  }, [gridSize]);
  useEffect(() => {
    strictWallsRef.current = strictWalls;
  }, [strictWalls]);

  const changeSpeed = (multiplier: number) => {
    setSpeed(multiplier);
    stepDelayRef.current = STEP_DELAY / multiplier;

    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = window.setInterval(tick, stepDelayRef.current);
    }
  };

  const tick = () => {
    const result = generatorRef.current!.next();

    if (result.done) {
      clearInterval(intervalRef.current!);
      setIsRunning(false);

      if (isSame(robotRef.current, finishRef.current)) {
        setMessage('🎉 Достиг финиша!');
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#2a9d8f', '#457b9d', '#e63946', '#f9c74f', '#90be6d'],
        });
      } else if (result.value === 'stop') {
        setStopReason('stop');
        setMessage('⛔ Остановлен');
      }
      return;
    }

    const next = move(
      robotRef.current,
      result.value as CommandKind,
      wallsRef.current,
      gridSizeRef.current,
      strictWallsRef.current,
    );

    if (next === null) {
      clearInterval(intervalRef.current!);
      setIsRunning(false);
      setStopReason('wall');
      setMessage('💥 Врезался в стену!');
      return;
    }

    robotRef.current = next;
    setRobot(next);
  };

  const runProgram = (program: ProgramItem[]) => {
    if (program.length === 0) return;

    robotRef.current = startRef.current;
    setRobot(startRef.current);
    setMessage('');
    setStopReason(null);
    setIsRunning(true);

    generatorRef.current = interpret(program, () => ({
      pos: robotRef.current,
      start: startRef.current,
      finish: finishRef.current,
      walls: wallsRef.current,
      gridSize: gridSizeRef.current,
    }));

    intervalRef.current = window.setInterval(tick, stepDelayRef.current);
  };

  const reset = () => {
    clearInterval(intervalRef.current!);
    generatorRef.current = null;
    robotRef.current = start;
    setRobot(start);
    setIsRunning(false);
    setStopReason(null);
    setMessage('');
  };

  const teleport = (pos: Position) => {
    robotRef.current = pos;
    setRobot(pos);
    setStopReason(null);
    setMessage('');
  };

  return { robot, isRunning, stopReason, message, speed, changeSpeed, runProgram, reset, teleport };
};
