import { Sequelize, DataTypes } from 'sequelize'
import express from 'express'

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './db.sqlite',
  logging: false,
})

const Submission = sequelize.define(
  'Submission',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    path: {
      type: DataTypes.STRING(1024),
      allowNull: false,
    },
    entityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    revisionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(8),
      allowNull: false,
    },
    result: {
      type: DataTypes.STRING(8),
      allowNull: false,
    },
    sessionId: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  { timestamps: false }
)

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// Allow CORS
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS')
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Content-Length, X-Requested-With'
  )

  //intercepts OPTIONS method
  if ('OPTIONS' === req.method) {
    //respond with 200
    res.sendStatus(200)
  } else {
    //move on
    next()
  }
})

app.post('/submit', async (req, res) => {
  try {
    const { path, entityId, revisionId, type, result, sessionId } = req.body

    if (
      typeof path == 'string' &&
      typeof entityId == 'number' &&
      typeof revisionId == 'number' &&
      ['sc', 'mc', 'input', 'h5p'].includes(type) &&
      ['correct', 'wrong'].includes(result) &&
      typeof sessionId == 'string'
    ) {
      if (path.length < 1024 && sessionId.length < 64) {
        if (
          Math.floor(entityId) === entityId &&
          Math.floor(revisionId) === revisionId &&
          entityId > 0 &&
          revisionId > 0
        ) {
          // ready to go
          await Submission.create({
            path,
            entityId,
            revisionId,
            type,
            result,
            sessionId,
          })
          res.send('ok')
          return
        }
      }
    }
  } catch (e) {
    console.log(e)
  }
  res.send('bad')
})

const exportTemplate = `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <title>Datenexport gelöste Aufgaben</title>
  </head>
  <body>
    <form method="post">
      <label>Passwort: <input type="password" name="password"/></label>
      <input type="submit">
    </form>
  </body>
</html>`

app.get('/export', (req, res) => {
  res.send(exportTemplate)
})

app.post('/export', async (req, res) => {
  try {
    if (req.body.password === 'yolobird' /* TODO: store in secrets file */) {
      const data = await Submission.findAll({ raw: true })
      res.json(data)
      return
    }
    res.send('wrong pw')
  } catch (e) {
    res.send('bad')
  }
})

async function start() {
  await sequelize.authenticate()
  await sequelize.sync()
  app.listen(3030, () => {
    console.log('server started on port 3030')
  })
}

start()
