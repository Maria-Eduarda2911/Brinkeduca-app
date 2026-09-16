import AsyncStorage from '@react-native-async-storage/async-storage';

export type RegistroRanking = {
  id: string;
  data: string;
  materia: 'matematica' | 'portugues' | 'ingles';
  ano: number;
  pontos: number;
  total: number;
  medalha: 'ouro' | 'prata' | 'bronze' | 'participacao';
};

const STORAGE_KEY = '@brinkeduca:ranking_pessoal';
const MEMORY_STORAGE = new Map<string, string>();

async function getStorageValue(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    try {
      if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
        return globalThis.localStorage.getItem(key);
      }
    } catch {
      // ignore fallback error
    }

    return MEMORY_STORAGE.get(key) ?? null;
  }
}

async function setStorageValue(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
    MEMORY_STORAGE.set(key, value);
    return;
  } catch (error) {
    try {
      if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
        globalThis.localStorage.setItem(key, value);
        MEMORY_STORAGE.set(key, value);
        return;
      }
    } catch {
      // ignore fallback error
    }

    MEMORY_STORAGE.set(key, value);
  }
}

async function removeStorageValue(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    try {
      if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
        globalThis.localStorage.removeItem(key);
      }
    } catch {
      // ignore fallback error
    }
  }

  MEMORY_STORAGE.delete(key);
}

export async function salvarPontuacaoPessoal(
  materia: 'matematica' | 'portugues' | 'ingles',
  ano: number,
  pontos: number,
  total: number = 5
): Promise<RegistroRanking> {
  let medalha: RegistroRanking['medalha'] = 'participacao';
  if (pontos === 5) medalha = 'ouro';
  else if (pontos >= 3) medalha = 'prata';
  else if (pontos >= 1) medalha = 'bronze';

  const agora = new Date();
  const dataFormatada = `${String(agora.getDate()).padStart(2, '0')}/${String(
    agora.getMonth() + 1
  ).padStart(2, '0')} às ${String(agora.getHours()).padStart(2, '0')}:${String(
    agora.getMinutes()
  ).padStart(2, '0')}`;

  const novoRegistro: RegistroRanking = {
    id: Date.now().toString(),
    data: dataFormatada,
    materia,
    ano,
    pontos,
    total,
    medalha,
  };

  try {
    const historicoAtual = await obterRankingPessoal();
    const novoHistorico = [novoRegistro, ...historicoAtual].slice(0, 50);
    await setStorageValue(STORAGE_KEY, JSON.stringify(novoHistorico));
  } catch (err) {
    console.warn('Erro ao salvar ranking pessoal:', err);
  }

  return novoRegistro;
}

export async function obterRankingPessoal(): Promise<RegistroRanking[]> {
  try {
    const json = await getStorageValue(STORAGE_KEY);
    if (!json) return [];

    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Erro ao carregar ranking pessoal:', err);
    return [];
  }
}

export async function limparRankingPessoal(): Promise<void> {
  try {
    await removeStorageValue(STORAGE_KEY);
  } catch (err) {
    console.warn('Erro ao limpar ranking pessoal:', err);
  }
}
