import React, { useEffect, useState } from "react";

const Pendente = () => {
  const [dots, setDots] = useState(".");
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(dots => dots.length >= 3 ? "." : dots + ".");
    }, 600);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="relative w-32 h-32">
            <img
              src="/src/assets/LogoAgenda.png"
              alt="Caderno"
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 opacity-30"></div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Aguardando Atribuição</h2>
          <p className="text-gray-600 mb-4">
            Por favor, aguarde enquanto o seu cargo é atribuído{dots}
          </p>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
          </div>
          
          <p className="text-sm text-gray-500">
            Estamos processando sua solicitação. Isso pode levar alguns momentos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pendente;