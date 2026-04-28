'use client';

import { ReactNode } from 'react';

interface WorkflowStep {
  num: string;
  text: ReactNode;
}

interface WorkflowProps {
  title: string;
  steps: WorkflowStep[];
}

export function Workflow({ title, steps }: WorkflowProps) {
  return (
    <div className="my-5 bg-[#0D1825] border border-[rgba(0,212,255,0.12)] rounded-[14px] p-6">
      <div className="text-[#00D4FF] font-bold text-sm mb-4 flex items-center gap-2">
        {title}
      </div>
      {steps.map((step, i) => (
        <div key={i} className="flex gap-4 mb-3.5 items-start">
          <div className="bg-gradient-to-br from-[#00D4FF] to-[#FF8C42] text-[#0A1420] w-[26px] h-[26px] rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0">
            {step.num}
          </div>
          <div className="text-[rgba(232,244,248,0.85)] text-sm flex-1">
            {step.text}
          </div>
        </div>
      ))}
    </div>
  );
}
