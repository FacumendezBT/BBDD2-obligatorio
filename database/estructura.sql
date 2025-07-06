CREATE TABLE Departamento (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE Eleccion (
  id INT PRIMARY KEY AUTO_INCREMENT,
  fecha_hora_inicio DATETIME NOT NULL,
  fecha_hora_fin DATETIME NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  tipo ENUM('Presidencial', 'Ballotage', 'Referéndum', 'Plebiscito') NOT NULL
);

CREATE TABLE Establecimiento (
  direccion VARCHAR(255) PRIMARY KEY,
  barrio VARCHAR(100),
  pueblo VARCHAR(100),
  ciudad_paraje VARCHAR(100),
  zona VARCHAR(100),
  tipo ENUM('Liceo', 'Universidad', 'Escuela') NOT NULL,
  fk_departamento_id INT NOT NULL,
  FOREIGN KEY (fk_departamento_id) REFERENCES Departamento(id)
);

CREATE TABLE Circuito (
  fk_establecimiento_direccion VARCHAR(255),
  nro VARCHAR(20),
  es_accesible BOOLEAN,
  PRIMARY KEY (fk_establecimiento_direccion, nro),
  FOREIGN KEY (fk_establecimiento_direccion) REFERENCES Establecimiento(direccion) ON DELETE CASCADE
);

CREATE TABLE Ciudadano (
  nro_credencial VARCHAR(50) PRIMARY KEY,
  cedula_identidad VARCHAR(20) NOT NULL UNIQUE,
  fecha_nacimiento DATE NOT NULL,
  nombre_completo VARCHAR(255) NOT NULL
);

CREATE TABLE UsuarioSistema (
  fk_ciudadano_nro_credencial VARCHAR(50) PRIMARY KEY,
  contraseña VARCHAR(255) NOT NULL,
  tipo VARCHAR(100),
  FOREIGN KEY (fk_ciudadano_nro_credencial) REFERENCES Ciudadano(nro_credencial) ON DELETE CASCADE
);

CREATE TABLE IntegranteMesa (
  fk_usuariosistema_nro_credencial VARCHAR(50) PRIMARY KEY,
  organismo_trabaja VARCHAR(255),
  tipo ENUM('Presidente', 'Secretario', 'Vocal') NOT NULL,
  FOREIGN KEY (fk_usuariosistema_nro_credencial) REFERENCES UsuarioSistema(fk_ciudadano_nro_credencial) ON DELETE CASCADE
);

CREATE TABLE Policia (
  fk_ciudadano_nro_credencial VARCHAR(50) PRIMARY KEY,
  nro_comisaria VARCHAR(50),
  FOREIGN KEY (fk_ciudadano_nro_credencial) REFERENCES Ciudadano(nro_credencial) ON DELETE CASCADE
);

CREATE TABLE Candidato (
  fk_ciudadano_nro_credencial VARCHAR(50) PRIMARY KEY,
  FOREIGN KEY (fk_ciudadano_nro_credencial) REFERENCES Ciudadano(nro_credencial) ON DELETE CASCADE
);

CREATE TABLE ParticipanteLista (
  fk_ciudadano_nro_credencial VARCHAR(50) PRIMARY KEY,
  organo_candidato VARCHAR(100),
  FOREIGN KEY (fk_ciudadano_nro_credencial) REFERENCES Ciudadano(nro_credencial) ON DELETE CASCADE
);

CREATE TABLE EstadoCircuito (
  tipo ENUM('Abierto', 'Cerrado', 'Contado') PRIMARY KEY,
  descripcion TEXT
);

CREATE TABLE FormulaMesa (
  fk_eleccion_id INT,
  nro_mesa VARCHAR(20),
  es_accesible BOOLEAN,
  estado_actual VARCHAR(100),
  hash_integridad VARCHAR(255),
  fk_presidente_credencial VARCHAR(50),
  fk_secretario_credencial VARCHAR(50),
  fk_vocal_credencial VARCHAR(50),
  fk_circuito_establecimiento_direccion VARCHAR(255) NOT NULL,
  fk_circuito_nro VARCHAR(20) NOT NULL,
  PRIMARY KEY (fk_eleccion_id, nro_mesa),
  FOREIGN KEY (fk_eleccion_id) REFERENCES Eleccion(id),
  FOREIGN KEY (fk_presidente_credencial) REFERENCES IntegranteMesa(fk_usuariosistema_nro_credencial),
  FOREIGN KEY (fk_secretario_credencial) REFERENCES IntegranteMesa(fk_usuariosistema_nro_credencial),
  FOREIGN KEY (fk_vocal_credencial) REFERENCES IntegranteMesa(fk_usuariosistema_nro_credencial),
  FOREIGN KEY (fk_circuito_establecimiento_direccion, fk_circuito_nro) REFERENCES Circuito(fk_establecimiento_direccion, nro)
);

CREATE TABLE FormulaMesa_EstadoCircuito (
  fk_formulam_eleccion_id INT,
  fk_formulam_nro_mesa VARCHAR(20),
  fk_estadocircuito_tipo ENUM('Abierto', 'Cerrado', 'Contado'),
  fecha_hora DATETIME,
  PRIMARY KEY (fk_formulam_eleccion_id, fk_formulam_nro_mesa, fecha_hora, fk_estadocircuito_tipo),
  FOREIGN KEY (fk_formulam_eleccion_id, fk_formulam_nro_mesa) REFERENCES FormulaMesa(fk_eleccion_id, nro_mesa) ON DELETE CASCADE,
  FOREIGN KEY (fk_estadocircuito_tipo) REFERENCES EstadoCircuito(tipo)
);

CREATE TABLE Ciudadano_Circuito_Eleccion (
  fk_ciudadano_nro_credencial VARCHAR(50),
  fk_eleccion_id INT,
  fk_circuito_establecimiento_direccion VARCHAR(255) NOT NULL,
  fk_circuito_nro VARCHAR(20) NOT NULL,
  PRIMARY KEY (fk_ciudadano_nro_credencial, fk_eleccion_id),
  FOREIGN KEY (fk_ciudadano_nro_credencial) REFERENCES Ciudadano(nro_credencial),
  FOREIGN KEY (fk_eleccion_id) REFERENCES Eleccion(id),
  FOREIGN KEY (fk_circuito_establecimiento_direccion, fk_circuito_nro) REFERENCES Circuito(fk_establecimiento_direccion, nro)
);

CREATE TABLE Vota (
  fk_formulam_eleccion_id INT,
  fk_formulam_nro_mesa VARCHAR(20),
  fk_ciudadano_nro_credencial VARCHAR(50),
  id_generado VARCHAR(256) UNIQUE,
  fecha_hora DATETIME NOT NULL,
  PRIMARY KEY (fk_formulam_eleccion_id, fk_formulam_nro_mesa, fk_ciudadano_nro_credencial),
  FOREIGN KEY (fk_formulam_eleccion_id, fk_formulam_nro_mesa) REFERENCES FormulaMesa(fk_eleccion_id, nro_mesa),
  FOREIGN KEY (fk_ciudadano_nro_credencial) REFERENCES Ciudadano(nro_credencial)
);

CREATE TABLE Voto (
  id INT PRIMARY KEY AUTO_INCREMENT,
  hora_emision DATETIME NOT NULL,
  hora_contado DATETIME,
  hash_integridad VARCHAR(255),
  estado_actual ENUM('Aprobado Presidente Mesa', 'Emitido Observado', 'Emitido', 'Contado') NOT NULL,
  tipo ENUM('Normal', 'Observado', 'Anulado', 'Observado Anulado', 'Blanco') NOT NULL,
  fk_circuito_establecimiento_direccion VARCHAR(255) NOT NULL,
  fk_circuito_nro VARCHAR(20) NOT NULL,
  FOREIGN KEY (fk_circuito_establecimiento_direccion, fk_circuito_nro) REFERENCES Circuito(fk_establecimiento_direccion, nro),
  CONSTRAINT CK_Voto_EstadoObservado CHECK (tipo != 'Observado' AND estado_actual NOT IN ('Emitido Observado', 'Aprobado Presidente Mesa'))
);

CREATE TABLE Observado (
  fk_voto_id INT PRIMARY KEY,
  hora_aprobado DATETIME,
  fk_integrantemesa_nro_credencial VARCHAR(50),
  FOREIGN KEY (fk_voto_id) REFERENCES Voto(id) ON DELETE CASCADE,
  FOREIGN KEY (fk_integrantemesa_nro_credencial) REFERENCES IntegranteMesa(fk_usuariosistema_nro_credencial)
);

CREATE TABLE Papeleta (
  id INT PRIMARY KEY AUTO_INCREMENT,
  descripcion TEXT,
  fk_eleccion_id INT NOT NULL,
  FOREIGN KEY (fk_eleccion_id) REFERENCES Eleccion(id)
);

CREATE TABLE Voto_Papeleta (
  fk_voto_id INT,
  fk_papeleta_id INT,
  PRIMARY KEY (fk_voto_id, fk_papeleta_id),
  FOREIGN KEY (fk_voto_id) REFERENCES Voto(id),
  FOREIGN KEY (fk_papeleta_id) REFERENCES Papeleta(id)
);

CREATE TABLE PapeletaComun (
  fk_papeleta_id INT PRIMARY KEY,
  es_si BOOLEAN, -- Representa si la papeleta es por "Sí" (true) o "No" (false).
  color VARCHAR(50),
  FOREIGN KEY (fk_papeleta_id) REFERENCES Papeleta(id) ON DELETE CASCADE
);

CREATE TABLE Partido (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL UNIQUE,
  direccion_sede VARCHAR(255),
  nombre_presidente VARCHAR(255),
  nombre_vicepresidente VARCHAR(255)
);

CREATE TABLE Lista (
  fk_partido_id INT,
  fk_papeleta_id INT,
  nro_lista VARCHAR(20) NOT NULL,
  fk_departamento_id INT, -- Puede ser NULL si la lista es nacional.
  fk_candidato_credencial VARCHAR(50), -- "Cabeza de lista".
  PRIMARY KEY (fk_partido_id, fk_papeleta_id),
  UNIQUE (fk_papeleta_id),
  FOREIGN KEY (fk_partido_id) REFERENCES Partido(id),
  FOREIGN KEY (fk_papeleta_id) REFERENCES Papeleta(id) ON DELETE CASCADE,
  FOREIGN KEY (fk_departamento_id) REFERENCES Departamento(id),
  FOREIGN KEY (fk_candidato_credencial) REFERENCES Candidato(fk_ciudadano_nro_credencial)
);


CREATE TABLE Policia_Establecimiento_Eleccion (
  fk_policia_nro_credencial VARCHAR(50),
  fk_establecimiento_direccion VARCHAR(255),
  fk_eleccion_id INT,
  PRIMARY KEY (fk_policia_nro_credencial, fk_establecimiento_direccion, fk_eleccion_id),
  FOREIGN KEY (fk_policia_nro_credencial) REFERENCES Policia(fk_ciudadano_nro_credencial),
  FOREIGN KEY (fk_establecimiento_direccion) REFERENCES Establecimiento(direccion),
  FOREIGN KEY (fk_eleccion_id) REFERENCES Eleccion(id)
);



CREATE TABLE Lista_ParticipanteLista (
  fk_participantelista_nro_credencial VARCHAR(50),
  fk_lista_papeleta_id INT,
  fk_lista_partido_id INT,
  orden INT NOT NULL,
  PRIMARY KEY (fk_participantelista_nro_credencial, fk_lista_papeleta_id, fk_lista_partido_id),
  FOREIGN KEY (fk_lista_partido_id, fk_lista_papeleta_id) REFERENCES Lista(fk_partido_id, fk_papeleta_id) ON DELETE CASCADE,
  FOREIGN KEY (fk_participantelista_nro_credencial) REFERENCES ParticipanteLista(fk_ciudadano_nro_credencial)
);
