const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-version, x-supabase-client-info',
};

interface LeadData {
  nome: string;
  nome_completo: string;
  telefone: string;
  whatsapp: string;
  tipo: string;
  valor_do_credito: string;
  valor_de_entrada: string;
  cidade: string;
  parcela_ideal: string;
  data_entrada: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const token = Deno.env.get('CONVEX_CRM_TOKEN');
    
    if (!token) {
      console.error('CONVEX_CRM_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'CRM token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json() as LeadData;
    
    // Validate required fields
    if (!body.nome || !body.whatsapp) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: nome and whatsapp' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Sending lead to Convex CRM:', { nome: body.nome, cidade: body.cidade });

    const crmResponse = await fetch(
      'https://app.convexcrm.com.br/api/webhooks/integrations/59fbcefca35e40b8a1a11a8005239d50',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    const responseText = await crmResponse.text();
    console.log('CRM response status:', crmResponse.status);
    console.log('CRM response:', responseText);

    if (!crmResponse.ok) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send to CRM', 
          status: crmResponse.status,
          details: responseText 
        }),
        { status: crmResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Lead sent successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-to-crm:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
