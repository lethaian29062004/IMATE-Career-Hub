import React from 'react';
import { Eye, Bookmark, MessageCircle } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';

interface QuestionContributedCardProps {
  id: number;
  title: string;
  description: string;
  author: string;
  company: string;
  difficulty?: string;
  timeAgo: string;
  skills: string[];
  position: string;
  level: string;
  rating: number; // 1-5
  isSaved?: boolean;
  commentCount?: number;
  statusLabel?: string;
  statusType?: "active" | "pending" | "error" | "inactive" | "draft";
  onView?: () => void;
  onSave?: () => void;
}

const QuestionContributedCard: React.FC<QuestionContributedCardProps> = ({
  title,
  description,
  author,
  company,
  timeAgo,
  skills,
  position,
  rating,
  isSaved = false,
  commentCount,
  statusLabel,
  statusType = 'inactive',
  onView,
  onSave,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // const getLevelStatus = (level: string): "active" | "pending" | "error" | "inactive" | "draft" => {
  //   const levelLower = level.toLowerCase();
  //   if (levelLower === 'intern' || levelLower === 'fresher') return 'active';
  //   if (levelLower === 'junior' || levelLower === 'middle') return 'pending';
  //   if (levelLower === 'senior') return 'error';
  //   return 'inactive';
  // };
  // const getDifficultyStatus = (difficultyText: string | undefined): "active" | "pending" | "error" | "inactive" | "draft" => {
  //   const difficultyLower = (difficultyText || '').toLowerCase();
  //   if (!difficultyLower) return 'inactive';
  //   if (difficultyLower === 'easy') return 'active';
  //   if (difficultyLower === 'medium') return 'pending';
  //   if (difficultyLower === 'hard') return 'error';
  //   return 'inactive';
  // };

  const renderStars = () => {
    return Array.from({ length: 3 }, (_, index) => {
      let colorClass = 'text-slate-600';
      if (index < rating) {
        if (rating === 1) colorClass = 'text-green-500 fill-current';
        else if (rating === 2) colorClass = 'text-yellow-500 fill-current';
        else if (rating >= 3) colorClass = 'text-red-500 fill-current';
      }
      return (
        <span
          key={index}
          className={`material-symbols-outlined text-sm ${colorClass}`}
        >
          star
        </span>
      );
    });
  };

  return (
    <div className="bg-[#1e293b]/40 backdrop-blur-sm p-6 rounded-2xl border border-white/5 hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300 group">
      {/* Header: Author & Company */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-sm font-bold text-indigo-400">
            {getInitials(author)}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{author}</p>
            <p className="text-xs text-slate-500">
              Đăng bởi {author} • {timeAgo}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {statusLabel && (
            <StatusBadge status={statusType}>{statusLabel}</StatusBadge>
          )}
          <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-400">
            {company}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors cursor-pointer">
        {title}
      </h3>

      {/* Description */}
      <p className="text-slate-400 text-sm mb-4 line-clamp-2">{description}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {skills.slice(0, 3).map((skill, idx) => (
          <StatusBadge key={idx} status="inactive">
            {skill}
          </StatusBadge>
        ))}
        <StatusBadge status="draft">{position}</StatusBadge>
      </div>

      {/* Footer: Rating & Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center gap-4">
          {/* Star Rating */}
          <div className="flex items-center gap-1">{renderStars()}</div>

          {/* Save Button */}
          {onSave && (
            <button
              onClick={onSave}
              className={`flex items-center gap-1 transition-colors text-xs ${isSaved ? 'text-yellow-400 hover:text-yellow-300' : 'text-slate-500 hover:text-yellow-400'
                }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              {isSaved ? 'Đã lưu' : 'Lưu'}
            </button>
          )}

          {typeof commentCount === 'number' && commentCount > 1 && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <MessageCircle className="w-4 h-4" />
              <span>{commentCount} bình luận</span>
            </div>
          )}
        </div>

        {/* View Detail Button */}
        <button
          onClick={onView}
          className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all border border-white/10 flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Xem chi tiết
        </button>
      </div>
    </div>
  );
};

export default QuestionContributedCard;
