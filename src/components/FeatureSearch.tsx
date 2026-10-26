"use client";
import type { Feature } from "@/types/feature";
import FeatureItem from "@/components/FeatureItem";
import { useState } from "react";

type FeatureSearchProps = {
  features: Feature[];
};

export default function FeatureSearch({ features }: FeatureSearchProps) {
  const [keyword, setKeyword] = useState("");
  const filteredFeatures = features.filter((feature) =>
    feature.title.toLowerCase().includes(keyword.toLowerCase().trim()),
  );
  return (
    <div>
      <label htmlFor="feature-search">搜索功能</label>
      <input
        id="feature-search"
        className="w-full max-w-md rounded-md border border-zinc-400 bg-white px-3 py-2 text-lg leading-8 text-zinc-950 placeholder:text-zinc-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-zinc-500 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400"
        type="text"
        placeholder="搜索功能"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
      />
      <button type="button" onClick={() => setKeyword("")}>
        清空
      </button>
      <p>找到 {filteredFeatures.length} 项能力</p>
      {filteredFeatures.length > 0 ? (
        <ul>
          {filteredFeatures.map((feature) => (
            <FeatureItem key={feature.id} title={feature.title} description={feature.description} />
          ))}
        </ul>
      ) : (
        <div>
          <p>没有匹配的能力</p>
        </div>
      )}
    </div>
  );
}
