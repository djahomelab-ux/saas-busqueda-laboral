CREATE DATABASE IF NOT EXISTS saas_busqueda_laboral
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE saas_busqueda_laboral;

CREATE TABLE usuario (
    id_usuario     INT AUTO_INCREMENT PRIMARY KEY,
    correo         VARCHAR(120) NOT NULL UNIQUE,
    contrasena     VARCHAR(255) NOT NULL,          -- hash bcrypt
    nombres        VARCHAR(80)  NOT NULL,
    apellidos      VARCHAR(80)  NOT NULL,
    rol            ENUM('postulante','administrador') NOT NULL DEFAULT 'postulante',
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE perfil_profesional (
    id_perfil   INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario  INT NOT NULL UNIQUE,
    titulo      VARCHAR(120),
    resumen     TEXT,
    experiencia TEXT,
    CONSTRAINT fk_perfil_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE habilidad (
    id_habilidad INT AUTO_INCREMENT PRIMARY KEY,
    nombre       VARCHAR(60) NOT NULL UNIQUE,      -- en minúsculas: html, react...
    categoria    VARCHAR(40)
) ENGINE=InnoDB;

CREATE TABLE perfil_habilidad (
    id_perfil    INT NOT NULL,
    id_habilidad INT NOT NULL,
    nivel        ENUM('basico','intermedio','avanzado') NOT NULL,
    PRIMARY KEY (id_perfil, id_habilidad),
    CONSTRAINT fk_ph_perfil FOREIGN KEY (id_perfil)
        REFERENCES perfil_profesional(id_perfil) ON DELETE CASCADE,
    CONSTRAINT fk_ph_habilidad FOREIGN KEY (id_habilidad)
        REFERENCES habilidad(id_habilidad)
) ENGINE=InnoDB;

CREATE TABLE curriculum (
    id_curriculum INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario    INT NOT NULL,
    nombre        VARCHAR(100) NOT NULL,
    CONSTRAINT fk_curriculum_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE version_curriculum (
    id_version    INT AUTO_INCREMENT PRIMARY KEY,
    id_curriculum INT NOT NULL,
    numero        INT NOT NULL,
    contenido     JSON NOT NULL,
    fecha         DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_version (id_curriculum, numero),
    CONSTRAINT fk_version_curriculum FOREIGN KEY (id_curriculum)
        REFERENCES curriculum(id_curriculum) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE empresa (
    id_empresa INT AUTO_INCREMENT PRIMARY KEY,
    nombre     VARCHAR(120) NOT NULL,
    sector     VARCHAR(60)
) ENGINE=InnoDB;

CREATE TABLE oferta_laboral (
    id_oferta   INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario  INT NOT NULL,                       -- usuario que registró la oferta
    id_empresa  INT NOT NULL,
    puesto      VARCHAR(120) NOT NULL,
    descripcion TEXT,
    modalidad   ENUM('presencial','remoto','hibrido'),
    ubicacion   VARCHAR(80),
    CONSTRAINT fk_oferta_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_oferta_empresa FOREIGN KEY (id_empresa)
        REFERENCES empresa(id_empresa)
) ENGINE=InnoDB;

CREATE TABLE requisito_oferta (
    id_oferta    INT NOT NULL,
    id_habilidad INT NOT NULL,
    obligatorio  BOOLEAN NOT NULL DEFAULT TRUE,     -- FALSE = deseable
    PRIMARY KEY (id_oferta, id_habilidad),
    CONSTRAINT fk_req_oferta FOREIGN KEY (id_oferta)
        REFERENCES oferta_laboral(id_oferta) ON DELETE CASCADE,
    CONSTRAINT fk_req_habilidad FOREIGN KEY (id_habilidad)
        REFERENCES habilidad(id_habilidad)
) ENGINE=InnoDB;

CREATE TABLE postulacion (
    id_postulacion    INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario        INT NOT NULL,
    id_oferta         INT NOT NULL,
    id_version        INT NOT NULL,
    estado            ENUM('registrada','en_proceso','entrevista','oferta_recibida',
                           'rechazada','desistida') NOT NULL DEFAULT 'registrada',
    fecha_postulacion DATE NOT NULL,
    CONSTRAINT fk_post_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    CONSTRAINT fk_post_oferta  FOREIGN KEY (id_oferta)  REFERENCES oferta_laboral(id_oferta),
    CONSTRAINT fk_post_version FOREIGN KEY (id_version) REFERENCES version_curriculum(id_version)
) ENGINE=InnoDB;

CREATE TABLE entrevista_simulada (
    id_entrevista  INT AUTO_INCREMENT PRIMARY KEY,
    id_postulacion INT NOT NULL,
    fecha          DATETIME DEFAULT CURRENT_TIMESTAMP,
    puntaje_global DECIMAL(5,2),
    CONSTRAINT fk_entrev_post FOREIGN KEY (id_postulacion)
        REFERENCES postulacion(id_postulacion) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE pregunta_respuesta (
    id_pregunta      INT AUTO_INCREMENT PRIMARY KEY,
    id_entrevista    INT NOT NULL,
    pregunta         TEXT NOT NULL,
    criterio_clave   VARCHAR(255),
    respuesta        TEXT,
    puntajes         JSON,                          -- claridad, comunicacion, relevancia, tecnico
    retroalimentacion TEXT,
    puntaje          DECIMAL(5,2),
    CONSTRAINT fk_preg_entrev FOREIGN KEY (id_entrevista)
        REFERENCES entrevista_simulada(id_entrevista) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE suscripcion (
    id_suscripcion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario     INT NOT NULL,
    plan           ENUM('gratuito','pro') NOT NULL,
    fecha_inicio   DATE NOT NULL,
    fecha_fin      DATE,
    estado         ENUM('activa','vencida','cancelada') NOT NULL DEFAULT 'activa',
    CONSTRAINT fk_susc_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE pago (
    id_pago        INT AUTO_INCREMENT PRIMARY KEY,
    id_suscripcion INT NOT NULL,
    monto          DECIMAL(8,2) NOT NULL,
    fecha_pago     DATETIME DEFAULT CURRENT_TIMESTAMP,
    metodo         VARCHAR(30),
    referencia     VARCHAR(60),                     -- en modo de prueba: PRUEBA-<id>
    CONSTRAINT fk_pago_susc FOREIGN KEY (id_suscripcion)
        REFERENCES suscripcion(id_suscripcion)
) ENGINE=InnoDB;

-- Tabla añadida en el Avance 2: historial y métricas del asistente
CREATE TABLE consulta_asistente (
    id_consulta INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario  INT NOT NULL,
    tipo        ENUM('compatibilidad','analisis_cv','preguntas','evaluacion','consulta') NOT NULL,
    latencia_ms INT NOT NULL,
    intentos    TINYINT NOT NULL DEFAULT 1,
    fecha       DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_consulta_usuario_fecha (id_usuario, fecha),
    CONSTRAINT fk_consulta_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;
