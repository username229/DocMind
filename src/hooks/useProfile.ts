import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase'; // ajuste o caminho conforme seu projeto

export type UserPlan = 'free' | 'standard' | 'pro';

interface Profile {
  plan: UserPlan;
  documents_count: number;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    async function getProfile() {
      try {
        setLoading(true);

        // Pegamos o ID do usuário logado primeiro
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        // Buscamos o perfil
        const { data, error: supabaseError } = await supabase
          .from('profiles')
          .select('plan, documents_count')
          .eq('id', user.id)
          .single(); // .single() evita que venha um array vazio

        if (supabaseError) throw supabaseError;

        setProfile(data);
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
        setError(err);
        
        // Fallback: Se der erro (como o 406), define um plano padrão para não quebrar a UI
        setProfile({ plan: 'free', documents_count: 0 });
      } finally {
        setLoading(false);
      }
    }

    getProfile();
  }, []);

  return { profile, loading, error };
}