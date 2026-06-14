# Daily diet API

> DESAFIO: construir uma API para registro e acompanhamento da dieta de um ou mais usuários

## Mais sobre o projeto

- [Descrição](https://efficient-sloth-d85.notion.site/Desafio-02-be7cdb37aaf74ba898bc6336427fa410)
- [Figma](https://www.figma.com/pt-br/comunidade/file/1218573349379609244/daily-diet-desafio-react-native)

Nesse desafio desenvolveremos uma API para controle de dieta diária, a Daily Diet API.

<details>
<summary>Saiba mais</summary>

### Regras da aplicação

- Deve ser possível criar um usuário
- Deve ser possível identificar o usuário entre as requisições
- Deve ser possível registrar uma refeição feita, com as seguintes informações:
    - Nome
    - Descrição
    - Data e Hora
    - Está dentro ou não da dieta

    > As refeições devem ser relacionadas a um usuário.
    
- Deve ser possível editar uma refeição, podendo alterar todos os dados acima
- Deve ser possível apagar uma refeição
- Deve ser possível listar todas as refeições de um usuário
- Deve ser possível visualizar uma única refeição
- Deve ser possível recuperar as métricas de um usuário
    - Quantidade total de refeições registradas
    - Quantidade total de refeições dentro da dieta
    - Quantidade total de refeições fora da dieta
    - Melhor sequência de refeições dentro da dieta
- O usuário só pode visualizar, editar e apagar as refeições o qual ele criou

### Contexto da aplicação

É comum ao estar desenvolvendo uma API, imaginar como esses dados vão estar sendo utilizados pelo cliente web e/ou mobile.

Por isso, deixamos abaixo o link para o layout da aplicação que utilizaria essa API.

</details>

## Instalação e execução

A execução da aplicação pode ser realizada diretamente do _host_, com Node.js 18.13.0 e um SGBD previamente instalados, ou a partir de _containers_ Docker.

Em ambos os casos, o ambiente deve ser configurado com as variáveis de ambiente constantes no arquivo `.env.example`.

**Bancos de dados suportados:**

- MySQL
- PostgreSQL
- SQLite

<details>
<summary>Execução diretamente no _host_</summary>

**Preparação do ambiente**

1. O _host_ deve ter o Node.js 18.13.0 previamente instalado.

2. Uma base de dados / _schema_ deve ser criada num SGBD para o armazenamento dos dados.

3. As variáveis de ambiente devem ser configuradas no _host_. Veja quais no arquivo `.env.sample`.

4. Instale as dependências do projeto com o npm ou o seu gerenciador de pacotes favorito

```sh
npm install
```

5. Execute a rotina de criação das tabelas.

```sh
npx knext -- migrate:latest
```

6. Execute a aplicação em modo de desenvolvimento (opcional)

    6.1 A aplicação será executada em TypeScript, com o seguinte comando:

```sh
npm run dev
```

7. Execute a _build_ da aplicação

```sh
npm run build
```

8. Inicie a aplicação

```sh
npm run start
```

</details>

<details>
<summary>Execução em _containers_ Docker</summary>
</details>