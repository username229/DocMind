import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UserPlan = 'free' | 'standard' | 'pro';

interface Profile {
  plan: UserPlan;
  documents_count: number;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile>({ plan: 'free', documents_count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getProfile() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('plan, documents_count')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Erro na busca do Supabase:', error);
        }

        if (data) {
          setProfile(data);
        }
      } catch (err) {
        console.error('Erro de conexão:', err);
      } finally {
        setLoading(false);
      }
    }
    getProfile();
  }, []);

  return { profile, loading };
}