# Brinkeduca App 🎓

![Android](https://img.shields.io/badge/Platform-Android-3DDC84?style=for-the-badge&logo=android&logoColor=white)
![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![PHP](https://img.shields.io/badge/Bridge-PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)

## 🗄️ Integração de Dados

O aplicativo consome dados de um banco **MySQL** hospedado no InfinityFree. 

> [!IMPORTANT]
> **Arquitetura de Segurança**: Devido às restrições de acesso remoto do MySQL no InfinityFree, utilizaremos um script PHP como ponte (API Bridge). O App faz uma requisição HTTP para o PHP, que por sua vez consulta o banco e retorna os dados em formato JSON.


## 🏗️ Estrutura do Projeto

O projeto segue os princípios da **Clean Architecture** e o padrão **MVVM (Model-View-ViewModel)**, garantindo que o código seja testável, escalável e fácil de manter.

### Camadas:

- **`data`**: Responsável pela persistência de dados e comunicação com a API externa.
  - `remote/`: Interfaces Retrofit e serviços de rede.
  - `model/`: DTOs (Data Transfer Objects) que representam a resposta da API.
  - `repository/`: Implementações dos repositórios que decidem se os dados vêm da rede ou cache local.
- **`domain`**: Contém a lógica de negócio pura. Independente de qualquer framework.
  - `model/`: Entidades de domínio usadas em todo o app.
  - `repository/`: Interfaces que definem o contrato para a camada de dados.
  - `usecase/`: Casos de uso específicos (ex: `GetQuestionsUseCase`).
- **`ui`**: Camada de apresentação.
  - `view/`: Activities, Fragments e componentes Jetpack Compose.
  - `viewmodel/`: Gerencia o estado da UI e se comunica com a camada de domínio.
- **`di`**: Módulos de Injeção de Dependência (ex: Hilt).

## 🚀 Próximos Passos

1.  **Integração com API**: Configurar Retrofit para se conectar ao banco de dados online do Brinkeduca.
2.  **Persistência Local**: Implementar Room para permitir o acesso às questões offline.
3.  **UI/UX**: Desenvolver as telas de listagem e detalhes das questões usando Material Design 3.

---
Desenvolvido com ❤️ para a educação.
