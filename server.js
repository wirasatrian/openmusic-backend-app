require('dotenv').config()

const Hapi = require('@hapi/hapi')

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*']
      }
    }
  })

  // await server.register({
  //   plugin: notes,
  //   options: {
  //     service: notesService,
  //     validator: NotesValidator,
  //   },
  // });

  await server.start()
  console.log(`Server berjalan pada ${server.info.uri}`)
}

init()
