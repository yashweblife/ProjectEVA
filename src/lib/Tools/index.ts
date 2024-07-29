import { Message, Tool, ToolCall } from "ollama";
import { HomeStateMachine } from "../HSM/HomeStateMachine";
const homeState = new HomeStateMachine()
/**
 * Returns the current time as a string.
 *
 * @returns {Promise<string>} The current time as a string.
 */
async function get_current_time(): Promise<string> {
    const currentTime: string = new Date().toLocaleTimeString();
    return currentTime;
}

/**
 * Returns the current date as a string.
 *
 * @returns {Promise<string>} The current date as a string.
 */
async function get_current_date(): Promise<string> {
    const date: string = new Date().toLocaleDateString();
    console.log(date);
    return date;
}

async function get_todo() {
    const output = await fetch('https://jsonplaceholder.typicode.com/todos/1')
    const test = await output.json()
    console.log(test)
    return (test)
}
async function add_lamp({name}:{name:string}) {
    homeState.addLamp(name)
}
async function get_home_state(){
    return(JSON.stringify(homeState.getData()))
}
async function toggle_lamp({ state, name = 'lamp' }: { state: 'on' | 'off' | 'blink', name?: string }) {
    if (!state || !['on', 'off', 'blink'].includes(state)) {
        throw new Error('Invalid state');
    }
    
    try {
        const response = await fetch(`http://192.168.0.29/${state === 'on' ? 'on' : 'off'}`);
        
        if (!response.ok) {
            throw new Error('Request failed');
        }
        
        homeState.setLamp(name, state === 'on');
        
        return 'Success';
    } catch (error) {
        console.error(error);
        
        return 'An error occurred';
    }
}

const AvailableTools: any = {
    get_current_time: get_current_time,
    get_current_date: get_current_date,
    get_todo: get_todo,
    add_lamp: add_lamp,
    toggle_lamp: toggle_lamp,
    get_home_state: get_home_state
}

async function HandleToolCalls(tools: ToolCall[], messages: Message[]) {
    for (let i = 0; i < tools.length; i++) {
        const tool = tools[i]
        const ftc = AvailableTools[tool.function.name]
        const args = tool.function.arguments
        ftc({ ...args }).then((outcome: any) => {
            messages.push({
                role: 'tool',
                content: outcome
            })
        })
    }
}

const ToolMetaData: Tool[] = [
    {
        type: 'function',
        function: {
            name: 'get_current_time',
            description: 'get the current time, use this if you cant access location and real time data',
            parameters: {
                type: 'none',
                properties: {},
                required: []
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'get_current_date',
            description: 'get the current date and not the time, use this if you cant access location and real time data',
            parameters: {
                type: 'none',
                properties: {},
                required: []
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'get_todo',
            description: 'get the related todo',
            parameters: {
                type: 'none',
                properties: {},
                required: []
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'add_lamp',
            description: 'add a lamp to the home',
            parameters: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        description: 'name of the lamp',
                        enum: ['lamp']
                    }
                },
                required: ['name']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'toggle_lamp',
            description: 'turn the lamp on,off,blink',
            parameters: {
                type: 'object',
                properties: {
                    state: {
                        type: 'string',
                        description: 'on, off, blink representing the state of the lamp',
                        enum: ['on', 'off', 'blink']
                    }
                },
                required: ['state']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'get_home_state',
            description: 'get the state of the home, used to check if the lamp is on or off',
            parameters: {
                type: 'none',
                properties: {},
                required: []
            }
        }
    }
]

export { add_lamp, AvailableTools, get_current_date, get_current_time, get_home_state, get_todo, HandleToolCalls, toggle_lamp, ToolMetaData };

