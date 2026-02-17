/**
 * Data helpers for plens.barcelona
 * Loads and cross-references all JSON data sources.
 * Now uses intervencions_annotated.json as primary source.
 */

import annotatedData from '../data/intervencions_annotated.json';
import interventionsRaw from '../data/intervencions.json';
import plenarisData from '../data/plenaris.json';
import regidorsData from '../data/regidors.json';
import tagsData from '../data/tags.json';

// --- Types ---
export interface Intervention {
  id: string;
  session_id: string;
  session_date: string;
  session_title: string;
  speaker_code: string;
  speaker_name: string;
  speaker_party: string;
  speaker_role: string;
  text: string;
  annotated_text?: string;
  start_time: string;
  start_seconds: number;
  end_seconds: number;
  duration: number;
  agenda_item_number?: string;
  agenda_item_title?: string;
  tags?: { code: number; name: string }[];
  polarization?: number;
  hate_speech?: boolean;
  from_agenda: boolean;
}

export interface AgendaItemAnnotation {
  title: string;
  agenda_summary: string;
  party_positions: Record<string, string>;
}

export interface AnnotatedSession {
  session_id: string;
  session_title: string;
  session_date: string;
  agenda_items: AgendaItemAnnotation[];
  interventions: { id: string; annotated_text: string }[];
}

export interface Session {
  title: string;
  date: string;
  video_url: string;
  documents: { name: string; url: string }[];
}

export interface Regidor {
  name: string;
  party: string;
  party_logo: string;
  photo: string;
  salary: string | null;
  dedication: string;
  email: string | null;
  social_media: Record<string, string>;
  links: Record<string, string>;
  last_update: string;
}

export interface Tag {
  code: number;
  name: string;
  description: string;
}

// --- Parse annotated data ---
const annotatedSessions: Record<string, AnnotatedSession> = (annotatedData as any).sessions;

// Build a lookup of annotated texts by intervention id
const annotatedTextMap = new Map<string, string>();
for (const session of Object.values(annotatedSessions)) {
  for (const int of session.interventions) {
    annotatedTextMap.set(int.id, int.annotated_text);
  }
}

// Flatten interventions from original JSON and merge with annotations
const allInterventions: Intervention[] = (interventionsRaw as any[]).map(i => ({
  ...i,
  annotated_text: annotatedTextMap.get(i.id) || undefined,
}));

const annotatedSessionIds = new Set(Object.keys(annotatedSessions));
const interventionsFiltered = allInterventions;

// --- Data Access ---
export const interventions: Intervention[] = interventionsFiltered;
// Filter sessions to only those that are annotated
export const sessions: Session[] = (plenarisData as Session[]).filter(s =>
  annotatedSessionIds.has(generateSessionId(s.date, s.video_url))
);
export const regidors: Regidor[] = (regidorsData as any).regidors as Regidor[];
export const tags: Tag[] = tagsData as Tag[];

// --- Helpers ---

/** Genera un slug a partir d'un nom */
export function slugify(name: string | null | undefined): string {
  if (!name) return 'unknown';
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Obté l'ID YouTube d'una URL d'embed */
export function getYouTubeId(url: string): string {
  const match = url.match(/embed\/([^?&]+)/);
  return match ? match[1] : '';
}

/** Genera un session_id a partir de la data i la URL de vídeo */
export function generateSessionId(date: string, videoUrl: string): string {
  const parts = date.split('/');
  const dateFormatted = `${parts[2]}-${parts[1]}-${parts[0]}`;
  const ytId = getYouTubeId(videoUrl);
  return `${dateFormatted}_${ytId}`;
}

/** Retorna la classe CSS del badge del partit */
export function partyClass(party: string | null | undefined): string {
  if (!party) return 'badge--other';
  const p = party.toLowerCase();
  if (p.includes('psc')) return 'badge--psc';
  if (p.includes('junts')) return 'badge--junts';
  if (p.includes('comú') || p.includes('comu')) return 'badge--bcomu';
  if (p.includes('erc')) return 'badge--erc';
  if (p === 'pp' || p.includes('popular')) return 'badge--pp';
  if (p.includes('vox')) return 'badge--vox';
  return 'badge--other';
}

/** Retorna la classe CSS del badge de polarització */
export function polClass(level: number | undefined): string {
  if (!level) return '';
  return `badge--pol-${level}`;
}

/** Etiqueta de polarització */
export function polLabel(level: number | undefined): string {
  switch (level) {
    case 1: return 'Unanimitat';
    case 2: return 'Acord majoritari';
    case 3: return 'Desacord';
    case 4: return 'Polarització màxima';
    default: return '';
  }
}

/** Emoji de polarització */
export function polEmoji(level: number | undefined): string {
  switch (level) {
    case 1: return '🟢';
    case 2: return '🟡';
    case 3: return '🟠';
    case 4: return '🔴';
    default: return '';
  }
}

/** Obté intervencions per sessió */
export function getInterventionsBySession(sessionId: string): Intervention[] {
  return interventions.filter(i => i.session_id === sessionId);
}

/** Obté intervencions per regidor */
export function getInterventionsBySpeaker(name: string): Intervention[] {
  return interventions.filter(i => i.speaker_name === name);
}

/** Obté intervencions per tag */
export function getInterventionsByTag(code: number): Intervention[] {
  return interventions.filter(i => i.tags?.some(t => t.code === code));
}

/** Agrupar intervencions per punt de l'ordre del dia */
export function groupByAgendaItem(items: Intervention[]): Map<string, Intervention[]> {
  const map = new Map<string, Intervention[]>();
  for (const item of items) {
    const key = item.agenda_item_title || 'Sense punt';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  return map;
}

/** Obté la sessió anotada amb resums i posicions */
export function getAnnotatedSession(sessionId: string): AnnotatedSession | undefined {
  return annotatedSessions[sessionId];
}

/** Obté l'anotació d'un punt de l'ordre del dia */
export function getAgendaAnnotation(sessionId: string, agendaTitle: string): AgendaItemAnnotation | undefined {
  const session = annotatedSessions[sessionId];
  if (!session) return undefined;
  return session.agenda_items.find(a => a.title === agendaTitle);
}

/** Rhetoric tag metadata */
export const RHETORIC_TAGS = {
  // New simplified taxonomy
  'fr-proposta': { label: 'Proposta', layer: 'rhetoric', color: '#2E7D32', emoji: '🟢' }, // Green
  'fr-ideologia': { label: 'Ideologia', layer: 'rhetoric', color: '#6A1B9A', emoji: '🟣' }, // Purple
  'fr-dada': { label: 'Dada', layer: 'rhetoric', color: '#1565C0', emoji: '🔵' },     // Blue
  'fr-atac': { label: 'Atac', layer: 'rhetoric', color: '#C62828', emoji: '🔴' },     // Red
} as const;

export type RhetoricTagName = keyof typeof RHETORIC_TAGS;

/**
 * Converts annotated_text with <fr-*> tags to HTML with styled spans.
 * Returns safe HTML string.
 */
export function renderAnnotatedText(text: string): string {
  if (!text) return '';
  // Escape HTML first (but preserve our fr-* tags)
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Now restore our fr-* tags as styled spans
  for (const [tag, meta] of Object.entries(RHETORIC_TAGS)) {
    const openRegex = new RegExp(`&lt;${tag}&gt;`, 'g');
    const closeRegex = new RegExp(`&lt;/${tag}&gt;`, 'g');
    html = html.replace(openRegex, `<span class="rh rh--${tag}" data-rh-layer="${meta.layer}" data-rh-tag="${tag}" title="${meta.emoji} ${meta.label}">`);
    html = html.replace(closeRegex, '</span>');
  }

  return html;
}

/** Fragment retòric extret */
export interface RhetoricFragment {
  tag: RhetoricTagName;
  label: string;
  emoji: string;
  color: string;
  text: string;
  speaker_name: string;
  speaker_party: string;
  session_id: string;
  session_date: string;
  session_title: string;
  intervention_anchor: string;
  topics: { code: number; name: string }[];
}

/** Extreu tots els fragments retòrics de totes les intervencions */
export function extractRhetoricFragments(): RhetoricFragment[] {
  const fragments: RhetoricFragment[] = [];
  const tagNames = Object.keys(RHETORIC_TAGS) as RhetoricTagName[];

  for (const intervention of interventions) {
    if (!intervention.annotated_text) continue;

    const session = findSession(intervention.session_id);
    const anchor = getInterventionAnchor(intervention);

    for (const tag of tagNames) {
      const regex = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'g');
      let match;
      while ((match = regex.exec(intervention.annotated_text)) !== null) {
        const meta = RHETORIC_TAGS[tag];
        fragments.push({
          tag,
          label: meta.label,
          emoji: meta.emoji,
          color: meta.color,
          text: match[1].trim(),
          speaker_name: intervention.speaker_name,
          speaker_party: intervention.speaker_party,
          session_id: intervention.session_id,
          session_date: intervention.session_date,
          session_title: intervention.session_title,
          intervention_anchor: `/sessions/${intervention.session_id}/#${anchor}`,
          topics: intervention.tags || [],
        });
      }
    }
  }

  return fragments;
}

/** Obté sessions amb les seves intervencions comptades (only annotated) */
export function getSessionsWithStats() {
  // Only return sessions that exist in annotated data
  return sessions
    .map(s => {
      const sessionId = generateSessionId(s.date, s.video_url);
      if (!annotatedSessionIds.has(sessionId)) return null;

      const sessionInterventions = getInterventionsBySession(sessionId);
      const agendaItems = new Set(sessionInterventions.map(i => i.agenda_item_title).filter(Boolean));
      const annotated = getAnnotatedSession(sessionId);

      // Polarisation average
      const polValues = sessionInterventions.filter(i => i.polarization).map(i => i.polarization!);
      const avgPol = polValues.length > 0 ? Math.round(polValues.reduce((a, b) => a + b, 0) / polValues.length) : 0;

      const hasHateSpeech = sessionInterventions.some(i => i.hate_speech);

      // Count rhetoric tags
      const allAnnotatedText = sessionInterventions.map(i => i.annotated_text || '').join(' ');
      const tagCount = (allAnnotatedText.match(/<fr-[a-z]+>/g) || []).length;

      return {
        ...s,
        sessionId,
        interventionCount: sessionInterventions.length,
        agendaItemCount: agendaItems.size,
        avgPolarization: avgPol,
        hasHateSpeech,
        rhetoricTagCount: tagCount,
        hasAgendaSummaries: (annotated?.agenda_items?.filter(a => a.agenda_summary).length || 0) > 0,
      };
    })
    .filter(Boolean) as any[];
}

/** Obté regidors amb estadístiques */
export function getRegidorsWithStats() {
  return regidors.map(r => {
    const myInterventions = getInterventionsBySpeaker(r.name);
    const mySessions = new Set(myInterventions.map(i => i.session_id));
    return {
      ...r,
      slug: slugify(r.name),
      interventionCount: myInterventions.length,
      sessionCount: mySessions.size,
    };
  }).sort((a, b) => b.interventionCount - a.interventionCount);
}

/** Obté tags amb estadístiques */
export function getTagsWithStats() {
  return tags.map(t => {
    const tagInterventions = getInterventionsByTag(t.code);
    const polValues = tagInterventions.filter(i => i.polarization).map(i => i.polarization!);
    const avgPol = polValues.length > 0 ? +(polValues.reduce((a, b) => a + b, 0) / polValues.length).toFixed(1) : 0;
    return {
      ...t,
      interventionCount: tagInterventions.length,
      avgPolarization: avgPol,
    };
  }).sort((a, b) => b.interventionCount - a.interventionCount);
}

/** Timestamp per link de YouTube */
export function youtubeTimestamp(videoUrl: string, seconds: number): string {
  const ytId = getYouTubeId(videoUrl);
  return `https://www.youtube.com/watch?v=${ytId}&t=${Math.floor(seconds)}s`;
}

/** Trobar la sessió d'una intervenció */
export function findSession(sessionId: string): Session | undefined {
  return sessions.find(s => generateSessionId(s.date, s.video_url) === sessionId);
}

/** Trobar regidor pel nom */
export function findRegidor(name: string): Regidor | undefined {
  return regidors.find(r => r.name === name);
}

/** Calcula l'ancla (#int-N) d'una intervenció dins la seva sessió */
export function getInterventionAnchor(intervention: Intervention): string {
  const sessionItems = getInterventionsBySession(intervention.session_id);
  const grouped = groupByAgendaItem(sessionItems);
  let idx = 0;
  for (const [, items] of grouped.entries()) {
    for (const item of items) {
      if (item === intervention || (item.start_seconds === intervention.start_seconds && item.speaker_name === intervention.speaker_name && item.session_id === intervention.session_id)) {
        return `int-${idx}`;
      }
      idx++;
    }
  }
  return `int-0`;
}
