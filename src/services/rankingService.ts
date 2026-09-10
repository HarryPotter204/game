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

// Default Hogwarts Hall of Fame entries if collection is fresh
const INITIAL_SEED_RANKINGS: RankingEntry[] = [
  {
    playerName: 'アルバス・D',
    characterId: 'dumbledore',
    characterName: 'ダンブルドア',
    score: 88400,
    galleons: 12500,
    level: 12,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    playerName: '不死鳥の騎士',
    characterId: 'harry',
    characterName: 'ハリー',
    score: 64200,
    galleons: 8900,
    level: 10,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    playerName: '万能の魔女',
    characterId: 'hermione',
    characterName: 'ハーマイオニー',
    score: 52100,
    galleons: 9800,
    level: 9,
    createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
  },
  {
    playerName: '魔法薬の達人',
    characterId: 'snape',
    characterName: 'スネイプ',
    score: 41300,
    galleons: 6400,
    level: 8,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    playerName: 'いたずら仕掛け人',
    characterId: 'ron',
    characterName: 'ロン',
    score: 28900,
    galleons: 7100,
    level: 6,
    createdAt: new Date().toISOString(),
  },
];

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
 * Fetches rankings ordered by score or galleons
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
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const results: RankingEntry[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        results.push({
          id: doc.id,
          playerName: data.playerName || '名無しの魔法使い',
          characterId: data.characterId || 'harry',
          characterName: data.characterName || 'ハリー',
          score: typeof data.score === 'number' ? data.score : 0,
          galleons: typeof data.galleons === 'number' ? data.galleons : 0,
          level: typeof data.level === 'number' ? data.level : 1,
          createdAt: data.createdAt || new Date().toISOString(),
        });
      });
      return results;
    }

    // If collection is empty, sort initial seeds as initial fallback
    return [...INITIAL_SEED_RANKINGS].sort((a, b) => {
      return type === 'score' ? b.score - a.score : b.galleons - a.galleons;
    });
  } catch (error) {
    console.warn('Firestore fetch failed, using fallback rankings:', error);
    return [...INITIAL_SEED_RANKINGS].sort((a, b) => {
      return type === 'score' ? b.score - a.score : b.galleons - a.galleons;
    });
  }
}
