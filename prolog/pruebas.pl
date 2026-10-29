:- consult(conocimiento).
:- use_module(library(plunit)).
:- use_module(library(http/json)).

% Perfiles adicionales de prueba
:- assertz(tiene_habilidad(ana, html, evidenciado)), assertz(tiene_habilidad(ana, css, evidenciado)),
   assertz(tiene_habilidad(ana, javascript, evidenciado)), assertz(tiene_habilidad(ana, react, evidenciado)),
   assertz(tiene_habilidad(ana, git, evidenciado)).
:- assertz(tiene_habilidad(luis, python, evidenciado)), assertz(tiene_habilidad(luis, sql, evidenciado)).
:- assertz(tiene_habilidad(rosa, html, evidenciado)), assertz(tiene_habilidad(rosa, css, poco)),
   assertz(tiene_habilidad(rosa, git, evidenciado)).
:- assertz(requiere(analista_datos, python, obligatorio)), assertz(requiere(analista_datos, sql, obligatorio)),
   assertz(requiere(analista_datos, power_bi, deseable)).

:- begin_tests(kb).
test(cp01_simple_juan)      :- coincidencia_simple(juan, frontend_junior, 60).
test(cp02_ponderada_juan)   :- compatibilidad_ponderada(juan, frontend_junior, 78).
test(cp03_faltante_juan)    :- findall(H, faltante(juan, frontend_junior, H), [git]).
test(cp04_parcial_juan)     :- findall(H, parcial(juan, frontend_junior, H), [react]).
test(cp05_perfil_completo)  :- compatibilidad_ponderada(ana, frontend_junior, 100), apto_minimo(ana, frontend_junior).
test(cp06_perfil_sin_relacion) :- compatibilidad_ponderada(luis, frontend_junior, 0), \+ apto_minimo(luis, frontend_junior).
test(cp07_no_apto_obligatorio) :- \+ apto_minimo(rosa, frontend_junior), compatibilidad_ponderada(rosa, frontend_junior, 44).
test(cp08_otra_oferta)      :- compatibilidad_ponderada(luis, analista_datos, 80), apto_minimo(luis, analista_datos).
test(cp09_usuario_inexistente) :- compatibilidad_ponderada(nadie, frontend_junior, 0).
test(cp10_oferta_inexistente, [fail]) :- compatibilidad_ponderada(juan, oferta_x, _).
:- end_tests(kb).

main :- run_tests, reporte(juan, frontend_junior, R), json_write_dict(current_output, R), nl,
        forall(member(U-O,[juan-frontend_junior,ana-frontend_junior,luis-frontend_junior,rosa-frontend_junior,luis-analista_datos]),
          ( coincidencia_simple(U,O,S), compatibilidad_ponderada(U,O,P), (apto_minimo(U,O)->A=si;A=no), format("~w ~w simple=~w ponderada=~w apto=~w~n",[U,O,S,P,A]) )).
