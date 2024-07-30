import { Message, Tool, ToolCall } from "ollama";
import { HomeStateMachine, Lamp } from "../HSM/HomeStateMachine";
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

/**
 * Retrieves a specific todo item from the JSONPlaceholder API and returns it as a strongly typed object.
 *
 * @returns {Promise<{userId: number, id: number, title: string, completed: boolean}>} The todo item with its properties strongly typed.
 * @throws {Error} If the fetch request fails or the response is not in the expected format.
 */
async function get_todo(): Promise<{ userId: number, id: number, title: string, completed: boolean }> {
    const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
    if (!response.ok) {
        throw new Error(`Failed to fetch todo item: ${response.status}`);
    }
    const todo: { userId: number, id: number, title: string, completed: boolean } = await response.json();
    return todo;
}


/**
 * Adds a lamp to the HomeStateMachine with the given name.
 *
 * @param {Object} lamp - An object containing the name of the lamp to add.
 * @param {string} lamp.name - The name of the lamp to add.
 * @returns {Promise<void>} - A Promise that resolves when the lamp is successfully added to the HomeStateMachine.
 */
async function add_lamp({ name }: { name: string }): Promise<void> {
    homeState.addLamp(name);
}


/**
 * Retrieves the current state of the HomeStateMachine and returns it as a JSON string.
 *
 * @returns {Promise<string>} A Promise that resolves with a JSON string representing the current state of the HomeStateMachine.
 */
async function get_home_state(): Promise<string> {
    const homeStateData: Lamp[] = homeState.getData();
    return JSON.stringify(homeStateData);
}


/**
 * Toggles the lamp with the given name in the HomeStateMachine.
 *
 * @param {Object} options - An object containing the state and name of the lamp to toggle.
 * @param {('on' | 'off' | 'blink')} options.state - The state to toggle the lamp to.
 * @param {string} [options.name='lamp'] - The name of the lamp to toggle.
 * @returns {Promise<string>} A Promise that resolves with the string 'Success' when the lamp is successfully toggled.
 * @throws {Error} If the state is invalid or if the HomeStateMachine is not initialized.
 * @throws {Error} If the request to the lamp fails.
 */
async function toggle_lamp({ state, name = 'lamp' }: { state: 'on' | 'off' | 'blink', name?: string }): Promise<string> {
    if (!state || !['on', 'off', 'blink'].includes(state)) {
        throw new Error('Invalid state');
    }

    try {
        if (!homeState) {
            throw new Error('HomeStateMachine not initialized');
        }

        const response = await fetch(`http://192.168.0.29/${state === 'on' ? 'on' : 'off'}`);

        if (!response.ok) {
            throw new Error('Request failed');
        }

        homeState.setLamp(name, state === 'on');

        return 'Success';
    } catch (error) {
        console.error(error);

        throw new Error('An error occurred');
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


/**
 * Handles multiple tool calls and adds the results as messages to the given messages array.
 *
 * @param {ToolCall[]} tools - An array of tool calls to handle.
 * @param {Message[]} messages - An array of messages to add the results to.
 * @return {Promise<void>} A promise that resolves when all tool calls have been handled.
 * @throws {Error} If a tool call references an invalid function or if the tool call fails.
 */
async function HandleToolCalls(tools: ToolCall[], messages: Message[]): Promise<void> {
    await Promise.all(tools.map(async (tool: ToolCall): Promise<void> => {
        if (!tool.function || !tool.function.name) {
            throw new Error('Invalid tool call');
        }

        const ftc = AvailableTools[tool.function.name];

        if (!ftc) {
            throw new Error('Invalid function');
        }

        const args: any = tool.function.arguments || {};

        try {
            const outcome: string = await ftc(args);
            messages.push({ role: 'tool', content: outcome });
        } catch (error) {
            console.error(error);
            throw new Error('Tool call failed');
        }
    }));
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

