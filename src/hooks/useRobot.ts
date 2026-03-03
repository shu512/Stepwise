import { useState, useRef } from "react";
import type { Position, ProgramItem } from "../types";
import { STEP_DELAY } from "../constants";
import { move, isSame, flatten } from "../utils/program";

export const useRobot = (
  wallsRef: React.MutableRefObject<Position[]>,
  start: Position,
  finish: Position,
) => {
  const [robot, setRobot] = useState<Position>(start);
  const robotRef = useRef<Position>(start);

  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState("");

  const intervalRef = useRef<number | null>(null);
  const stepRef = useRef(0);
  const flatRef = useRef<string[]>([]);

  const runProgram = (program: ProgramItem[]) => {
    const flat = flatten(program);
    if (flat.length === 0) return;

    flatRef.current = flat;
    setMessage("");
    robotRef.current = start;
    setRobot(start);
    setIsRunning(true);
    stepRef.current = 0;

    intervalRef.current = window.setInterval(() => {
      if (stepRef.current >= flatRef.current.length) {
        clearInterval(intervalRef.current!);
        setIsRunning(false);
        if (isSame(robotRef.current, finish)) {
          setMessage("🎉 Достиг финиша!");
        }
        return;
      }

      const cmd = flatRef.current[stepRef.current] as any;
      stepRef.current++;

      const next = move(robotRef.current, cmd, wallsRef.current);
      robotRef.current = next;
      setRobot(next);
    }, STEP_DELAY);
  };

  const reset = () => {
    clearInterval(intervalRef.current!);
    robotRef.current = start;
    setRobot(start);
    setIsRunning(false);
    setMessage("");
  };

  return { robot, isRunning, message, runProgram, reset };
};