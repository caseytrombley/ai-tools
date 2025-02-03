<template>
  <div>
    <input v-model="prompt" placeholder="Ask me something" />
    <button @click="sendRequest">Send</button>
    <div v-if="responseText">
      <p>{{ responseText }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      prompt: '',
      responseText: '',
    };
  },
  methods: {
    async sendRequest() {
      this.responseText = ''; // Clear previous response
      const response = await fetch('http://localhost:3000/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: this.prompt }),
      });

      // Handle the response as a stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = '';
      let done = false;

      // Read the stream and update responseText as tokens come in
      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        result += decoder.decode(value, { stream: true });
        this.responseText = result; // Update the UI with the latest response
      }
    },
  },
};
</script>
