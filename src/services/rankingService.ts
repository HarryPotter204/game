import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase';
import { RankingEntry, RankingTab } from '../types';

const RANKINGS_COLLECTION = 'rankings';

// Bot names to exclude from ranking to ensure only real player entries are displayed
const BOT_NAMES = new Set([
  'アルバス・D',
  '不死鳥の騎士',
  '万能の魔女',
  '魔法薬の達人',
  'いたずら仕掛け人',
]);

/**
 * Submits a new score to Firestore rankings
 */
export async function submitRanking(
  playerName: string,
  characterId: string,
  characterName: string,
  score: number,
  galleons: number,
  level: number
): Promise<string | null> {
  // If score is 0, don't pollute the leaderboard
  if (score <= 0 && galleons <= 0) return null;

  const validName = (playerName || '名無しの魔法使い').trim().slice(0, 20);

  const newDoc = {
    playerName: validName,
    characterId,
    characterName,
    score: Math.max(0, Math.floor(score)),
    galleons: Math.max(0, Math.floor(galleons)),
    level: Math.max(1, Math.floor(level)),
    createdAt: new Date().toISOString(),
  };

  try {
    const docRef = await addDoc(collection(db, RANKINGS_COLLECTION), newDoc);
    return docRef.id;
  } catch (error) {
    console.error('Error submitting ranking to Firestore:', error);
    return null;
  }
}

/**
 * Fetches rankings ordered by score or galleons (real player submissions only)
 */
export async function fetchRankings(
  type: RankingTab = 'score',
  limitCount: number = 10
): Promise<RankingEntry[]> {
  try {
    const field = type === 'score' ? 'score' : 'galleons';
    const q = query(
      collection(db, RANKINGS_COLLECTION),
      orderBy(field, 'desc'),
      limit(limitCount + 5) // Fetch a few extra to account for any filtered bot names
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const results: RankingEntry[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const pName = data.playerName || '名無しの魔法使い';
        // Filter out any legacy bot entries
        if (BOT_NAMES.has(pName)) return;

        results.push({
          id: doc.id,
          playerName: pName,
          characterId: data.characterId || 'harry',
          characterName: data.characterName || 'ハリー・ポッター',
          score: typeof data.score === 'number' ? data.score : 0,
          galleons: typeof data.galleons === 'number' ? data.galleons : 0,
          level: typeof data.level === 'number' ? data.level : 1,
          createdAt: data.createdAt || new Date().toISOString(),
        });
      });
      return results.slice(0, limitCount);
    }

    return [];
  } catch (error) {
    console.warn('Firestore fetch failed or empty:', error);
    return [];
  }
}
