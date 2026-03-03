import { useState, useRef } from "react";
import type { Position } from "../types";
import { START, FINISH, STEP_DELAY } from "../constants";
import { move, isSame, flatten } from "../utils/program";
import type { ProgramItem } from "../types";

export const useRobot = (wallsRef: React.MutableRefObject<Position[]>) => {
  const [robot, setRobot] = useState<Position>(START);
  const robotRef = useRef<Position>(START);

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
    robotRef.current = START;
    setRobot(START);
    setIsRunning(true);
    stepRef.current = 0;

    intervalRef.current = window.setInterval(() => {
      if (stepRef.current >= flatRef.current.length) {
        clearInterval(intervalRef.current!);
        setIsRunning(false);
        return;
      }

      const cmd = flatRef.current[stepRef.current] as any;
      stepRef.current++;

      const next = move(robotRef.current, cmd, wallsRef.current);
      robotRef.current = next;
      setRobot(next);

      if (isSame(next, FINISH)) {
        clearInterval(intervalRef.current!);
        setIsRunning(false);
        setMessage("🎉 Достиг финиша!");
      }
    }, STEP_DELAY);
  };

  const reset = () => {
    clearInterval(intervalRef.current!);
    robotRef.current = START;
    setRobot(START);
    setIsRunning(false);
    setMessage("");
  };

  return { robot, isRunning, message, runProgram, reset };
};