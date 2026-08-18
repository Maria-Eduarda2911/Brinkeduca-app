package com.brinkeduca.app.data.model

/**
 * Objeto de transferência de dados (DTO) para representar a questão vinda da API.
 * Geralmente inclui anotações do Serializador (ex: @SerializedName do Gson).
 */
data class QuestionDto(
    val id: String?,
    val titulo: String?,
    val descricao: String?,
    val opcoes: List<String>?,
    val resposta_correta: Int?
)
