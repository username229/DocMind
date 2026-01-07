import { Link } from 'react-router-dom';
import { Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">DocMind</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Funcionalidades
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Preços
            </a>
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Button asChild variant="ghost">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <Button variant="outline" onClick={signOut}>
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link to="/auth">Entrar</Link>
                </Button>
                <Button asChild variant="default">
                  <Link to="/auth">Começar Grátis</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
