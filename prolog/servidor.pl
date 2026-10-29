:- use_module(library(http/thread_httpd)).
:- use_module(library(http/http_dispatch)).
:- use_module(library(http/http_json)).
:- consult(conocimiento).

:- http_handler(root(compatibilidad), compatibilidad, [method(post)]).

servidor(Puerto) :- http_server(http_dispatch, [port(localhost:Puerto)]).

compatibilidad(Request) :-
    http_read_json_dict(Request, Datos),
    with_mutex(kb, ( cargar_hechos(Datos), reporte(usuario, oferta, Reporte) )),
    reply_json_dict(Reporte).

cargar_hechos(Datos) :-
    retractall(tiene_habilidad(usuario, _, _)),
    retractall(requiere(oferta, _, _)),
    forall(member(H, Datos.habilidades),
           ( atom_string(A, H.nombre), atom_string(N, H.nivel),
             assertz(tiene_habilidad(usuario, A, N)) )),
    forall(member(R, Datos.requisitos),
           ( atom_string(A, R.nombre), atom_string(T, R.tipo),
             assertz(requiere(oferta, A, T)) )).
