let express = require('express')
let fs = require('fs')
let app = express()
let bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient
let urlencodedParser = bodyParser.urlencoded({ extended: false })
const http = require('http')
const port = process.env.PORT || 8080;
const server = http.Server(app).listen(port)
console.log(port)
const io = require('socket.io')(server)
const url = 'mongodb+srv://BigBanka:505mongo@cluster0.bs3kxm4.mongodb.net/results?retryWrites=true&w=majority'
const mongoClient = new MongoClient(url, {useNewUrlParser: true, useUnifiedTopology:true})
const cookie = require('cookie')
const cookieParser = require('cookie-parser')
const { connection } = require('mongoose')

let currentPuzzle = '333'
let currentUser = null  
let showTimeCheckStatus = true
let currentBest = ''


mongoClient.connect(function(err, client){

    if(err){
        return console.log(err)
    }

    
        console.log('Success')


    const db = client.db('results')
    const collectionSolves = db.collection('solves')
    const collectionUsers = db.collection('users')

    app.use(cookieParser('secret'))

    

    io.on('connection', (socket)=>{
        let solves = []
        if(socket.handshake.headers.cookie){
                
            currentUserCookie = cookie.parse(socket.handshake.headers.cookie); 

            
            collectionSolves.findOne({name:currentUserCookie.currentUser, puzzle:currentPuzzle}, (err,doc)=>{
                if(doc){
                    socket.emit('getData',{ solves:doc.solves})
                    socket.emit('newBest',{best:doc.best})
                    
                }
            })

        }
        if(currentUser){
            
            socket.on('getResList',(data)=>{
                collectionSolves.findOne({name:currentUser, puzzle:currentPuzzle}, function(err,doc){
                    if(doc){
                        currentBest = doc.best
                        if(Number(doc.best)>Number(data.solve)){
                            collectionSolves.updateOne({name:currentUser, puzzle:currentPuzzle},{$set:{best:data.solve}})
                            socket.emit('newBest',{best:data.solve})
                        }
                        solves = []
                        for(let i = doc.solves.length; i > 0; i--){
                            solves.unshift(doc.solves[i-1])
                        }
                        solves.unshift({solve:data.solve, scramble:data.scramble})
                        collectionSolves.updateOne({name:currentUser, puzzle:currentPuzzle},{$set:{solves:solves}})
                        socket.emit('showRes',{solves:solves,})
                        
                    }
                    else if(!doc){
                        console.log('first result')

                        solves.unshift({solve:data.solve,scramble:data.scramble})

                        collectionSolves.insertOne({name:currentUser, puzzle:currentPuzzle, solves:solves, best:data.solve})
                        socket.emit('showRes',{solves:solves})
                    }
                })
            })

            collectionUsers.findOne({login:currentUser},(err, doc)=>{
                socket.emit('showTimeCheckRes', doc.showTimeCheckStatus)
            })
        }


        socket.on('deleteCurrentSession', ()=>{
            collectionSolves.deleteOne({name:currentUser, puzzle:currentPuzzle}, (err, doc)=>{
                console.log("current session has been deleted")
            })
        })
        socket.on('getDataForPopup',(data)=>{
            collectionSolves.findOne({name:currentUser, puzzle:currentPuzzle}, (err, doc)=>{
                if(err)console.log(err)
                let dataForPopup = doc.solves[data]
                socket.emit('dataForPopup', {solve:dataForPopup.solve,scramble:dataForPopup.scramble})
            })
        })
        socket.on('deleteSolveReq', (data)=>{
            collectionSolves.findOne({name:currentUser, puzzle:currentPuzzle},(err, doc)=>{
                let allSolves = doc.solves 
                allSolves.splice(data,1)
                collectionSolves.updateOne({name:currentUser, puzzle:currentPuzzle},{$set:{solves:allSolves}})
                socket.emit('getData', {solves:allSolves})
            })
        })
        socket.on('plus2',(data)=>{
            collectionSolves.findOne({name:currentUser, puzzle:currentPuzzle},(err, doc)=>{
                let allSolves = doc.solves
                if(allSolves[data].solve[0]!='+'){
                    allSolves[data].solve = '+' + allSolves[data].solve
                    collectionSolves.updateOne({name:currentUser, puzzle:currentPuzzle},{$set:{solves:allSolves}})
                    socket.emit('getData', {solves:allSolves})
                }else{
                    allSolves[data].solve = allSolves[data].solve.slice(1)
                    collectionSolves.updateOne({name:currentUser, puzzle:currentPuzzle},{$set:{solves:allSolves}})
                    socket.emit('getData', {solves:allSolves})
                }
            })
        })
        socket.on('dnf',(data)=>{
            collectionSolves.findOne({name:currentUser, puzzle:currentPuzzle},(err, doc)=>{
                let allSolves = doc.solves
                if(allSolves[data].solve[0]!='D'){
                    allSolves[data].solve = 'DNF<br>('+allSolves[data].solve+')'
                    collectionSolves.updateOne({name:currentUser, puzzle:currentPuzzle},{$set:{solves:allSolves}})
                    socket.emit('getData', {solves:allSolves})
                }else{
                    allSolves[data].solve = allSolves[data].solve.slice(8)
                    allSolves[data].solve = allSolves[data].solve.substring(0, allSolves[data].solve.length-1)
                    collectionSolves.updateOne({name:currentUser, puzzle:currentPuzzle},{$set:{solves:allSolves}})
                    socket.emit('getData', {solves:allSolves})
                }
            })
        })
        socket.on('changePuzzle', (puzzle) => {
            currentPuzzle = puzzle
        })

        socket.on('showTimeCheckReq', (bolean)=>{
            collectionUsers.findOne({login: currentUser},(err,doc)=>{
                if(doc){
                collectionUsers.updateOne({login: currentUser},{$set:{showTimeCheckStatus:bolean}})
                }
            })
        })
    })



  

    app.use(express.static(__dirname + '/public'));

    app.set('view engine', 'ejs');
    


    app.get('/', (req, res, err)=>{
        
        if(!req.cookies){
            console.log('Please, log in')
        }
        else{
            currentUser = req.cookies.currentUser
        }
        res.render('timer',{currentPuzzle:currentPuzzle,
                            currentUser:req.cookies.currentUser,})
        
        
    })

    app.post('/login', urlencodedParser, (req, res)=>{
        collectionUsers.findOne({login:req.body.login},(err, doc)=>{
            if(doc){
                if(req.body.password == doc.password){
                    console.log('ure logged now')
                    res.cookie('currentUser',req.body.login)
                    currentUser = req.body.login
                    res.redirect('/')
                }
            }
            else{
                collectionUsers.insertOne({
                                            login:req.body.login,
                                            password:req.body.password,
                                            showTimeCheckStatus:true})
                console.log('new user is created')
                res.cookie('currentUser',req.body.login)
                currentUser = req.body.login
                res.redirect('/')
            }
        })
    })
    app.post('/puzzle',urlencodedParser, (req, res) => {
        console.log('currentPuzzle changed')
        res.redirect('/')
    })
    app.post('/logout', urlencodedParser, (req, res) => {
        console.log('logout')
        res.clearCookie('currentUser')
        res.redirect('/')
    })

     app.use(function(req, res, next) {
            res.status(404).send('404');
            console.log('err')
        });
})


