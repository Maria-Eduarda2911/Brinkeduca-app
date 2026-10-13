export type Materia = 'matematica' | 'portugues' | 'ingles';
export type Screen = 'home' | 'select_quiz' | 'quiz' | 'games' | 'matemagica' | 'typeblaster' | 'ranking' | 'achievements';
export type RespostaQuiz = { id: number; pergunta: string; selecionada: number; correta: number; acertou: boolean; explicacao: string; };
