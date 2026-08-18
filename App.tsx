import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Definição da interface para a Questão
interface Question {
  id: string;
  category: string;
  title: string;
  options: string[];
  correctAnswerIndex: number;
}

const SAMPLE_QUESTION: Question = {
  id: '1',
  category: 'MATEMÁTICA',
  title: 'Quanto é 5 + 7?',
  options: ['A) 10', 'B) 12', 'C) 15'],
  correctAnswerIndex: 1,
};

export default function App() {
  const [question, setQuestion] = useState<Question>(SAMPLE_QUESTION);

  const handleCheckAnswer = (index: number) => {
    const isCorrect = index === question.correctAnswerIndex;

    Alert.alert(
      isCorrect ? "Correto! 🎉" : "Errado ❌",
      isCorrect ? "Você acertou a questão!" : "Tente novamente!"
    );
  };

  const handleNextQuestion = () => {
    Alert.alert("Aviso", "Buscando próxima questão no banco (via PHP)...");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      <View style={styles.content}>
        <Text style={styles.categoryText}>{question.category}</Text>

        <View style={styles.card}>
          <Text style={styles.questionText}>{question.title}</Text>
        </View>

        <View style={styles.optionsContainer}>
          {question.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionButton}
              onPress={() => handleCheckAnswer(index)}
            >
              <Text style={styles.optionButtonText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNextQuestion}
        >
          <Text style={styles.nextButtonText}>Próxima Questão</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  categoryText: {
    fontSize: 14,
    color: '#3700B3',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 24,
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#6200EE',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  optionButtonText: {
    color: '#6200EE',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#6200EE',
    padding: 18,
    borderRadius: 30,
    marginTop: 'auto',
    alignItems: 'center',
  },
  textStyle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
