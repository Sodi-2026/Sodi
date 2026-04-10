const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cppjodjxudflmhdruibf.supabase.co';
const supabaseServiceKey = 'sb_secret_FXKdZRiRphclpuAAWZzMEA_u3EkAJf4';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  console.log('--- Testando Conexão Supabase ---');
  console.log('URL:', supabaseUrl);
  
  try {
    // Tenta uma operação simples: listar tabelas (via consulta ao schema public se possível, ou apenas tentando bater na API)
    // Como é Service Role, temos acesso total.
    const { data, error } = await supabase.from('insumos').select('*').limit(1);
    
    if (error) {
       console.log('Status: Conectado à API.');
       console.log('Detalhe:', error.message);
       if (error.code === 'PGRST116' || error.message.includes('relation "public.insumos" does not exist')) {
         console.log('Resultado: O projeto respondeu corretamente, mas as tabelas ainda não existem. (Migração pendente)');
       }
    } else {
      console.log('Status: Conexão bem sucedida e tabela encontrada!');
      console.log('Dados:', data);
    }
  } catch (err) {
    console.error('Erro crítico no teste:', err.message);
  }
}

testConnection();
