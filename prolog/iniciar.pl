% Arranca el servicio de reglas en el puerto 5000 y lo mantiene en ejecución.
%   swipl iniciar.pl
:- consult(servidor).
:- initialization(main, main).

main :-
    servidor(5000),
    format("Servicio Prolog en http://localhost:5000/compatibilidad~n"),
    thread_get_message(_).
