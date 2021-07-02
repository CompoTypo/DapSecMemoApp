from node:lts as node

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm cache clean --force
RUN npm install
RUN npm audit fix
COPY . .

RUN npm run build

from nginx:alpine
COPY --from=node /usr/src/app/dist/web/* /usr/share/nginx/html/

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
