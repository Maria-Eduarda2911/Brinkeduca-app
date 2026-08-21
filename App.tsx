import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import theme from './src/theme';
import Button from './src/components/Button';
import Card from './src/components/Card';

interface Question {
  id: string;
  year: number;
  category: string;
  title: string;
  options: string[];
  correctAnswerIndex: number;
}

const QUESTIONS: Question[] = [
  {
    id: '1',
    year: 1,
    category: 'MATEMÁTICA',
    title: 'Quanto é 5 + 7?',
    options: ['10', '12', '15', '18'],
    correctAnswerIndex: 1,
  },
  {
    id: '2',
    year: 1,
    category: 'CIÊNCIAS',
    title: 'Qual é o maior planeta do Sistema Solar?',
    options: ['Terra', 'Júpiter', 'Marte', 'Saturno'],
    correctAnswerIndex: 1,
  },
  {
    id: '3',
    year: 1,
    category: 'PORTUGUÊS',
    title: 'Qual palavra está escrita corretamente?',
    options: ['Receber', 'Recebr', 'Recever', 'Reseber'],
    correctAnswerIndex: 0,
  },
];

const YEARS = [1, 2, 3, 4, 5];

export default function App() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  if (selectedYear === null) {
    return <HomeScreen onSelectYear={setSelectedYear} />;
  }

  return (
    <QuizScreen
      year={selectedYear}
      onBack={() => setSelectedYear(null)}
    />
  );
}

/* =========================================================
   TELA INICIAL
========================================================= */

interface HomeScreenProps {
  onSelectYear: (year: number) => void;
}

function HomeScreen({ onSelectYear }: HomeScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.homeContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.homeHeader}>
          <Text style={styles.logo}>🌈</Text>

          <Text style={styles.appTitle}>
            BrincaEduca
          </Text>

          <Text style={styles.appSubtitle}>
            Aprender pode ser divertido!
          </Text>
        </View>

        <Text style={styles.chooseTitle}>
          Escolha seu ano escolar
        </Text>

        <Text style={styles.chooseSubtitle}>
          Vamos aprender brincando?
        </Text>

        <View style={styles.yearsContainer}>
          {YEARS.map((year) => (
            <TouchableOpacity
              key={year}
              activeOpacity={0.85}
              onPress={() => onSelectYear(year)}
            >
              <Card>
                <View style={styles.yearCardContent}>
                  <View style={styles.bookIcon}>
                    <Text style={styles.bookEmoji}>📚</Text>
                  </View>

                  <View style={styles.yearInfo}>
                    <Text style={styles.yearTitle}>
                      {year}º ano
                    </Text>

                    <Text style={styles.yearDescription}>
                      Matemática, Português e Ciências
                    </Text>

                    <Text style={styles.startText}>
                      Começar →
                    </Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.footerText}>
          Escolha seu ano e comece a aprender! ⭐
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================================================
   TELA DO QUIZ
========================================================= */

interface QuizScreenProps {
  year: number;
  onBack: () => void;
}

function QuizScreen({ year, onBack }: QuizScreenProps) {
  const yearQuestions = QUESTIONS.filter(
    (question) => question.year === year
  );

  if (yearQuestions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />

        <View style={styles.emptyYearContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
          >
            <Text style={styles.backButtonText}>
              ← Voltar
            </Text>
          </TouchableOpacity>

          <View style={styles.emptyContent}>
            <Text style={styles.emptyEmoji}>
              🚧
            </Text>

            <Text style={styles.emptyTitle}>
              {year}º ano
            </Text>

            <Text style={styles.emptyText}>
              As atividades deste ano ainda estão sendo
              preparadas.
            </Text>

            <Button onPress={onBack}>
              Escolher outro ano
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <QuizContent
      questions={yearQuestions}
      year={year}
      onBack={onBack}
    />
  );
}

/* =========================================================
   CONTEÚDO DO QUIZ
========================================================= */

interface QuizContentProps {
  questions: Question[];
  year: number;
  onBack: () => void;
}

function QuizContent({
  questions,
  year,
  onBack,
}: QuizContentProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] =
    useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = questions[currentIndex];

  const answered = selectedIndex !== null;

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
    if (currentIndex === questions.length - 1) {
      setFinished(true);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedIndex(null);
  }, [currentIndex, questions.length]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setSelectedIndex(null);
    setScore(0);
    setFinished(false);
  }, []);

  const isCorrectSelection = useCallback(
    (index: number) =>
      index === question.correctAnswerIndex && answered,
    [answered, question.correctAnswerIndex]
  );

  const isWrongSelection = useCallback(
    (index: number) =>
      index === selectedIndex &&
      index !== question.correctAnswerIndex &&
      answered,
    [
      answered,
      question.correctAnswerIndex,
      selectedIndex,
    ]
  );

  /* =======================================================
     RESULTADO
  ======================================================= */

  if (finished) {
    const percentage = Math.round(
      (score / questions.length) * 100
    );

    let message = 'Continue tentando! 💪';

    if (percentage === 100) {
      message = 'Perfeito! Você acertou tudo! 🏆';
    } else if (percentage >= 70) {
      message = 'Muito bem! Você foi ótimo! 🌟';
    } else if (percentage >= 50) {
      message = 'Muito bom! Continue estudando! 😊';
    }

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />

        <View style={styles.resultContainer}>
          <Text style={styles.resultEmoji}>
            🎉
          </Text>

          <Text style={styles.resultTitle}>
            Parabéns!
          </Text>

          <Text style={styles.resultSubtitle}>
            Você terminou o quiz do {year}º ano!
          </Text>

          <View style={styles.resultScoreBox}>
            <Text style={styles.resultScoreLabel}>
              SUA PONTUAÇÃO
            </Text>

            <Text style={styles.resultScore}>
              {score}/{questions.length}
            </Text>

            <Text style={styles.resultPercentage}>
              {percentage}%
            </Text>
          </View>

          <Text style={styles.resultMessage}>
            {message}
          </Text>

          <Button
            onPress={handleRestart}
            style={styles.resultButton}
          >
            Jogar novamente
          </Button>

          <TouchableOpacity
            style={styles.resultBackButton}
            onPress={onBack}
          >
            <Text style={styles.resultBackText}>
              ← Escolher outro ano
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /* =======================================================
     PERGUNTA
  ======================================================= */

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.quizBackButton}
          onPress={onBack}
        >
          <Text style={styles.quizBackText}>
            ← Voltar
          </Text>
        </TouchableOpacity>

        <View style={styles.headerRow}>
          <Text style={styles.categoryText}>
            {question.category}
          </Text>

          <Text style={styles.progressText}>
            {currentIndex + 1}/{questions.length}
          </Text>
        </View>

        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>
            Pontuação
          </Text>

          <Text style={styles.scoreValue}>
            {score}
          </Text>
        </View>

        <Card>
          <Text style={styles.questionText}>
            {question.title}
          </Text>
        </Card>

        <View style={styles.optionsContainer}>
          {question.options.map((option, index) => {
            const optionStyle = [
              styles.optionButton,
              isCorrectSelection(index) &&
                styles.optionButtonCorrect,
              isWrongSelection(index) &&
                styles.optionButtonWrong,
            ];

            return (
              <TouchableOpacity
                key={`${question.id}-${option}`}
                style={optionStyle}
                onPress={() =>
                  handleAnswerPress(index)
                }
                disabled={answered}
                activeOpacity={0.8}
              >
                <View style={styles.optionLetter}>
                  <Text style={styles.optionLetterText}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.optionButtonText,
                    isCorrectSelection(index) &&
                      styles.optionButtonTextCorrect,
                    isWrongSelection(index) &&
                      styles.optionButtonTextWrong,
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
            {selectedIndex ===
            question.correctAnswerIndex
              ? 'Resposta correta! 🎉'
              : `Resposta errada. A correta é: ${
                  question.options[
                    question.correctAnswerIndex
                  ]
                }`}
          </Text>
        )}

        <Button
          onPress={handleNextQuestion}
          style={styles.nextButton}
        >
          {currentIndex === questions.length - 1
            ? 'Ver resultado'
            : 'Próxima questão'}
        </Button>
      </View>
    </SafeAreaView>
  );
}

/* =========================================================
   ESTILOS
========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },

  /* HOME */

  homeContent: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    paddingBottom: 40,
  },

  homeHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },

  logo: {
    fontSize: 48,
    marginBottom: 4,
  },

  appTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: theme.colors.primary,
    fontFamily: theme.fonts.heading,
  },

  appSubtitle: {
    marginTop: 4,
    fontSize: 16,
    color: theme.colors.muted,
    fontWeight: '600',
    fontFamily: theme.fonts.body,
  },

  chooseTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
    fontFamily: theme.fonts.heading,
  },

  chooseSubtitle: {
    marginTop: 6,
    marginBottom: 22,
    fontSize: 15,
    color: theme.colors.muted,
    textAlign: 'center',
    fontFamily: theme.fonts.body,
  },

  yearsContainer: {
    width: '100%',
  },

  /*
   * O Card agora é responsável pelo contorno/sombreado.
   * Esse estilo apenas organiza o conteúdo dentro dele.
   */
  yearCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  bookIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: theme.colors.cyanSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  bookEmoji: {
    fontSize: 34,
  },

  yearInfo: {
    flex: 1,
  },

  yearTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
  },

  yearDescription: {
    marginTop: 4,
    fontSize: 13,
    color: theme.colors.muted,
    fontWeight: '600',
    fontFamily: theme.fonts.body,
  },

  startText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '900',
    color: theme.colors.primary,
    fontFamily: theme.fonts.heading,
  },

  footerText: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 14,
    color: theme.colors.muted,
    fontWeight: '600',
  },

  /* QUIZ */

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 18,
    justifyContent: 'center',
  },

  quizBackButton: {
    alignSelf: 'flex-start',
    marginBottom: 18,
  },

  quizBackText: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: '800',
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
    marginTop: 20,
  },

  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.cyanSoft,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  optionLetter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.cyanSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  optionLetterText: {
    fontSize: 15,
    fontWeight: '900',
    color: theme.colors.primary,
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
    flex: 1,
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

  /* VOLTAR */

  backButton: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },

  backButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '800',
  },

  /* ANO SEM QUESTÕES */

  emptyYearContainer: {
    flex: 1,
  },

  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 35,
  },

  emptyEmoji: {
    fontSize: 60,
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
  },

  emptyText: {
    marginTop: 12,
    marginBottom: 25,
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.muted,
    textAlign: 'center',
    fontFamily: theme.fonts.body,
  },

  /* RESULTADO */

  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
  },

  resultEmoji: {
    fontSize: 70,
    marginBottom: 10,
  },

  resultTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: theme.colors.primary,
    fontFamily: theme.fonts.heading,
  },

  resultSubtitle: {
    marginTop: 8,
    fontSize: 16,
    color: theme.colors.muted,
    textAlign: 'center',
    fontFamily: theme.fonts.body,
  },

  resultScoreBox: {
    width: '100%',
    marginTop: 30,
    marginBottom: 20,
    padding: 24,
    borderRadius: 20,
    backgroundColor: theme.colors.cyanSoft,
    borderWidth: 3,
    borderColor: theme.colors.primary,
    alignItems: 'center',
  },

  resultScoreLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: theme.colors.primary,
  },

  resultScore: {
    marginTop: 5,
    fontSize: 42,
    fontWeight: '900',
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
  },

  resultPercentage: {
    marginTop: 2,
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.primary,
  },

  resultMessage: {
    marginBottom: 25,
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
  },

  resultButton: {
    width: '100%',
  },

  resultBackButton: {
    marginTop: 20,
    padding: 10,
  },

  resultBackText: {
    fontSize: 15,
    color: theme.colors.primary,
    fontWeight: '800',
  },
});