import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase'; // ajuste o caminho conforme seu projeto

export type UserPlan = 'free' | 'standard' | 'pro';

interface Profile {
  plan: UserPlan;
  documents_count: number;
}

export function useProfile() {
  // Iniciamos com um valor padrão seguro
  const [profile, setProfile] = useState<Profile>({ plan: 'free', documents_count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    async function getProfile() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error: supabaseError } = await supabase
          .from('profiles')
          .select('plan, documents_count')
          .eq('id', user.id)
          .maybeSingle(); // Troque .single() por .maybeSingle() para evitar erro se o perfil não existir ainda

        if (supabaseError) throw supabaseError;

        if (data) {
          setProfile(data);
        }
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    getProfile();
  }, []);

  return { profile, loading, error };
}

export default function Analisador() {
  const { profile, loading } = useProfile();

  // 1. Se estiver carregando, mostre um estado de loading e NÃO renderize o MultiFileUpload
  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin w-8 h-8" />
        <p className="ml-2">Carregando plano...</p>
      </div>
    );
  }

  // 2. Se o profile for nulo (mesmo após loading), criamos um fallback local
  const safeProfile = profile || { plan: 'free', documents_count: 0 };

  return (
    <div>
      <MultiFileUpload 
        plan={safeProfile.plan} 
        isLoading={loading}
        onSubmit={handleAnalyse}
      />
    </div>
  );
}