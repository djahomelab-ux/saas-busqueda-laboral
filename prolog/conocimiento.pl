% Base de conocimiento del asistente profesional
:- dynamic tiene_habilidad/3, requiere/3.

% tiene_habilidad(Usuario, Habilidad, Nivel)  Nivel: evidenciado | poco
tiene_habilidad(juan, html, evidenciado).
tiene_habilidad(juan, css, evidenciado).
tiene_habilidad(juan, javascript, evidenciado).
tiene_habilidad(juan, react, poco).

% requiere(Oferta, Habilidad, Tipo)  Tipo: obligatorio | deseable
requiere(frontend_junior, html, obligatorio).
requiere(frontend_junior, css, obligatorio).
requiere(frontend_junior, javascript, obligatorio).
requiere(frontend_junior, react, obligatorio).
requiere(frontend_junior, git, deseable).

peso(obligatorio, 2).
peso(deseable, 1).
factor(evidenciado, 1.0).
factor(poco, 0.5).

cumple_requisito(U, O, H) :- requiere(O, H, _), tiene_habilidad(U, H, evidenciado).
parcial(U, O, H)          :- requiere(O, H, _), tiene_habilidad(U, H, poco).
faltante(U, O, H)         :- requiere(O, H, _), \+ tiene_habilidad(U, H, _).

estado(U, O, H, evidenciado)    :- cumple_requisito(U, O, H), !.
estado(U, O, H, poco_evidenciado) :- parcial(U, O, H), !.
estado(_, _, _, no_evidenciado).

coincidencia_simple(U, O, P) :-
    findall(H, requiere(O, H, _), Rs), length(Rs, T), T > 0,
    findall(H, cumple_requisito(U, O, H), Cs), length(Cs, C),
    P is round(C / T * 100).

compatibilidad_ponderada(U, O, P) :-
    findall(W, (requiere(O, _, Ti), peso(Ti, W)), Ws), sum_list(Ws, Tot), Tot > 0,
    findall(S, (requiere(O, H, Ti), peso(Ti, W), tiene_habilidad(U, H, N), factor(N, F), S is W*F), Ss),
    sum_list(Ss, Obt),
    P is round(Obt / Tot * 100).

apto_minimo(U, O) :- \+ (requiere(O, H, obligatorio), \+ tiene_habilidad(U, H, _)).

reporte(U, O, json{simple:S, ponderada:P, detalle:D, apto:A}) :-
    coincidencia_simple(U, O, S), compatibilidad_ponderada(U, O, P),
    findall(json{habilidad:H, estado:E}, (requiere(O, H, _), estado(U, O, H, E)), D),
    ( apto_minimo(U, O) -> A = true ; A = false ).
