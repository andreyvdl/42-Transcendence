FROM nginx

RUN apt update && apt install -y openssl

RUN mkdir -p /etc/nginx/ssl

RUN openssl req -x509 -sha256 -nodes -days 365 -newkey rsa:4096 \
	-keyout /etc/nginx/ssl/chave.key \
	-out /etc/nginx/ssl/certificado.crt \
	-subj "/C=BR/ST=SP/L=Sao Paulo/O=42SP/OU=Student Project/CN=transcendence0.1"

COPY ./nginx/nginx.conf /etc/nginx/conf.d/nginx.conf

RUN mkdir -p /var/www/html
COPY ./static /var/www/html/static
COPY ./media /var/www/html/media
RUN chmod 755 /var/www/html
RUN chown -R www-data:www-data /var/www/html

CMD ["nginx", "-g", "daemon off;"]
