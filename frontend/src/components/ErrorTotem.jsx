import React from 'react';


const ErrorTotem = ({error, retry}) => {

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
                <div className="text-red-500 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Error de Inicialización</h2>
                <p className="text-gray-600 mb-4">No se pudo cargar la información del circuito.</p>
                <p className="text-sm text-red-600 mb-4">{error?.message || 'Error desconocido'}</p>
                <button onClick={retry} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                    Reintentar
                </button>
            </div>
        </div>
    );
};

export default ErrorTotem;