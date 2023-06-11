require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()
app.use(cors())
app.use(express.static('build'))
app.use(express.json())
morgan.token('req-body', req => { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body'))

app.get('/api/persons', (req, res, next) => {
  Person.find({}).then(ps => {
    res.json(ps)
  }).catch(error => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id).then(p => {
    res.json(p)
  }).catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body
  const person = {
    name: body.name,
    number: body.number,
  }
  Person.findByIdAndUpdate(req.params.id, person, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      res.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const person = new Person(req.body)
  person.save()
    .then(rp => res.json(rp))
    .catch(error => next(error))
})

app.get('/info', (req, res, next) => {
  const date = new Date()
  Person.find({}).then(ps => {
    res.send(`
      <p>Phonebook has info for ${ps.length} people</p>
      <p>${date}</p>
    `)
  }).catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)
