"use client";
import { useState } from "react";
type StudyCounterProps = {
  title: string;
  initialCount?: number;
};

export default function StudyCounter({
  title,
  initialCount = 0,
}: StudyCounterProps) {
  const [count, setCount] = useState(initialCount);

  return (
    <div>
      <h2>{title}</h2>
      <div>
        <span>当前的数字:{count}</span>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => {
            setCount((prev) => prev + 1);
          }}
        >
          加一
        </button>
        <button onClick={() => setCount(initialCount)}>重置</button>
      </div>
    </div>
  );
}
