CREATE DATABASE ObligatorioBD2;

USE ObligatorioBD2;


CREATE TABLE `Departamento` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nombre` VARCHAR(100)
);

CREATE TABLE `Eleccion` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `fecha_hora_inicio` DATETIME,
  `fecha_hora_fin` DATETIME,
  `nombre` VARCHAR(255),
  `tipo` ENUM('Presidencial', 'Ballotage', 'Referéndum', 'Plebiscito')
);

CREATE TABLE `Establecimiento` (
  `dirección` VARCHAR(255) PRIMARY KEY,
  `barrio` VARCHAR(100),
  `pueblo` VARCHAR(100),
  `ciudad_paraje` VARCHAR(100),
  `zona` VARCHAR(100),
  `tipo` ENUM('Liceo', 'Universidad', 'Escuela'),
  `id_departamento` INT,
  FOREIGN KEY (`id_departamento`) REFERENCES `Departamento`(`id`)
);

CREATE TABLE `Circuito` (
  `direccion_establecimiento` VARCHAR(255),
  `nro` VARCHAR(20),
  `es_accesible` BOOLEAN,
  PRIMARY KEY (`direccion_establecimiento`, `nro`),
  FOREIGN KEY (`direccion_establecimiento`) REFERENCES `Establecimiento`(`dirección`)
);

CREATE TABLE `Ciudadano` (
  `nro_credencial` VARCHAR(50) PRIMARY KEY,
  `cédula_identidad` VARCHAR(20) UNIQUE,
  `fecha_nacimiento` DATE,
  `nombre_completo` VARCHAR(255),
  `direccion_circuito` VARCHAR(255),
  `nro_circuito` VARCHAR(20),
  FOREIGN KEY (`direccion_circuito`, `nro_circuito`) REFERENCES `Circuito`(`direccion_establecimiento`, `nro`)
);

CREATE TABLE `Policia` (
  `nro_credencial_ciudadano` VARCHAR(50) PRIMARY KEY,
  `nro_comisaria` VARCHAR(50),
  FOREIGN KEY (`nro_credencial_ciudadano`) REFERENCES `Ciudadano`(`nro_credencial`)
);

CREATE TABLE `Policia_Establecimiento` (
  `nro_credencial_policia` VARCHAR(50),
  `direccion_establecimiento` VARCHAR(255),
  `fecha` DATE,
  PRIMARY KEY (`nro_credencial_policia`, `direccion_establecimiento`, `fecha`),
  FOREIGN KEY (`nro_credencial_policia`) REFERENCES `Policia`(`nro_credencial_ciudadano`),
  FOREIGN KEY (`direccion_establecimiento`) REFERENCES `Establecimiento`(`dirección`)
);

CREATE TABLE `EstadoVoto` (
  `tipo` ENUM('Aprobado Presidente Mesa', 'Emitido Observado', 'Emitido', 'Anulado', 'Blanco') PRIMARY KEY,
  `descripción` TEXT
    -- RnE: EstadoVoto.tipo "Aprobado Presidente Mesa” o "Emitido Observado” solo disponibles para voto observado. (Hay que verlo a nivel de app)
);

CREATE TABLE `Voto` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `direccion_circuito` VARCHAR(255),
  `nro_circuito` VARCHAR(20),
  FOREIGN KEY (`direccion_circuito`, `nro_circuito`) REFERENCES `Circuito`(`direccion_establecimiento`, `nro`)
);

CREATE TABLE `Voto_EstadoVoto` (
  `id_voto` INT,
  `tipo_estado_voto` ENUM('Aprobado Presidente Mesa', 'Emitido Observado', 'Emitido', 'Anulado', 'Blanco'),
  `fecha_hora` DATETIME,
  PRIMARY KEY (`id_voto`, `tipo_estado_voto`, `fecha_hora`),
  FOREIGN KEY (`id_voto`) REFERENCES `Voto`(`id`),
  FOREIGN KEY (`tipo_estado_voto`) REFERENCES `EstadoVoto`(`tipo`)
);

CREATE TABLE `IntegranteMesa` (
  `nro_credencial_ciudadano` VARCHAR(50) PRIMARY KEY,
  `organismo_trabaja` VARCHAR(255),
  `tipo` ENUM('Presidente', 'Secretario', 'Vocal'),
  FOREIGN KEY (`nro_credencial_ciudadano`) REFERENCES `Ciudadano`(`nro_credencial`)
);

CREATE TABLE `FormulaMesa` (
  `id_eleccion` INT,
  `nro_mesa` VARCHAR(20),
  `es_accesible` BOOLEAN,
  `id_presidente_mesa` VARCHAR(50),
  `id_secretario_mesa` VARCHAR(50),
  `id_vocal_mesa` VARCHAR(50),
  `direccion_circuito` VARCHAR(255),
  `nro_circuito` VARCHAR(20),
  PRIMARY KEY (`id_eleccion`, `nro_mesa`),
  FOREIGN KEY (`id_eleccion`) REFERENCES `Eleccion`(`id`),
  FOREIGN KEY (`id_presidente_mesa`) REFERENCES `IntegranteMesa`(`nro_credencial_ciudadano`),
  FOREIGN KEY (`id_secretario_mesa`) REFERENCES `IntegranteMesa`(`nro_credencial_ciudadano`),
  FOREIGN KEY (`id_vocal_mesa`) REFERENCES `IntegranteMesa`(`nro_credencial_ciudadano`),
  FOREIGN KEY (`direccion_circuito`, `nro_circuito`) REFERENCES `Circuito`(`direccion_establecimiento`, `nro`)
);

CREATE TABLE `EstadoCircuito` (
  `tipo` VARCHAR(50) PRIMARY KEY,
  `descripción` TEXT,
  CONSTRAINT `CK_EstadoCircuito_tipo` CHECK (`tipo` IN ('Abierto', 'Cerrado', 'Contado'))
);

CREATE TABLE `FormulaMesa_EstadoCircuito` (
  `id_eleccion` INT,
  `nro_mesa` VARCHAR(20),
  `fecha_hora` DATETIME,
  `tipo_estado_circuito` VARCHAR(50),
  PRIMARY KEY (`id_eleccion`, `nro_mesa`, `tipo_estado_circuito`, `fecha_hora`),
  FOREIGN KEY (`id_eleccion`, `nro_mesa`) REFERENCES `FormulaMesa`(`id_eleccion`, `nro_mesa`),
  FOREIGN KEY (`tipo_estado_circuito`) REFERENCES `EstadoCircuito`(`tipo`)
);

CREATE TABLE `Vota` (
  `id_eleccion` INT,
  `nro_mesa` VARCHAR(20),
  `nro_credencial_ciudadano` VARCHAR(50),
  `fecha_hora` DATETIME,
  PRIMARY KEY (`id_eleccion`, `nro_mesa`, `nro_credencial_ciudadano`),
  FOREIGN KEY (`id_eleccion`, `nro_mesa`) REFERENCES `FormulaMesa`(`id_eleccion`, `nro_mesa`),
  FOREIGN KEY (`nro_credencial_ciudadano`) REFERENCES `Ciudadano`(`nro_credencial`)
);

CREATE TABLE `Papeleta` (
  `id` INT PRIMARY KEY,
  `descripción` TEXT,
  `fecha_hora_fin` DATETIME,
  `nombre` VARCHAR(255),
  `tipo` VARCHAR(100),
  `id_eleccion` INT,
  FOREIGN KEY (`id_eleccion`) REFERENCES `Eleccion`(`id`)
);

CREATE TABLE `Voto_Papeleta` (
  `id_voto` INT,
  `id_papeleta` INT,
  PRIMARY KEY (`id_voto`, `id_papeleta`),
  FOREIGN KEY (`id_voto`) REFERENCES `Voto`(`id`),
  FOREIGN KEY (`id_papeleta`) REFERENCES `Papeleta`(`id`)
);

CREATE TABLE `PapeletaComun` (
  `id_papeleta` INT PRIMARY KEY,
  `es_si` BOOLEAN,
  `color` VARCHAR(50),
  FOREIGN KEY (`id_papeleta`) REFERENCES `Papeleta`(`id`)
);

CREATE TABLE `Partido` (
  `id` INT PRIMARY KEY,
  `nombre` VARCHAR(255) UNIQUE,
  `dirección_sede` VARCHAR(255),
  `nombre_presidente` VARCHAR(255),
  `nombre_vicepresidente` VARCHAR(255)
);

CREATE TABLE `Candidato` (
  `nro_credencial_ciudadano` VARCHAR(50) PRIMARY KEY,
  FOREIGN KEY (`nro_credencial_ciudadano`) REFERENCES `Ciudadano`(`nro_credencial`)
);

CREATE TABLE `ParticipanteLista` (
  `nro_credencial_ciudadano` VARCHAR(50) PRIMARY KEY,
  `organo_candidato` VARCHAR(100),
  FOREIGN KEY (`nro_credencial_ciudadano`) REFERENCES `Ciudadano`(`nro_credencial`)
);

CREATE TABLE `Lista` (
  `id_papeleta` INT,
  `nro_lista` VARCHAR(20),
  `nro_credencial_candidato` VARCHAR(50), -- "Cabeza de lista"
  `id_partido` INT,
  PRIMARY KEY (`id_papeleta`, `nro_lista`),
  FOREIGN KEY (`id_papeleta`) REFERENCES `Papeleta`(`id`),
  FOREIGN KEY (`nro_credencial_candidato`) REFERENCES `Candidato`(`nro_credencial_ciudadano`),
  FOREIGN KEY (`id_partido`) REFERENCES `Partido`(`id`)
);

CREATE TABLE `Lista_ParticipanteLista` (
  `id_papeleta` INT,
  `nro_lista` VARCHAR(20),
  `nro_credencial_participante` VARCHAR(50),
  `orden` INT,
  PRIMARY KEY (`id_papeleta`, `nro_lista`, `nro_credencial_participante`),
  FOREIGN KEY (`id_papeleta`, `nro_lista`) REFERENCES `Lista`(`id_papeleta`, `nro_lista`),
  FOREIGN KEY (`nro_credencial_participante`) REFERENCES `ParticipanteLista`(`nro_credencial_ciudadano`)
);