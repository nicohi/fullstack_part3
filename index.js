const express = require('express')
const morgan = require('morgan')
//import express from 'express'

const app = express()
app.use(express.json())
morgan.token('req-body', (req, res) => { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body'))

const getRandomInt = max => {
  return Math.floor(Math.random() * max);
}

const nextId = () => getRandomInt(100000000000000000)

var persons = [
    {
      "id": 1,
      "name": "Arto Hellas",
      "number": "040-123456"
    },
    {
      "id": 2,
      "name": "Ada Lovelace",
      "number": "39-44-5323523"
    },
    {
      "id": 3,
      "name": "Dan Abramov",
      "number": "12-43-234345"
    },
    {
      "id": 4,
      "name": "Mary Poppendieck",
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(p => p.id === id)
  if (!person) {
    return res.status(404).json({error:`Person with id:${id} not found`})
  }
  res.json(person)
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(p => p.id !== id)
  res.status(204).end()
})

app.post('/api/persons', (req, res) => {
  const person = { ...req.body, id: nextId() }
  if (!person.name)
    return res.status(400).json({error: `No name provided`})
  if (!person.number)
    return res.status(400).json({error: `No number provided`})
  if (persons.find(p => p.name === person.name))
    return res.status(400).json({error: `Person with name "${person.name}" already exists`})
  persons = persons.concat(person)
  res.json(person)
})

app.get('/info', (request, response) => {
  const date = new Date()
  response.send(`
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${date}</p>
    `)
})

const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)
