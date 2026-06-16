import type { CropCalendarDetails, ScheduledActivity } from '@/types/booking';
import { addLocalDays, parseLocalIsoDate, toLocalIsoDate } from '@/lib/date';

function midpointDate(startDate: string, endDate: string, ratio: number): string {
  const start = parseLocalIsoDate(startDate).getTime();
  const end = parseLocalIsoDate(endDate).getTime();
  const mid = start + (end - start) * ratio;
  return toLocalIsoDate(new Date(mid));
}

/** Client-side draft schedule until the AI calendar endpoint is available. */
export function generateCropCalendarSchedule(
  details: Pick<CropCalendarDetails, 'startDate' | 'endDate' | 'cropName' | 'season'>,
): ScheduledActivity[] {
  const { startDate, endDate, cropName, season } = details;

  return [
    { name: 'Sowing', date: startDate },
    { name: '1st Irrigation', date: addLocalDays(startDate, 14) },
    {
      name: season === 'Rabi' ? 'Fertilizer (DAP)' : 'Fertilizer (Urea)',
      date: midpointDate(startDate, endDate, 0.28),
    },
    { name: 'Pest watch', date: midpointDate(startDate, endDate, 0.55) },
    { name: `Harvest · ${cropName}`, date: endDate },
  ];
}
