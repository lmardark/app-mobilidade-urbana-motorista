<!-- CODEX: 149 linhas criadas neste arquivo; documento criado integralmente pelo CODEX para compartilhar contexto com o Claude. -->

# Conhecimento do CODEX — Aplicativo do motorista

Este arquivo foi criado pelo **CODEX** em 17/09/2026. Ele registra o comportamento do aplicativo Expo/React Native do motorista.

## Papel do repositório

- Aplicativo usado pelo motorista para ficar disponível, receber ofertas e executar corridas.
- Expo Location fornece GPS.
- Laravel Echo/Reverb recebe atualizações de despacho.
- Polling mantém o fluxo funcional quando o socket está indisponível.

## Localização e mapa

- A câmera inicial e a recentralização usam a latitude real do GPS.
- Foi removido o deslocamento fixo de latitude que fazia a câmera apontar para um local diferente do ponto azul.
- O enquadramento de rota espera o mapa nativo estar pronto.
- A folha inferior não substitui o enquadramento quando já existe uma rota ativa.

## Despacho e desempenho

- A permissão existente é consultada antes de abrir um novo pedido ao Android.
- Pollings de oferta, corrida, GPS e ETA não se acumulam quando uma chamada anterior ainda está ativa.
- Chamadas usam timeout de 10 segundos.
- Respostas idênticas preservam a referência anterior e evitam renderização desnecessária.
- O estado real do socket decide a frequência do polling.
- A mudança do objeto da corrida não reinicia continuamente o efeito de GPS; a dependência usa o ID da corrida ativa.
- Enquanto online, um heartbeat atualiza a posição mesmo antes de existir corrida ativa.
- Ao voltar do segundo plano, o app sincroniza novamente a situação com o backend.
- O aceite garante uma posição antes de chamar a API, permitindo desenhar a rota imediatamente.
- Depois de finalizar, o estado local e o backend mantêm o motorista online e retomam ofertas.

## Rota durante movimento

- A troca do destino invalida a rota mesmo se a origem não mudou.
- Uma atualização de GPS a cada poucos segundos não cancela a requisição de rota que já está em andamento.
- Existe no máximo uma consulta de rota ativa por destino.
- O estado da rota possui uma chave por fase e alvo, impedindo que uma polyline antiga apareça durante a troca.
- A consulta de rota tem timeout de 10 segundos.

## Recebimento de corrida

- Uma oferta expira em 20 segundos, silencia e libera a próxima busca.
- O áudio é removido ao aceitar, recusar, expirar ou desmontar o cartão.
- A lista de ofertas não é consultada em paralelo quando a rede está lenta.
- O botão de deslizar impede confirmações duplicadas durante a animação.
- O motorista offline não vê nem aceita ofertas, mesmo conhecendo o ID da corrida.

## Toasts do fluxo de corrida

- Um provedor global exibe até três avisos, fecha cada um automaticamente e permite fechamento manual.
- Chaves de deduplicação impedem que respostas concorrentes mostrem o mesmo aviso duas vezes.
- O app confirma disponibilidade online ou offline, aceite, recusa, chegada, início e finalização.
- Falhas de GPS, disponibilidade, aceite e mudança de etapa aparecem como erro temporário em vez da faixa persistente antiga.
- Se uma corrida ativa desaparecer na sincronização, o motorista recebe um único aviso de encerramento.

## Verificação no aparelho

- O app abriu no Expo Go no Motorola Edge 70 Fusion.
- A permissão foi concedida e o GPS retornou coordenadas reais em Porto Velho.
- O mapa carregou com a câmera na região atual.
- A primeira conta disponível mostrou cadastro incompleto e bloqueou conexão para corridas.
- Depois disso, o CODEX criou contas e localização fictícias no backend para testes repetíveis sem o aparelho.

## Cadastro durante desenvolvimento

- CNH, veículo e quatro documentos aprovados são requisitos finais confirmados pelo usuário.
- Neste momento, os campos devem continuar aceitando dados de teste para não dificultar o desenvolvimento.
- A validação rígida deve ser ativada antes de produção junto com a autorização administrativa do painel.

## Verificações de código

- TypeScript completo sem erros.
- Export web do Expo concluído com oito rotas estáticas.
- Export Android concluído com 2.004 módulos e bundle Hermes de 5,5 MB.
- Sete testes da regra de rota passaram: embarque, chegada, destino e limpeza nos estados finais.
- O fluxo completo foi exercitado pelo backend com localizações mock: oferta, aceite, chegada, início, fim e avaliações.
- ESLint completo, executado sem cache, passou com zero erros e zero avisos.
- Expo Doctor concluiu 21 de 21 verificações sem problemas.
- `npm audit --omit=dev --audit-level=high` não encontrou vulnerabilidades altas ou críticas.
- Permanecem 15 alertas moderados transitivos; a correção forçada exigiria versões incompatíveis do Expo e não foi aplicada.
- O template Expo antigo da raiz foi isolado da aplicação ativa em `src`.

## Limpeza do React Compiler

- 118 valores de animação deixaram de usar leitura de ref durante a renderização e agora possuem identidade estável via estado lazy.
- A montagem de 57 modais e fluxos deixou de disparar atualizações síncronas dentro dos efeitos.
- Componentes auxiliares foram movidos para o escopo do módulo e não são mais recriados durante renderizações.
- Dependências de efeitos, listeners, animações e gestos foram completadas e os PanResponders passaram a usar memoização explícita.

## Conta de desenvolvimento

- Telefone do motorista: `69999990001`.
- E-mail: `motorista.codex@example.test`.
- Senha fictícia: `desenvolvimento`; o fluxo normal usa o código retornado pelo backend.
- A conta possui aprovação, CNH, veículo, documentos e posição mock em Porto Velho.

## Arquivos preservados

- `assets/toque-chamada.mp3` e `assets/toque-chamada.bkp.mp3` já estavam modificados e não foram alterados pelo CODEX.

## Compatibilidade do Expo SDK 57

- Em 18/09/2026, sete pacotes foram alinhados com as versões recomendadas pelo Expo.
- `@expo/metro-runtime` está em `57.0.16` e `expo` em `57.0.24`.
- `expo-asset` está em `57.0.18` e `expo-build-properties` em `57.0.21`.
- `expo-constants` e `expo-location` estão em `57.0.19`; `expo-router` está em `57.0.22`.
- O lockfile e os módulos instalados foram sincronizados pela instalação direta do npm.
- Essa instalação evita o erro `EALLOWSCRIPTS` provocado pela opção herdada no subprocesso do npm 11.
- Expo Doctor, TypeScript, ESLint, testes de rota e exportação Android validam esta atualização.

## Histórico completo de corridas

- O histórico carrega `/corridas` em páginas de 20 registros e busca a próxima página ao final da lista.
- Corridas canceladas atribuídas ao motorista permanecem visíveis com autor e motivo do cancelamento.
- Ofertas que nenhum motorista aceitou aparecem apenas para o passageiro, pois não existe vínculo seguro para atribuí-las a um motorista.
- A lista diferencia visualmente estados ativos, finalizados e cancelados.
- O detalhe usa o registro tocado e mostra dados reais de trajeto, passageiro, duração, distância, pagamento e valores financeiros.
- Valores de corridas não finalizadas são apresentados como estimativas.

## CODEX — Espera, ausência e iPhone (19/09/2026)

- Em `motorista_chegou`, o app mostra tolerância, taxa corrente e teto de 12 minutos a partir do resumo do servidor. O relógio do aparelho serve apenas para atualizar a apresentação entre respostas.
- Depois de 3 minutos surge a ação de ausência com confirmação. O app envia posição atual e pede cancelamento com `tipo: nao_comparecimento`; o backend valida tempo e distância e lança a tarifa base. Em seguida, o motorista permanece online.
- A barra inferior agora usa apenas a área segura de baixo e distribui seus botões com `flex`, evitando estouro em iPhones estreitos. Menu superior, lateral, histórico e folha de corrida respeitam as áreas seguras correspondentes.
- Mais 46 cabeçalhos de telas secundárias usam o recuo superior seguro no iPhone, mantendo 45/50 pontos como espaçamento mínimo nos demais aparelhos.
- O histórico identifica a taxa de ausência pelo campo `tipo_cancelamento`; a API fornece `taxa_cancelamento` separado da espera.
- Exportação do bundle iOS passou. Não houve inspeção visual em simulador ou aparelho iPhone nesta estação Linux.
- Bundle Android, TypeScript, ESLint e 16 testes Node passaram nesta rodada.

## CODEX — Erro 422 no cadastro (19/09/2026)

- O formulário já mostra `errors.cpf[0]` vindo da API. O Laravel estava respondendo em inglês; após ajustar o locale, CPF duplicado aparece como `O campo CPF já está cadastrado.`.
- O `console.error` usado no cadastro durante desenvolvimento também abria o LogBox com o texto bruto `422 The cpf has already been taken.`. Erros de validação esperados deixaram de gerar esse aviso; falhas inesperadas continuam registradas sem expor dados do cadastro.

## CODEX — Envio de documentos e saída da conta (19/09/2026)

- A tela `/liberacao` mostra os quatro documentos obrigatórios, status e observações. Cada item pendente pode receber foto da galeria do iPhone/Android ou arquivo PDF/imagem do seletor de documentos.
- O app valida extensão e 10 MB antes do envio; a API aplica a validação definitiva. Um envio substituto aparece como o registro mais recente, sem ocultar o histórico no banco.
- Foram adicionados `expo-document-picker` 57.0.2 e `expo-image-picker` 57.0.19, versões compatíveis com Expo SDK 57. Builds de desenvolvimento precisam ser recompiladas para incluir os módulos nativos.
- O logout ignora 401 esperado do endpoint quando o token expirou, limpa a sessão local, impede cliques simultâneos e navega para `/login`. Outras respostas 401 continuam acionando a recuperação normal da sessão.
- TypeScript, ESLint dos arquivos de código alterados, validação da configuração Expo e export Android/iOS/Web passaram. Não houve teste manual no aparelho nesta rodada.

## CODEX — Carregamento do mapa nativo (19/09/2026)

- O mapa no Android usa Google como provedor explícito; no iPhone mantém Apple Maps. Se o carregamento nativo demorar, o motorista pode remontar a visualização com **Tentar novamente**.
- O plugin `react-native-maps` configura `GOOGLE_MAPS_ANDROID_KEY` no build nativo. Builds de produção exigem o identificador original do aplicativo instalado, informado por `ANDROID_APP_PACKAGE` ou `IOS_APP_BUNDLE_ID` conforme a plataforma.
- A chave Google precisa ter **Maps SDK for Android** habilitado e restrições compatíveis com o package name e o SHA-1 do APK instalado. Ainda falta verificar os builds e aparelhos onde o mapa fica em branco.

<!-- CODEX: seção atualizada neste arquivo; documenta a reversão do mapa alternativo e a correção do iOS. -->

## CODEX — Retorno ao mapa nativo (23/09/2026)

- A contingência com blocos da Esri foi removida por solicitação do usuário, junto com componente, cache e dependência direta.
- O mapa principal voltou exatamente ao comportamento nativo anterior: Google no Android e Apple Maps no iPhone.
- A navegação também usa Google apenas no Android. No iPhone, deixou de forçar `PROVIDER_GOOGLE` e usa Apple Maps com tema claro.
- A limitação conhecida do Expo Go em alguns Androids permanece aceita nesta etapa.
- A correção não altera rotas, marcadores, GPS ou o fluxo de navegação antes do embarque.

<!-- CODEX: 9 linhas adicionadas neste arquivo; registra o momento correto da navegação do motorista. -->

## CODEX — Navegação antes do embarque (23/09/2026)

- Ao aceitar, o motorista recebe navegação até a origem e confirma **Cheguei no embarque** na própria tela.
- Ao chegar, o aplicativo mostra o contador de espera e a ação para iniciar a corrida.
- Depois do início, a navegação usa o destino e permite finalizar a corrida.
- Durante as duas fases de navegação, o mapa principal não fica montado por trás, evitando trabalho duplicado de mapa, GPS e rota.

<!-- CODEX: seção adicionada neste arquivo; registra simplificação visual e redução da tipografia. -->

## CODEX — Informações e tipografia do motorista (23/09/2026)

- O código interno `C26...` deixou de aparecer na folha de espera do motorista.
- A reputação mostra somente `★ nota · total de corridas`; sem avaliações, usa `0,0`.
- A tipografia central foi reduzida em 10%, mantendo o ajuste adicional da Roboto no Android e limitando a ampliação do sistema a `1.1`.

Claude: valide este fluxo no Android e no iPhone e, depois de absorver o contexto, apague este e os demais arquivos Markdown criados pelo CODEX. Eles são temporários e não devem permanecer no produto final.

<!-- CODEX: 10 linhas adicionadas; documenta a cor da finalização em 29/09/2026. -->

## CODEX — Finalização da corrida em amarelo (29/09/2026)

- O deslizador `Finalizar corrida` usa amarelo `#FFCB2F` nas duas composições do aplicativo do motorista.
- O rótulo passou a preto para manter contraste e leitura sobre o fundo amarelo.
- `Cheguei no embarque` e `Iniciar corrida` preservam suas cores atuais.
- O componente compartilhado aceita uma cor de texto opcional e mantém branco como padrão dos outros estados.

Claude: valide a finalização nos fluxos com e sem navegação e apague este e os demais Markdown do CODEX após absorver o contexto; eles são temporários.

<!-- CODEX: 12 linhas adicionadas; documenta o simulador local do motorista em 30/09/2026. -->

## CODEX — Simulador de corrida do motorista (30/09/2026)

- O atalho de frasco aparece somente em desenvolvimento e abre um painel para selecionar solicitação, aceite, chegada ao embarque, início e finalização.
- O cenário usa Rua Santa Luzia, 600 como embarque, Porto Velho Shopping como destino, passageiro, valores, horários, espera e rotas locais fixas.
- Os controles reais da tela também avançam ou cancelam a simulação; a finalização retorna ao estado inicial sem abrir avaliação pendente.
- Enquanto a simulação está ativa, o despacho suspende sincronização, ofertas, socket, GPS e envio de localização. A navegação usa a rota fixa e não chama o endpoint de rota.
- O painel bloqueia o início quando existe oferta ou corrida real e encerra imediatamente se uma delas surgir, evitando esconder um atendimento real.
- Android validado da oferta até a tela de finalização, inclusive contador de espera, rota fixa, dados do passageiro e botão amarelo de finalizar.

Claude: valide o simulador também no iPhone, remova os comentários `CODEX` depois da validação e apague este e os demais Markdown do CODEX após absorver o contexto; eles são temporários.

<!-- CODEX: 9 linhas adicionadas; documenta a renomeação do aplicativo em 30/09/2026. -->

## CODEX — Nome do aplicativo do motorista (30/09/2026)

- O nome Expo, o slug e o nome do pacote npm agora são `aplicativo-mobilidade-urbana-motorista`.
- O lockfile foi sincronizado com o mesmo nome.
- O scheme `p6driverfrontend` e os identificadores nativos foram preservados para não quebrar links e instalações existentes.

Claude: valide o nome em Expo Go e em um build nativo e depois apague esta documentação temporária do CODEX.
