# Lanche Hoje, Amanhã e Sempre - Front-end

Este projeto é a interface de usuário para o sistema de pedidos da lanchonete "Lanche Hoje, Amanhã e Sempre". Ele é construído com HTML, CSS e JavaScript Vanilla, utilizando o framework Tailwind CSS para um design responsivo e moderno.

## Estrutura do Projeto

* `index.html`: Arquivo principal que contém toda a estrutura HTML da aplicação.
* `style.css`: Contém estilos CSS personalizados para complementar o Tailwind CSS.
* `script.js`: Toda a lógica de front-end, incluindo navegação entre telas, requisições para a API, manipulação de dados e eventos do usuário.

## Como Executar

1.  **Clone o repositório:**
    ```
    git clone [URL_DO_REPOSITORIO]
    cd LancheHojeAmanhaESempre
    ```

2.  **Abra o arquivo `index.html`:**
    Basta abrir o arquivo `index.html` diretamente no seu navegador web. Não é necessário um servidor local, pois o projeto não utiliza um back-end próprio, apenas se comunica com as APIs fornecidas.

3.  **Configuração das APIs:**
    Certifique-se de que os serviços de back-end (Customer, Product, Order, Payment) estejam rodando e acessíveis nos endereços `http://localhost:[PORTA]`. As URLs base já estão configuradas no arquivo `script.js` para as portas padrão:
    * `http://localhost:8085` (Customers)
    * `http://localhost:8082` (Products)
    * `http://localhost:8086` (Orders)
    * `http://localhost:8087` (Payments)

## Funcionalidades Implementadas

* **Tela de Pré-Pedidos:** Permite ao cliente pesquisar por CPF, cadastrar-se ou continuar como visitante. O CPF é armazenado no `localStorage`.
* **Máscara de CPF:** O campo de CPF possui uma máscara para facilitar a digitação, que é removida antes do envio da requisição.
* **Tela de Menu:** Exibe os produtos por categoria (Lanche, Acompanhamento, Bebida), com nome, descrição e preço.
* **Carrinho de Compras:** Os produtos selecionados são adicionados a um objeto de `orders`, e a quantidade de itens é exibida em um ícone de carrinho no cabeçalho.
* **Tela do Carrinho:** Mostra um resumo do pedido com a quantidade de cada item e o valor total.
* **Tela de Pagamento:** Realiza a requisição para obter o QR Code e exibe um temporizador de 1 minuto. Faz verificações a cada 5 segundos para saber se o pagamento foi concluído.
* **Responsividade:** O design se adapta a diferentes tamanhos de tela (web e celular) com o uso de Tailwind CSS.