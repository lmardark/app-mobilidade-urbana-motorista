<!-- CODEX: 164 linhas criadas neste arquivo; guia de setup criado integralmente pelo CODEX para a equipe e para o Claude. -->

# Setup do aplicativo do motorista

Aplicativo Expo/React Native usado para disponibilidade, recebimento de ofertas e execução das corridas.

## Requisitos

- Node.js 24 e npm 11, versões usadas nas validações atuais.
- Backend Laravel, worker da fila e Reverb ativos.
- Expo Go compatível com o SDK 57 ou ambiente Android nativo.
- Android SDK e ADB para emulador, build local ou aparelho conectado.
- GPS habilitado e chave Google Maps para Android.

## 1. Instalar dependências

```bash
npm ci
```

Use o npm diretamente. Se a correção automática do Expo terminar com `EALLOWSCRIPTS`, execute `npm install` no projeto e valide com `npx expo install --check`.

## 2. Criar o arquivo `.env`

Este repositório ainda não possui `.env.example`. Crie `.env` na raiz:

```dotenv
EXPO_PUBLIC_API_URL=http://IP_DA_MAQUINA/api
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=sua-chave-publica
GOOGLE_MAPS_ANDROID_KEY=sua-chave-android
ANDROID_APP_PACKAGE=identificador.exato.do.apk.instalado
IOS_APP_BUNDLE_ID=identificador.exato.do.app.ios

EXPO_PUBLIC_REVERB_APP_KEY=chave-local
EXPO_PUBLIC_REVERB_HOST=IP_DA_MAQUINA
EXPO_PUBLIC_REVERB_PORT=6001
EXPO_PUBLIC_REVERB_SCHEME=http
```

Use o IPv4 do computador, como `192.168.1.50`. `localhost` não alcança o computador quando o aplicativo roda em um celular físico.

A chave pública do Reverb deve ser igual a `REVERB_APP_KEY` no backend. Nunca coloque `REVERB_APP_SECRET` no aplicativo.

<!-- CODEX: configuração adicional para recuperar mapas nativos em aparelhos com blocos em branco. -->
### Mapa em branco com logotipo Google

O `react-native-maps` recebe `GOOGLE_MAPS_ANDROID_KEY` pelo plugin nativo do Expo. A variável `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` serve para chamadas JavaScript e não configura o mapa nativo. Defina `ANDROID_APP_PACKAGE` e `IOS_APP_BUNDLE_ID` com os **identificadores dos aplicativos instalados**, evitando criar outro app por acidente. Builds de produção exigem esses identificadores.

Habilite **Maps SDK for Android** e faturamento no Google Cloud. Nas restrições da chave, autorize cada par de **package name e SHA-1 da assinatura** usada nos builds de debug, release e distribuição pela Play Store. Confirme o pacote do aparelho com `adb shell pm list packages`; obtenha o SHA-1 no certificado da variante de build ou no Play Console (Play App Signing).

Após mudar as variáveis ou a chave, reinstale **um build nativo novo**; reiniciar Metro não altera a chave embutida no APK. No iPhone usamos Apple Maps. O botão “Tentar novamente” remonta o mapa se o carregamento demorar, mas não corrige restrições rejeitadas pelo Google Cloud.

## 3. Iniciar o aplicativo

```bash
npm start -- --lan --clear
```

Leia o QR Code com o Expo Go. Para Android conectado ou emulador:

```bash
npm run android
```

Confirme o aparelho com:

```bash
adb devices
```

## 4. Conta de desenvolvimento

| Campo    | Valor                          |
| -------- | ------------------------------ |
| Telefone | `69999990001`                  |
| E-mail   | `motorista.codex@example.test` |
| Senha    | `desenvolvimento`              |

Prepare a conta no backend:

```bash
docker compose exec laravel.test php artisan db:seed --class=CenarioCorridaDesenvolvimentoSeeder
```

A conta fictícia possui CNH, veículo e quatro documentos aprovados. Depois do login, coloque o motorista online para receber ofertas.

## 5. Serviços necessários

O recebimento de corrida usa Reverb e possui polling de recuperação. Para o tempo real funcionar com baixa latência:

1. Mantenha o backend no ar.
2. Publique a porta interna `8080` do Reverb como `6001` no host.
3. Mantenha `php artisan queue:work` em execução.
4. Use a mesma chave pública no backend e no aplicativo.
5. Libere a porta `6001` no firewall.

O guia do backend contém o exemplo de `compose.override.yaml` para publicar essa porta.

## 6. Dependências compatíveis com Expo 57

- `expo@57.0.24`.
- `@expo/metro-runtime@57.0.16`.
- `expo-asset@57.0.18`.
- `expo-build-properties@57.0.21`.
- `expo-constants@57.0.19`.
- `expo-location@57.0.19`.
- `expo-router@57.0.22`.

Confira a compatibilidade antes de iniciar:

```bash
npx expo install --check
npx --yes expo-doctor
```

## 7. Verificações

```bash
npx tsc --noEmit
npm run lint
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/rotaDaCorrida.test.mjs
npx expo export --platform android --output-dir /tmp/motorista-android
```

O estado validado possui zero erros e zero avisos de lint, sete testes de rota aprovados e Expo Doctor aprovado em 21 verificações.

## 8. Checklist de recebimento e corrida

1. Autorize a localização precisa e o áudio.
2. Entre com a conta de desenvolvimento.
3. Coloque o motorista online.
4. Solicite uma corrida pelo aplicativo do passageiro.
5. Confirme alerta sonoro, oferta, tempo e dados da corrida.
6. Aceite e confira a rota do motorista até o passageiro.
7. Marque chegada e inicie; a rota deve mudar para o destino.
8. Finalize; o motorista deve continuar online e voltar a receber ofertas.

## 9. Teste com aparelho via USB

Se a rede local bloquear a API e o backend estiver na porta `8000`:

```bash
adb reverse tcp:8000 tcp:8000
```

Use temporariamente `EXPO_PUBLIC_API_URL=http://127.0.0.1:8000/api` e reinicie o Metro. Para testar Reverb por USB, encaminhe também a porta externa escolhida:

```bash
adb reverse tcp:6001 tcp:6001
```

## 10. Solução de problemas

- **Nenhuma oferta:** confirme que o cadastro está aprovado, o motorista está online e o worker está ativo.
- **Oferta chega apenas por polling:** confira Reverb, chave, porta e autorização do canal privado.
- **Rota não aparece após aceitar:** confira GPS, coordenadas do passageiro e resposta da API de traçado.
- **Som não toca:** confirme volume do aparelho e permissão de áudio.
- **Variável antiga:** reinicie o Metro com `--clear`.

## Segurança

- Não versione `.env`, tokens, credenciais ou chaves irrestritas.
- Variáveis `EXPO_PUBLIC_*` ficam visíveis no bundle.
- Use HTTPS/WSS e restrições de chave em ambientes externos.
