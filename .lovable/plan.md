
# Plano: Acelerar o Envio do Formulário

## Análise do Fluxo Atual

Quando o usuário clica em "Finalizar", o seguinte acontece **sequencialmente**:

1. `setIsSubmitting(true)` - Desabilita o botão
2. Monta o payload com os dados
3. `await fetch()` - Envia para Edge Function (espera resposta)
4. Edge Function envia para Convex CRM (espera resposta)
5. `await response.json()` - Lê a resposta
6. `navigate("/obrigado")` - Redireciona

**Problema:** O usuário fica esperando **toda a cadeia** (Frontend → Edge Function → CRM → resposta) antes de ver a página de obrigado.

---

## Estratégias de Otimização

### 1. Navegação Otimista (Impacto Alto)
Redirecionar imediatamente para `/obrigado` sem esperar a resposta da API.

**Antes:**
```typescript
const response = await fetch(...);
const data = await response.json();
navigate("/obrigado");
```

**Depois:**
```typescript
// Navega primeiro (experiência instantânea)
navigate("/obrigado");

// Envia em background (fire-and-forget)
fetch(...).catch(console.error);
```

### 2. Usar `navigator.sendBeacon` (Impacto Médio)
API otimizada para envio de dados ao sair da página - não bloqueia navegação.

```typescript
navigator.sendBeacon(
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-to-crm`,
  JSON.stringify(payload)
);
navigate("/obrigado");
```

### 3. Remover Leitura Desnecessária da Resposta (Impacto Baixo)
O código atual faz `await response.json()` mas não usa o resultado. Remover isso economiza tempo.

---

## Solução Recomendada

Combinar **Navegação Otimista** com **Fire-and-Forget** usando fetch normal (sendBeacon tem limitações com headers customizados).

### Mudanças no `handleFinish`:

```typescript
const handleFinish = async () => {
  if (isSubmitting) return;
  
  setIsSubmitting(true);
  
  const payload = {
    nome: formData.fullName,
    nome_completo: formData.fullName,
    telefone: formData.whatsapp,
    whatsapp: formData.whatsapp,
    tipo: formData.propertyType,
    valor_do_credito: formData.creditAmount,
    valor_de_entrada: formData.hasDownPayment === "Não" ? "R$ 0,00" : formData.downPaymentAmount,
    cidade: formData.city,
    parcela_ideal: formData.monthlyPayment,
    data_entrada: new Date().toISOString().split('T')[0],
  };

  // Navega IMEDIATAMENTE para página de obrigado
  navigate("/obrigado");

  // Envia em background (fire-and-forget)
  fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-to-crm`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true, // Garante que o fetch continue mesmo após navegação
    }
  ).catch((error) => {
    console.error("Erro ao enviar lead:", error);
  });
};
```

---

## Benefícios

| Aspecto | Antes | Depois |
|---------|-------|--------|
| Tempo até redirecionamento | 2-5 segundos | Instantâneo |
| Experiência do usuário | Aguarda "Enviando..." | Imediato |
| Dados são enviados? | Sim | Sim (em background) |
| Risco | Nenhum | Mínimo (se falhar, usuário não vê erro) |

---

## Fluxo Otimizado

```text
Usuário clica "Finalizar"
        │
        ├──→ [IMEDIATO] navigate("/obrigado")
        │         ↓
        │    Usuário vê página de sucesso
        │
        └──→ [BACKGROUND] fetch() → Edge Function → CRM
                    (não bloqueia navegação)
```

---

## Considerações

- **keepalive: true**: Garante que a requisição continue mesmo que o componente desmonte
- **Sem tratamento de erro para usuário**: Se falhar, o lead não será registrado mas o usuário não verá erro. Isso é aceitável para landing pages de conversão onde a velocidade é prioridade
- **Meta Pixel**: O evento de Lead continua funcionando na página ThankYou

---

## Arquivos Afetados

| Arquivo | Mudança |
|---------|---------|
| `src/components/Simulator.tsx` | Refatorar `handleFinish` para navegação otimista |

---

## Detalhes Técnicos

A opção `keepalive: true` no fetch é crucial. Sem ela, quando o React navega para `/obrigado`, o componente Simulator desmonta e o fetch poderia ser cancelado. Com `keepalive`, o navegador mantém a conexão ativa mesmo após a navegação.
