import ollama, { ChatResponse, Message, ToolCall } from 'ollama';
import { HandleToolCalls, ToolMetaData as tools } from './lib/Tools';
import './style.scss';

const sendButton = document.querySelector('#send-button') as HTMLButtonElement
const userInput = document.querySelector('#user-input') as HTMLInputElement
const toast = document.querySelector('#toast') as HTMLDivElement

const MODEL = 'llama3.1';

let messages:Message[] = [	
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

/**
 * Creates a user message element and returns it along with the user input text.
 * 
 * @returns {Object} An object with properties 'box' (HTMLDivElement) and 'val' (string).
 */
function createUserMessage(): { box: HTMLDivElement, val: string } {
	const inp: HTMLInputElement = document.querySelector('#user-input') as HTMLInputElement;
	const text: string = inp.value;
	const box: HTMLDivElement = document.createElement('div');
	box.classList.add('card', 'user');
	const sender: HTMLDivElement = document.createElement('div');
	sender.classList.add('sender');
	sender.innerHTML = 'User';
	const message: HTMLDivElement = document.createElement('div');
	message.innerHTML = inp.value;
	box.appendChild(sender);
	box.appendChild(message);
	inp.value = '';
	return { box, val: text };
}
/**
 * Creates an AI message element with the given message text and returns it.
 * 
 * @param {string} msg - The message text to display in the AI message.
 * @returns {HTMLDivElement} - The created AI message element.
 */
function createAIMessage(msg: string): HTMLDivElement {
	const box: HTMLDivElement = document.createElement('div');
	box.classList.add('card', 'ai');
	const sender: HTMLDivElement = document.createElement('div');
	sender.classList.add('sender');
	sender.innerHTML = 'AI';
	const message: HTMLDivElement = document.createElement('div');
	message.innerHTML = msg;
	box.appendChild(sender);
	box.appendChild(message);
	return box;
}

/**
 * Handles the send message event.
 * 
 * @returns {Promise<void>} Promise that resolves when the function completes.
 */
async function handleSendMessage(): Promise<void> {
	if (userInput.value === '' || userInput.value === ' ') return;
	const { box, val }: { box: HTMLDivElement, val: string } = createUserMessage();
	messages.push({
		role: 'user',
		content: val
	});
	const chat: HTMLDivElement = document.querySelector('.chat') as HTMLDivElement;
	chat.appendChild(box);
	await APP();
}

/**
 * Main application function that handles user input and interaction with the chat model.
 * 
 * @returns {Promise<void>} Promise that resolves when the function completes.
 */
async function APP(): Promise<void> {
	toast.classList.remove('dis-off')
	
	// Call the chat model with the current messages and tools
	const res: ChatResponse = await ollama.chat({
		model: MODEL,
		messages: messages,
		stream: false,
		tools: tools
	})
	
	// If the chat model returned tool calls, handle them
	if (res.message?.tool_calls) {
		const tools: ToolCall[] = res.message.tool_calls
		await HandleToolCalls(tools, messages)
	}
	
	// Call the chat model again to get the AI's response and append it to the chat
	const chat: HTMLDivElement = document.querySelector('.chat') as HTMLDivElement
	const aiMessage: HTMLDivElement = createAIMessage(await ollama.chat({
		model: MODEL,
		messages: messages,
	}).then((res: ChatResponse) => res.message.content))
	chat.appendChild(aiMessage)
	
	// Hide the toast
	toast.classList.add('dis-off')
}

userInput.addEventListener('keyup', (e) => {
	if(userInput.value =='' || userInput.value == ' ') return
	if (e.key === 'Enter') {
		handleSendMessage()
	}
})
sendButton.addEventListener('click', handleSendMessage)