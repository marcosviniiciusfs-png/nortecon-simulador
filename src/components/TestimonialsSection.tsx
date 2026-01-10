import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

const TestimonialsSection = () => {
  const scrollToSimulator = () => {
    const element = document.getElementById("simulador");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const videos = ["/videos/1_1.mp4", "/videos/3_1.mp4", "/videos/Design_sem_nome.mp4"];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mutedStates, setMutedStates] = useState<boolean[]>(videos.map(() => true));
  const [loadedVideos, setLoadedVideos] = useState<Set<number>>(new Set([0]));
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const toggleMute = (index: number) => {
    setMutedStates((prev) => {
      const newStates = prev.map(() => true);
      newStates[index % videos.length] = !prev[index % videos.length];
      return newStates;
    });
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

  // Pré-carregar próximo vídeo
  useEffect(() => {
    if (isVisible) {
      const nextIndex = (currentIndex + 1) % videos.length;
      setLoadedVideos(prev => new Set([...prev, currentIndex, nextIndex]));
    }
  }, [currentIndex, isVisible, videos.length]);

  // Auto-scroll carousel
  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % videos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [videos.length, isVisible]);

  // Duplicate videos for seamless loop
  const displayVideos = [...videos, ...videos, ...videos];

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
        <div className="relative overflow-hidden mt-16">
          <div
            className="flex gap-6 transition-transform duration-1000 ease-linear"
            style={{
              transform: `translateX(-${currentIndex * (320 + 24)}px)`,
            }}
          >
            {displayVideos.map((video, index) => (
              <div
                key={index}
                className="relative flex-shrink-0 w-80 h-[500px] rounded-2xl overflow-hidden shadow-lg bg-muted"
              >
                {isVisible && loadedVideos.has(index % videos.length) ? (
                  <video
                    src={video}
                    autoPlay
                    muted={mutedStates[index % videos.length]}
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
                  aria-label={mutedStates[index % videos.length] ? "Ativar som" : "Desativar som"}
                >
                  {mutedStates[index % videos.length] ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Indicadores de pontos */}
        <div className="flex justify-center gap-2 mt-8">
          {videos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex % videos.length
                  ? "bg-primary w-8"
                  : "bg-border hover:bg-primary/50"
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
