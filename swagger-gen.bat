@echo off

rd /s "./api"
call snc -t ./api-template -o ./api/gen ./swagger-api/openapi.yaml
xcopy .\api-template\src\api\routes\*s.js .\api\gen\src\api\routes\ /c /d /i /y
xcopy .\api-template\src\api\services\*s.js .\api\gen\src\api\services\ /c /d /i /y

del /q .\api-template\src\api\services\*s.js
del /q .\api-template\src\api\routes\*s.js

pause