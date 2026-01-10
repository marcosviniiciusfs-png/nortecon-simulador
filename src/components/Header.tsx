import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo-nortecon.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#E7F3FF] shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Grupo Nortecon" className="h-14 w-auto" />
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={() => scrollToSection("inicio")}
            className="text-gray-700 hover:text-gray-900 transition-colors font-medium"
          >
            Início
          </button>
          <button
            onClick={() => scrollToSection("simulador")}
            className="text-gray-700 hover:text-gray-900 transition-colors font-medium"
          >
            Simulador
          </button>
          <button
            onClick={() => scrollToSection("beneficios")}
            className="text-gray-700 hover:text-gray-900 transition-colors font-medium"
          >
            Benefícios
          </button>
          <button
            onClick={() => scrollToSection("contato")}
            className="text-gray-700 hover:text-gray-900 transition-colors font-medium"
          >
            Contato
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-gray-700 hover:bg-gray-300/50"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#E7F3FF] border-t border-blue-200">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <button
              onClick={() => scrollToSection("inicio")}
              className="text-gray-700 hover:text-gray-900 transition-colors text-left py-2 font-medium"
            >
              Início
            </button>
            <button
              onClick={() => scrollToSection("simulador")}
              className="text-gray-700 hover:text-gray-900 transition-colors text-left py-2 font-medium"
            >
              Simulador
            </button>
            <button
              onClick={() => scrollToSection("beneficios")}
              className="text-gray-700 hover:text-gray-900 transition-colors text-left py-2 font-medium"
            >
              Benefícios
            </button>
            <button
              onClick={() => scrollToSection("contato")}
              className="text-gray-700 hover:text-gray-900 transition-colors text-left py-2 font-medium"
            >
              Contato
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
