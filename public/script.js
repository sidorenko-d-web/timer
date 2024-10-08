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
let bestDisplay = document.querySelector('.bestDisplay')

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
let openSessionPopup = document.querySelector('.session')
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
let popupContent2 = document.querySelector('#two')
let wrapperSettings = document.querySelector('.wrapperSettings')
let wrapperSettings1 = document.querySelector('.wrapperSettings1')
let settings = document.querySelector('.settings')
let twodots = document.querySelector('.twodots')

let timeOfBegining

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
    if(window.innerWidth >= 768){
        if(event.code == "Space"){
            
        keyupFunc()
        }
    }
    else {
        if (event.targetTouches.length == 0){
            
        keyupFunc()
        }
    }
}

let keydown = (event)=>{
    if(window.innerWidth >= 768){
        if(event.code == "Space"){
            keydownFunc()
        }
    }
    else {
        if (event.targetTouches.length == 1){
            keydownFunc()
        }
    }
}

let keyupFunc = async () => {
    
        clearInterval(Interval)
        if(counter == true){
            if(!showTimeCheck.checked){
                censoredBlock.style.display = 'block'
            }
            ms = 0
            sec = 0
            min = 0
            clearDisplay()
            twodots.style.display = 'none'
            minpanel.style.display = 'none'
            timeOfBegining = new Date().getTime()
            Interval = setInterval(startTime,10)
            display.style.color='white'
            counter = false  
        }else{
            counter = true
            scrDisplay.innerHTML = await newScramble()
        }
    
}

let keydownFunc = () => {
    
    if(counter == true){
        display.style.color='green'
        scrDisplay.style.color="black"
    }else{
        censoredBlock.style.display = 'none'
        clearInterval(Interval)  
        if(minpanel.innerHTML!= 0){
            if(secpanel.innerHTML<=9){
                showRes(minpanel.innerHTML+':'+secpanel.innerHTML+'.'+mspanel.innerHTML,scrDisplay.innerHTML)
            }else{
                showRes(minpanel.innerHTML+':'+secpanel.innerHTML.slice(0,1)+'.'+mspanel.innerHTML,scrDisplay.innerHTML)
            }
            showRes(minpanel.innerHTML+':'+secpanel.innerHTML+'.'+mspanel.innerHTML,scrDisplay.innerHTML)
            
        }
        else{
            if(secpanel.innerHTML<=9){
                showRes(secpanel.innerHTML.slice(1,2)+'.'+mspanel.innerHTML,scrDisplay.innerHTML)
            }else{
                showRes(secpanel.innerHTML+'.'+mspanel.innerHTML,scrDisplay.innerHTML)
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

    let a = new Date().getTime() - timeOfBegining
    let b = convertTime(a)

    mspanel.innerHTML = b.slice(6, 8)
    secpanel.innerHTML = b.slice(3, 5)
    minpanel.innerHTML = b.slice(0, 2)
    if(b.slice(0, 2) != '00'){
        minpanel.style.display = 'block'
        twodots.style.display = 'block'
        minpanel.innerHTML = b.slice(0, 2)
    }else{

        minpanel.style.display = 'none'
        twodots.style.display = 'none'
    }

}

let convertTime = (time) => {
    
    return new Date(time).toISOString().slice(14, 22);

}
//работа таблицы результатов

let showRes = (res,scr)=>{
    socket.emit('getResList',{solve:res, scramble:scr})

}
    socket.on('showRes', (data)=>{
        updateResPanel(data)
    })

    let updateResPanel = (data)=>{
        if(!data.solves){
            prevRes.innerHTML = ''
            bestDisplay.innerHTML = ''
            avg5Display.innerHTML = ''
            avg12Display.innerHTML = ''
            avg100Display.innerHTML = ''
            return
        }

        let resStr=''
        if(data.solves.length>=5) avg5Display.innerHTML = countAvg(data.solves,5)
        if(data.solves.length>=12) avg12Display.innerHTML = countAvg(data.solves,12)
        if(data.solves.length>=100)avg100Display.innerHTML = countAvg(data.solves,100)

        
        if(data.solves.length>=5) avg5DisplayMobile.innerHTML = countAvg(data.solves,5)
        if(data.solves.length>=12) avg12DisplayMobile.innerHTML = countAvg(data.solves,12)
        if(data.solves.length>=100)avg100DisplayMobile.innerHTML = countAvg(data.solves,100)
        
        let arrForBest = data.solves.filter(elem => elem.solve[0]!='D')
        if(arrForBest>[]){
            let a = arrForBest[0].solve.split('.')
            if(a[0][0]=='+'){
                if(a.length==2){
                    a[0]=Number(a[0].slice(1))+2
                }else{
                    a[1]=Number(a)[1].slice(1)+2
                }
            }
            let best = new Date(0,0,0,0,0,Number(a[0]),Number(a[1]))

            for(let i = 1;i<arrForBest.length;i++){
                
                let next = arrForBest[i].solve.split('.')

                if(next[0][0]=='+'){
                    if(next.length==2){
                        next[0]=Number(next[0].slice(1))+2
                    }
                }
                
                let a1 = new Date(0,0,0,0,0,Number(next[0]),Number(next[1]))
                if(a1<best){
                    best = a1
                }
            }

            let min = best.getMinutes()
            let sec = best.getSeconds()
            let ms = best.getMilliseconds()

            if(ms<10){ms=`0${ms}`}
            if(min!=0){bestDisplay.innerHTML = `${min}:${sec}.${ms}`}
            else{bestDisplay.innerHTML = `${sec}.${ms}`}
        }else{
            bestDisplay.innerHTML=''
        }
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
    socket.emit('deleteCurrentSession')
})
 
popup.addEventListener('click',() => {
    popup.style.display = 'none'
})
sessionPopup.addEventListener('click',() => {
    if(window.innerWidth >= 768){
         sessionPopup.style.display = 'none'
    }else{
        popupContent2.style.transform = 'translateX(-100%)'
        setTimeout(()=>{
            sessionPopup.style.display = 'none'
        },500)
    }

    
})

wrapperSettings.addEventListener('click', ()=>{
    settings.style.transform = 'translateX(100%)'
    setTimeout(()=>{
        wrapperSettings.style.display = 'none'
        wrapperSettings1.style.display = 'none'
    },500)
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

openSessionPopup.addEventListener('click',() => {
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
    setTimeout(()=>{
        popupContent2.style.transform = 'translateX(0%)'
    },1)
    
})
mobileSettings.addEventListener('click', () => {
    wrapperSettings1.style.display = 'block'
    wrapperSettings.style.display = 'block'
    setTimeout(()=>{
        settings.style.transform = 'translateX(0%)'
    },1)
})

showTimeCheck.addEventListener('change', ()=>{
    socket.emit('showTimeCheckReq', showTimeCheck.checked)
})
socket.on('showTimeCheckRes',(bolean)=>{
    showTimeCheck.checked = bolean
})
socket.on('reloadPage', () =>{
    location.reload()
})


