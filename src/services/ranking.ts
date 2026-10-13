import { getDatabase, type DatabaseRankingRow } from './database';
import type { Materia } from '../types';

export type RegistroRanking = DatabaseRankingRow;

export async function salvarPontuacaoPessoal(
  materia: Materia,
  ano: number,
  pontos: number,
  total: number = 5
): Promise<RegistroRanking> {
  let medalha: RegistroRanking['medalha'] = 'participacao';
  if (pontos === total) medalha = 'ouro';
  else if (pontos >= 3) medalha = 'prata';
  else if (pontos >= 1) medalha = 'bronze';

  const agora = new Date();
  const dataFormatada = `${String(agora.getDate()).padStart(2, '0')}/${String(
    agora.getMonth() + 1
  ).padStart(2, '0')} às ${String(agora.getHours()).padStart(2, '0')}:${String(
    agora.getMinutes()
  ).padStart(2, '0')}`;

  const novoRegistro: RegistroRanking = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    data: dataFormatada,
    materia,
    ano,
    pontos,
    total,
    medalha,
  };

  try {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO ranking_pessoal (id, data, materia, ano, pontos, total, medalha)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      novoRegistro.id,
      novoRegistro.data,
      novoRegistro.materia,
      novoRegistro.ano,
      novoRegistro.pontos,
      novoRegistro.total,
      novoRegistro.medalha
    );
    await db.runAsync(
      `DELETE FROM ranking_pessoal
       WHERE id NOT IN (
         SELECT id FROM ranking_pessoal ORDER BY rowid DESC LIMIT 50
       )`
    );
  } catch (error) {
    console.warn('Erro ao salvar pontuação no SQLite:', error);
  }

  return novoRegistro;
}

export async function obterRankingPessoal(): Promise<RegistroRanking[]> {
  try {
    const db = await getDatabase();
    return await db.getAllAsync<RegistroRanking>(
      `SELECT id, data, materia, ano, pontos, total, medalha
       FROM ranking_pessoal ORDER BY rowid DESC LIMIT 50`
    );
  } catch (error) {
    console.warn('Erro ao carregar ranking do SQLite:', error);
    return [];
  }
}

export async function limparRankingPessoal(): Promise<void> {
  try {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM ranking_pessoal');
  } catch (error) {
    console.warn('Erro ao limpar ranking no SQLite:', error);
  }
}
