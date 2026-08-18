package com.brinkeduca.app.ui.viewmodel

import com.brinkeduca.app.domain.usecase.GetQuestionsUseCase

/**
 * ViewModel responsável por gerenciar o estado da tela de questões.
 * Ela se comunica com o UseCase para buscar os dados.
 */
class QuestionViewModel(private val getQuestionsUseCase: GetQuestionsUseCase) {
    // Aqui você teria StateFlows ou LiveData para a UI observar
}
