# Media Tracker Backend

Запуск сервера: npm start

http://localhost:3000/movies/ - можно чекнуть тестовый запрос к руту

https://media-tracker-backend.onrender.com/movies/ - доступно из сети. При деплое в мастер обновляется
https://recommendation-system-jm7m.onrender.comrecommend/simple - простые рекомендации. Обновляется при деплое в feature/python/simple_recommender

Описание новых методов бека производится в формате Swagger OpenApi в файле: swagger-api/openapi.yaml. Это не сильно сложно.
Так будет быстрее, потому что по этим файлам будет генерироваться код рутов и сервисов для express.
Кроме того потом по этому сваггеру можно будет сгенерировать клиентский код для Vue.js с использованием Axios:
https://github.com/chenweiqun/swagger-vue

**Перед локальным запуском проекта нужно сгенерировать файлы рутов.**

Чтобы сгенерировать файлы рутов через Swagger, необходимо: 
1. Установить swagger-codegen: npm install -g swagger-node-codegen
2. Затем запустить батник swagger-gen.bat
3. Далее в папке api/gen появятся руты и сервисы, которые можно подключать.
Подключаются только routes, в index.js уже есть пример. Сервисы нужно копировать в папку src/api/services/ и заинжектить в рут в файле index.js.
Затем можно реализовать бизнес логику в методах сервиса.

Правила описания Swagger:
- Все сущности рассматривать в виде коллекций и соответственно называть api соответствующе.
- **В конце пути обязательно ставить букву s, например: /movieS (генерация в библиотеке кривая, пришлось изворачиваться, сейчас без s может сломаться)**
- Желательно придерживаться правил REST: https://tproger.ru/translations/luchshie-praktiki-razrabotki-rest-api-20-sovetov?ysclid=lq4bx1yp9b912458411
