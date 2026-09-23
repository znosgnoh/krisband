export interface RehearsalPlan {
  /** ISO datetime for the next rehearsal */
  scheduledAt: string;
  songIds: string[];
  weekly: boolean;
}
