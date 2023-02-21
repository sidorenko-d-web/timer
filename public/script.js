import { randomScrambleForEvent } from "https://cdn.cubing.net/js/cubing/scramble";

let min = 0
let sec = 0
let ms = 0

const socket = io()

let minpanel = document.querySelector('.min')
let secpanel = document.querySelector('.sec')
let mspanel = document.querySelector('.ms')
let display = document.querySelector('.time')
let scrDisplay = document.querySelector('.scrString')
let avgDisplay = document.querySelector('.avgContain')
let Interval
let counter = true

let prevRes = document.querySelector('.prevRes')
let results = []
let scrambles =[]

let avg5Display = document.querySelector('.avg5Display')
let avg12Display = document.querySelector('.avg12Display')
let avg100Display = document.querySelector('.avg100Display')

let avg5DisplayMobile = document.querySelector('.avg5DisplayMobile')
let avg12DisplayMobile = document.querySelector('.avg12DisplayMobile')
let avg100DisplayMobile = document.querySelector('.avg100DisplayMobile')

let popup = document.querySelector('.popup')
let sessionPopup = document.querySelector('.sessionPopup')

let deleteAllBtn = document.querySelector('.deleteAll')
let deleteAllSessionsBtn = document.querySelector('.deleteAllSessions')
let plus2Btn = document.querySelector('.plus2')
let deleteSolveBtn = document.querySelector('.deleteSolve')
let dnfBtn = document.querySelector('.dnf')

let currentPuzzle = document.querySelector('.currentSession')
let scramblePicElem = document.querySelector('scramble-display')
let mobileScramblePicElem = document.querySelector('.mobileScrDisp')

let sessionBtns = document.querySelectorAll('.puzzleBtn')
let loginBtn = document.querySelector('.submit')

let showTimeCheck = document.querySelector('.checkboxShowTime')
let censoredBlock = document.querySelector('.censored')

let midPanel = document.querySelector('.btnForStart')

let mobileSession = document.querySelector('.mobileSession')
let mobileStatistic = document.querySelector('.mobileStatistic')
let mobileSettings = document.querySelector('.mobileSettings')

let popupContent = document.querySelector('.popupContent')
let wrapperSettings = document.querySelector('.wrapperSettings')
let wrapperSettings1 = document.querySelector('.wrapperSettings1')
let settings = document.querySelector('.settings')


document.getElementsByTagName("body")[0].style.height =( window.innerHeight-20)+'px'





var SPACE_KEYCODE=32;
document.onkeydown=function(e){
    var keycode=e.keyCode||e.charCode,
        body=document.body;
 
    if(keycode!=SPACE_KEYCODE)
        return;
     
    e.preventDefault();
}


//работа основного дисплея

let keyup = async (event)=>{
    if(event.code == "Space"||event.targetTouches.length == 0){
        clearInterval(Interval)
        if(counter == true){
            if(!showTimeCheck.checked){
                censoredBlock.style.display = 'block'
            }
            ms = 0
            sec = 0
            min = 0
            clearDisplay()
            Interval = setInterval(startTime,10)
            display.style.color='white'
            counter = false  
        }else{
            counter = true
            scrDisplay.innerHTML = await newScramble()
        }
    }
    
}

let keydown = (event)=>{
    if(event.code == "Space"||event.targetTouches.length == 1){
        if(counter == true){
            display.style.color='green'
            scrDisplay.style.color="black"
        }else{
            censoredBlock.style.display = 'none'
            clearInterval(Interval)  
            if(min!= 0){
                if(sec<=9&&min>0)sec='0'+sec
                if(ms<=9)ms='0'+ms
                showRes(min+':'+sec+'.'+ms,scrDisplay.innerHTML)
                
            }
            else{
                if(ms<=9)ms='0'+ms
                showRes(sec+'.'+ms,scrDisplay.innerHTML)
            }
            
        }
    }
}

document.addEventListener('keyup', keyup)
document.addEventListener('keydown', keydown)
midPanel.addEventListener('touchend', keyup)
midPanel.addEventListener('touchstart', keydown)

let clearDisplay = ()=>{
    mspanel.innerHTML = '00'
    secpanel.innerHTML = '00'
    minpanel.innerHTML = '00'
}

let startTime = ()=>{
    ms++
    if(ms<=99){
        if(ms<=9) mspanel.innerHTML = `${ms}0`
        else mspanel.innerHTML = ms
        
    }else if(ms == 100){
        ms = 0
        sec++
        mspanel.innerHTML = ms
        if(sec<=9) secpanel.innerHTML = `0${sec}`
        else secpanel.innerHTML = sec
    }
    if(sec == 60){
        sec = 0
        min++
        (min<=9)? minpanel.innerHTML = `0${min}`:minpanel.innerHTML = min
        secpanel.innerHTML = `0${sec}`
        mspanel.innerHTML = ms
    } 
}
//работа таблицы результатов

let showRes = (res,scr)=>{
    socket.emit('getResList',{solve:res, scramble:scr})

}
    socket.on('showRes', (data)=>{
        updateResPanel(data)
    })

    let updateResPanel = (data)=>{

        let resStr=''
        if(data.solves.length>=5) avg5Display.innerHTML = countAvg(data.solves,5)
        if(data.solves.length>=12) avg12Display.innerHTML = countAvg(data.solves,12)
        if(data.solves.length>=100)avg100Display.innerHTML = countAvg(data.solves,100)

        
        if(data.solves.length>=5) avg5DisplayMobile.innerHTML = countAvg(data.solves,5)
        if(data.solves.length>=12) avg12DisplayMobile.innerHTML = countAvg(data.solves,12)
        if(data.solves.length>=100)avg100DisplayMobile.innerHTML = countAvg(data.solves,100)

        for(let i = 0;i<data.solves.length;i++){
            resStr = resStr+('<span class="solve" id ="'+i+'">' + data.solves[i].solve+'</span><div class="stroke"></div>')
        }
        prevRes.innerHTML = resStr
        let solvesArray = document.querySelectorAll('.solve')
        solvesArray.forEach(elem => {
            elem.addEventListener('click',() => {    
                popup.style.display = 'block'
                socket.emit('getDataForPopup', elem.id)
                socket.on('dataForPopup',(data)=>{
                    document.querySelector('.thisTime').innerHTML = data.solve
                    document.querySelector('.thisTime').id = elem.id
                    document.querySelector('.thisScramble').innerHTML = data.scramble
                
                })
            })
        });
}

socket.on('getData',(data)=>{
    updateResPanel(data)
})

//скрамбл


let newScramble = async ()=>{
    const scramble = await randomScrambleForEvent(currentPuzzle.innerHTML);
    scramblePicElem.scramble = scramble.toString()
    scramblePicElem.event = currentPuzzle.innerHTML
    mobileScramblePicElem.scramble = scramble.toString()
    mobileScramblePicElem.event = currentPuzzle.innerHTML

    return scramble.toString()
}
let updateScr = async ()=>{  
    scrDisplay.innerHTML = await newScramble()
}
updateScr()

let countAvg = (solves,num)=>{
    let lastSolves1 = []
    let lastSolves = []
    for(let i = 0; i<num;i++){
        lastSolves1.push(solves[i].solve)
    }
    for(let elem of lastSolves1){
        if (elem[0]=='+'){
            let a = elem.slice(1)
            lastSolves.push(Number(a) + 2)

        }else{
            lastSolves.push(elem)
        }
    }
    let best = lastSolves[0]
    let worst = lastSolves[0]
    for(let elem of lastSolves){
        if(best>elem){
            best = elem
        }
        if(worst<elem || elem[0] == "D"){
            worst = elem
        }
    }
    lastSolves.splice(lastSolves.indexOf(best),1)
    lastSolves.splice(lastSolves.indexOf(worst),1)
    let sum = 0

    let check = true
    for(let elem of lastSolves){
        if(elem[0]=='D')check=false
    }
    
    for(let elem of lastSolves){
        sum+=Number(elem) 
    }
    if(!check)return('DNF')
    return (sum/lastSolves.length).toFixed(2)
}

deleteAllBtn.addEventListener('click',() => {
    socket.emit('deleteAll')
    prevRes.innerHTML = ''
    avg5Display.innerHTML = ''
    avg12Display.innerHTML = ''
    avg100Display.innerHTML = ''
})
 
popup.addEventListener('click',() => {
    popup.style.display = 'none'
})
sessionPopup.addEventListener('click',() => {
    sessionPopup.style.display = 'none'
})

wrapperSettings.addEventListener('click', ()=>{
    console.log('clos')
    wrapperSettings.style.display = 'none'
    wrapperSettings1.style.display = 'none'
})




deleteSolveBtn.addEventListener('click',() => {
    let elemForDelete = document.querySelector('.thisTime')
    socket.emit('deleteSolveReq',elemForDelete.id)
})
socket.on('deleteSolveRes',(data)=>{
    updateResPanel(data)
})

plus2Btn.addEventListener('click',() => {
    let elemForChange = document.querySelector('.thisTime')
    if(elemForChange.innerHTML[0] == 'D') return
    socket.emit('plus2', elemForChange.id)
})

dnfBtn.addEventListener('click',() => {
    let elemForChange = document.querySelector('.thisTime')
    socket.emit('dnf', elemForChange.id)
})

currentPuzzle.addEventListener('click',() => {
    sessionPopup.style.display = 'block'
})

sessionBtns.forEach(elem => {
    elem.addEventListener('click',() => {
        currentPuzzle.innerHTML = elem.innerHTML
        socket.emit('changePuzzle', currentPuzzle.innerHTML)
    })
});


if(loginBtn){
    loginBtn.addEventListener('click', ()=>{
        setTimeout(()=>{
            let password = document.querySelector('#password')
            password.style.border = '5px solid red'
            password.style.height =  '15px'
            password.style.width =  '100px'
        },1000)
    })
}

mobileSession.addEventListener('click', ()=>{
    sessionPopup.style.display = 'block'
})
mobileSettings.addEventListener('click', () => {
    console.log('block')
    wrapperSettings1.style.display = 'block'
    wrapperSettings.style.display = 'block'
})
