import React, { useState } from 'react';
import { BrainCircuit, ChevronDown, ChevronRight, Zap, Coins, Sparkles } from 'lucide-react';
import { DeepSeekReasoningInfo } from '../../core/types';

interface DeepSeekReasoningBoxProps {
  reasoning: DeepSeekReasoningInfo;
}

export const DeepSeekReasoningBox: React.FC<DeepSeekReasoningBoxProps> = ({ reasoning }) => {
  const [isExpanded, setIsExpanded] = useState(false); // 默认折叠，保持页面简洁

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '10px',
      overflow: 'hidden',
      marginBottom: '16px',
    }}>
      {/* 极简折叠标题栏 */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: '8px 14px',
          background: 'rgba(99, 102, 241, 0.08)',
          borderBottom: isExpanded ? '1px solid var(--border-subtle)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <BrainCircuit size={14} color="#6366f1" />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
            思考过程
          </span>
          <span style={{
            fontSize: '9px',
            padding: '1px 5px',
            borderRadius: '4px',
            background: 'rgba(99, 102, 241, 0.18)',
            color: '#4f46e5',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
          }}>
            {reasoning.model === 'deepseek-reasoner' ? 'R1' : 'V3'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)' }}>
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
      </div>

      {/* 展开的思维链正文 */}
      {isExpanded && (
        <div style={{
          padding: '14px 18px',
          fontSize: '12px',
          lineHeight: 1.6,
          color: 'var(--text-main)',
          fontFamily: 'var(--font-mono)',
          whiteSpace: 'pre-wrap',
          background: 'var(--bg-surface-hover)',
          borderLeft: '3px solid #6366f1',
          margin: '8px 12px 12px 12px',
          borderRadius: '4px'
        }}>
          {reasoning.reasoningContent}
        </div>
      )}
    </div>
  );
};
