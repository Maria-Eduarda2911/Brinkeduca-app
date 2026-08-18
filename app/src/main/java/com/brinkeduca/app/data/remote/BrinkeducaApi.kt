package com.brinkeduca.app.data.remote

import com.brinkeduca.app.data.model.QuestionDto

import retrofit2.http.GET

/**
 * Interface para o Retrofit definir os endpoints da API.
 * Aqui você define as rotas que chamam seus arquivos PHP.
 */
interface BrinkeducaApi {
    
    @GET("get_questoes.php")
    suspend fun fetchQuestions(): List<QuestionDto>
}
