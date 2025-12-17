# 🚀 Deploy no Render

## Configuração de Variáveis de Ambiente

### 1. Preparar as Credenciais do Firebase

Você tem **3 opções** para configurar o Firebase no Render:

---

### ⭐ OPÇÃO 1: JSON Completo (RECOMENDADO)

1. Abra seu arquivo `serviceAccountKey.json`
2. **Minifique o JSON** (remova quebras de linha):

   - Use um minificador online: https://www.minifier.org/
   - Ou use este comando no terminal:

   ```bash
   cat serviceAccountKey.json | jq -c
   ```

3. Copie o resultado (será algo como):

   ```json
   {"type":"service_account","project_id":"seu-projeto","private_key_id":"abc123",...}
   ```

4. No Render, adicione a variável de ambiente:
   - **Key:** `FIREBASE_SERVICE_ACCOUNT`
   - **Value:** Cole o JSON minificado

---

### OPÇÃO 2: Credenciais Individuais

No Render, adicione estas 3 variáveis:

1. **FIREBASE_PROJECT_ID**

   - Valor: `seu-projeto-id` (do serviceAccountKey.json)

2. **FIREBASE_CLIENT_EMAIL**

   - Valor: `firebase-adminsdk-xxxxx@seu-projeto.iam.gserviceaccount.com`

3. **FIREBASE_PRIVATE_KEY**
   - Valor: Copie a chave privada completa do JSON
   - **IMPORTANTE:** Mantenha as quebras de linha como `\n`
   - Exemplo: `-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n`

---

### OPÇÃO 3: Arquivo (Não recomendado para Render)

Não use esta opção no Render, pois você não pode fazer upload de arquivos facilmente.

---

## 2. Outras Variáveis de Ambiente

Adicione também:

```
PORT=3001
NODE_ENV=production
```

---

## 3. Passos no Render

### 1. Criar Novo Web Service

1. Acesse https://dashboard.render.com/
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório GitHub

### 2. Configurar o Build

- **Name:** `sorteando-crawler` (ou outro nome)
- **Environment:** `Node`
- **Build Command:** `pnpm install && pnpm run build`
- **Start Command:** `pnpm start`
- **Instance Type:** Free (ou outro)

### 3. Adicionar Variáveis de Ambiente

Na seção **"Environment Variables"**, adicione:

#### Se usar OPÇÃO 1 (JSON Completo):

```
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
PORT=3001
NODE_ENV=production
```

#### Se usar OPÇÃO 2 (Credenciais Individuais):

```
FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END...
PORT=3001
NODE_ENV=production
```

### 4. Deploy

Clique em **"Create Web Service"** e aguarde o deploy!

---

## 4. Testar o Deploy

Após o deploy, teste seus endpoints:

```bash
# Substituir URL_DO_RENDER pela URL fornecida
curl https://seu-app.onrender.com/

# Testar locais
curl https://seu-app.onrender.com/sorteando/locais

# Testar localização
curl -X POST https://seu-app.onrender.com/location \
  -H "Content-Type: application/json" \
  -d '{
    "accuracy": "2.55",
    "device_name": "test_device",
    "device_time": "2025-12-17T10:00:00.000Z",
    "is_moving": true,
    "latitude": "-11.012444",
    "longitude": "-37.066038",
    "speed": "13.89",
    "timestamp": "1734436800000"
  }'
```

---

## 5. Logs e Troubleshooting

### Ver Logs no Render

1. Acesse seu serviço no dashboard
2. Clique na aba **"Logs"**
3. Procure por mensagens de inicialização do Firebase

### Mensagens Esperadas

```
Inicializando Firebase Admin...
Ambiente: production
Usando FIREBASE_SERVICE_ACCOUNT (JSON direto)
✓ Firebase Admin inicializado com sucesso!
=================================
🚀 Servidor rodando na porta 3001
📝 Ambiente: production
=================================
```

### Erros Comuns

#### ❌ "Nenhuma credencial do Firebase encontrada"

- **Causa:** Variáveis de ambiente não configuradas
- **Solução:** Verifique se adicionou `FIREBASE_SERVICE_ACCOUNT` ou as credenciais individuais

#### ❌ "Unexpected token in JSON"

- **Causa:** JSON do `FIREBASE_SERVICE_ACCOUNT` não está válido
- **Solução:** Certifique-se de que minificou corretamente e não tem aspas extras

#### ❌ "Invalid private key"

- **Causa:** Private key está incorreta ou sem `\n`
- **Solução:** Copie novamente do serviceAccountKey.json mantendo os `\n`

---

## 6. Configurar no Flutter

Atualize a URL no seu app Flutter:

```dart
await locationService.configure(
  serverUrl: 'https://seu-app.onrender.com',
);
```

---

## 7. Auto-Deploy

O Render fará deploy automático sempre que você fizer push para a branch principal:

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

---

## 8. Monitoramento

### Health Check

Configure um health check no Render:

- **Path:** `/`
- **Expected Status:** `200`

### Firestore Rules

Certifique-se de que as regras do Firestore permitem escrita via Admin SDK:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /coords/{document} {
      allow read: if request.auth != null;
      allow write: if false; // Admin SDK bypassa esta regra
    }
  }
}
```

---

## 📝 Checklist Final

- [ ] Variáveis de ambiente configuradas no Render
- [ ] Build command: `pnpm install && pnpm run build`
- [ ] Start command: `pnpm start`
- [ ] Firebase inicializado com sucesso (verificar logs)
- [ ] Endpoint `/` retorna JSON
- [ ] Endpoint `/location` aceita POST
- [ ] Endpoint `/sorteando/locais` retorna array
- [ ] URL atualizada no app Flutter
- [ ] Auto-deploy configurado

---

## 🎉 Pronto!

Seu servidor está no ar e pronto para receber dados de localização do app Flutter!
