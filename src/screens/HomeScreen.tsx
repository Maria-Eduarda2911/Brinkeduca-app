import React from 'react';
import { Text, View } from 'react-native';
import Card from '../components/Card';
import Button from '../components/Button';
import { styles } from '../styles/appStyles';

type Props = { onSelectQuiz: () => void; onGames: () => void; onRanking: () => void; onAchievements: () => void };
export default function HomeScreen({ onSelectQuiz, onGames, onRanking, onAchievements }: Props) {
  return <Card><Text style={styles.menuSubtitle}>Escolha o que você quer fazer:</Text><View style={styles.homeMenuButtons}><Button variant="secondary" onPress={onSelectQuiz}>📝 Questões</Button><Button variant="secondary" onPress={onGames}>🎮 Jogos</Button><Button variant="secondary" onPress={onRanking}>🏆 Ranking Pessoal</Button><Button variant="secondary" onPress={onAchievements}>🌟 Minhas Conquistas</Button></View></Card>;
}
