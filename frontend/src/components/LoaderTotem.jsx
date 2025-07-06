import React from 'react';

const LoaderTotem = () => {
   return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Inicializando Totem</h2>
        <p className="text-gray-600">Cargando información del circuito...</p>
      </div>
    </div>
  );
};

export default LoaderTotem;