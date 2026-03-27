/**
 * ClaimBadge Component
 * Displays a badge indicating the claim type (Calculated, Interpreted, Exploratory) - Vietnamese UI
 */

import { ClaimType } from '@/types';
import messages from '@localization';

interface ClaimBadgeProps {
  type: ClaimType;
  confidence?: number | null;
  compact?: boolean;
}

const getBadgeConfig = (type: ClaimType) => {
  const configs = {
    calculated: {
      label: messages.claimTypes.calculated,
      bgColor: 'bg-emerald-400/12 border border-emerald-300/20',
      textColor: 'text-emerald-200',
      icon: '≡',
    },
    interpreted: {
      label: messages.claimTypes.interpreted,
      bgColor: 'bg-sky-400/12 border border-sky-300/20',
      textColor: 'text-sky-200',
      icon: '~',
    },
    exploratory: {
      label: messages.claimTypes.exploratory,
      bgColor: 'bg-violet-400/12 border border-violet-300/20',
      textColor: 'text-violet-200',
      icon: '?',
    },
  };
  return configs[type];
};

export function ClaimBadge({ type, confidence, compact = false }: ClaimBadgeProps) {
  const config = getBadgeConfig(type);

  if (compact) {
    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.bgColor} ${config.textColor}`}
        title={`${config.label}${confidence !== null && confidence !== undefined ? ` (${(confidence * 100).toFixed(0)}% ${messages.claimTypes.confidence})` : ''}`}
      >
        {config.icon} {config.label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${config.bgColor} ${config.textColor}`}
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
