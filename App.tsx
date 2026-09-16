import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Card from './src/components/Card';
import Button from './src/components/Button';
import theme from './src/theme';
import { getQuestionsByMateria } from './src/services/questions';
import {
  obterRankingPessoal,
  RegistroRanking,
  salvarPontuacaoPessoal,
} from './src/services/ranking';

type Materia = 'matematica' | 'portugues' | 'ingles';
type Screen = 'home' | 'select_quiz' | 'quiz' | 'games' | 'matemagica' | 'typeblaster' | 'ranking';

type RespostaQuiz = {
  id: number;
  pergunta: string;
  selecionada: number;
  correta: number;
  acertou: boolean;
  explicacao: string;
};

const MATERIAS: Materia[] = ['matematica', 'portugues', 'ingles'];
const ANOS = [1, 2, 3, 4, 5];
const MAX_QUESTOES = 5;

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [materia, setMateria] = useState<Materia>('matematica');
  const [ano, setAno] = useState(1);
  const [indice, setIndice] = useState(0);
  const [pontos, setPontos] = useState(0);
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const [fim, setFim] = useState(false);
  const [historico, setHistorico] = useState<RegistroRanking[]>([]);
  const [respostas, setRespostas] = useState<RespostaQuiz[]>([]);

  const perguntas = useMemo(
    () =>
      getQuestionsByMateria(materia)
        .filter((questao) => questao.ano === ano)
        .slice(0, MAX_QUESTOES),
    [materia, ano]
  );

  const perguntaAtual = perguntas[indice] ?? null;
  const progresso =
    perguntas.length === 0
      ? 0
      : ((indice + (selecionada !== null ? 1 : 0)) / perguntas.length) * 100;

  useEffect(() => {
    async function carregarHistorico() {
      const dados = await obterRankingPessoal();
      setHistorico(Array.isArray(dados) ? dados : []);
    }
    carregarHistorico();
  }, []);

  const iniciarQuestionario = () => {
    if (perguntas.length === 0) return;
    setIndice(0);
    setPontos(0);
    setSelecionada(null);
    setFim(false);
    setRespostas([]);
    setScreen('quiz');
  };

  const voltarAoMenu = () => {
    setIndice(0);
    setPontos(0);
    setSelecionada(null);
    setFim(false);
    setRespostas([]);
    setScreen('home');
  };

  const voltarAosJogos = () => {
    setScreen('games');
  };

  const responder = async (opcaoIndex: number) => {
    if (selecionada !== null || !perguntaAtual) return;

    const acertou = opcaoIndex === perguntaAtual.resposta_correta;

    setSelecionada(opcaoIndex);
    setPontos((valorAtual) => (acertou ? valorAtual + 1 : valorAtual));

    const novaResposta: RespostaQuiz = {
      id: perguntaAtual.id,
      pergunta: perguntaAtual.pergunta,
      selecionada: opcaoIndex,
      correta: perguntaAtual.resposta_correta,
      acertou,
      explicacao: perguntaAtual.explicacao,
    };

    setRespostas((valorAtual) => [...valorAtual, novaResposta]);

    const ultimoIndice = perguntas.length - 1;

    if (indice === ultimoIndice) {
      const pontuacaoFinal = acertou ? pontos + 1 : pontos;
      await salvarPontuacaoPessoal(materia, ano, pontuacaoFinal, perguntas.length);
      const dados = await obterRankingPessoal();
      setHistorico(Array.isArray(dados) ? dados : []);
      setFim(true);
      return;
    }

    setTimeout(() => {
      setIndice((valorAtual) => valorAtual + 1);
      setSelecionada(null);
    }, 700);
  };

  const renderResposta = (texto: string, index: number) => {
    if (!perguntaAtual) return null;

    const correta = perguntaAtual.resposta_correta;
    const estaSelecionada = selecionada === index;
    const mostrarCorreta = selecionada !== null && index === correta;
    const mostrarIncorreta = selecionada !== null && estaSelecionada && index !== correta;
    const ocultarOpcao = selecionada !== null && !mostrarCorreta && !mostrarIncorreta && index !== correta;

    let badge = '•';
    if (mostrarCorreta) badge = '✔️';
    if (mostrarIncorreta) badge = '❌';

    return (
      <Pressable
        key={`${perguntaAtual.id}-${index}`}
        style={[
          styles.option,
          mostrarCorreta && styles.optionCorrect,
          mostrarIncorreta && styles.optionWrong,
          ocultarOpcao && styles.optionDimmed,
          estaSelecionada && !mostrarCorreta && !mostrarIncorreta && styles.optionSelected,
        ]}
        onPress={() => responder(index)}
        disabled={selecionada !== null || fim}
      >
        <Text style={styles.optionBadge}>{badge}</Text>
        <Text style={styles.optionText}>{texto}</Text>
      </Pressable>
    );
  };

  const feedbackAtual =
    selecionada !== null && perguntaAtual
      ? {
          acertou: selecionada === perguntaAtual.resposta_correta,
          texto: perguntaAtual.explicacao,
        }
      : null;

  // =====================================================================
  // TELA DOS JOGOS (ISOLADA DO SCROLLVIEW)
  // =====================================================================
  if (screen === 'matemagica' || screen === 'typeblaster') {
    const gameSource = screen === 'matemagica' 
      ? require('./games/matemagica.html') 
      : require('./games/typeblaster.html');

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.gameWrapper}>
          <View style={styles.gameHeader}>
            <Button variant="secondary" onPress={voltarAosJogos}>← Voltar aos Jogos</Button>
          </View>

          <View style={styles.gameFrame}>
            <WebView
              source={gameSource}
              style={styles.gameWebView}
              javaScriptEnabled
              domStorageEnabled
              originWhitelist={['*']}
              scrollEnabled={false} 
              bounces={false}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // =====================================================================
  // RESTANTE DO APP (COM SCROLLVIEW)
  // =====================================================================
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.brandWrap}>
          <Image source={require('./assets/logo.png')} style={styles.logo} resizeMode="contain" />
        </View>

        {screen === 'home' && (
          <Card>
            <Text style={styles.menuSubtitle}>Escolha o que você quer fazer:</Text>
            <View style={styles.homeMenuButtons}>
              <Button onPress={() => setScreen('select_quiz')}>📝 Questões</Button>
              <Button variant="secondary" onPress={() => setScreen('games')}>🎮 Jogos</Button>
              <Button variant="secondary" onPress={() => setScreen('ranking')}>🏆 Ranking Pessoal</Button>
            </View>
          </Card>
        )}

        {screen === 'select_quiz' && (
          <>
            <Card style={styles.cardTop}>
              <Text style={styles.sectionTitle}>1. Escolha a Matéria</Text>
              <View style={styles.tabsRow}>
                {MATERIAS.map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => setMateria(item)}
                    style={[styles.tab, materia === item && styles.tabActive]}
                  >
                    <Text style={[styles.tabText, materia === item && styles.tabTextActive]}>{item}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.sectionTitle}>2. Escolha o Ano Escolar</Text>
              <View style={styles.anoRow}>
                {ANOS.map((numero) => (
                  <Pressable
                    key={numero}
                    onPress={() => setAno(numero)}
                    style={[styles.anoButton, ano === numero && styles.anoButtonActive]}
                  >
                    <Text style={[styles.anoText, ano === numero && styles.anoTextActive]}>{numero}º</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.infoQuestoes}>
                Disponíveis: {perguntas.length} questões de {materia} ({ano}º ano)
              </Text>

              <Button onPress={iniciarQuestionario} disabled={perguntas.length === 0} style={styles.btnIniciar}>
                ▶ Iniciar Questionário
              </Button>
            </Card>
            <Button variant="secondary" onPress={voltarAoMenu}>← Voltar ao Menu</Button>
          </>
        )}

        {screen === 'quiz' && (
          <>
            {!fim && perguntaAtual ? (
              <Card>
                <Text style={styles.badge}>
                  Pergunta {indice + 1} de {perguntas.length} • {materia} ({ano}º ano)
                </Text>

                <View style={styles.progressWrap}>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${Math.min(100, progresso)}%` }]} />
                  </View>
                  <Text style={styles.progressLabel}>{Math.round(progresso)}%</Text>
                </View>

                <Text style={styles.questionEmoji}>{perguntaAtual.emoji}</Text>
                <Text style={styles.questionText}>{perguntaAtual.pergunta}</Text>
                <Text style={styles.scoreText}>Pontuação atual: {pontos}</Text>
                <View style={styles.optionsList}>{perguntaAtual.opcoes.map(renderResposta)}</View>

                {feedbackAtual && (
                  <View
                    style={[
                      styles.feedbackBox,
                      feedbackAtual.acertou ? styles.feedbackBoxSuccess : styles.feedbackBoxError,
                    ]}
                  >
                    <Text style={styles.feedbackTitle}>
                      {feedbackAtual.acertou ? '✅ Você acertou!' : '❌ Você errou!'}
                    </Text>
                    <Text style={styles.feedbackText}>{feedbackAtual.texto}</Text>
                  </View>
                )}

                <View style={{ marginTop: 16 }}>
                  <Button variant="secondary" onPress={voltarAoMenu}>Sair da Partida</Button>
                </View>
              </Card>
            ) : (
              <Card>
                <Text style={styles.resultTitle}>🎉 Fim do Quiz!</Text>
                <Text style={styles.resultText}>
                  Você concluiu a rodada de {materia} ({ano}º ano) e acertou {pontos} de {perguntas.length} perguntas!
                </Text>

                <View style={styles.reviewSummary}>
                  {perguntas.map((questao, index) => {
                    const resposta = respostas.find((item) => item.id === questao.id);
                    const acertou = resposta?.acertou ?? false;

                    return (
                      <View key={questao.id} style={styles.reviewItem}>
                        <Text style={styles.reviewQuestion}>
                          {index + 1}. {questao.pergunta}
                        </Text>
                        <Text style={[styles.reviewStatus, acertou ? styles.reviewStatusCorrect : styles.reviewStatusWrong]}>
                          {acertou ? '✅ Acertou' : '❌ Errou'}
                        </Text>
                        <Text style={styles.reviewAnswer}>
                          Sua resposta: {resposta ? questao.opcoes[resposta.selecionada] : '—'}
                        </Text>
                        <Text style={styles.reviewAnswer}>
                          Resposta certa: {questao.opcoes[questao.resposta_correta]}
                        </Text>
                        <Text style={styles.reviewExplanation}>{questao.explicacao}</Text>
                      </View>
                    );
                  })}
                </View>

                <Button variant="secondary" onPress={voltarAoMenu}>Menu Principal</Button>
              </Card>
            )}
          </>
        )}

        {screen === 'games' && (
          <>
            <Card style={styles.cardTop}>
              <Text style={styles.resultTitle}>🎮 Jogos Educativos</Text>
              <Text style={styles.resultText}>Escolha um jogo para praticar de forma dinâmica:</Text>

              <Card style={[styles.gameCardItem, styles.gameCardMagic]}>
                <View style={styles.gameBadge}>
                  <Text style={styles.gameBadgeText}>Magia & Matemática</Text>
                </View>
                <Text style={styles.gameCardTitle}>✨ Matemágica</Text>
                <Text style={styles.gameEmojis}>🧙‍♂️ ⚔️ 🔮</Text>
                <Text style={styles.gameCardDesc}>
                  Defesa de torre com operações matemáticas, desafios mágicos e muito foco!
                </Text>
                <Button style={styles.gameButtonMagic} onPress={() => setScreen('matemagica')}>
                  Jogar Matemágica
                </Button>
              </Card>

              <Card style={[styles.gameCardItem, styles.gameCardArcade]}>
                <View style={styles.gameBadge}>
                  <Text style={styles.gameBadgeText}>Digitação no Espaço</Text>
                </View>
                <Text style={styles.gameCardTitle}>🚀 Type Blaster</Text>
                <Text style={styles.gameEmojis}>🛸 👾 🚀</Text>
                <Text style={styles.gameCardDesc}>
                  Voos rápidos, aliens travessos e digitação em ritmo de arcade espacial!
                </Text>
                <Button style={styles.gameButtonArcade} onPress={() => setScreen('typeblaster')}>
                  Jogar Type Blaster
                </Button>
              </Card>
            </Card>

            <Button variant="secondary" onPress={voltarAoMenu}>← Voltar ao Menu</Button>
          </>
        )}

        {screen === 'ranking' && (
          <>
            <Card style={styles.cardTop}>
              <Text style={styles.sectionTitle}>🏆 Ranking Pessoal</Text>
              {historico.length === 0 ? (
                <Text style={styles.emptyText}>Ainda não há partidas salvas no seu histórico.</Text>
              ) : (
                historico.map((registro) => {
                  const medalhaTexto =
                    registro.pontos === registro.total
                      ? '🥇 Ouro'
                      : registro.pontos >= 3
                        ? '🥈 Prata'
                        : registro.pontos >= 1
                          ? '🥉 Bronze'
                          : '🎖️ Participação';

                  return (
                    <View key={registro.id} style={styles.rankRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.rankMateria}>{registro.materia}</Text>
                        <Text style={styles.rankMeta}>{registro.ano}º ano</Text>
                        <Text style={styles.rankDate}>{registro.data}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.rankScoreHighlight}>{registro.pontos}/{registro.total}</Text>
                        <Text style={styles.rankMedal}>{medalhaTexto}</Text>
                      </View>
                    </View>
                  );
                })
              )}
            </Card>

            <Button variant="secondary" onPress={voltarAoMenu}>← Voltar ao Menu</Button>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    // ESSA FOI A LINHA ADICIONADA:
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  brandWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  logo: {
    width: 500,
    height: 180,
    maxWidth: '100%',
  },
  menuSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  homeMenuButtons: {
    gap: 14,
  },
  cardTop: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 12,
  },
  tabsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    backgroundColor: theme.colors.cyanSoft,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tabActive: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primary,
  },
  tabText: {
    color: theme.colors.text,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  tabTextActive: {
    color: theme.colors.primaryHover,
  },
  anoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  anoButton: {
    backgroundColor: theme.colors.cyanSoft,
    borderRadius: 10,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  anoButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.borderStrong,
  },
  anoText: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  anoTextActive: {
    color: '#fff',
  },
  infoQuestoes: {
    fontSize: 13,
    color: theme.colors.muted,
    marginBottom: 16,
    fontWeight: '600',
  },
  btnIniciar: {
    marginTop: 4,
  },
  progressWrap: {
    marginBottom: 12,
  },
  progressTrack: {
    height: 10,
    backgroundColor: '#DDEAFF',
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
  },
  progressLabel: {
    textAlign: 'right',
    color: theme.colors.primaryHover,
    fontSize: 12,
    fontWeight: '700',
  },
  badge: {
    color: theme.colors.primaryHover,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  questionEmoji: {
    fontSize: 34,
    marginBottom: 8,
    textAlign: 'center',
  },
  questionText: {
    fontSize: 20,
    color: theme.colors.text,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: 12,
    textAlign: 'center',
  },
  scoreText: {
    fontSize: 14,
    color: theme.colors.muted,
    marginBottom: 16,
    textAlign: 'center',
  },
  optionsList: {
    gap: 10,
  },
  option: {
    backgroundColor: '#F5F9FF',
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D9E9F7',
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 1,
  },
  optionSelected: {
    borderColor: theme.colors.primary,
  },
  optionCorrect: {
    backgroundColor: '#EAF8E9',
    borderColor: theme.colors.success,
  },
  optionWrong: {
    backgroundColor: '#FDEDED',
    borderColor: theme.colors.error,
  },
  optionDimmed: {
    opacity: 0.35,
  },
  optionBadge: {
    fontSize: 18,
    marginRight: 10,
    minWidth: 26,
    textAlign: 'center',
  },
  optionText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  feedbackBox: {
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 2,
    padding: 12,
  },
  feedbackBoxSuccess: {
    backgroundColor: '#F0F9E8',
    borderColor: theme.colors.success,
  },
  feedbackBoxError: {
    backgroundColor: '#FFF0F0',
    borderColor: theme.colors.error,
  },
  feedbackTitle: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '800',
    marginBottom: 4,
  },
  feedbackText: {
    fontSize: 12,
    lineHeight: 18,
    color: theme.colors.text,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  resultText: {
    fontSize: 15,
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: 18,
    textAlign: 'center',
  },
  reviewSummary: {
    gap: 12,
    marginBottom: 18,
  },
  reviewItem: {
    backgroundColor: '#F8FBFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDEBFF',
    padding: 12,
  },
  reviewQuestion: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 6,
  },
  reviewStatus: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  reviewStatusCorrect: {
    color: theme.colors.success,
  },
  reviewStatusWrong: {
    color: theme.colors.error,
  },
  reviewAnswer: {
    fontSize: 12,
    color: theme.colors.muted,
    marginBottom: 2,
  },
  reviewExplanation: {
    fontSize: 12,
    color: theme.colors.text,
    marginTop: 4,
    lineHeight: 18,
  },
  emptyText: {
    color: theme.colors.muted,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 12,
  },
  rankRow: {
    backgroundColor: '#F8FBFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCEBFF',
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rankMateria: {
    fontWeight: '700',
    color: theme.colors.text,
    textTransform: 'capitalize',
    fontSize: 14,
  },
  rankMeta: {
    color: theme.colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  rankDate: {
    color: theme.colors.cyan,
    fontSize: 11,
    marginTop: 2,
  },
  rankScoreHighlight: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
  },
  rankMedal: {
    color: theme.colors.primaryHover,
    fontWeight: '700',
    textTransform: 'capitalize',
    fontSize: 12,
    marginTop: 2,
  },
  gameCardItem: {
    marginTop: 8,
    overflow: 'hidden',
  },
  gameCardMagic: {
    backgroundColor: '#1E1338',
    borderColor: '#8B3FD6',
    borderWidth: 3,
    padding: 18,
  },
  gameCardArcade: {
    backgroundColor: '#090E24',
    borderColor: '#00F0FF',
    borderWidth: 3,
    padding: 18,
    marginTop: 12,
  },
  gameBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 14,
  },
  gameBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#fff',
  },
  gameCardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  gameCardDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
    color: '#F5EEFF',
  },
  gameEmojis: {
    fontSize: 28,
    letterSpacing: 6,
    marginBottom: 14,
  },
  gameButtonMagic: {
    backgroundColor: '#A64BFF',
    borderColor: '#5D1FB2',
  },
  gameButtonArcade: {
    backgroundColor: '#FF2BD6',
    borderColor: '#B7008E',
  },
  gameWrapper: {
    flex: 1,
    backgroundColor: '#f3f8ff',
  },
  gameHeader: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f3f8ff',
  },
  gameFrame: {
    flex: 1,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#D9E9F7',
    overflow: 'hidden',
    backgroundColor: '#0d0a14',
  },
  gameWebView: {
    flex: 1,
    backgroundColor: '#0d0a14',
  },
});