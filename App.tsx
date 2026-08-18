import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

interface Question {
  id: string;
  category: string;
  title: string;
  options: string[];
  correctAnswerIndex: number;
}

const QUESTIONS: Question[] = [
  {
    id: '1',
    category: 'MATEMÁTICA',
    title: 'Quanto é 5 + 7?',
    options: ['A) 10', 'B) 12', 'C) 15', 'D) 18'],
    correctAnswerIndex: 1,
  },
  {
    id: '2',
    category: 'CIÊNCIAS',
    title: 'Qual é o maior planeta do Sistema Solar?',
    options: ['A) Terra', 'B) Júpiter', 'C) Marte', 'D) Saturno'],
    correctAnswerIndex: 1,
  },
  {
    id: '3',
    category: 'PORTUGUÊS',
    title: 'Qual palavra está escrita corretamente?',
    options: ['A) Receber', 'B) Recebr', 'C) Recever', 'D) Reseber'],
    correctAnswerIndex: 0,
  },
];

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const question = QUESTIONS[currentIndex];

  const answered = selectedIndex !== null;

  const progressLabel = useMemo(
    () => `${Math.min(currentIndex + 1, QUESTIONS.length)}/${QUESTIONS.length}`,
    [currentIndex]
  );

  const handleAnswerPress = (index: number) => {
    if (answered) return;

    setSelectedIndex(index);

    if (index === question.correctAnswerIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex === QUESTIONS.length - 1) {
      setCurrentIndex(0);
      setSelectedIndex(null);
      setScore(0);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedIndex(null);
  };

  const isCorrectSelection = (index: number) =>
    index === question.correctAnswerIndex && answered;

  const isWrongSelection = (index: number) =>
    index === selectedIndex && index !== question.correctAnswerIndex && answered;

  if (!question) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.categoryText}>{question.category}</Text>
          <Text style={styles.progressText}>{progressLabel}</Text>
        </View>

        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>Pontuação</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.questionText}>{question.title}</Text>
        </View>

        <View style={styles.optionsContainer}>
          {question.options.map((option, index) => {
            const optionStyle = [
              styles.optionButton,
              isCorrectSelection(index) && styles.optionButtonCorrect,
              isWrongSelection(index) && styles.optionButtonWrong,
            ];

            return (
              <TouchableOpacity
                key={`${question.id}-${option}`}
                style={optionStyle}
                onPress={() => handleAnswerPress(index)}
                disabled={answered}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    isCorrectSelection(index) && styles.optionButtonTextCorrect,
                    isWrongSelection(index) && styles.optionButtonTextWrong,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {answered && (
          <Text style={styles.feedbackText}>
            {selectedIndex === question.correctAnswerIndex
              ? 'Resposta correta! 🎉'
              : `Resposta errada. A correta é: ${question.options[question.correctAnswerIndex]}`}
          </Text>
        )}

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNextQuestion}
        >
          <Text style={styles.nextButtonText}>
            {currentIndex === QUESTIONS.length - 1 ? 'Reiniciar Quiz' : 'Próxima Questão'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  progressText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  scoreBox: {
    alignSelf: 'flex-end',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  scoreValue: {
    fontSize: 22,
    color: '#0F172A',
    fontWeight: '800',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  questionText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 32,
  },
  optionsContainer: {
    width: '100%',
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#C7D2FE',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  optionButtonCorrect: {
    backgroundColor: '#DCFCE7',
    borderColor: '#22C55E',
  },
  optionButtonWrong: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  optionButtonText: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '600',
  },
  optionButtonTextCorrect: {
    color: '#166534',
  },
  optionButtonTextWrong: {
    color: '#991B1B',
  },
  feedbackText: {
    marginTop: 10,
    marginBottom: 18,
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
