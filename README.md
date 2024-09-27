## About
- Angular-18 UI for Todos App
- User login screen at - http://localhost:4200/auth/login
- User registration screen at - http://localhost:4200/auth/register
- TODO screen with Create, Update & Edit option - http://localhost:4200/todos 
    - all user can read the TODO
    - only authenticated user can do Create, Update & Edit operations
- Angular material
- Tailwind CSS

## Used version of System Requirements
- git version 2.39.3
- node 18.19.0
- npm 10.2.3
- Docker version 27.2.0
- Docker Compose version 2.24.0

All of these must be available in your `PATH`. To verify things are set up
properly, you can run this:

```shell
git -v
node -v
npm -v
docker -v
docker-compose -v
```

# SETUP ALL APPS(postgres, test-api & test-ui) using Docker
1. clone repo - `git clone https://github.com/vijayliebe/test-api.git`
2. clone repo - `git clone https://github.com/vijayliebe/test-ui.git`
3. enter into test-ui i.e. angular repo folder - `cd test-ui`
4. run docker-compose for angular, nestjs & postgres - `docker-compose up`
    - a. `docker stop $(docker ps -a -q)`
    - b. `docker rm $(docker ps -a -q)`
    - c. `docker rmi postgres test-api/nestjs:1.0 test-ui/angular:1.0`
    - d. Remove `pgdata` folder in `test-api` - `cd test-api && rm -rf pgdata`
5. Register a user by visiting - http://localhost:4200/auth/register
6. Login using registered user by visiting - http://localhost:4200/auth/login
7. View / Create / Edit / Delete todos by visiting - http://localhost:4200/todos 
8. API Swagger UI - http://localhost:3000/api

## Setup Angular App
### Using Docker
1. clone repo - `git clone https://github.com/vijayliebe/test-ui.git`
2. enter into repo - `cd test-ui`
3. run docker-compose for angular, nestjs & postgres - `docker-compose up` 

- Note :- 
    - a. Make sure `test-api` folder i.e. NestJS app is also present in parent folder
    - b. No need to use docker setup step mentioned in test-api repo

- If there is still any issue while setup, run this command and then above again -
    - a. `docker stop $(docker ps -a -q)`
    - b. `docker rm $(docker ps -a -q)`
    - c. `docker rmi postgres test-api/nestjs:1.0 test-ui/angular:1.0`    

4. Access angular app at port 4200 - http://localhost:4200

### Without Docker
1. clone repo - `git clone https://github.com/vijayliebe/test-ui.git`
2. enter into repo - `cd test-ui`
3. Install dependencies - `npm install -g @angular/cli && npm i`
4. start nestjs server - `npm start`
5. Access angular app at port 4200 - http://localhost:4200

## Running Tests
`npm run test`

## Dockerfile
- `Dockerfile` build image for angular i.e. test-ui app with nginx as web-server

## Docker-compose
- `docker-compose.yml` - It start all apps i.e. angular(test-ui), nestjs(test-api) and postgres

## Kubernetes deployment and service YAML
- Available in `K8s` folder
