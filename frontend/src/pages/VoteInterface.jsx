import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { votanteLoginSchema } from '@/zod-schemas/votantes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginVotante, selectAuthLoading } from '@/store/auth-slice';
import { selectTotem } from '@/store/totem-slice';

export default function VoteInterface() {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectAuthLoading);
  const dataCircuito = useAppSelector(selectTotem);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(votanteLoginSchema),
    defaultValues: {
      serie: ['', '', ''],
      numero: ['', '', '', '', ''],
    },
    mode: 'onChange',
  });

  const watchedValues = watch();

  const handleSerieChange = (index, value, onChange) => {
    // Solo permitir letras, máximo 1 carácter
    const valFiltrado = value
      .replace(/[^a-zA-Z]/g, '')
      .slice(0, 1)
      .toUpperCase();

    const newSerie = [...watchedValues.serie];
    newSerie[index] = valFiltrado;
    onChange(newSerie);

    // Hacemos auto-focus al siguiente input si el actual está lleno
    if (valFiltrado && index < 2) {
      const nextInput = document.getElementById(`serie-${index + 1}`);
      if (nextInput) nextInput.focus();
    } else if (valFiltrado && index === 2) {
      // Si es el último input de serie, enfocamos el primero de número
      const firstNumeroInput = document.getElementById('numero-0');
      if (firstNumeroInput) firstNumeroInput.focus();
    }
  };

  const handleNumeroChange = (index, value, onChange) => {
    // Solo permitir números, máximo 1 carácter
    const valFiltrado = value.replace(/[^0-9]/g, '').slice(0, 1);

    const newNumero = [...watchedValues.numero];
    newNumero[index] = valFiltrado;
    onChange(newNumero);

    // Hacemos auto-focus al siguiente input si el actual está lleno
    if (valFiltrado && index < 4) {
      const nextInput = document.getElementById(`numero-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleTeclaBorrar = (e, type, index) => {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      const prevInput = document.getElementById(`${type}-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const onSubmit = async (data) => {
    try {
      const credencial = `${data.serie.join('')}${data.numero.join('')}`;
      console.log('Credencial completa:', credencial);
      console.log('Datos del formulario:', data);

      // Usar Redux para hacer login
      const result = dispatch(loginVotante(credencial));

      if (loginVotante.fulfilled.match(result)) {
        toast.success('¡Acceso exitoso! Bienvenido al sistema de votación.');
      } else {
        console.error('Error en login:', result.payload);
      }
    } catch (error) {
      toast.error('Error al acceder. Verifique sus credenciales.');
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl shadow-xl overflow-auto bg-[#002879] h-[90vh]">
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
          {/* Columan con el formulario de acceso */}
          <div className="flex flex-col items-start justify-between pl-14 py-9">
            <div className="flex flex-col items-start gap-3 flex-1">
              <div>
                <img src="/corte-electoral.png" alt="Totem de votación" className="w-16 h-20 object-cover" />
                <h3 className="uppercase text-white/65 text-lg font-semibold mt-12 mb-3 tracking-[0px] leading-relaxed">
                  12321321321321213 ELECTRÓNICAS 2024
                </h3>
                <h1 className="text-white/90 font-bold text-5xl">Acceso Votante</h1>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md mt-20 space-y-6 mb-20">
                <div className="space-y-4 mb-10">
                  <Label className="text-white/80 text-base font-medium">Ingrese su credencial completa</Label>
                  <div className="flex gap-3 items-center justify-center">
                    {/* Serie inputs - 3 cajitas */}
                    <div className="flex gap-2 p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                      <Controller
                        name="serie"
                        control={control}
                        render={({ field }) => (
                          <>
                            {field.value.map((digit, index) => (
                              <div key={`serie-${index}`} className="relative">
                                <Input
                                  id={`serie-${index}`}
                                  type="text"
                                  value={digit}
                                  onChange={(e) => handleSerieChange(index, e.target.value, field.onChange)}
                                  onKeyDown={(e) => handleTeclaBorrar(e, 'serie', index)}
                                  className={`h-12 w-10 text-xl bg-white/95 border-2 ${
                                    errors.serie ? 'border-red-400 focus:border-red-500' : 'border-white/30 focus:border-blue-400'
                                  } focus:bg-white text-center font-bold rounded-lg shadow-md transition-all duration-200 hover:shadow-lg focus:shadow-lg`}
                                  disabled={isLoading}
                                  placeholder="A"
                                  maxLength={1}
                                />
                              </div>
                            ))}
                          </>
                        )}
                      />
                    </div>
                    {/* Numero inputs - 5 cajitas */}
                    <div className="flex gap-2 p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                      <Controller
                        name="numero"
                        control={control}
                        render={({ field }) => (
                          <>
                            {field.value.map((digit, index) => (
                              <div key={`numero-${index}`} className="relative">
                                <Input
                                  id={`numero-${index}`}
                                  type="text"
                                  value={digit}
                                  onChange={(e) => handleNumeroChange(index, e.target.value, field.onChange)}
                                  onKeyDown={(e) => handleTeclaBorrar(e, 'numero', index)}
                                  className={`h-12 w-10 text-xl bg-white/95 border-2 ${
                                    errors.numero
                                      ? 'border-red-400 focus:border-red-500'
                                      : 'border-white/30 focus:border-blue-400'
                                  } focus:bg-white text-center font-bold rounded-lg shadow-md transition-all duration-200 hover:shadow-lg focus:shadow-lg`}
                                  disabled={isLoading}
                                  placeholder="0"
                                  maxLength={1}
                                />
                              </div>
                            ))}
                          </>
                        )}
                      />
                    </div>
                  </div>

                  {/* Mensajes de error */}
                  {(errors.serie || errors.numero) && (
                    <div>
                      {errors.serie && <p className="text-red-400 text-sm mt-2">{errors.serie[1]?.message}</p>}
                      {errors.numero && <p className="text-red-400 text-sm mt-2">{errors.numero[1]?.message}</p>}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-md font-semibold text-white hover:bg-white/90 bg-gradient-to-r from-[#2E59AEFF] to-[#395CA2FF] transition-colors disabled:opacity-50"
                  disabled={isLoading || !isValid}
                >
                  {isLoading ? 'Accediendo...' : 'Acceder'}
                </Button>
              </form>
            </div>
            <p className="text-gray-400">
              Circuito {dataCircuito.nroCircuito} - {dataCircuito.direccionCircuito}
            </p>
          </div>
          {/* Columan con la imagen del totem de votación */}
          <div className="flex items-center justify-center py-9 pl-12">
            <img src="/totem.svg" alt="Totem de votación" className="w-full h-full max-w-full max-h-full object-contain" />
          </div>
        </div>
      </Card>
    </div>
  );
}
