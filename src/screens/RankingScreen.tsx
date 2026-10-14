import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Card from '../components/Card';
import { styles } from '../styles/appStyles';
import type { RegistroRanking } from '../services/ranking';

type Props = { historico: RegistroRanking[] };

export default function RankingScreen({ historico }: Props) {
  const [mostrarAjuda, setMostrarAjuda] = useState(false);

  return <>
    <Card style={styles.cardTop}>
      <Text style={styles.sectionTitle}>🏆 Ranking Pessoal</Text>
      <Text style={styles.rankingIntro}>Acompanhe suas partidas, celebre seus acertos e veja o quanto você está aprendendo!</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: mostrarAjuda }}
        onPress={() => setMostrarAjuda((visivel) => !visivel)}
        style={styles.rankingHelpButton}
      >
        <Text style={styles.rankingHelpButtonText}>{mostrarAjuda ? '✕ Fechar explicação' : '💡 Como funciona o ranking?'}</Text>
      </Pressable>

      {mostrarAjuda && <View style={styles.rankingHelpPanel}>
        <Text style={styles.rankingHelpTitle}>🎯 Cada partida é uma nova missão!</Text>
        <Text style={styles.rankingHelpText}>Ao terminar um questionário, sua pontuação fica salva no seu histórico. Cada rodada tem até 5 questões e você pode voltar para praticar quantas vezes quiser.</Text>
        <View style={styles.rankingMedalLine}><Text style={styles.rankingMedalEmoji}>🥇</Text><Text style={styles.rankingHelpText}><Text style={{ fontWeight: '800' }}>Ouro:</Text> acertou todas as questões.</Text></View>
        <View style={styles.rankingMedalLine}><Text style={styles.rankingMedalEmoji}>🥈</Text><Text style={styles.rankingHelpText}><Text style={{ fontWeight: '800' }}>Prata:</Text> acertou 3 ou 4 questões.</Text></View>
        <View style={styles.rankingMedalLine}><Text style={styles.rankingMedalEmoji}>🥉</Text><Text style={styles.rankingHelpText}><Text style={{ fontWeight: '800' }}>Bronze:</Text> acertou 1 ou 2 questões.</Text></View>
        <View style={styles.rankingMedalLine}><Text style={styles.rankingMedalEmoji}>🎖️</Text><Text style={styles.rankingHelpText}><Text style={{ fontWeight: '800' }}>Participação:</Text> você concluiu a partida — continue praticando!</Text></View>
        <Text style={styles.rankingHelpFooter}>🌟 O mais importante é aprender e superar seu próprio resultado. Cada tentativa conta!</Text>
      </View>}

      {historico.length === 0
        ? <Text style={styles.emptyText}>Ainda não há partidas salvas no seu histórico. Faça um questionário para registrar sua primeira aventura!</Text>
        : historico.map((registro) => {
          const medalhaTexto = registro.pontos === registro.total ? '🥇 Ouro' : registro.pontos >= 3 ? '🥈 Prata' : registro.pontos >= 1 ? '🥉 Bronze' : '🎖️ Participação';
          return <View key={registro.id} style={styles.rankRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rankMateria}>{registro.materia}</Text>
              <Text style={styles.rankMeta}>{registro.ano}º ano</Text>
              <Text style={styles.rankDate}>{registro.data}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.rankScoreHighlight}>{registro.pontos}/{registro.total}</Text>
              <Text style={styles.rankMedal}>{medalhaTexto}</Text>
            </View>
          </View>;
        })}
    </Card>
  </>;
}
