import { useState, useRef } from "react";
import type { Position, ProgramItem } from "../types";
import { STEP_DELAY } from "../constants";
import { move, isSame } from "../utils/program";
import { interpret } from "../utils/interpreter";
import type { RuntimeState } from "../utils/interpreter";

export const useRobot = (
  wallsRef: React.MutableRefObject<Position[]>,
  start: Position,
  finish: Position,
  gridSize: number,
) => {
  const [robot, setRobot] = useState<Position>(start);
  const robotRef = useRef<Position>(start);

  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState("");

  const intervalRef = useRef<number | null>(null);
  const generatorRef = useRef<Generator<string> | null>(null);

  const getState = (): RuntimeState => ({
    pos: robotRef.current,
    start,
    finish,
    walls: wallsRef.current,
    gridSize,
  });

  const runProgram = (program: ProgramItem[]) => {
    if (program.length === 0) return;

    generatorRef.current = interpret(program, getState);

    setMessage("");
    robotRef.current = start;
    setRobot(start);
    setIsRunning(true);

    intervalRef.current = window.setInterval(() => {
      const gen = generatorRef.current!;
      const result = gen.next();

      if (result.done) {
        clearInterval(intervalRef.current!);
        setIsRunning(false);
        if (isSame(robotRef.current, finish)) {
          setMessage("🎉 Достиг финиша!");
        }
        return;
      }

      const next = move(robotRef.current, result.value as any, wallsRef.current, gridSize);
      robotRef.current = next;
      setRobot(next);
    }, STEP_DELAY);
  };

  const reset = () => {
    clearInterval(intervalRef.current!);
    generatorRef.current = null;
    robotRef.current = start;
    setRobot(start);
    setIsRunning(false);
    setMessage("");
  };

  const teleport = (pos: Position) => {
    robotRef.current = pos;
    setRobot(pos);
    setMessage("");
  };

  return { robot, isRunning, message, runProgram, reset, teleport };
};