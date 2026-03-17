/**
 * Header Component
 * Top navigation bar with app title and user info - Vietnamese UI
 */

import { useUserStore } from '@stores/userStore';
import { formatDateDisplay } from '@utils/date';
import messages from '@localization';

// Vietnamese day names
const DAY_NAMES = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const MONTH_NAMES = [
  'tháng 1', 'tháng 2', 'tháng 3', 'tháng 4', 'tháng 5', 'tháng 6',
  'tháng 7', 'tháng 8', 'tháng 9', 'tháng 10', 'tháng 11', 'tháng 12'
];

function formatVietnameseDate(date: Date): string {
  const dayName = DAY_NAMES[date.getDay()];
  const day = date.getDate();
  const month = MONTH_NAMES[date.getMonth()];
  return `${dayName}, ngày ${day} ${month}`;
}

export default function Header() {
  const { profile } = useUserStore();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
      <div className="flex items-center justify-between h-full px-6">
        {/* App Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <h1 className="text-lg font-semibold text-gray-900">
            {messages.app.name}
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Date */}
          <span className="text-sm text-gray-500">
            {formatVietnameseDate(new Date())}
          </span>

          {/* User */}
          {profile && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-medium text-sm">
                  {profile.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {profile.full_name}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
