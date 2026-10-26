"use client";

import { useState } from "react";
import StudyCounter from "@/components/StudyCounter";

export default function CounterListDemo() {
  const [studyCounters, setStudyCounters] = useState([
    {
      id: 1,
      title: "React 练习",
    },
    {
      id: 2,
      title: "TypeScript 练习",
      initialCount: 5,
    },
    {
      id: 3,
      title: "状态管理练习",
      initialCount: 10,
    },
  ]);
  return (
    <div>
      <ul className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
        {studyCounters.map((studyCounter) => (
          <li key={studyCounter.id}>
            <StudyCounter
              title={studyCounter.title}
              initialCount={studyCounter.initialCount}
            />
          </li>
        ))}
      </ul>
      <button
        onClick={() => {
          setStudyCounters(studyCounters.toReversed());
        }}
      >
        反转数组
      </button>
    </div>
  );
}
