import { useMemo, useSyncExternalStore } from 'react';
import type { PipelineCard } from '../../api/types';

export type PipelineBoardCard = PipelineCard & {
  partyId?: number;
  clientName?: string;
};

export const MIXING_STAGES = ['Brief','Prep','v1 Sent','Revisions','Approved','Delivered'] as const;
export const MASTERING_STAGES = ['Brief','v1','Revisions','Approved','DDP Delivered'] as const;

const INITIAL_CARDS: PipelineBoardCard[] = [
  { id: 'mx-1', title: 'Arkabuz - Single A', artist: 'Arkabuz', type: 'Mixing', stage: 'Brief', clientName: 'Arkabuz' },
  { id: 'mx-2', title: 'Quimika - EP', artist: 'Quimika Soul', type: 'Mixing', stage: 'Prep', clientName: 'Quimika Soul' },
  { id: 'ma-1', title: 'Skanka Fe - LP', artist: 'Skanka Fe', type: 'Mastering', stage: 'v1', clientName: 'Skanka Fe' },
  { id: 'ma-2', title: 'El Bloque - Single', artist: 'El Bloque', type: 'Mastering', stage: 'Approved', clientName: 'El Bloque' },
];

let cards: PipelineBoardCard[] = [...INITIAL_CARDS];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return cards;
}

export function usePipelineCards() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function findPipelineCard(cardId: string) {
  return cards.find(card => card.id === cardId);
}

export function updatePipelineCardStage(cardId: string, newStage: string) {
  let updated: PipelineBoardCard | undefined;
  cards = cards.map(card => {
    if (card.id === cardId) {
      updated = { ...card, stage: newStage };
      return updated;
    }
    return card;
  });
  if (updated) {
    emit();
  }
  return updated;
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function usePipelineCardsForParty(
  party: { partyId?: number | null; displayName?: string | null } | null,
) {
  const allCards = usePipelineCards();
  return useMemo(() => {
    if (!party) {
      return [] as PipelineBoardCard[];
    }
    const id = party.partyId ?? null;
    const displayName = (party.displayName ?? '').trim();
    const normalizedName = displayName ? normalize(displayName) : '';

    return allCards.filter(card => {
      if (id && card.partyId && card.partyId === id) {
        return true;
      }
      if (!normalizedName) {
        return false;
      }
      const candidates = [card.clientName, card.artist, card.title];
      return candidates.some(candidate => {
        if (!candidate) return false;
        const normalizedCandidate = normalize(candidate);
        return (
          normalizedCandidate.includes(normalizedName) ||
          normalizedName.includes(normalizedCandidate)
        );
      });
    });
  }, [allCards, party?.partyId, party?.displayName]);
}

export function resetPipelineCards(next?: PipelineBoardCard[]) {
  cards = next ? [...next] : [...INITIAL_CARDS];
  emit();
}
