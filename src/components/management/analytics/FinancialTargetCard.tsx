import React, { useState } from 'react';
import { toPersianDigits } from '../../../utils/dateUtils';
import { Target, Trophy, Sparkles, Edit3, Check, ArrowRight } from 'lucide-react';

interface FinancialTargetCardProps {
  currentRevenue: number;
  targetAmount: number;
  achievedPct: number;
  remainingAmount: number;
  isTargetMet: boolean;
  periodLabel: string;
  onUpdateTarget: (newTarget: number) => void;
}

export const FinancialTargetCard: React.FC<FinancialTargetCardProps> = ({
  currentRevenue,
  targetAmount,
  achievedPct,
  remainingAmount,
  isTargetMet,
  periodLabel,
  onUpdateTarget,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [customInput, setCustomInput] = useState(targetAmount.toString());

  const handleSave = () => {
    const val = parseInt(customInput, 10);
    if (!isNaN(val) && val > 0) {
      onUpdateTarget(val);
    }
    setIsEditing(false);
  };

  return (
    <div className="bg-gradient-to-br from-[#151518] to-[#101012] border border-[#2b281f] rounded-2xl p-4 sm:p-5 text-white shadow-xl relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-0 left-0 w-72 h-40 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10 mb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2a2417] to-[#1c1912] border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
            {isTargetMet ? <Trophy className="w-5 h-5 text-emerald-400" /> : <Target className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-stone-100 text-sm sm:text-base">
                هدف مالی {periodLabel} آتلیه
              </h3>
              {isTargetMet && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <Sparkles className="w-3 h-3" /> هدف محقق شد
                </span>
              )}
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              میزان درآمد محقق‌شده نسبت به بودجه برنامه‌ریزی‌شده
            </p>
          </div>
        </div>

        {/* Target Amount Edit / Display */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {isEditing ? (
            <div className="flex items-center gap-1.5 bg-[#1f1f25] p-1 rounded-xl border border-[#d4af37]">
              <span className="text-stone-400 text-xs px-1">$</span>
              <input
                type="number"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="w-24 bg-transparent text-sm text-stone-100 font-bold focus:outline-none"
                autoFocus
              />
              <button
                onClick={handleSave}
                className="p-1 bg-[#d4af37] text-stone-950 rounded-lg font-bold hover:bg-[#c5a028] transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setCustomInput(targetAmount.toString());
                setIsEditing(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1c1a14] hover:bg-[#25221a] border border-[#3d3725] rounded-xl text-xs text-[#d4af37] font-medium transition-colors"
            >
              <span>تارگت: ${toPersianDigits(targetAmount.toLocaleString())}</span>
              <Edit3 className="w-3 h-3 text-stone-400" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar & Indicators */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-stone-300 font-semibold">
              درآمد تحقق‌یافته: ${toPersianDigits(currentRevenue.toLocaleString())}
            </span>
          </div>
          <div className="text-xs font-bold text-[#d4af37]">
            ٪{toPersianDigits(achievedPct)} پیشرفت
          </div>
        </div>

        {/* Bar */}
        <div className="w-full h-3.5 bg-[#1c1c22] rounded-full overflow-hidden p-0.5 border border-[#2d2d38]">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isTargetMet
                ? 'bg-gradient-to-r from-[#d4af37] to-emerald-400'
                : 'bg-gradient-to-r from-[#8a7228] to-[#d4af37]'
            }`}
            style={{ width: `${Math.min(100, Math.max(3, achievedPct))}%` }}
          />
        </div>

        {/* Footer Sub-stats */}
        <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
          <span>
            {isTargetMet ? (
              <span className="text-emerald-400 font-medium">
                فراتر از تارگت: +${toPersianDigits((currentRevenue - targetAmount).toLocaleString())}
              </span>
            ) : (
              <span>
                مانده تا تحقق کامل: <strong className="text-stone-200 font-bold">${toPersianDigits(remainingAmount.toLocaleString())}</strong>
              </span>
            )}
          </span>
          <span>بودجه مصوب: ${toPersianDigits(targetAmount.toLocaleString())}</span>
        </div>
      </div>
    </div>
  );
};
