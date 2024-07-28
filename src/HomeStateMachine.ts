export type Lamp = {
    name: string
    state: boolean
}

export class HomeStateMachine {
    lamps:Lamp[] = []
    constructor() {
        this.lamps.push({
            name: 'Lamp',
            state:false
        })
    }
    addLamp(name:string){
        this.lamps.push({name: name, state: false})
    }
    setLamp(name:string, state:boolean) {
        const l = this.lamps.find(lamp => lamp.name === name)
        if(l){
            l.state = state
        }else{
            console.log(`Lamp ${name} not found`)
        }
    }
    getData(){
        return this.lamps
    }
}