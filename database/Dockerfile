# La última que encontré en la vuelta
FROM mysql:9.3

# Por lo que veo cualquier imagen de MySQL que usemos
# va a automáticamente ejecutar los scripts que tengamos en /docker-entrypoint-initdb.d
# al momento de crear la base de datos por primera vez.
COPY estructura.sql /docker-entrypoint-initdb.d/1_base.sql
COPY datos.sql /docker-entrypoint-initdb.d/2_datos.sql
