package com.brinkeduca.app.domain.model

/**
 * Representa uma questão no domínio da aplicação.
 * Esta classe é independente de como os dados são recebidos da API ou salvos no banco.
 */
data class Question(
    val id: String,
    val title: String,
    val description: String,
    val options: List<String>,
    val correctAnswerIndex: Int
)
