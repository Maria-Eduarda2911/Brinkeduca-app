# 🗺️ Guia da Estrutura do Projeto

Para que o aplicativo seja organizado e profissional, dividimos o código em camadas. Aqui está a explicação de onde cada coisa deve ficar:

## 📂 Pasta: `data` (Dados)
Aqui fica tudo que lida com a origem dos dados (Banco de Dados Online, Banco de Dados Local, Preferências).
- **`remote/`**: Contém a interface do Retrofit (`BrinkeducaApi`) que diz quais URLs vamos chamar no seu site.
- **`model/`**: Contém os `DTOs`. São classes que copiam exatamente a estrutura que o seu PHP devolve. Se o PHP mandar um campo chamado "titulo_pergunta", o DTO deve ter esse mesmo nome.
- **`repository/`**: Contém a implementação real (`QuestionRepositoryImpl`). É aqui que você decide: "Vou buscar na internet agora" ou "Vou usar o que salvei no celular".

## 📂 Pasta: `domain` (Regras de Negócio)
Esta é a parte mais importante. Ela não sabe se os dados vêm da internet ou de um arquivo. Ela só sabe **o que** o app deve fazer.
- **`model/`**: Classe `Question`. É o modelo que o resto do aplicativo (telas) vai usar. É uma versão "limpa" dos dados.
- **`usecase/`**: Pequenas classes que executam uma tarefa única, como `GetQuestionsUseCase`. Isso facilita reaproveitar código em várias telas.

## 📂 Pasta: `ui` (Interface)
Tudo que o usuário vê e toca.
- **`view/`**: Suas Activities e Fragments. Elas devem ser "burras", apenas mostrando o que o ViewModel manda.
- **`viewmodel/`**: O "cérebro" da tela. Ele pede dados para o `domain` e guarda o estado da tela (ex: "está carregando", "ocorreu erro", "aqui estão as questões").

## 📂 Pasta: `di` (Injeção de Dependência)
Aqui configuramos o Hilt ou Koin para "entregar" as peças do quebra-cabeça automaticamente para cada classe, evitando que você tenha que criar manualmente `new Repository()` em todo lugar.

---

### ⚠️ Próximo Passo Importante:
Como o **InfinityFree** não permite que o App se conecte diretamente ao MySQL (porta 3306), você **precisa** criar um arquivo PHP no seu servidor. 
Eu deixei um exemplo em: `app/src/main/java/com/brinkeduca/app/data/remote/Sample_Bridge.php`
