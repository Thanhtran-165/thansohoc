/**
 * ClaimBadge Component
 * Displays a badge indicating the claim type (Calculated, Interpreted, Exploratory)
 */

import { ClaimType } from '@/types';

interface ClaimBadgeProps {
  type: ClaimType;
  confidence?: number | null;
  compact?: boolean;
}

const badgeConfig: Record<ClaimType, { label: string; bgColor: string; textColor: string; icon: string }> = {
  calculated: {
    label: 'Calculated',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
    icon: '≡',
  },
  interpreted: {
    label: 'Interpreted',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    icon: '~',
  },
  exploratory: {
    label: 'Exploratory',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    icon: '?',
  },
};

export function ClaimBadge({ type, confidence, compact = false }: ClaimBadgeProps) {
  const config = badgeConfig[type];

  if (compact) {
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.bgColor} ${config.textColor}`}
        title={`${config.label}${confidence !== null && confidence !== undefined ? ` (${(confidence * 100).toFixed(0)}% confidence)` : ''}`}
      >
        {config.icon} {config.label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.textColor}`}
    >
      <span className="font-bold">{config.icon}</span>
      <span>{config.label}</span>
      {confidence !== null && confidence !== undefined && (
        <span className="opacity-75 text-xs">
          ({(confidence * 100).toFixed(0)}%)
        </span>
      )}
    </span>
  );
}

export default ClaimBadge;
