import React from 'react';
import { Text, View, Pressable } from 'react-native';
import Card from '../components/Card';
import Button from '../components/Button';
import { styles } from '../styles/appStyles';
import type { Materia } from '../types';
type Props = { materia: Materia; setMateria: (m: Materia) => void; ano: number; setAno: (a: number) => void; quantidade: number; iniciar: () => void };
const MATERIAS: Materia[] = ['matematica', 'portugues', 'ingles']; const ANOS = [1,2,3,4,5];
export default function SelectQuizScreen({ materia, setMateria, ano, setAno, quantidade, iniciar }: Props) {
 return <><Card style={styles.cardTop}><Text style={styles.sectionTitle}>1. Escolha a Matéria</Text><View style={styles.tabsRow}>{MATERIAS.map(item => <Pressable key={item} onPress={() => setMateria(item)} style={[styles.tab, materia === item && styles.tabActive]}><Text style={[styles.tabText, materia === item && styles.tabTextActive]}>{item}</Text></Pressable>)}</View><Text style={styles.sectionTitle}>2. Escolha o Ano Escolar</Text><View style={styles.anoRow}>{ANOS.map(numero => <Pressable key={numero} onPress={() => setAno(numero)} style={[styles.anoButton, ano === numero && styles.anoButtonActive]}><Text style={[styles.anoText, ano === numero && styles.anoTextActive]}>{numero}º</Text></Pressable>)}</View><Text style={styles.infoQuestoes}>{quantidade} questões disponíveis para {materia} ({ano}º ano). Cada partida sorteia até 5 questões.</Text><Button onPress={iniciar} disabled={quantidade === 0} style={styles.btnIniciar}>▶ Iniciar Questionário</Button></Card></>;
}
