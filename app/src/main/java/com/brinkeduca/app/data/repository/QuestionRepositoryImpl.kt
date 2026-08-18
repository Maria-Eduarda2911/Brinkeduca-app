package com.brinkeduca.app.data.repository

import com.brinkeduca.app.domain.model.Question
import com.brinkeduca.app.domain.repository.QuestionRepository
import com.brinkeduca.app.data.remote.BrinkeducaApi

/**
 * Implementação do repositório.
 * Faz a ponte entre a API (remoto) e o domínio.
 * Também realiza a conversão de DTOs para modelos de domínio.
 */
class QuestionRepositoryImpl(
    private val api: BrinkeducaApi
) : QuestionRepository {
    
    override suspend fun getQuestions(): List<Question> {
        // Aqui você chamaria a API e mapearia os resultados
        // return api.fetchQuestions().map { it.toDomain() }
        return emptyList()
    }
}
