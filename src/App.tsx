/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import Editor from './components/Editor';

export default function App() {
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    // @ts-ignore
    if (window.aistudio?.hasSelectedApiKey) {
      // @ts-ignore
      window.aistudio.hasSelectedApiKey().then(setHasKey);
    } else {
      setHasKey(true);
    }
  }, []);

  const handleSelectKey = async () => {
    // @ts-ignore
    if (window.aistudio?.openSelectKey) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  if (!hasKey) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 text-white font-sans">
        <h1 className="text-4xl font-bold mb-4 tracking-tight">Image Studio Pro</h1>
        <p className="mb-8 text-zinc-400 max-w-md text-center">
          要使用高质量的图像生成和搜索功能，您需要提供来自付费 Google Cloud 项目的 Gemini API 密钥。
        </p>
        <button
          onClick={handleSelectKey}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors"
        >
          选择 API 密钥
        </button>
        <a
          href="https://ai.google.dev/gemini-api/docs/billing"
          target="_blank"
          rel="noreferrer"
          className="mt-6 text-sm text-zinc-500 hover:text-zinc-300 underline underline-offset-4"
        >
          了解有关计费的更多信息
        </a>
      </div>
    );
  }

  return <Editor />;
}

