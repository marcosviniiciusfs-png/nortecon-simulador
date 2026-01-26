import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SimulatorData {
  propertyType: string;
  creditAmount: string;
  hasDownPayment: string;
  downPaymentAmount: string;
  monthlyPayment: string;
  city: string;
  fullName: string;
  whatsapp: string;
}

const Simulator = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SimulatorData>({
    propertyType: "",
    creditAmount: "",
    hasDownPayment: "",
    downPaymentAmount: "",
    monthlyPayment: "",
    city: "",
    fullName: "",
    whatsapp: "",
  });

  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    const formatted = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(numbers) / 100);
    return formatted;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, (_, ddd, p1, p2) =>
        p2 ? `(${ddd}) ${p1}-${p2}` : p1 ? `(${ddd}) ${p1}` : ddd ? `(${ddd}` : ""
      );
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, (_, ddd, p1, p2) =>
      p2 ? `(${ddd}) ${p1}-${p2}` : p1 ? `(${ddd}) ${p1}` : ddd ? `(${ddd}` : ""
    );
  };

  const handleCurrencyChange = (field: keyof SimulatorData, value: string) => {
    setFormData({ ...formData, [field]: formatCurrency(value) });
  };

  const handlePhoneChange = (value: string) => {
    setFormData({ ...formData, whatsapp: formatPhone(value) });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.propertyType !== "";
      case 2:
        return formData.creditAmount !== "";
      case 3:
        if (formData.hasDownPayment === "") return false;
        if (formData.hasDownPayment === "Sim" && formData.downPaymentAmount === "") return false;
        return true;
      case 4:
        return formData.monthlyPayment !== "";
      case 5:
        return formData.city.trim() !== "";
      case 6:
        return formData.fullName.trim() !== "" && formData.whatsapp.trim() !== "";
      default:
        return false;
    }
  };

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleFinish = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
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

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-to-crm`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Erro na resposta:", errorData);
        throw new Error("Erro ao enviar simulação");
      }

      const data = await response.json();

      navigate("/obrigado");
    } catch (error) {
      console.error("Erro na submissão:", error);
      toast({
        title: "Erro ao enviar simulação",
        description: "Por favor, tente novamente.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <Label className="text-lg font-semibold text-foreground">
              Qual tipo de bem você deseja adquirir?
            </Label>
            <Select
              value={formData.propertyType}
              onValueChange={(value) => setFormData({ ...formData, propertyType: value })}
            >
              <SelectTrigger className="text-lg p-6 border-2">
                <SelectValue placeholder="Selecione o tipo de bem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Imóvel">Imóvel</SelectItem>
                <SelectItem value="Veículo">Veículo</SelectItem>
                <SelectItem value="Moto">Moto</SelectItem>
                <SelectItem value="Caminhão">Caminhão</SelectItem>
                <SelectItem value="Maquinário">Maquinário</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <Label className="text-lg font-semibold text-foreground">
              Qual o valor do crédito que deseja simular?
            </Label>
            <Input
              type="text"
              placeholder="R$ 0,00"
              value={formData.creditAmount}
              onChange={(e) => handleCurrencyChange("creditAmount", e.target.value)}
              className="text-lg p-6 border-2"
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <Label className="text-lg font-semibold text-foreground">Tem valor de entrada?</Label>
            <div className="grid grid-cols-2 gap-3">
              {["Sim", "Não"].map((option) => (
                <button
                  key={option}
                  onClick={() => setFormData({ ...formData, hasDownPayment: option, downPaymentAmount: option === "Não" ? "" : formData.downPaymentAmount })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.hasDownPayment === option
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-border hover:border-primary/50 bg-card"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            
            {formData.hasDownPayment === "Sim" && (
              <div className="space-y-4 mt-6">
                <Label className="text-lg font-semibold text-foreground">
                  Qual o valor da entrada?
                </Label>
                <Input
                  type="text"
                  placeholder="R$ 0,00"
                  value={formData.downPaymentAmount}
                  onChange={(e) => handleCurrencyChange("downPaymentAmount", e.target.value)}
                  className="text-lg p-6 border-2"
                />
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <Label className="text-lg font-semibold text-foreground">
              Qual a parcela mensal ideal pra você?
            </Label>
            <Input
              type="text"
              placeholder="R$ 0,00"
              value={formData.monthlyPayment}
              onChange={(e) => handleCurrencyChange("monthlyPayment", e.target.value)}
              className="text-lg p-6 border-2"
            />
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <Label className="text-lg font-semibold text-foreground">
              Qual cidade você reside?
            </Label>
            <Input
              type="text"
              placeholder="Digite sua cidade"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="text-lg p-6 border-2"
            />
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="text-lg font-semibold text-foreground">Nome completo</Label>
              <Input
                type="text"
                placeholder="Digite seu nome completo"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="text-lg p-6 border-2"
              />
            </div>
            <div className="space-y-4">
              <Label className="text-lg font-semibold text-foreground">WhatsApp para contato</Label>
              <Input
                type="tel"
                placeholder="(00) 00000-0000"
                value={formData.whatsapp}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className="text-lg p-6 border-2"
                maxLength={15}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section id="simulador" className="py-16 md:py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">
              SIMULE AGORA
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3">
              Responda as perguntas para fazer sua simulação
            </h2>
          </div>

          <div className="bg-card rounded-2xl shadow-[0_4px_30px_rgba(12,76,199,0.12)] p-8 md:p-10">
            {/* Barra de Progresso */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-primary">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Conteúdo do Step */}
            <div className="mb-8 min-h-[200px]">{renderStep()}</div>

            {/* Mensagem de aviso */}
            {!canProceed() && (
              <div className="flex items-center gap-2 text-accent mb-6 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Conclua esse tempo limitado</span>
              </div>
            )}

            {/* Botões de Navegação */}
            <div className="flex gap-3">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 py-6 text-base border-2"
                >
                  Voltar
                </Button>
              )}
              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex-1 py-6 text-base"
                >
                  Próximo
                </Button>
              ) : (
                <Button
                  onClick={handleFinish}
                  disabled={!canProceed() || isSubmitting}
                  className="flex-1 py-6 text-base"
                >
                  {isSubmitting ? "Enviando..." : "Finalizar"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Simulator;
