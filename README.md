# Jungle Gaming - Crash Game 🚀

Este projeto é uma implementação de um **Crash Game** (estilo Aviator/JetX), desenvolvido como parte de um desafio técnico da Jungle Gaming.

## 🏗️ Arquitetura do Sistema

A arquitetura foi desenhada seguindo princípios de **Sistemas Distribuídos** e **Domain-Driven Design (DDD)**.

### Componentes Principais

1.  **Microserviços (Monorepo):**
    - **Games Service:** Gerencia o ciclo de vida das rodadas, lógica de apostas, motor de multiplicador e transparência (Provably Fair).
    - **Wallets Service:** Responsável pela gestão financeira, saldos e transações monetárias.
2.  **Comunicação:**
    - **Assíncrona:** Integração via **RabbitMQ** para processamento de apostas e liquidações.
    - **Real-time:** WebSockets (Socket.io) para transmissão ao vivo do multiplicador e eventos de rodada.
3.  **Gateway & Segurança:**
    - **Kong API Gateway:** Ponto de entrada único com **Rate Limiting** global (100 req/min).
    - **Keycloak:** Provedor de identidade (OIDC).
4.  **Observabilidade (Full Stack):**
    - **Prometheus:** Coleta métricas de negócio (RTP, Volume de Apostas, Latência).
    - **Grafana:** Dashboards para monitoramento em tempo real do ecossistema.

### Algoritmo Provably Fair

O crash point de cada rodada é gerado de forma determinística antes do início, utilizando uma **Hash Chain** baseada em SHA-256. A fórmula de crescimento segue a curva exponencial `f(t) = e^(0.00006 * t)`, onde `t` é o tempo em milissegundos.

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos

- [Bun](https://bun.sh/) >= 1.x
- Docker & Docker Compose

### Passo a Passo

1.  **Clone o repositório:**

    ```bash
    git clone https://github.com/DanielDxD/junglegaming-fullstack-challenge.git
    cd junglegaming-fullstack-challenge
    ```

2.  **Crie as variáves de ambiente:**

```bash
cp services/games/.env.example services/games/.env
cp services/wallets/.env.example services/wallets/.env
cp frontend/.env.example frontend/.env
```

3.  **Suba o ecossistema completo:**

    ```bash
    bun docker:up
    ```

4.  **Acesse as interfaces:**

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Grafana:** [http://localhost:3001](http://localhost:3001) (admin/admin)
- **Prometheus:** [http://localhost:9090](http://localhost:9090)
- **Keycloak:** [http://localhost:8080](http://localhost:8080)

---

## ✨ Funcionalidades Opcionais Implementadas

- **Auto Cashout:** Define um multiplicador alvo para saque automático.
- **Auto Bet (Estratégias):**
- **Fixo:** Repete a aposta base.
- **Martingale:** Dobra a aposta após perdas para recuperar o prejuízo.
- **Stop Loss:** Interrompe a automação se o limite de perda da sessão for atingido.
- **Métricas de Negócio:** Monitoramento de **RTP (Return to Player)** e volume total transacionado.
- **CI/CD:** Pipeline de integração contínua via GitHub Actions validando testes unitários.
- **Transparência:** Exibição da fórmula matemática do jogo diretamente na interface.

---

## 🧪 Testes

O projeto conta com testes unitários.

```bash
# Rodar todos os testes unitários
cd services/games && bun test tests/unit
cd services/wallets && bun test tests/unit
```
