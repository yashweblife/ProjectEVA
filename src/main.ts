import ollama, { ChatResponse } from 'ollama';
import { HandleToolCalls, ToolMetaData as tools } from './lib/Tools';
import './style.scss';
const model = 'llama3.1';
let messages = [	
	{
		role: 'system',
		content: `
        You are a helpful assistant.
        You can use tools to help you for things that need real time data.
        Your name is Eva,
        you use short and concise sentences to answer user queries.
        If you are given a task, you complete it with a single word response.
        If you don't know the answer, you respond with "I don't know" and a short description.
        You are mildly sarcastic and friendly.
        `
	},
];


const sendButton = document.querySelector('#send-button') as HTMLButtonElement
const userInput = document.querySelector('#user-input') as HTMLInputElement
const toast = document.querySelector('#toast') as HTMLDivElement

function createUserMessage() {
	const inp = document.querySelector('#user-input') as HTMLInputElement
	const text = inp.value
	const box = document.createElement('div')
	box.classList.add('card', 'user')
	const sender = document.createElement('div')
	sender.classList.add('sender')
	sender.innerHTML = 'User'
	const message = document.createElement('div')
	message.innerHTML = inp.value
	box.appendChild(sender)
	box.appendChild(message)
	inp.value = ''
	return { box, val: text }
}
function createAIMessage(msg: string) {
	const box = document.createElement('div')
	box.classList.add('card', 'ai')
	const sender = document.createElement('div')
	sender.classList.add('sender')
	sender.innerHTML = 'AI'
	const message = document.createElement('div')
	message.innerHTML = msg
	box.appendChild(sender)
	box.appendChild(message)
	return box
}

function handleSendMessage() {
	if (userInput.value == '' || userInput.value == ' ') return
	const { box, val } = createUserMessage()
	messages.push({
		role: 'user',
		content: val
	})
	const chat = document.querySelector('.chat') as HTMLDivElement
	chat.appendChild(box)
	APP();
}

userInput.addEventListener('keyup', (e) => {
	if(userInput.value =='' || userInput.value == ' ') return
	if (e.key === 'Enter') {
		handleSendMessage()
	}
})
sendButton.addEventListener('click', handleSendMessage)

function APP() {
	toast.classList.remove('dis-off')
	ollama.chat({
		model,
		messages,
		stream: false,
		tools: tools
	}).then((res: ChatResponse) => {
		if (res.message.tool_calls) {
			const tools = res.message.tool_calls
			HandleToolCalls(tools, messages)
		}
		ollama.chat({
			model,
			messages,
		}).then((res: ChatResponse) => {
			const chat = document.querySelector('.chat') as HTMLDivElement
			chat.appendChild(createAIMessage(res.message.content))
		})
		toast.classList.add('dis-off')
	})

}