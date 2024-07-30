# Ollama Tool Use examples

I was able to try out ollama's latest tool use abilities

This project uses `vite` and `Ollama v0.3.0` 

The model we use is `llama3.1`

#### Get setup
```bash
git clone https://github.com/yashweblife/ProjectEVA.git
npm install # inside the directory
npm run dev # after install is complete
# UI will appear on localhost with a link in the terminal
```

### What can it do

- Run local code blocks
    - Get current date and time
- Run fetch to get data from external links
- Run fetch to toggle a simple server lamp running on a [NodeMCU](https://www.amazon.com/HiLetgo-Internet-Development-Wireless-Micropython/dp/B010O1G1ES)



#### Resource Links
[Ollama](https://ollama.com)

[Ollama Tool Use](https://ollama.com/blog/tool-support)

[Llama 3.1](https://ollama.com/library/llama3.1)

[Vite](https://vitejs.dev/)

### File Structure

The `src` folder is where the magic really happens

The tools folder contains 3 aspects,
- Function definitions
- Function registration
- Tool Metadata

### Creating Tools

There can usually be 2 types of tools:
- One that run locally and runs fully contained
- One that fetches data from an external source


When creating a tool, put it in an async function for consistency
