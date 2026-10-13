import { getDatabase } from './database';
import type { Materia } from '../types';

export type Conquista = {
  id: string;
  titulo: string;
  descricao: string;
  emoji: string;
  desbloqueada: boolean;
  desbloqueadaEm?: string;
};

const DEFINICOES: Omit<Conquista, 'desbloqueada' | 'desbloqueadaEm'>[] = [
  { id: 'genio_matematica', titulo: 'Gênio da Matemática', descricao: 'Acerte todas as 5 questões de um quiz de Matemática.', emoji: '🧠' },
  { id: 'explorador', titulo: 'Explorador', descricao: 'Visite e experimente os dois jogos educativos.', emoji: '🧭' },
  { id: 'primeiro_passo', titulo: 'Primeiro Passo', descricao: 'Conclua seu primeiro quiz.', emoji: '🌟' },
  { id: 'persistente', titulo: 'Aprendiz Persistente', descricao: 'Conclua 5 quizzes.', emoji: '🔥' },
  { id: 'colecionador', titulo: 'Colecionador de Medalhas', descricao: 'Desbloqueie 3 conquistas.', emoji: '🏅' },
];

function agoraIso() { return new Date().toISOString(); }

async function desbloquear(id: string) {
  const db = await getDatabase();
  await db.runAsync('INSERT OR IGNORE INTO conquistas (id, desbloqueada_em) VALUES (?, ?)', id, agoraIso());
}

export async function registrarConclusaoQuiz(materia: Materia, ano: number, pontos: number, total: number) {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO eventos_gamificacao (id, tipo, referencia, pontos, total, criado_em) VALUES (?, ?, ?, ?, ?, ?)',
    `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, 'quiz', `${materia}:${ano}`, pontos, total, agoraIso()
  );
  await desbloquear('primeiro_passo');
  const contagem = await db.getFirstAsync<{ total: number }>("SELECT COUNT(*) AS total FROM eventos_gamificacao WHERE tipo = 'quiz'");
  if ((contagem?.total ?? 0) >= 5) await desbloquear('persistente');
  if (materia === 'matematica' && total === 5 && pontos === total) await desbloquear('genio_matematica');
  await atualizarConquistaColecionador();
}

export async function registrarJogoVisitado(jogo: 'matemagica' | 'typeblaster') {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO jogos_visitados (jogo, primeira_visita, quantidade) VALUES (?, ?, 1)
     ON CONFLICT(jogo) DO UPDATE SET quantidade = quantidade + 1`,
    jogo, agoraIso()
  );
  const jogos = await db.getFirstAsync<{ total: number }>('SELECT COUNT(*) AS total FROM jogos_visitados WHERE jogo IN (?, ?)', 'matemagica', 'typeblaster');
  if ((jogos?.total ?? 0) >= 2) await desbloquear('explorador');
  await atualizarConquistaColecionador();
}

async function atualizarConquistaColecionador() {
  const db = await getDatabase();
  const resultado = await db.getFirstAsync<{ total: number }>('SELECT COUNT(*) AS total FROM conquistas');
  // Conta as conquistas já obtidas antes de conceder a de colecionador.
  if ((resultado?.total ?? 0) >= 3) {
    await db.runAsync('INSERT OR IGNORE INTO conquistas (id, desbloqueada_em) VALUES (?, ?)', 'colecionador', agoraIso());
  }
}

export async function obterConquistas(): Promise<Conquista[]> {
  const db = await getDatabase();
  const desbloqueadas = await db.getAllAsync<{ id: string; desbloqueada_em: string }>('SELECT id, desbloqueada_em FROM conquistas');
  const mapa = new Map(desbloqueadas.map(item => [item.id, item.desbloqueada_em]));
  return DEFINICOES.map(item => ({ ...item, desbloqueada: mapa.has(item.id), desbloqueadaEm: mapa.get(item.id) }));
}

export async function obterResumoGamificacao() {
  const db = await getDatabase();
  const quizzes = await db.getFirstAsync<{ total: number }>("SELECT COUNT(*) AS total FROM eventos_gamificacao WHERE tipo = 'quiz'");
  const jogos = await db.getFirstAsync<{ total: number }>('SELECT COUNT(*) AS total FROM jogos_visitados');
  const pontos = await db.getFirstAsync<{ total: number }>("SELECT COALESCE(SUM(pontos), 0) AS total FROM eventos_gamificacao WHERE tipo = 'quiz'");
  const conquistas = await db.getFirstAsync<{ total: number }>('SELECT COUNT(*) AS total FROM conquistas');
  return { quizzesConcluidos: quizzes?.total ?? 0, jogosExperimentados: jogos?.total ?? 0, pontosAcumulados: pontos?.total ?? 0, conquistasDesbloqueadas: conquistas?.total ?? 0 };
}
