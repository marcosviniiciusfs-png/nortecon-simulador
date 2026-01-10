import { useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ThankYou = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Track Meta Pixel Lead event on thank you page
    const fbq = (window as any).fbq;
    if (typeof fbq === 'function') {
      fbq('track', 'Lead');
      console.log('Meta Pixel Lead event tracked');
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto text-center">
            <div className="bg-card rounded-2xl shadow-[0_4px_30px_rgba(12,76,199,0.12)] p-10">
              <div className="flex justify-center mb-6">
                <CheckCircle className="w-20 h-20 text-green-500" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                Obrigado!
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Sua simulação foi enviada com sucesso! Em breve, um de nossos consultores entrará em contato pelo WhatsApp.
              </p>
              <Button 
                onClick={() => navigate("/")}
                className="py-6 px-8 text-base"
              >
                Voltar ao início
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ThankYou;
