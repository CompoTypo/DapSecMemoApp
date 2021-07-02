install:
	cd api && npm i && cd ..
	cd web-front && npm i

build:
	cd web-front && ng build --prod

deploy:
	cd api && forever start ./api.ts && cd ..
