package com.brinkeduca.app.domain.repository

import com.brinkeduca.app.domain.model.Question

/**
 * Interface que define as operações de dados relacionadas às questões.
 * A implementação real ficará na camada de 'data'.
 */
interface QuestionRepository {
    suspend fun getQuestions(): List<Question>
}
