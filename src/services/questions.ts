export type Question = {
  id: number;
  materia: 'matematica' | 'portugues' | 'ingles';
  ano: number;
  pergunta: string;
  opcoes: string[];
  resposta_correta: number;
  explicacao: string;
  emoji: string;
};

type JsonQuestion = {
  id?: number;
  materia?: string;
  ano?: number;
  pergunta?: string;
  opcoes?: string[];
  opcao_a?: string;
  opcao_b?: string;
  opcao_c?: string;
  resposta?: string;
  resposta_correta?: number;
  explicacao?: string;
  emoji?: string;
};

function normalizeQuestion(item: unknown, fallbackMateria?: Question['materia'], fallbackAno?: number): Question | null {
  const question = item as JsonQuestion;
  const materia = (fallbackMateria ?? (question.materia as Question['materia'])) as Question['materia'];
  const opcoes = Array.isArray(question.opcoes)
    ? question.opcoes.map((opcao) => String(opcao))
    : [question.opcao_a, question.opcao_b, question.opcao_c].map((opcao) => String(opcao ?? ''));

  const respostaTexto = typeof question.resposta === 'string' ? question.resposta.trim() : undefined;
  const respostaCorreta =
    typeof question.resposta_correta === 'number'
      ? question.resposta_correta
      : respostaTexto
        ? opcoes.findIndex((opcao) => opcao.trim() === respostaTexto)
        : 0;

  if (!materia || !question.pergunta || opcoes.filter((opcao) => opcao.trim().length > 0).length < 3) {
    return null;
  }

  const normalizedOpcoes = opcoes.filter((opcao) => opcao.trim().length > 0);

  return {
    id: Number(question.id ?? 0),
    materia,
    ano: Number(fallbackAno ?? question.ano ?? 1),
    pergunta: String(question.pergunta),
    opcoes: normalizedOpcoes,
    resposta_correta: Number.isInteger(respostaCorreta) ? respostaCorreta : 0,
    explicacao: String(question.explicacao ?? 'Sem explicação disponível.'),
    emoji: String(question.emoji ?? '❓'),
  };
}

export function normalizeQuestions(raw: unknown): Question[] {
  if (Array.isArray(raw)) {
    return raw
      .map((item) => normalizeQuestion(item))
      .filter((question): question is Question => question !== null);
  }

  if (!raw || typeof raw !== 'object') {
    return [];
  }

  const entries = Object.entries(raw as Record<string, unknown>);
  const normalized: Question[] = [];

  for (const [materiaKey, materiaValue] of entries) {
    const materia = materiaKey as Question['materia'];
    if (!materiaValue || typeof materiaValue !== 'object') continue;

    for (const [anoKey, anoValue] of Object.entries(materiaValue as Record<string, unknown>)) {
      const anoMatch = String(anoKey).match(/ano(\d+)/i);
      const ano = anoMatch ? Number(anoMatch[1]) : 1;

      if (!anoValue || typeof anoValue !== 'object') continue;

      const questoes = (anoValue as { questoes?: unknown }).questoes;
      if (!Array.isArray(questoes)) continue;

      questoes.forEach((item) => {
        const normalizedQuestion = normalizeQuestion(item, materia, ano);
        if (normalizedQuestion) normalized.push(normalizedQuestion);
      });
    }
  }

  return normalized;
}

const rawQuestions = require('../../api/questoes.json') as unknown;
const LOCAL_QUESTIONS = normalizeQuestions(rawQuestions);

export function getQuestionsByMateria(materia: Question['materia']): Question[] {
  return LOCAL_QUESTIONS.filter((question) => question.materia === materia);
}

export async function fetchQuestions(): Promise<Question[]> {
  return LOCAL_QUESTIONS;
}
