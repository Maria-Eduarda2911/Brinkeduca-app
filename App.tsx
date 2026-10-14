import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView, ScrollView, Image, View, Text, Pressable, BackHandler } from 'react-native';
import { fetchQuestions, type Question } from './src/services/questions';
import { getDatabase, obterQuestoesDoBanco } from './src/services/database';
import { obterRankingPessoal, salvarPontuacaoPessoal, type RegistroRanking } from './src/services/ranking';
import HomeScreen from './src/screens/HomeScreen';
import SelectQuizScreen from './src/screens/SelectQuizScreen';
import QuizScreen from './src/screens/QuizScreen';
import GamesScreen from './src/screens/GamesScreen';
import RankingScreen from './src/screens/RankingScreen';
import MatemagicaScreen from './src/screens/MatemagicaScreen';
import TypeBlasterScreen from './src/screens/TypeBlasterScreen';
import AchievementsScreen from './src/screens/AchievementsScreen';
import { obterConquistas, obterResumoGamificacao, registrarConclusaoQuiz, registrarJogoVisitado, type Conquista } from './src/services/gamification';
import { styles } from './src/styles/appStyles';
import type { Materia, Screen, RespostaQuiz } from './src/types';

const MAX_QUESTOES = 5;
const TITULOS_TELA: Partial<Record<Screen, string>> = {
  select_quiz: 'Preparar atividade',
  quiz: 'Questionário',
  games: 'Jogos educativos',
  ranking: 'Ranking pessoal',
  achievements: 'Minhas conquistas',
};

function embaralhar<T>(lista: T[]): T[] {
  const resultado = [...lista];
  for (let i = resultado.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [resultado[i], resultado[j]] = [resultado[j], resultado[i]];
  }
  return resultado;
}

export default function App() {
  const [navigationStack, setNavigationStack] = useState<Screen[]>(['home']);
  const screen = navigationStack[navigationStack.length - 1] ?? 'home';
  const [materia, setMateria] = useState<Materia>('matematica');
  const [ano, setAno] = useState(1);
  const [indice, setIndice] = useState(0);
  const [pontos, setPontos] = useState(0);
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const [fim, setFim] = useState(false);
  const [historico, setHistorico] = useState<RegistroRanking[]>([]);
  const [todasQuestoes, setTodasQuestoes] = useState<Question[]>([]);
  const [perguntasPartida, setPerguntasPartida] = useState<Question[]>([]);
  const [bancoPronto, setBancoPronto] = useState(false);
  const [conquistas, setConquistas] = useState<Conquista[]>([]);
  const [resumoGamificacao, setResumoGamificacao] = useState({ quizzesConcluidos: 0, jogosExperimentados: 0, pontosAcumulados: 0, conquistasDesbloqueadas: 0 });
  const [respostas, setRespostas] = useState<RespostaQuiz[]>([]);
  const ultimaPartidaRef = useRef<Record<string, number[]>>({});

  const poolQuestoes = useMemo(
    () => todasQuestoes.filter((questao) => questao.materia === materia && questao.ano === ano),
    [todasQuestoes, materia, ano]
  );
  const perguntas = perguntasPartida;
  const perguntaAtual = perguntas[indice] ?? null;
  const progresso = perguntas.length === 0 ? 0 : ((indice + (selecionada !== null ? 1 : 0)) / perguntas.length) * 100;

  const navegarPara = (destino: Screen) => {
    setNavigationStack((atual) => atual[atual.length - 1] === destino ? atual : [...atual, destino]);
  };
  const voltar = () => setNavigationStack((atual) => atual.length > 1 ? atual.slice(0, -1) : ['home']);
  const irParaInicio = () => setNavigationStack(['home']);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (navigationStack.length > 1) {
        setNavigationStack((atual) => atual.length > 1 ? atual.slice(0, -1) : ['home']);
        return true;
      }
      return false;
    });
    return () => subscription.remove();
  }, [navigationStack]);

  useEffect(() => {
    let ativo = true;
    async function inicializar() {
      try {
        await getDatabase();
        const [questoes, dados] = await Promise.all([obterQuestoesDoBanco(), obterRankingPessoal()]);
        if (ativo) {
          setTodasQuestoes(questoes);
          setHistorico(Array.isArray(dados) ? dados : []);
          const [lista, resumo] = await Promise.all([obterConquistas(), obterResumoGamificacao()]);
          setConquistas(lista);
          setResumoGamificacao(resumo);
        }
      } catch (error) {
        console.warn('Não foi possível iniciar o SQLite; usando as questões locais como alternativa.', error);
        const questoesLocais = await fetchQuestions();
        if (ativo) {
          setTodasQuestoes(questoesLocais);
          setHistorico([]);
        }
      } finally {
        if (ativo) setBancoPronto(true);
      }
    }
    inicializar();
    return () => { ativo = false; };
  }, []);

  const atualizarGamificacao = async () => {
    try {
      const [lista, resumo] = await Promise.all([obterConquistas(), obterResumoGamificacao()]);
      setConquistas(lista);
      setResumoGamificacao(resumo);
    } catch (error) {
      console.warn('Não foi possível carregar as conquistas:', error);
    }
  };

  const abrirMatematica = async () => {
    try { await registrarJogoVisitado('matemagica'); } catch (error) { console.warn('Não foi possível registrar o jogo:', error); }
    await atualizarGamificacao();
    navegarPara('matemagica');
  };
  const abrirTypeBlaster = async () => {
    try { await registrarJogoVisitado('typeblaster'); } catch (error) { console.warn('Não foi possível registrar o jogo:', error); }
    await atualizarGamificacao();
    navegarPara('typeblaster');
  };

  const iniciarQuestionario = () => {
    if (poolQuestoes.length === 0) return;
    const chavePool = `${materia}-${ano}`;
    let selecionadas = embaralhar(poolQuestoes).slice(0, Math.min(MAX_QUESTOES, poolQuestoes.length));
    const idsAnteriores = ultimaPartidaRef.current[chavePool] ?? [];
    const assinaturaAnterior = [...idsAnteriores].sort((a, b) => a - b).join(',');
    let assinaturaNova = selecionadas.map((questao) => questao.id).sort((a, b) => a - b).join(',');

    // Evita repetir exatamente o mesmo conjunto quando há questões alternativas disponíveis.
    if (poolQuestoes.length > selecionadas.length && assinaturaNova === assinaturaAnterior) {
      const idsSelecionados = new Set(selecionadas.map((questao) => questao.id));
      const alternativa = embaralhar(poolQuestoes.filter((questao) => !idsSelecionados.has(questao.id)))[0];
      if (alternativa) selecionadas = [...selecionadas.slice(0, -1), alternativa];
      assinaturaNova = selecionadas.map((questao) => questao.id).sort((a, b) => a - b).join(',');
    }
    // Se o banco tiver exatamente o número mínimo de questões, ao menos muda a ordem da rodada.
    if (selecionadas.length > 1 && selecionadas.map((questao) => questao.id).join(',') === idsAnteriores.join(',')) {
      selecionadas = [...selecionadas].reverse();
    }
    ultimaPartidaRef.current[chavePool] = selecionadas.map((questao) => questao.id);

    setPerguntasPartida(selecionadas);
    setIndice(0);
    setPontos(0);
    setSelecionada(null);
    setFim(false);
    setRespostas([]);
    navegarPara('quiz');
  };

  const sairDaPartida = () => {
    setIndice(0); setPontos(0); setSelecionada(null); setFim(false); setRespostas([]);
    voltar();
  };
  const voltarAosJogos = () => voltar();

  const responder = async (opcaoIndex: number) => {
    if (selecionada !== null || !perguntaAtual) return;
    const acertou = opcaoIndex === perguntaAtual.resposta_correta;
    setSelecionada(opcaoIndex);
    setPontos((valorAtual) => acertou ? valorAtual + 1 : valorAtual);
    const novaResposta: RespostaQuiz = { id: perguntaAtual.id, pergunta: perguntaAtual.pergunta, selecionada: opcaoIndex, correta: perguntaAtual.resposta_correta, acertou, explicacao: perguntaAtual.explicacao };
    setRespostas((valorAtual) => [...valorAtual, novaResposta]);
    const ultimoIndice = perguntas.length - 1;
    if (indice === ultimoIndice) {
      const pontuacaoFinal = acertou ? pontos + 1 : pontos;
      await salvarPontuacaoPessoal(materia, ano, pontuacaoFinal, perguntas.length);
      try { await registrarConclusaoQuiz(materia, ano, pontuacaoFinal, perguntas.length); } catch (error) { console.warn('Não foi possível registrar a gamificação:', error); }
      const dados = await obterRankingPessoal();
      setHistorico(Array.isArray(dados) ? dados : []);
      await atualizarGamificacao();
      setFim(true);
      return;
    }
    setTimeout(() => { setIndice((valorAtual) => valorAtual + 1); setSelecionada(null); }, 700);
  };

  if (!bancoPronto) return <SafeAreaView style={styles.safeArea}><View style={styles.container}><Text style={styles.sectionTitle}>Preparando o BrincaEduca…</Text><Text style={styles.emptyText}>Carregando questões e histórico.</Text></View></SafeAreaView>;
  if (screen === 'matemagica') return <MatemagicaScreen onVoltar={voltarAosJogos} />;
  if (screen === 'typeblaster') return <TypeBlasterScreen onVoltar={voltarAosJogos} />;

  return <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.brandWrap}><Image source={require('./assets/logo.png')} style={styles.logo} resizeMode="contain" /></View>
      {screen !== 'home' && <View style={styles.navigationBar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Voltar à tela anterior" onPress={voltar} style={styles.navigationButton}>
          <Text style={styles.navigationButtonText}>‹  Voltar</Text>
        </Pressable>
        <Text style={styles.navigationTitle}>{TITULOS_TELA[screen] ?? 'BrincaEduca'}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Ir para o início" onPress={irParaInicio} style={styles.navigationHomeButton}>
          <Text style={styles.navigationHomeText}>⌂</Text>
        </Pressable>
      </View>}
      {screen === 'home' && <HomeScreen onSelectQuiz={() => navegarPara('select_quiz')} onGames={() => navegarPara('games')} onRanking={() => navegarPara('ranking')} onAchievements={() => navegarPara('achievements')} />}
      {screen === 'achievements' && <AchievementsScreen conquistas={conquistas} resumo={resumoGamificacao} />}
      {screen === 'select_quiz' && <SelectQuizScreen materia={materia} setMateria={setMateria} ano={ano} setAno={setAno} quantidade={poolQuestoes.length} iniciar={iniciarQuestionario} />}
      {screen === 'quiz' && <QuizScreen pergunta={perguntaAtual} perguntas={perguntas} indice={indice} materia={materia} ano={ano} pontos={pontos} selecionada={selecionada} fim={fim} progresso={progresso} respostas={respostas} responder={responder} sair={sairDaPartida} voltarMenu={irParaInicio} />}
      {screen === 'games' && <GamesScreen onMatemagica={abrirMatematica} onTypeBlaster={abrirTypeBlaster} />}
      {screen === 'ranking' && <RankingScreen historico={historico} />}
    </ScrollView>
  </SafeAreaView>;
}
