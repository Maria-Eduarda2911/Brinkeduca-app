import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, Image, View, Text } from 'react-native';
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
export default function App() {
 const [screen,setScreen]=useState<Screen>('home');
 const [materia,setMateria]=useState<Materia>('matematica');
 const [ano,setAno]=useState(1);
 const [indice,setIndice]=useState(0);
 const [pontos,setPontos]=useState(0);
 const [selecionada,setSelecionada]=useState<number|null>(null);
 const [fim,setFim]=useState(false);
 const [historico,setHistorico]=useState<RegistroRanking[]>([]);
 const [todasQuestoes,setTodasQuestoes]=useState<Question[]>([]);
 const [bancoPronto,setBancoPronto]=useState(false);
 const [conquistas,setConquistas]=useState<Conquista[]>([]);
 const [resumoGamificacao,setResumoGamificacao]=useState({quizzesConcluidos:0,jogosExperimentados:0,pontosAcumulados:0,conquistasDesbloqueadas:0});
 const [respostas,setRespostas]=useState<RespostaQuiz[]>([]);
 const perguntas=useMemo(()=>todasQuestoes.filter(questao=>questao.materia===materia&&questao.ano===ano).slice(0,MAX_QUESTOES),[todasQuestoes,materia,ano]);
 const perguntaAtual=perguntas[indice]??null;
 const progresso=perguntas.length===0?0:((indice+(selecionada!==null?1:0))/perguntas.length)*100;
 useEffect(()=>{let ativo=true;async function inicializar(){try{await getDatabase();const [questoes,dados]=await Promise.all([obterQuestoesDoBanco(),obterRankingPessoal()]);if(ativo){setTodasQuestoes(questoes);setHistorico(Array.isArray(dados)?dados:[]);const [lista,resumo]=await Promise.all([obterConquistas(),obterResumoGamificacao()]);setConquistas(lista);setResumoGamificacao(resumo)}}catch(error){console.warn('Não foi possível iniciar o SQLite; usando as questões locais como alternativa.',error);const questoesLocais=await fetchQuestions();if(ativo){setTodasQuestoes(questoesLocais);setHistorico([])}}finally{if(ativo)setBancoPronto(true)}}inicializar();return()=>{ativo=false}},[]);
 const atualizarGamificacao=async()=>{try{const [lista,resumo]=await Promise.all([obterConquistas(),obterResumoGamificacao()]);setConquistas(lista);setResumoGamificacao(resumo)}catch(error){console.warn('Não foi possível carregar as conquistas:',error)}};
 const abrirMatematica=async()=>{try{await registrarJogoVisitado('matemagica')}catch(error){console.warn('Não foi possível registrar o jogo:',error)}await atualizarGamificacao();setScreen('matemagica')};
 const abrirTypeBlaster=async()=>{try{await registrarJogoVisitado('typeblaster')}catch(error){console.warn('Não foi possível registrar o jogo:',error)}await atualizarGamificacao();setScreen('typeblaster')};
 const iniciarQuestionario=()=>{if(perguntas.length===0)return;setIndice(0);setPontos(0);setSelecionada(null);setFim(false);setRespostas([]);setScreen('quiz')};
 const voltarAoMenu=()=>{setIndice(0);setPontos(0);setSelecionada(null);setFim(false);setRespostas([]);setScreen('home')};
 const voltarAosJogos=()=>setScreen('games');
 const responder=async(opcaoIndex:number)=>{if(selecionada!==null||!perguntaAtual)return;const acertou=opcaoIndex===perguntaAtual.resposta_correta;setSelecionada(opcaoIndex);setPontos(valorAtual=>acertou?valorAtual+1:valorAtual);const novaResposta:RespostaQuiz={id:perguntaAtual.id,pergunta:perguntaAtual.pergunta,selecionada:opcaoIndex,correta:perguntaAtual.resposta_correta,acertou,explicacao:perguntaAtual.explicacao};setRespostas(valorAtual=>[...valorAtual,novaResposta]);const ultimoIndice=perguntas.length-1;if(indice===ultimoIndice){const pontuacaoFinal=acertou?pontos+1:pontos;await salvarPontuacaoPessoal(materia,ano,pontuacaoFinal,perguntas.length);try{await registrarConclusaoQuiz(materia,ano,pontuacaoFinal,perguntas.length)}catch(error){console.warn('Não foi possível registrar a gamificação:',error)}const [dados]=await Promise.all([obterRankingPessoal()]);setHistorico(Array.isArray(dados)?dados:[]);await atualizarGamificacao();setFim(true);return}setTimeout(()=>{setIndice(valorAtual=>valorAtual+1);setSelecionada(null)},700)};
 if(!bancoPronto)return <SafeAreaView style={styles.safeArea}><View style={styles.container}><Text style={styles.sectionTitle}>Preparando o BrincaEduca…</Text><Text style={styles.emptyText}>Carregando questões e histórico.</Text></View></SafeAreaView>;
 if(screen==='matemagica')return <MatemagicaScreen onVoltar={voltarAosJogos}/>;
 if(screen==='typeblaster')return <TypeBlasterScreen onVoltar={voltarAosJogos}/>;
 return <SafeAreaView style={styles.safeArea}><ScrollView contentContainerStyle={styles.container}><View style={styles.brandWrap}><Image source={require('./assets/logo.png')} style={styles.logo} resizeMode="contain" /></View>
 {screen==='home'&&<HomeScreen onSelectQuiz={()=>setScreen('select_quiz')} onGames={()=>setScreen('games')} onRanking={()=>setScreen('ranking')} onAchievements={()=>setScreen('achievements')}/>}
 {screen==='achievements'&&<AchievementsScreen conquistas={conquistas} resumo={resumoGamificacao} onVoltar={voltarAoMenu}/>}
 {screen==='select_quiz'&&<SelectQuizScreen materia={materia} setMateria={setMateria} ano={ano} setAno={setAno} quantidade={perguntas.length} iniciar={iniciarQuestionario} voltar={voltarAoMenu}/>}
 {screen==='quiz'&&<QuizScreen pergunta={perguntaAtual} perguntas={perguntas} indice={indice} materia={materia} ano={ano} pontos={pontos} selecionada={selecionada} fim={fim} progresso={progresso} respostas={respostas} responder={responder} sair={voltarAoMenu} voltarMenu={voltarAoMenu}/>}
 {screen==='games'&&<GamesScreen onMatemagica={abrirMatematica} onTypeBlaster={abrirTypeBlaster} onVoltar={voltarAoMenu}/>}
 {screen==='ranking'&&<RankingScreen historico={historico} onVoltar={voltarAoMenu}/>}
 </ScrollView></SafeAreaView>;
}
