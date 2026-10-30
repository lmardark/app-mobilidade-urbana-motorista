<!-- CODEX: 142 linhas criadas pelo CODEX. Remover este arquivo e os comentários CODEX após validar ou commitar. -->

# Revisão do aplicativo do motorista — CODEX

Este documento foi criado pelo **CODEX** para contextualizar a validação do Claude. Ele é temporário.

## Implementações

- Mapa branco com tratamento de permissão, nova tentativa de carregamento e chave nativa obrigatória no build de produção.
- Botão de centralização preso ao canto inferior direito, acompanhando continuamente a folha; fica oculto com a folha totalmente aberta.
- Reenquadramento para a posição do motorista e para a rota sem sobrescrever a interação manual a cada leitura do GPS.
- Pausa de polling, Reverb e GPS quando o aplicativo está em segundo plano.
- Sincronização da disponibilidade e da corrida ativa com o servidor ao abrir ou retomar o aplicativo.
- Motorista permanece online após finalizar uma corrida ou cancelar por não comparecimento.
- Lista real de solicitações com atualização, estado offline e corridas recusadas mantidas para reconsideração na sessão.
- Oferta expira após 20 segundos, inclusive com a remontagem de efeitos do React; temporizador e som não reiniciam quando a lista atualiza.
- Toast centralizado, sem botão de fechar, com fade-in e duração curta, exibido somente no aceite da corrida.
- Nota do passageiro exibida na oferta e desde o estado `aceita`; a reputação mostra somente `★ nota · total de corridas`, usando `0,0` sem avaliações. Nome e foto seguem a regra de privacidade retornada pelo backend, sem exibir o texto sobre foto protegida.
- Avaliação pendente pode ser adiada por 12 horas sem reaparecer a cada abertura do aplicativo.
- Ganho diário calculado pelo histórico real e atualizado após o fim da corrida; removidos saldos, metas e estatísticas fictícias das telas acessíveis.
- Menu lateral e preferências usam dados reais e ações funcionais; itens de protótipo sem backend foram retirados do fluxo acessível.
- Logout idempotente, limpeza local mesmo com token expirado, encerramento do Reverb e tentativa única de renovação em respostas 401.
- Cadastro do motorista sem confirmação de senha e sem falsa etapa de confirmação de e-mail; validação local do CPF e mensagens em português.
- Upload multipart deixa o Axios gerar o boundary correto.
- API com timeout, exigência de HTTPS em produção e logs de autenticação reduzidos.

## Causas encontradas

- O mapa recebia uma nova região controlada a cada evento do GPS, causando renderizações e recentralizações involuntárias.
- A disponibilidade local podia divergir do servidor ao reabrir o aplicativo.
- O callback da recusa mudava a cada polling e reiniciava o ciclo de vida da oferta.
- A avaliação dispensada não era persistida e voltava imediatamente.
- Diversas telas exibiam números e cadastros fictícios como se fossem dados reais.
- O logout dependia do sucesso da API e podia repetir uma chamada com token já inválido.
- O cabeçalho JSON fixo em `FormData` podia produzir upload sem boundary.

## Validações executadas

- `npx tsc --noEmit`: aprovado.
- `npm run lint`: aprovado.
- `npx expo-doctor`: 21 de 21 verificações aprovadas.
- `npx expo export --platform android`: bundle Android gerado com sucesso.
- Teste no Motorola Edge 70 Fusion: mapa, localização, folha nos três níveis, botão de centralização, ganhos reais, menu, preferências, logout, estado online/offline e abertura de solicitações.
- Logcat durante os testes: sem erro React Native, exceção fatal ou crash.
- A conta foi deixada offline ao fim dos testes.

## Limites da validação

- Não aceitei uma solicitação real para evitar interferir em uma corrida; o fluxo de aceite foi validado por tipos, build e proteção transacional já existente no backend.
- O Expo Go não reproduz integralmente chaves e permissões de um binário nativo; o funcionamento em vários aparelhos também exige que as restrições da chave Google Maps aceitem os identificadores e certificados de cada build.
- A cobrança por cancelamento do passageiro e a precisão do embarque estão sendo tratadas pelo Claude, conforme divisão informada pelo usuário.

## Correção do momento da navegação

- No estado `aceita`, a navegação abre imediatamente e guia o motorista até a origem, com a ação **Cheguei no embarque**.
- No estado `motorista_chegou`, a navegação sai de cena e aparece a folha com contador de espera e ação **Iniciar corrida**.
- No estado `em_andamento`, a navegação volta com o destino como alvo e a ação **Finalizar corrida**.
- O mapa principal deixa de renderizar por trás da navegação, evitando dois mapas, dois listeners de GPS e duas requisições de rota simultâneas.

## Ajustes finais de mapa e interface

- A camada alternativa da Esri e seu cache foram revertidos; os aplicativos voltaram aos mapas nativos anteriores.
- Na navegação, Android usa Google e iPhone usa Apple Maps, corrigindo o provedor forçado que quebrava o mapa no iOS.
- O código interno da corrida foi removido da folha do motorista e do acompanhamento do passageiro.
- A fonte central do motorista foi reduzida em 10%, com teto de ampliação do sistema ajustado para `1.1`.

## Separação do perfil na corrida atual

- A sincronização de corrida ativa agora envia `perfil=motorista` ao backend.
- Isso impede que uma conta com cadastro simultâneo de motorista e passageiro carregue no aplicativo do motorista uma solicitação feita por ela como passageiro.
- A API mantém compatibilidade com clientes antigos que ainda não enviam o parâmetro.
- TypeScript, Prettier e ESLint passaram; permaneceu somente um aviso preexistente sobre o cálculo visual do horário estimado em `NavegacaoAtiva.tsx`.

## Metro Web e componentes nativos (24/09/2026)

- O erro `(0, codegenNativeComponent) is not a function` foi reproduzido no SSR Web de desenvolvimento com HTTP 500.
- A causa era a rota Web `/home` importar `react-native-maps`, que só possui implementação nativa nesse fluxo.
- `src/app/home.web.tsx` isola a rota do navegador e orienta o desenvolvedor a abrir o QR pelo Expo Go. Android e iPhone continuam resolvendo `home.tsx` e mantêm mapa, GPS e navegação.
- Após a alteração, `/home` e `/` responderam HTTP 200 no Metro iniciado com cache limpo; o texto da tela Web também foi confirmado no HTML renderizado.
- O aviso `shadow*` continua não fatal e vem da camada de compatibilidade Web durante a avaliação das rotas. Ele não aparece como erro nos bundles móveis nem interfere no Expo Go.
- TypeScript e ESLint passaram. As exportações Android e iOS do motorista foram concluídas.

## Câmera da navegação no iPhone (24/09/2026)

- A imagem enviada mostrava coordenadas corretas e distância de 3 metros, porém o Apple Maps continuava no zoom continental.
- A causa era o uso exclusivo de `zoom`, propriedade usada pelo Google Maps. O Apple Maps controla essa escala com `altitude`.
- A câmera da navegação agora envia `zoom: 18` para Android e `altitude: 350` para iPhone; a câmera inicial usa a origem/destino com escala segura nas duas plataformas.
- Eventos de GPS recebidos antes de `onMapReady` ficam preservados e são reaplicados assim que o mapa estiver pronto.
- Heading e última coordenada passaram para refs, evitando uma renderização adicional em cada leitura de localização.
- O cálculo de horário previsto deixou de chamar `Date.now()` durante o render e é atualizado a cada 30 segundos.
- TypeScript, Prettier e ESLint passaram sem avisos no componente. O bundle iOS foi exportado para verificar a integração nativa.

## Folha de espera sem cancelamento por ausência (24/09/2026)

- O texto `Cancelamento por ausência após 3 minutos`, a ação `Passageiro não apareceu` e o diálogo associado foram removidos da folha `CorridaEmAndamento.tsx`.
- A regra e o endpoint de não comparecimento permanecem no código de domínio/backend, mas não são oferecidos nessa interface.
- O timer, endereço, dados do passageiro, ligação e ação `Iniciar corrida` foram preservados.
- TypeScript, Prettier e ESLint passaram sem erros ou avisos.

## Barra compacta a caminho do embarque (24/09/2026)

- Quando a corrida está em `aceita`, a folha abre expandida com as informações anteriores: estimativa, pagamento, nome, nota, total de corridas, telefone e **Cheguei no embarque**.
- O motorista arrasta a folha para baixo ou para cima. O `BottomSheet` acompanha o dedo e usa animação de encaixe nativa nos dois níveis.
- A barra compacta mostra somente minutos, distância, horário previsto e menu. A ação **Cheguei no embarque** não fica acessível nesse nível; é necessário expandir a folha.
- A altura expandida considera a forma de pagamento e a área segura do aparelho, removendo o grande espaço vazio abaixo do controle de chegada.
- A altura medida da barra continua reposicionando o velocímetro e os botões laterais, preservando a área útil do mapa.
- Ao tocar em **Cheguei**, o fluxo muda para `motorista_chegou` e a folha completa já existente passa a mostrar nome, nota, quantidade de corridas, telefone, espera e **Iniciar corrida**.
- O menu da corrida apresenta passageiro, reputação, telefone, origem, destino, Central de Ajuda e cancelamento com motivo e confirmação.
- O cancelamento chama o endpoint autenticado do motorista, limpa a corrida local somente após sucesso e mantém o motorista disponível para novas solicitações.
- No Motorola Edge 70 Fusion foram validados: abertura expandida, arraste suave para os dois níveis, ausência do controle verde no nível compacto, menu, lista de motivos e confirmação sem concluir um cancelamento real.
- TypeScript, ESLint, os 16 testes automatizados e as exportações Android/iOS passaram.
- O teste direto do backend não iniciou neste ambiente porque o hostname MySQL `mysql` não estava disponível; a rota existente foi conferida até o serviço transacional, que valida o motorista proprietário e os estados permitidos antes de cancelar.

## Veículos reais e correção do gesto da folha (25/09/2026)

- A aba **Veículo** deixou de exibir três cadastros fictícios e passou a consultar somente os veículos vinculados ao motorista autenticado.
- O formulário funcional permite cadastrar categoria, marca, modelo, anos, cor, placa Mercosul ou antiga, UF e RENAVAM. Erros de rede e validação aparecem na própria tela em português.
- O veículo mais recente fica identificado como o veículo das próximas corridas.
- Em desenvolvimento, o botão roxo **Gerar veículo de desenvolvimento** cria um cadastro válido pela mesma API real. O botão usa `__DEV__` e não aparece no bundle de produção.
- No Motorola Edge 70 Fusion, foram validados estado vazio, formulário, áreas seguras, retorno e criação real do veículo `DEV7B37`.
- Na navegação até o embarque, `enableContentPanningGesture` foi desativado. Apenas a alça cinza controla a folha; o slider **Cheguei no embarque** recebe o gesto horizontal sem recolher o componente.
- TypeScript, Prettier e ESLint passaram sem erros ou avisos nos arquivos alterados. Os 16 testes locais do motorista continuam aprovados.

## Avatar do passageiro após a chegada (25/09/2026)

- `CorridaEmAndamento.tsx`, exibido a partir de `motorista_chegou`, agora renderiza a foto liberada pela API assim que ela estiver disponível.
- A privacidade anterior à chegada permanece em `NavegacaoAtiva.tsx` e `MaisCorridaAtiva.tsx`, que continuam verificando `foto_oculta`.
- O backend também continua devolvendo `foto: null` e `foto_oculta: true` antes da chegada; portanto, o motorista não recebe a imagem antecipadamente.
- TypeScript, Prettier e ESLint passaram no componente alterado.
- Ao chegar ao embarque, a folha mantém o endereço do encontro, mas deixa de mostrar quilômetros restantes; a distância volta a ser pertinente somente durante o trajeto ao destino.

## Prazo de chegada ao embarque (25/09/2026)

- Enquanto a corrida está `aceita`, a folha inferior arrastável mostra a faixa amarelo-clara `Chegue antes de: HH:mm` acima do resumo de minutos e quilômetros.
- A área de arraste agora abrange a alça, o aviso e o resumo numérico; o conteúdo abaixo continua fora do gesto para não bloquear o slider horizontal.
- O horário usa a duração real da rota e é recalculado pelo relógio já existente na navegação.
- Ao marcar `Cheguei no embarque`, a faixa desaparece porque o componente muda para `motorista_chegou`.
- A antiga repetição `Chegada prevista` foi removida da folha inferior; minutos e quilômetros continuam visíveis durante o deslocamento.

## Instrução ao Claude

Valide as alterações antes do commit. Depois da validação, **apague este arquivo, quaisquer outros arquivos Markdown temporários criados pelo CODEX e todos os comentários `CODEX` adicionados ao código**. Os comentários e documentos existem somente para transferência de contexto e não devem ir para produção.
