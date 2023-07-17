# DiscordGPT

To run the Discord bot code from GitHub, follow these instructions:

1. Ensure you have a server to host the bot. You can use your own computer for this purpose.

2. You will need Node.js installed on your server/machine. If it isn't already installed, you can download it from the following link: https://nodejs.org/en/download/current

3. Once you have Node.js installed, proceed with the following steps:

   a. Clone the repository to your server or local machine.

   b. Inside the cloned repository, create a new file named ".env". You can use the command-line interface (CLI) and the command "nano .env" to create the file in the root directory of the repository.

   c. Add the following lines to the ".env" file:
      ```
      OPENAI_API_KEY=your_openai_token
      BOT_TOKEN=your_bot_token
      ```
      Replace `your_openai_token` with your actual OpenAI API key, and `your_bot_token` with your Discord bot token. These are needed for the bot to function correctly. 

      Note: Never share or publish your .env file, as it contains sensitive information.

4. Once you've set up the ".env" file, open your CLI and navigate to the repository directory. Start the Discord bot by running the command "node discordbot.js". Your bot should now be up and running.
