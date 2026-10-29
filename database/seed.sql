-- Datos de demostración: reproduce el ejemplo de la Tabla 1 del informe.
-- Usuario demo: juan@demo.com  /  contraseña: Demo12345  (solo para desarrollo)
USE saas_busqueda_laboral;

INSERT INTO usuario (id_usuario, correo, contrasena, nombres, apellidos) VALUES
  (1, 'juan@demo.com', '$2a$10$SB.VyOhSU9MvtFgsyK4WjuuAA7CXAolmYApTbT7YGDDWWfOC2Wa.6', 'Juan', 'Pérez');

INSERT INTO suscripcion (id_usuario, plan, fecha_inicio, estado) VALUES (1, 'gratuito', CURDATE(), 'activa');

INSERT INTO habilidad (id_habilidad, nombre, categoria) VALUES
  (1, 'html', 'frontend'), (2, 'css', 'frontend'), (3, 'javascript', 'frontend'),
  (4, 'react', 'frontend'), (5, 'git', 'herramientas'), (6, 'python', 'datos'),
  (7, 'sql', 'datos'), (8, 'power_bi', 'datos');

INSERT INTO perfil_profesional (id_perfil, id_usuario, titulo, resumen) VALUES
  (1, 1, 'Estudiante de Ingeniería de Sistemas', 'Interesado en desarrollo frontend.');

-- intermedio/avanzado = evidenciado; basico = poco evidenciado
INSERT INTO perfil_habilidad (id_perfil, id_habilidad, nivel) VALUES
  (1, 1, 'intermedio'), (1, 2, 'intermedio'), (1, 3, 'intermedio'), (1, 4, 'basico');

INSERT INTO curriculum (id_curriculum, id_usuario, nombre) VALUES (1, 1, 'CV frontend');
INSERT INTO version_curriculum (id_version, id_curriculum, numero, contenido) VALUES
  (1, 1, 1, JSON_OBJECT(
    'datos_personales', JSON_OBJECT('nombre', 'Juan Pérez'),
    'perfil', 'Estudiante de sistemas con proyectos web en HTML, CSS y JavaScript.',
    'experiencia', 'Desarrollo de la web de una tienda local (2025).',
    'formacion', 'Ingeniería de Sistemas, UPSJB (en curso).',
    'habilidades', JSON_ARRAY('html', 'css', 'javascript', 'react')));

INSERT INTO empresa (id_empresa, nombre) VALUES (1, 'Empresa Demo SAC');
INSERT INTO oferta_laboral (id_oferta, id_usuario, id_empresa, puesto, modalidad, ubicacion) VALUES
  (1, 1, 1, 'Desarrollador frontend junior', 'remoto', 'Ica');
INSERT INTO requisito_oferta (id_oferta, id_habilidad, obligatorio) VALUES
  (1, 1, TRUE), (1, 2, TRUE), (1, 3, TRUE), (1, 4, TRUE), (1, 5, FALSE);
