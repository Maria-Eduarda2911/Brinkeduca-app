# Brinkeduca App 🎓

![React Native](https://img.shields.io/badge/Platform-React--Native-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Expo](https://img.shields.io/badge/Framework-Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

Aplicativo mobile do projeto Brinkeduca, pensado para complementar o site institucional e a plataforma de estudos. A ideia principal é transformar a experiência de aprendizagem em uma versão mobile mais prática, rápida e acessível para alunos e professores.

O app foi desenvolvido em React Native com Expo e está alinhado com o site de referência:

https://brinkeduca.infinityfree.me/index?i=1

<img width="281" height="463" alt="image" src="https://github.com/user-attachments/assets/fed9bee2-196f-4f61-abce-922ea5dc031c" />

## 🎯 Objetivo do projeto

O Brinkeduca busca oferecer uma experiência de estudo com foco em:

- interação simples e amigável
- questões por categoria
- feedback imediato ao responder
- acompanhamento de pontuação
- evolução para uma versão mais completa com login, banco de dados e conteúdos dinâmicos

## 🔗 Relação com o site

Esse app funciona como uma extensão móvel do projeto web. O site serve como base visual e conceitual, enquanto o app oferece uma experiência mais direta para uso em celular, com navegação mais leve e foco em tarefa de estudo.

Em outras palavras:

- site: apresentação e conteúdo geral do projeto
- app: experiência mobile otimizada para uso rápido e estudo contínuo

## 🧩 Funcionalidade atual

A versão atual do app inclui:

- tela de boas-vindas / quiz inicial
- categorias de questões
- perguntas com múltipla escolha
- validação da resposta
- retorno visual de acerto ou erro
- pontuação acumulada
- botão para avançar para a próxima questão

## 🚀 Como rodar

1. Abra a pasta do projeto no VS Code.
2. Certifique-se de ter o Node.js instalado.
3. Instale as dependências:

```bash
npm install
```

4. Inicie o Expo:

```bash
npx expo start
```

5. Use o Expo Go no celular para escanear o QR Code ou rode em navegador com:

```bash
npx expo start --web
```

## 🏗️ Estrutura principal

- `App.tsx`: tela principal da aplicação e lógica do quiz
- `app.json`: configuração do Expo
- `package.json`: dependências e scripts do projeto
- `tsconfig.json`: configuração do TypeScript

## 📌 Observações

Este projeto está em evolução. A versão atual funciona como protótipo funcional para validar o fluxo do app, e a próxima etapa pode incluir:

- integração com backend/PHP
- cadastro de usuários
- banco de questões
- ranking e progresso
- autenticação

---

Desenvolvido como parte do projeto Brinkeduca em ambiente Expo/React Native.

## Banco de dados SQLite

O aplicativo utiliza `expo-sqlite` e cria automaticamente o arquivo local `brinkeduca.db` na primeira inicialização.

- `questoes`: importa as questões de `api/questoes.json` para o SQLite e completa registros ausentes caso uma instalação anterior tenha criado uma carga parcial.
- `ranking_pessoal`: guarda as pontuações e medalhas no aparelho, mesmo depois de fechar o app.
- Migração: o histórico antigo salvo com AsyncStorage é copiado para o SQLite quando a tabela do ranking ainda está vazia.

Para instalar/alinhar a dependência com a versão do Expo do projeto e atualizar o lockfile, execute na pasta do projeto:

```bash
npx expo install expo-sqlite
npm install
npx expo start
```

O SQLite nativo deve ser testado no Expo Go compatível com o SDK do projeto.



## Gamificação e conquistas

O app possui uma tela **Minhas Conquistas**, acessível pelo menu inicial. O progresso fica salvo localmente no SQLite, nas tabelas `conquistas`, `eventos_gamificacao` e `jogos_visitados`.

Conquistas disponíveis:
- **Gênio da Matemática:** acertar 5 de 5 questões em um quiz de Matemática.
- **Explorador:** abrir os dois jogos educativos.
- **Primeiro Passo:** concluir o primeiro quiz.
- **Aprendiz Persistente:** concluir cinco quizzes.
- **Colecionador de Medalhas:** obter três conquistas.

A tela também mostra quizzes concluídos, acertos acumulados, jogos experimentados e a galeria de medalhas desbloqueadas ou ainda bloqueadas.


## Navegação e sorteio de questões

- As telas internas contam com uma barra de navegação com **Voltar** e **Início**; no Android, o botão físico de voltar também respeita a navegação entre telas.
- O quiz filtra as questões pelo ano escolar e pela disciplina selecionados.
- Cada partida sorteia até cinco questões sem repetição dentro da rodada. Quando há questões alternativas, o app evita repetir exatamente o mesmo conjunto na partida seguinte da mesma disciplina e ano.
- A tela de Ranking Pessoal inclui um guia expansível que explica as medalhas e incentiva a criança a acompanhar a própria evolução.
