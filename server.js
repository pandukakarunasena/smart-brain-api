const express = require('express')
const bodyparser = require('body-parser')
const bcrypt = require('bcrypt-nodejs')
const cors = require('cors')
const knex = require('knex')
const signin = require('./controllers/signin')
const faceSearch = require('./controllers/clarify')

//make sure to validate the users 
//server should do its own validations other than a frontend validations
const db = knex({
    client: 'pg',
    connection: {
      host : process.env.DATABASE_URL || '127.0.0.1',  //local host (home)
      user : 'postgres',
      password : 'test',
      database : 'smartbrain'
    }
  });

  db.select('*').from('users').then(data => {
      console.log(data)
  })
  
//these are the endpoints that we want to have in the app
const app = express()
app.use(bodyparser.json())
app.use(cors())


app.get('/' ,(req,res) => {
   
    console.log('running')
})


app.post('/signin',(req,res) => {signin.handleSignIn(req,res,db,bcrypt)})
//like this the code can make organized by creating a file to 
//each endpoint and passing the req,res and dependencies to the app.request()
//every endpoint could have a seprate file so it becomes easy to read the code


app.post('/register', (req,res) => {
    const{email,name,password} = req.body
    const hash = bcrypt.hashSync(password)
        db.transaction(trx => {
            trx.insert({
                hash:hash,
                email:email
            })
            .into('login')
            .returning('email')
            .then(loginEmail => {
                return trx('users')
                    .returning('*')
                    .insert({
                        email:loginEmail[0],
                        name:name,
                        joined: new Date()
                    })
                    .then(user => {
                        res.json(user[0])
                        
                    })
                    .catch(err => res.status(400).json(err))

            })
            .then(trx.commit)     
            .catch(err => {
                console.log(err)
                trx.rollback
                res.status(400).json(err)
            })   

            })
    
            
    
})

//this is useful to update the profile or 
// if we want to have a profile page
app.get('/profile/:id',(req,res) => {
    const {id} = req.params
   

    db.select('*').from('users').where({
        id:id
    })
    .then(user => {
        if(user.length){
            res.json(user)
        }else{
            res.status(400).json('Not found')
        }  
    })
    .catch(err => res.status(400).json('error getting users'))

    
})



app.put('/image', (req,res) => {
    const {id} = req.body
    
    db('users').where('id','=',id)
    .increment('entries',1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0])
    })
    .catch(err => res.status(400).json('unable to get entries'))
    
})

app.post('/image', (req,res) => {faceSearch.faceDetection(req, res)})



app.listen(process.env.PORT||3005, () => {
    console.log('server is on')
})

/*
/--> res = this is working
/signin --> POST = success/fail
/register  --> POST = user
/profile/:userId --> GET = user
/image -- PUT --> user

*/ 



//bcrypt hash and compare to make password hard to hack



