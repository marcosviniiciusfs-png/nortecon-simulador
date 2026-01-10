import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const TestimonialsSection = () => {
  const scrollToSimulator = () => {
    const element = document.getElementById("simulador");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const videos = ["/videos/1_1.mp4", "/videos/3_1.mp4"];
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % videos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [videos.length]);

  // Duplicate videos for seamless loop
  const displayVideos = [...videos, ...videos, ...videos];

  return (
    <section className="py-16 md:py-20 bg-secondary/20">
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
                className="flex-shrink-0 w-80 h-[500px] rounded-2xl overflow-hidden shadow-lg"
              >
                <video
                  src={video}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
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
