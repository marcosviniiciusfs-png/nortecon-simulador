import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, ChevronLeft, ChevronRight } from "lucide-react";

const TestimonialsSection = () => {
  const scrollToSimulator = () => {
    const element = document.getElementById("simulador");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const videos = ["/videos/1_1.mp4", "/videos/3_1.mp4", "/videos/Design_sem_nome.mp4"];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeAudioIndex, setActiveAudioIndex] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout>();

  const handleInteraction = () => {
    setIsPaused(true);
    
    // Retomar auto-scroll após 10 segundos
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 10000);
  };

  const toggleMute = (index: number) => {
    handleInteraction();
    setCurrentIndex(index);
    
    if (activeAudioIndex === index) {
      setActiveAudioIndex(null);
    } else {
      setActiveAudioIndex(index);
    }
  };

  const handleNavigation = (direction: 'prev' | 'next') => {
    handleInteraction();
    
    if (direction === 'prev') {
      setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
    } else {
      setCurrentIndex((prev) => (prev + 1) % videos.length);
    }
  };

  const handleDotClick = (index: number) => {
    handleInteraction();
    setCurrentIndex(index);
  };

  // Intersection Observer para lazy loading da seção
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-scroll carousel (apenas se não estiver pausado)
  useEffect(() => {
    if (!isVisible || isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % videos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [videos.length, isVisible, isPaused]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-16 md:py-20 bg-secondary/20">
      <div className="container mx-auto px-4">
        {/* Título e CTA */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Simule agora gratuitamente e descubra o melhor plano para conquistar o seu sonho
          </h2>
          <p className="text-muted-foreground text-lg mb-6">
            As condições podem mudar a qualquer momento
          </p>
          <Button
            onClick={scrollToSimulator}
            size="lg"
            className="text-lg px-8 py-6 h-auto rounded-lg shadow-lg hover:shadow-xl"
          >
            Quero meu plano ideal →
          </Button>
        </div>

        {/* Carrossel de Vídeos */}
        <div className="relative mt-16 max-w-md mx-auto">
          {/* Botão Anterior */}
          <button
            onClick={() => handleNavigation('prev')}
            className="absolute left-0 md:-left-16 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full shadow-lg transition-all hover:scale-110"
            aria-label="Vídeo anterior"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Container do Vídeo */}
          <div className="overflow-hidden rounded-2xl shadow-xl">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
              }}
            >
              {videos.map((video, index) => (
                <div
                  key={index}
                  className="relative flex-shrink-0 w-full h-[500px] md:h-[600px] bg-muted"
                >
                  {isVisible ? (
                    <video
                      src={video}
                      autoPlay
                      muted={activeAudioIndex !== index}
                      loop
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  <button
                    onClick={() => toggleMute(index)}
                    className="absolute bottom-4 right-4 z-10 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full shadow-lg transition-all hover:scale-110"
                    aria-label={activeAudioIndex === index ? "Desativar som" : "Ativar som"}
                  >
                    {activeAudioIndex === index ? <Volume2 size={20} /> : <VolumeX size={20} />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Botão Próximo */}
          <button
            onClick={() => handleNavigation('next')}
            className="absolute right-0 md:-right-16 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full shadow-lg transition-all hover:scale-110"
            aria-label="Próximo vídeo"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Indicadores de pontos */}
        <div className="flex justify-center gap-2 mt-8">
          {videos.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-primary w-8"
                  : "bg-border hover:bg-primary/50"
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Indicador de pausa */}
        {isPaused && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            Carrossel pausado • Retoma automaticamente em breve
          </p>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;
