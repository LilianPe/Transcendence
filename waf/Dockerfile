FROM owasp/modsecurity-crs:nginx

COPY extra-server.conf /etc/nginx/conf.d/extra-server.conf
COPY modsecurity.conf /etc/nginx/modsecurity.conf

EXPOSE 6000

CMD ["nginx", "-g", "daemon off;"]
