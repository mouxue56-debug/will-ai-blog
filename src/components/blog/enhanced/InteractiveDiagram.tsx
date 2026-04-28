'use client';

import { useState } from 'react';

interface NodeData {
  id: string;
  title: string;
  description: string;
  color: string;
  details: string[];
}

const nodes: NodeData[] = [
  {
    id: 'yuki',
    title: 'ユキ (yuki)',
    description: '技术顾问 · M4 Mac mini',
    color: '#00D4FF',
    details: ['Port: 18789', '主实例', '技术工程', '代码开发']
  },
  {
    id: 'natsu',
    title: 'ナツ (natsu)',
    description: 'SNS运营 · M4 Mac mini',
    color: '#FF8C42',
    details: ['Port: 18790', '内容创作', '品牌传播', '同机 loopback']
  },
  {
    id: 'haru',
    title: 'ハル (haru)',
    description: '生活助理 · M2 Mac mini',
    color: '#A78BFA',
    details: ['Port: 18789', '猫舍客服', '医院助理', 'SSH 远程']
  },
  {
    id: 'aki',
    title: 'アキ (aki)',
    description: '随身助理 · MacBook Pro',
    color: '#34D399',
    details: ['Port: 18789', '移动场景', 'Tailscale', 'Will 外出']
  },
  {
    id: 'hermes',
    title: 'Hermes',
    description: '主脑 · CLI 助手',
    color: '#FBBF24',
    details: ['YAML config', 'MCP servers', '多 provider', '日常 coding']
  },
  {
    id: 'clawmem',
    title: 'clawmem',
    description: '共享记忆 · Obsidian',
    color: '#EC4899',
    details: ['语义搜索', '自动 curate', 'Git + Dream Cycle', '每晚 03:00 同步']
  }
];

export function InteractiveDiagram() {
  const [activeNode, setActiveNode] = useState<string | null>('yuki');

  const activeData = nodes.find(n => n.id === activeNode);

  return (
    <div className="my-8 p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-xl border border-cyan-500/20">
      <h3 className="text-lg font-semibold text-cyan-400 mb-4 text-center">
        🧠 六 AI 实例共享大脑架构
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {nodes.map((node) => (
          <button
            key={node.id}
            onClick={() => setActiveNode(node.id)}
            className={`p-3 rounded-lg border transition-all duration-200 text-left
              ${activeNode === node.id 
                ? 'border-cyan-400 bg-cyan-500/10 scale-105' 
                : 'border-slate-600 bg-slate-800/50 hover:border-cyan-500/50'
              }`}
            style={{ borderColor: activeNode === node.id ? node.color : undefined }}
          >
            <div className="text-sm font-medium text-slate-100">{node.title}</div>
            <div className="text-xs text-slate-400 mt-1">{node.description}</div>
          </button>
        ))}
      </div>

      {activeData && (
        <div className="p-4 bg-slate-800/80 rounded-lg border border-slate-600 animate-fadeIn">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: activeData.color }}
            />
            <h4 className="font-semibold text-slate-100">{activeData.title}</h4>
          </div>
          <p className="text-sm text-slate-400 mb-3">{activeData.description}</p>
          <ul className="space-y-1">
            {activeData.details.map((detail, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                <span className="w-1 h-1 bg-cyan-400 rounded-full" />
                {detail}
              </li>
            ))}
          </ul>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-fadeIn { animation: none; }
        }
      `}</style>
    </div>
  );
}
