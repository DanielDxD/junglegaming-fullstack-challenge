import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ProvablyFairDialog } from '../organisms/ProvablyFairDialog';

interface HistoryPillProps {
  multiplier: number;
  roundId?: string;
}

export const HistoryPill: React.FC<HistoryPillProps> = ({ multiplier, roundId }) => {
  const isHigh = multiplier >= 2.0;

  const pill = (
    <Badge
      variant="outline"
      className={cn(
        "font-mono px-3 py-1 text-sm font-bold border-transparent cursor-pointer transition-transform hover:scale-105 active:scale-95",
        isHigh ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
      )}
    >
      {multiplier.toFixed(2)}x
    </Badge>
  );

  if (!roundId) {
    return pill;
  }

  return (
    <ProvablyFairDialog roundId={roundId} trigger={pill} />
  );
};
