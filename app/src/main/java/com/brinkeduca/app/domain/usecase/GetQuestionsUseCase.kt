package com.brinkeduca.app.domain.usecase

import com.brinkeduca.app.domain.model.Question
import com.brinkeduca.app.domain.repository.QuestionRepository

/**
 * Caso de uso para obter a lista de questões.
 * Aqui é onde a lógica de negócio específica deve residir.
 */
class GetQuestionsUseCase(private val repository: QuestionRepository) {
    suspend operator fun invoke(): List<Question> {
        return repository.getQuestions()
    }
}
