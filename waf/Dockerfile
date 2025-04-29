FROM owasp/modsecurity-crs:nginx

USER root

COPY extra-server.conf /etc/nginx/conf.d/extra-server.conf
COPY modsecurity.conf /etc/nginx/modsecurity.conf

WORKDIR /tmp

RUN mkdir ssl

RUN openssl req -x509 -nodes -out /tmp/ssl/transcendence.crt -keyout /tmp/ssl/transcendence.key -subj "/C=FR/ST=IDF/L=Paris/O=42/OU=42/CN=gmorel.42.fr/UID=login"

RUN chmod 644 /tmp/ssl/transcendence.crt \
    && chmod 600 /tmp/ssl/transcendence.key \
    && chown -R www-data:www-data /tmp/ssl

EXPOSE 6000

CMD ["nginx", "-g", "daemon off;"]
