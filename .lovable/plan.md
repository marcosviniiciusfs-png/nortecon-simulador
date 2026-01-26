
# Plano: Chamar Edge Function Diretamente (Sem Supabase Client)

## Problema Identificado
O projeto tem "Lovable Cloud habilitado" mas apenas no nível de permissões - o backend completo (Database/Users/Storage) não está provisionado. Por isso, as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` não são injetadas automaticamente, causando o erro `supabaseUrl is required` quando o cliente Supabase tenta inicializar.

## Solução
Remover a dependência do cliente Supabase no frontend e chamar a Edge Function diretamente via `fetch()`. Isso é possível porque:
1. A Edge Function já está configurada com `verify_jwt = false`
2. O endpoint da Edge Function está acessível publicamente
3. Não há necessidade de autenticação do usuário para enviar leads

## Alterações Necessárias

### 1. Remover Cliente Supabase do Simulator
**Arquivo:** `src/components/Simulator.tsx`

Mudanças:
- Remover import do `supabase` client
- Substituir `supabase.functions.invoke()` por `fetch()` direto
- Usar a URL completa da Edge Function do projeto

### 2. Opcionalmente Limpar Cliente Supabase
**Arquivo:** `src/integrations/supabase/client.ts`

Opção: Manter o arquivo mas adicionar verificação lazy, ou simplesmente não importá-lo onde não é usado.

## Código da Mudança Principal

O `handleFinish` no Simulator passará de:

```typescript
import { supabase } from "@/integrations/supabase/client";
// ...
const { data, error } = await supabase.functions.invoke('send-to-crm', {
  body: payload,
});
```

Para:

```typescript
// Sem import do supabase client
// ...
const response = await fetch(
  'https://43ecbb0e-055a-404a-920e-866debe2c8d3.supabase.co/functions/v1/send-to-crm',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }
);

if (!response.ok) {
  throw new Error('Erro ao enviar simulação');
}

const data = await response.json();
```

## Fluxo Atualizado

```text
+--------------+      +---------------------------+      +-------------+
|  Simulator   | ---> | Edge Function             | ---> | Convex CRM  |
|  (Frontend)  |      | send-to-crm               |      | Webhook     |
+--------------+      +---------------------------+      +-------------+
       |                       |                               |
       | fetch() direto        | POST + Bearer Token           |
       | (sem Supabase client) | (usa CONVEX_CRM_TOKEN)        |
       v                       v                               v
   Dados do form         Processa + Envia             Cria lead no CRM
```

## Benefícios
- Elimina completamente a dependência de variáveis de ambiente no frontend
- A Edge Function continua segura (token armazenado como secret)
- Funciona mesmo sem backend completo do Lovable Cloud provisionado
- Sem necessidade de configuração adicional

## Arquivos Afetados
1. `src/components/Simulator.tsx` - Modificar handleFinish
2. `src/integrations/supabase/client.ts` - Pode ser mantido para uso futuro (opcional)

## Detalhes Técnicos

### URL da Edge Function
A URL base do projeto Supabase é derivada do ID do projeto:
`https://43ecbb0e-055a-404a-920e-866debe2c8d3.supabase.co/functions/v1/send-to-crm`

### CORS
A Edge Function já está configurada com headers CORS adequados, então a chamada fetch do frontend funcionará sem problemas.

### Tratamento de Erros
Verificar `response.ok` e consumir o body com `response.json()` para tratamento adequado.
