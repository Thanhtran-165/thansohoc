/**
 * InsightLayerContent Component
 * Displays the content of an insight layer with proper claim highlighting
 */

import { useState, useMemo, Fragment } from 'react';
import { ClaimBadge } from './ClaimBadge';
import { Claim, ClaimType } from '@/types';
import messages from '@localization';

interface InsightLayerContentProps {
  content: string;
  claims: Claim[];
  showClaimHighlights?: boolean;
}

const claimTypeConfig: Record<ClaimType, { pattern: RegExp; color: string }> = {
  calculated: {
    pattern: /\[Calculated\]/g,
    color: 'bg-blue-100 text-blue-800',
  },
  interpreted: {
    pattern: /\[Interpreted\]/g,
    color: 'bg-purple-100 text-purple-800',
  },
  exploratory: {
    pattern: /\[Exploratory\]/g,
    color: 'bg-amber-100 text-amber-800',
  },
};

export function InsightLayerContent({
  content,
  claims,
  showClaimHighlights = true,
}: InsightLayerContentProps) {
  const [expandedClaim, setExpandedClaim] = useState<string | null>(null);

  // Parse content into segments based on claim markers
  const segments = useMemo(() => {
    const result: Array<{ type: ClaimType | null; text: string; rawText: string }> = [];

    // Create a regex that matches any claim marker
    const markerPattern = /\[(Calculated|Interpreted|Exploratory)\]\s*/g;

    // Split content by markers
    const parts = content.split(markerPattern);
    const markers = content.match(markerPattern) || [];

    // First part is any text before the first marker
    if (parts.length > 0 && parts[0].trim()) {
      result.push({ type: null, text: parts[0].trim(), rawText: parts[0].trim() });
    }

    // Add marked segments
    markers.forEach((marker, index) => {
      const type = marker.replace(/[\[\]]/g, '').toLowerCase() as ClaimType;
      const text = parts[index + 1]?.trim() || '';
      if (text) {
        result.push({ type, text, rawText: `[${type.charAt(0).toUpperCase() + type.slice(1)}] ${text}` });
      }
    });

    return result;
  }, [content]);

  // Find claim data for a segment
  const getClaimData = (text: string): Claim | undefined => {
    // Find matching claim by comparing text (without marker prefix)
    const textWithoutMarker = text.replace(/\[(Calculated|Interpreted|Exploratory)\]\s*/, '');
    return claims.find(claim =>
      claim.text.includes(textWithoutMarker) || textWithoutMarker.includes(claim.text.replace(/\[.*?\]\s*/, ''))
    );
  };

  // Render a single segment
  const renderSegment = (segment: { type: ClaimType | null; text: string; rawText: string }, index: number) => {
    if (segment.type === null) {
      // Non-claim text
      return <span key={index}>{segment.text} </span>;
    }

    const claimData = getClaimData(segment.rawText);
    const config = claimTypeConfig[segment.type];
    const isExpanded = expandedClaim === segment.rawText;

    if (!showClaimHighlights) {
      // Render plain text without highlighting
      return (
        <span key={index} className="inline">
          <ClaimBadge type={segment.type} confidence={claimData?.confidence} />
          <span className="ml-1">{segment.text}</span>
        </span>
      );
    }

    return (
      <span key={index} className="inline">
        <button
          onClick={() => setExpandedClaim(isExpanded ? null : segment.rawText)}
          className={`rounded px-2 py-0.5 text-sm transition-colors ${config.color} hover:opacity-80`}
        >
          <ClaimBadge type={segment.type} confidence={claimData?.confidence} />
        </button>
        <span className="ml-1">{segment.text}</span>
        {isExpanded && claimData && (
          <span className="ml-2 text-xs text-gray-500">
            ({messages.claimTypes.confidence}: {(claimData.confidence * 100).toFixed(1)}%)
          </span>
        )}
      </span>
    );
  };

  return (
    <div className="text-gray-700 leading-relaxed">
      <p className="whitespace-pre-wrap">
        {segments.map((segment, index) => (
          <Fragment key={index}>
            {renderSegment(segment, index)}
            {index < segments.length - 1 && segment.type !== null && <span> </span>}
          </Fragment>
        ))}
      </p>
    </div>
  );
}

export default InsightLayerContent;
