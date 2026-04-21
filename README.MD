# Daily diet API

> DESAFIO: construir uma API para registro e acompanhamento da dieta de um ou mais usuários

## Variáveis de ambiente

## Mais sobre o projeto

- [Descrição](https://efficient-sloth-d85.notion.site/Desafio-02-be7cdb37aaf74ba898bc6336427fa410)
- [Figma](https://www.figma.com/pt-br/comunidade/file/1218573349379609244/daily-diet-desafio-react-native)

Nesse desafio desenvolveremos uma API para controle de dieta diária, a Daily Diet API.

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