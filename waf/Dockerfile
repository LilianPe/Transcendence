FROM owasp/modsecurity-crs:nginx

USER root

COPY extra-server.conf /etc/nginx/conf.d/extra-server.conf
COPY modsecurity.conf /etc/nginx/modsecurity.conf

WORKDIR /tmp

RUN mkdir ssl

EXPOSE 6000

CMD ["nginx", "-g", "daemon off;"]
