import React from 'react';
import { Text, View } from 'react-native';
import Card from '../components/Card';
import Button from '../components/Button';
import type { Conquista } from '../services/gamification';
import { styles } from '../styles/appStyles';

type Props = { conquistas: Conquista[]; resumo: { quizzesConcluidos: number; jogosExperimentados: number; pontosAcumulados: number; conquistasDesbloqueadas: number }; onVoltar: () => void };

export default function AchievementsScreen({ conquistas, resumo, onVoltar }: Props) {
  return <>
    <Card style={styles.cardTop}>
      <Text style={styles.resultTitle}>🏆 Minhas Conquistas</Text>
      <Text style={styles.resultText}>Cada desafio concluído é mais um passo na sua jornada de aprendizagem!</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 14 }}>
        <View style={{ flexGrow: 1, minWidth: 125, backgroundColor: '#E9F8FF', borderRadius: 16, padding: 12 }}><Text style={{ fontSize: 22 }}>📝</Text><Text style={{ color: '#154A70', fontWeight: '800', fontSize: 18 }}>{resumo.quizzesConcluidos}</Text><Text style={{ color: '#154A70', fontWeight: '700' }}>Quizzes concluídos</Text></View>
        <View style={{ flexGrow: 1, minWidth: 125, backgroundColor: '#FFF4D6', borderRadius: 16, padding: 12 }}><Text style={{ fontSize: 22 }}>⭐</Text><Text style={{ color: '#754B00', fontWeight: '800', fontSize: 18 }}>{resumo.pontosAcumulados}</Text><Text style={{ color: '#754B00', fontWeight: '700' }}>Acertos acumulados</Text></View>
        <View style={{ flexGrow: 1, minWidth: 125, backgroundColor: '#EAF8E9', borderRadius: 16, padding: 12 }}><Text style={{ fontSize: 22 }}>🎖️</Text><Text style={{ color: '#225B28', fontWeight: '800', fontSize: 18 }}>{resumo.conquistasDesbloqueadas}/{conquistas.length}</Text><Text style={{ color: '#225B28', fontWeight: '700' }}>Medalhas obtidas</Text></View>
      </View>
      <Text style={styles.sectionTitle}>Galeria de medalhas</Text>
      {conquistas.map(conquista => <View key={conquista.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, borderWidth: 2, borderColor: conquista.desbloqueada ? '#F2C14E' : '#D8E0E8', backgroundColor: conquista.desbloqueada ? '#FFFAE8' : '#F4F6F8', padding: 12, marginBottom: 10, opacity: conquista.desbloqueada ? 1 : 0.75 }}>
        <View style={{ width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', backgroundColor: conquista.desbloqueada ? '#FFE28A' : '#E1E6EB' }}><Text style={{ fontSize: 28 }}>{conquista.desbloqueada ? conquista.emoji : '🔒'}</Text></View>
        <View style={{ flex: 1 }}><Text style={{ color: '#203044', fontSize: 15, fontWeight: '900' }}>{conquista.titulo}</Text><Text style={{ color: '#536273', fontSize: 12, marginTop: 3 }}>{conquista.descricao}</Text><Text style={{ color: conquista.desbloqueada ? '#6D5200' : '#7A8794', fontSize: 11, fontWeight: '800', marginTop: 5 }}>{conquista.desbloqueada ? 'CONQUISTA DESBLOQUEADA' : 'CONTINUE JOGANDO PARA DESBLOQUEAR'}</Text></View>
      </View>)}
      <Text style={styles.emptyText}>Jogos experimentados: {resumo.jogosExperimentados}/2</Text>
    </Card>
    <Button variant="secondary" onPress={onVoltar}>← Voltar ao Menu</Button>
  </>;
}
