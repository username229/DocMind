import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase';
import { MultiFileUpload } from '@/components/MultiFileUpload'; // Certifique-se que o caminho está certo
import { Loader2 } from 'lucide-react';

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
          .eq('id', user.id)
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

export default function Analisador() {
  const { profile, loading } = useProfile();

  const handleAnalyse = (data: any) => {
    console.log("Analisando:", data);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
        <span className="ml-3 text-muted-foreground">Verificando plano...</span>
      </div>
    );
  }

  return (
    <div className="p-4">
      <MultiFileUpload 
        plan={profile.plan} 
        isLoading={loading}
        onSubmit={handleAnalyse}
      />
    </div>
  );
}