/**
 * Dashboard Screen
 * Main dashboard combining insight display and journal entry - Vietnamese UI
 *
 * Phase 4: Full implementation with real components
 */

import { useState, useEffect } from 'react';
import { useUserStore } from '@stores/userStore';
import { useInsightStore } from '@stores/insightStore';
import { useJournalStore } from '@stores/journalStore';
import { InsightCard } from '@components/insight';
import { JournalForm } from '@components/journal';
import { DailyInsight } from '@/types';
import messages from '@localization';

export default function Dashboard() {
  const { profile } = useUserStore();
  const { todayInsight, isLoading: insightLoading, loadTodayInsight } = useInsightStore();
  const { todayEntry, isLoading: journalLoading, loadTodayEntry } = useJournalStore();
  const [showJournalForm, setShowJournalForm] = useState(false);

  // Load today's data on mount
  useEffect(() => {
    if (profile?.id) {
      loadTodayInsight(profile.id);
      loadTodayEntry(profile.id);
    }
  }, [profile?.id, loadTodayInsight, loadTodayEntry]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {getVietnameseGreeting()}, {profile?.full_name?.split(' ')[0] || ''}
        </h1>
        <p className="text-gray-600 mt-1">
          {messages.dashboard.insightSubtitle}
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Insight - Takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {messages.dashboard.todaysInsight}
            </h2>

            {insightLoading ? (
              <InsightSkeleton />
            ) : todayInsight ? (
              <InsightCard
                insight={todayInsight}
                showFeedback={true}
                showWhyModal={true}
              />
            ) : (
              <EmptyInsightState />
            )}
          </div>
        </div>

        {/* Journal Entry - Takes 1 column */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {messages.dashboard.quickJournal}
            </h2>

            {journalLoading ? (
              <JournalSkeleton />
            ) : todayEntry && !showJournalForm ? (
              <JournalCard
                entry={todayEntry}
                onEdit={() => setShowJournalForm(true)}
              />
            ) : (
              <JournalForm
                mode="quick"
                onSuccess={() => {
                  setShowJournalForm(false);
                  if (profile?.id) {
                    loadTodayEntry(profile.id);
                  }
                }}
                onCancel={todayEntry ? () => setShowJournalForm(false) : undefined}
              />
            )}
          </div>
        </div>
      </div>

      {/* Numerology Summary */}
      <div className="mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {messages.dashboard.yourNumbers}
          </h2>
          <NumerologySummary insight={todayInsight} />
        </div>
      </div>
    </div>
  );
}

// Helper function for Vietnamese greeting
function getVietnameseGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return messages.greeting.morning;
  if (hour < 17) return messages.greeting.afternoon;
  return messages.greeting.evening;
}

// Skeleton components
function InsightSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
    </div>
  );
}

function JournalSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-20 bg-gray-200 rounded mb-4"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
  );
}

// Empty state
function EmptyInsightState() {
  return (
    <div className="text-center py-8">
      <div className="w-12 h-12 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
        <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <h3 className="text-gray-900 font-medium mb-2">{messages.dashboard.noInsight.title}</h3>
      <p className="text-gray-500 text-sm">
        {messages.dashboard.noInsight.description}
      </p>
    </div>
  );
}

// Journal Card for displaying existing entry
function JournalCard({ entry, onEdit }: { entry: any; onEdit: () => void }) {
  return (
    <div>
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <div className="text-sm text-gray-500 mb-1">{messages.dashboard.journal.mood}</div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <div
                key={n}
                className={`w-2 h-4 rounded ${
                  n <= entry.mood_score ? 'bg-primary-500' : 'bg-gray-200'
                }`}
              />
            ))}
            <span className="ml-2 text-sm font-medium text-gray-700">{entry.mood_score}</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-500 mb-1">{messages.dashboard.journal.energy}</div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <div
                key={n}
                className={`w-2 h-4 rounded ${
                  n <= entry.energy_score ? 'bg-amber-500' : 'bg-gray-200'
                }`}
              />
            ))}
            <span className="ml-2 text-sm font-medium text-gray-700">{entry.energy_score}</span>
          </div>
        </div>
      </div>
      {entry.emotions?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {entry.emotions.map((emotion: string) => (
            <span
              key={emotion}
              className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full"
            >
              {emotion}
            </span>
          ))}
        </div>
      )}
      {entry.reflection_text && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {entry.reflection_text}
        </p>
      )}
      <button
        onClick={onEdit}
        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
      >
        {messages.dashboard.journal.editEntry}
      </button>
    </div>
  );
}

// Numerology Summary with real data from insight
function NumerologySummary({ insight }: { insight: DailyInsight | null }) {
  // Get cyclic numbers from insight or show placeholders
  const numbers = [
    { label: messages.dashboard.numerology.personalDay, value: insight?.personal_day ?? '?' },
    { label: messages.dashboard.numerology.personalMonth, value: insight?.personal_month ?? '?' },
    { label: messages.dashboard.numerology.personalYear, value: insight?.personal_year ?? '?' },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {numbers.map((num) => (
        <div
          key={num.label}
          className="text-center p-4 bg-gray-50 rounded-lg"
        >
          <div className="text-2xl font-bold text-primary-600 mb-1">
            {num.value}
          </div>
          <div className="text-xs text-gray-500">{num.label}</div>
        </div>
      ))}
    </div>
  );
}
