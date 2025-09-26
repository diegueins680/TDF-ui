
import { patch } from './client';
import type { PipelineCard } from './types';

// Hook point: when backend exposes endpoints, call them here.
// Example PATCH: /pipelines/:type/:id { stage }
export async function updateStage(card: PipelineCard, newStage: string) {
  try {
    await patch<void>(`/pipelines/${card.type.toLowerCase()}/${card.id}`, { stage: newStage });
  } catch (e) {
    // Degrade gracefully in dev if endpoint is not present yet
    console.warn('Pipeline API not available yet; keeping local state only.');
  }
}
