# mcc-api

## Deploy

### Heroku

- [Deploy to Heroku](https://devcenter.heroku.com/articles/container-registry-and-runtime#building-and-pushing-image-s):

  - Login to Heroku container (required on initial deployment to verify credentials)
    `$ heroku container:login`
  - Build and push web containers
    `$ heroku container:push web`
  - Release app
    `$ heroku container:release web`

## Development

You will need to have Docker and Docker Compose installed and running.

```sh
$ git clone https://github.com/moontography/mcc-api
$ cd mcc-api
$ npm install

# run tests
$ npm test

# start development server
$ docker-compose up
```

## License

MIT
