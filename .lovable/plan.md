
# Plano: Envio Duplo para CRM Convex + Webhook Make

## Objetivo

Adicionar um segundo envio de dados para o webhook do Make.com, mantendo o envio existente para o Convex CRM. Ambos serão executados em paralelo, em background, após a navegação para a página de obrigado.

---

## Estrutura do Payload para Make.com

Conforme solicitado, o JSON será formatado assim:

```json
{
  "Data de Entrada": "2026-01-26",
  "Nome Completo": "João Silva",
  "WhatsApp": "(11) 99999-9999",
  "Tipo de Bem": "Imóvel",
  "Valor Pretendido (R$)": "R$ 500.000,00",
  "Valor de Entrada (R$)": "R$ 50.000,00",
  "Parcela Ideal (R$)": "R$ 2.500,00",
  "Cidade": "São Paulo"
}
```

---

## Mudanças no Código

### Arquivo: `src/components/Simulator.tsx`

Modificar a função `handleFinish` para enviar para ambos os destinos:

```typescript
const handleFinish = () => {
  if (isSubmitting) return;
  
  setIsSubmitting(true);
  
  // Payload para Convex CRM (mantém formato existente)
  const payloadCRM = {
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

  // Payload para Make.com (formato solicitado)
  const payloadMake = {
    "Data de Entrada": new Date().toISOString().split('T')[0],
    "Nome Completo": formData.fullName,
    "WhatsApp": formData.whatsapp,
    "Tipo de Bem": formData.propertyType,
    "Valor Pretendido (R$)": formData.creditAmount,
    "Valor de Entrada (R$)": formData.hasDownPayment === "Não" ? "R$ 0,00" : formData.downPaymentAmount,
    "Parcela Ideal (R$)": formData.monthlyPayment,
    "Cidade": formData.city,
  };

  // Navega IMEDIATAMENTE para página de obrigado
  navigate("/obrigado");

  // Envia para Convex CRM (via Edge Function)
  fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-to-crm`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadCRM),
      keepalive: true,
    }
  ).catch((error) => {
    console.error("Erro ao enviar para CRM:", error);
  });

  // Envia para Make.com (direto do frontend)
  fetch(
    'https://hook.us2.make.com/2efqpinw0psfqi0astfgfdcchdwtlwug',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadMake),
      keepalive: true,
    }
  ).catch((error) => {
    console.error("Erro ao enviar para Make:", error);
  });
};
```

---

## Fluxo de Dados

```text
Usuário clica "Finalizar"
        │
        ├──→ [IMEDIATO] navigate("/obrigado")
        │         ↓
        │    Usuário vê página de sucesso
        │
        ├──→ [BACKGROUND] fetch() → Edge Function → Convex CRM
        │                    (payload formato CRM)
        │
        └──→ [BACKGROUND] fetch() → Make.com Webhook
                             (payload formato Make)
```

---

## Mapeamento de Campos

| Campo do Formulário | Convex CRM | Make.com |
|---------------------|------------|----------|
| Nome Completo | `nome` / `nome_completo` | `Nome Completo` |
| WhatsApp | `whatsapp` / `telefone` | `WhatsApp` |
| Tipo de Bem | `tipo` | `Tipo de Bem` |
| Valor do Crédito | `valor_do_credito` | `Valor Pretendido (R$)` |
| Valor de Entrada | `valor_de_entrada` | `Valor de Entrada (R$)` |
| Parcela Mensal | `parcela_ideal` | `Parcela Ideal (R$)` |
| Cidade | `cidade` | `Cidade` |
| Data | `data_entrada` | `Data de Entrada` |

---

## Considerações de Segurança

O webhook do Make.com será chamado **diretamente do frontend**. Isso é seguro porque:

1. **Webhooks Make são públicos por design** - não precisam de autenticação
2. **A URL já está exposta** na mensagem do usuário
3. **Não há tokens secretos** envolvidos nesta chamada

Se no futuro precisar adicionar autenticação ao Make, podemos criar uma segunda Edge Function.

---

## Arquivos Afetados

| Arquivo | Mudança |
|---------|---------|
| `src/components/Simulator.tsx` | Adicionar segundo fetch para Make.com |

---

## Benefícios

- **Simultaneidade**: Ambos os envios acontecem em paralelo
- **Velocidade**: Usuário não espera nenhuma resposta
- **Independência**: Se um falhar, o outro continua funcionando
- **Formato correto**: Cada destino recebe os dados no formato esperado
