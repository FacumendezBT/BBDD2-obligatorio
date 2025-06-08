Ciudadano ( 
<ins>**nro_credencial**</ins>, 
cédula_identidad, 
fecha_nacimiento, 
nombre_completo,
)

UsuarioSistema ( 
<ins>**FK:Ciudadano.nro_credencial**</ins>, 
contraseña,
tipo, 
)

IntegranteMesa ( 
<ins>**FK:UsuarioSistema.nro_credencial**</ins>, 
organismo_trabaja, 
tipo 
)

Policia ( 
<ins>**FK:Ciudadano.nro_credencial**</ins>, 
nro_comisaria 
)

Departamento ( 
<ins>**id**</ins>, 
nombre 
)

Establecimiento ( 
<ins>**dirección**</ins>, 
barrio, 
pueblo, 
ciudad_paraje, 
zona, 
tipo,
FK:Departamento.id
)

Elección (
<ins>**id**</ins>,
fecha_hora_inicio,
fecha_hora_fin,
nombre,
tipo
)

Policía_Establecimiento_Eleccion (
<ins>**FK:Policia.nro_credencial**</ins>,  
<ins>**FK:Establecimiento.dirección**</ins>,  
<ins>**FK:Eleccion.id**</ins>,  
)

Circuito ( 
<ins>**FK:Establecimiento.dirección**</ins>,  
<ins>**nro**</ins>,  
es_accesible 
)

Voto ( 
<ins>**id**</ins>, 
hora_emision,
hora_contado
hash_integridad,
estado_actual,
tipo,
FK:Circuito.dirección
FK:Circuito.nro
)

Observado (
<ins>**FK:Voto.id**</ins>, 
hora_aprobado,
FK:IntegranteMesa.nro_credencial
)

FormulaMesa ( 
<ins>**FK:Elección.id**</ins>, 
<ins>**nro_mesa**</ins>, 
es_accesible, 
estado_actual,
hash_integridad,
FK:IntegranteMesa.nro_credencial (id_presidente), 
FK:IntegranteMesa.nro_credencial (id_secretario), 
FK:IntegranteMesa.nro_credencial (id_vocal), 
FK:Circuito.dirección
FK:Circuito.nro
)

EstadoCircuito ( 
<ins>**tipo**</ins>,  
descripción
)

FormulaMesa_EstadoCircuito (
<ins>**FK:FormulaMesa.id**</ins>,
<ins>**FK:FormulaMesa.nro_mesa**</ins>,
<ins>**fecha_hora**</ins>,
<ins>**FK:EstadoCircuito.tipo**</ins>,  
)

Vota (
<ins>**FK:FormulaMesa.id**</ins>,
<ins>**FK:FormulaMesa.nro_mesa**</ins>,
<ins>**FK:Ciudadano.nro_credencial**</ins>, 
id_generado,
fecha_hora
)

Ciudadano_Circuito_Elección (
<ins>**FK:Ciudadano.nro_credencial**</ins>, 
<ins>**FK:Elección.id**</ins>, 
FK:Circuito.dirección
FK:Circuito.nro
)

Papeleta (
<ins>**id**</ins>, 
descripción,
FK:Elección.Id,
)

Voto_Papeleta (
<ins>**FK:Voto.Id**</ins>, 
<ins>**FK:Papeleta.id**</ins>,
)


PapeletaComun (
<ins>**FK:Papeleta.id**</ins>,
es_si,
color
)

Partido (
<ins>**id**</ins>,
nombre,
dirección_sede,
nombre_presidente,
nombre_vicepresidente,
)

Candidato (
<ins>**FK:Ciudadano.nro_credencial**</ins>, 
)

ParticipanteLista (
<ins>**FK:Ciudadano.nro_credencial**</ins>, 
organo_candidato
)

Lista (
<ins>**FK:Partido.id**</ins> (id_partido),
<ins>**FK:Papeleta.id**</ins> (id_papeleta),
nro_lista,
FK:departamento.id,
FK:Candidato.nro_credencial
)

Lista_ParticipanteLista (
<ins>**FK:ParticipanteLista.nro_credencial**</ins>, 
<ins>**FK:Lista.id_papeleta**</ins>, 
<ins>**FK:Lista.id_partido**</ins>, 
orden
)


RnE: Para ser ciudadano debe de tener más de 18 años

RnE: Establecimiento.tipo puede ser ( Liceo, Universidad, Escuela )

RnE: EstadoVoto.tipo puede ser ( Aprobado Presidente Mesa, Emitido Observado, Emitido, Anulado, Blanco )

RnE: EstadoVoto.tipo "Aprobado Presidente Mesa” o "Emitido Observado” solo disponibles para voto observado.

RnE: EstadoCircuito.tipo puede ser ( Abierto, Cerrado, Contado )

RnE: Elección.tipo puede ser ( Presidencial, Ballotage, Referéndum, Plebiscito )

RnE: IntegranteMesa.tipo puede ser ( Presidente, Secretario, Vocal )

RnE: FormulaMesa.id_presidente debe referenciar a un IntegranteMesa de tipo “Presidente” (Idem con Vocal y Secretario)

RnE: Lista.nro_lista no debe de repetirse dentro de un mismo período electoral
