import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';
import type { Question } from './questions';
import { normalizeQuestions } from './questions';
import type { Materia } from '../types';

const DATABASE_NAME = 'brinkeduca.db';
const LEGACY_RANKING_KEY = '@brinkeduca:ranking_pessoal';

type DatabaseQuestionRow = {
  id: number;
  materia: Materia;
  ano: number;
  pergunta: string;
  opcoes: string;
  resposta_correta: number;
  explicacao: string;
  emoji: string;
};

export type DatabaseRankingRow = {
  id: string;
  data: string;
  materia: Materia;
  ano: number;
  pontos: number;
  total: number;
  medalha: 'ouro' | 'prata' | 'bronze' | 'participacao';
};

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function openAndPrepareDatabase(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS questoes (
      id INTEGER PRIMARY KEY NOT NULL,
      materia TEXT NOT NULL,
      ano INTEGER NOT NULL,
      pergunta TEXT NOT NULL,
      opcoes TEXT NOT NULL,
      resposta_correta INTEGER NOT NULL,
      explicacao TEXT NOT NULL,
      emoji TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_questoes_materia_ano
      ON questoes (materia, ano);
    CREATE TABLE IF NOT EXISTS ranking_pessoal (
      id TEXT PRIMARY KEY NOT NULL,
      data TEXT NOT NULL,
      materia TEXT NOT NULL,
      ano INTEGER NOT NULL,
      pontos INTEGER NOT NULL,
      total INTEGER NOT NULL,
      medalha TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS conquistas (
      id TEXT PRIMARY KEY NOT NULL,
      desbloqueada_em TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS eventos_gamificacao (
      id TEXT PRIMARY KEY NOT NULL,
      tipo TEXT NOT NULL,
      referencia TEXT NOT NULL,
      pontos INTEGER NOT NULL DEFAULT 0,
      total INTEGER NOT NULL DEFAULT 0,
      criado_em TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS jogos_visitados (
      jogo TEXT PRIMARY KEY NOT NULL,
      primeira_visita TEXT NOT NULL,
      quantidade INTEGER NOT NULL DEFAULT 1
    );
  `);

  await seedQuestionsIfNeeded(db);
  await migrateLegacyRankingIfNeeded(db);
  return db;
}

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = openAndPrepareDatabase().catch((error) => {
      databasePromise = null;
      throw error;
    });
  }
  return databasePromise;
}

async function seedQuestionsIfNeeded(db: SQLite.SQLiteDatabase): Promise<void> {
  // INSERT OR IGNORE mantém os registros existentes e completa questões ausentes
  // caso uma instalação anterior tenha criado o banco com uma carga parcial.
  const rawQuestions = require('../../api/questoes.json') as unknown;
  const questions = normalizeQuestions(rawQuestions);

  await db.withTransactionAsync(async () => {
    for (const question of questions) {
      await db.runAsync(
        `INSERT OR IGNORE INTO questoes
          (id, materia, ano, pergunta, opcoes, resposta_correta, explicacao, emoji)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        question.id,
        question.materia,
        question.ano,
        question.pergunta,
        JSON.stringify(question.opcoes),
        question.resposta_correta,
        question.explicacao,
        question.emoji
      );
    }
  });
}

async function migrateLegacyRankingIfNeeded(db: SQLite.SQLiteDatabase): Promise<void> {
  const result = await db.getFirstAsync<{ total: number }>(
    'SELECT COUNT(*) AS total FROM ranking_pessoal'
  );
  if ((result?.total ?? 0) > 0) return;

  try {
    const legacyJson = await AsyncStorage.getItem(LEGACY_RANKING_KEY);
    if (!legacyJson) return;

    const legacyRows: unknown = JSON.parse(legacyJson);
    if (!Array.isArray(legacyRows)) return;

    for (const value of legacyRows) {
      if (!value || typeof value !== 'object') continue;
      const item = value as Partial<DatabaseRankingRow>;
      if (
        typeof item.id !== 'string' ||
        typeof item.data !== 'string' ||
        !['matematica', 'portugues', 'ingles'].includes(String(item.materia)) ||
        typeof item.ano !== 'number' ||
        typeof item.pontos !== 'number' ||
        typeof item.total !== 'number'
      ) continue;

      const medalha = ['ouro', 'prata', 'bronze', 'participacao'].includes(String(item.medalha))
        ? item.medalha!
        : 'participacao';
      await db.runAsync(
        `INSERT OR IGNORE INTO ranking_pessoal
          (id, data, materia, ano, pontos, total, medalha)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        item.id,
        item.data,
        item.materia!,
        item.ano,
        item.pontos,
        item.total,
        medalha
      );
    }
  } catch (error) {
    // A migração não deve impedir o início do aplicativo se o histórico antigo estiver inválido.
    console.warn('Não foi possível migrar o ranking antigo para SQLite:', error);
  }
}

export async function obterQuestoesDoBanco(): Promise<Question[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<DatabaseQuestionRow>(
    `SELECT id, materia, ano, pergunta, opcoes, resposta_correta, explicacao, emoji
     FROM questoes ORDER BY materia, ano, id`
  );

  return rows.map((row) => ({
    id: row.id,
    materia: row.materia,
    ano: row.ano,
    pergunta: row.pergunta,
    opcoes: JSON.parse(row.opcoes) as string[],
    resposta_correta: row.resposta_correta,
    explicacao: row.explicacao,
    emoji: row.emoji,
  }));
}
