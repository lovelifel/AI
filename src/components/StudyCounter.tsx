"use client";
import { useState } from "react";

export default function StudyCounter() {
  const [count, setCount] = useState(0);

  return (
    <div>
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
        <button onClick={() => setCount(0)}>重置</button>
      </div>
    </div>
  );
}
