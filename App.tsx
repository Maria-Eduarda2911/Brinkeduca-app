import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import theme from './src/theme';
import Button from './src/components/Button';
import Card from './src/components/Card';

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
  const answered = selectedIndex !== null;

  const progressLabel = useMemo(
    () => `${Math.min(currentIndex + 1, QUESTIONS.length)}/${QUESTIONS.length}`,
    [currentIndex]
  );

  const question = QUESTIONS[currentIndex];

  const handleAnswerPress = useCallback(
    (index: number) => {
      if (answered) return;

      setSelectedIndex(index);

      if (index === question.correctAnswerIndex) {
        setScore((prev) => prev + 1);
      }
    },
    [answered, question.correctAnswerIndex]
  );

  const handleNextQuestion = useCallback(() => {
    if (currentIndex === QUESTIONS.length - 1) {
      setCurrentIndex(0);
      setSelectedIndex(null);
      setScore(0);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedIndex(null);
  }, [currentIndex]);

  const isCorrectSelection = useCallback(
    (index: number) => index === question.correctAnswerIndex && answered,
    [answered, question.correctAnswerIndex]
  );

  const isWrongSelection = useCallback(
    (index: number) => index === selectedIndex && index !== question.correctAnswerIndex && answered,
    [answered, question.correctAnswerIndex, selectedIndex]
  );

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

        <Card>
          <Text style={styles.questionText}>{question.title}</Text>
        </Card>

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

        <Button onPress={handleNextQuestion} style={styles.nextButton}>
          {currentIndex === QUESTIONS.length - 1 ? 'Reiniciar Quiz' : 'Próxima Questão'}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
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
    color: theme.colors.primary,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontFamily: theme.fonts.heading,
  },
  progressText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  scoreBox: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.cyanSoft,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  scoreLabel: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '800',
    textTransform: 'uppercase',
    fontFamily: theme.fonts.heading,
  },
  scoreValue: {
    fontSize: 22,
    color: theme.colors.text,
    fontWeight: '800',
    textAlign: 'center',
    fontFamily: theme.fonts.heading,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 30,
    fontFamily: theme.fonts.heading,
  },
  optionsContainer: {
    width: '100%',
  },
  optionButton: {
    borderWidth: 3,
    borderColor: theme.colors.cyanSoft,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
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
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: theme.fonts.body,
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
    color: theme.colors.muted,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: theme.fonts.body,
  },
  nextButton: {
    alignSelf: 'stretch',
  },
});
