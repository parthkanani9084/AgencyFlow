import { Reel } from '@/types';

export const groupReelsByDate = (reels: Reel[]): { date: string; reels: Reel[] }[] => {
  const groups: Record<string, Reel[]> = {};

  reels.forEach((reel) => {
    const dateStr = reel.deadline_date;
    const date = new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    if (!groups[date]) groups[date] = [];
    groups[date].push(reel);
  });

  return Object.entries(groups)
    .sort((a, b) => new Date(a[1][0].deadline_date).getTime() - new Date(b[1][0].deadline_date).getTime())
    .map(([date, reels]) => ({
      date,
      reels: reels.sort((a, b) => a.title.localeCompare(b.title)),
    }));
};
