import TelegramBot from "node-telegram-bot-api";
import { config } from "dotenv";
import invariant from "tiny-invariant";
import { Configuration, OpenAIApi } from "openai";

config();
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})
const token = process.env.TELEGRAM_BOT_TOKEN
const openai = new OpenAIApi(configuration)

invariant(token, "Не удалось прочитать токен")

const bot = new TelegramBot(token, {polling: true});

const recognizedCommands = [
    '/gpt',
    '/gpt@AlcoGameClubBot',
    'Братик',
    'Братик,',
    'Братан',
    'Братан,',
    'Брат',
    'Брат,',
];
  

const answers = [
    "Ля ну ты и сморозил кончено, я аж упал...",
    "Притормози, ничего не понял.",
    "Ты такие вопросы Кэнди задавай.",
    "Не убивай башку, братан, а то сам себя пришибёшь.",
    "Ну шо, семки есть? Ответил бы, да не могу - рот занят вопросами от тебя и компании.",
    "Ну, давайте все по порядку, один вопрос за раз. Пусть никто не отвлекается, а то у меня уже голова кругом идет.",
    "Батенька, может давайте сделаем так, я вам на все вопросы отвечу одним словом - нет. Как вам такой вариант?",
]

bot.on("message", async (msg) => {
    const chatId = msg.chat.id;

    try {
        const command = msg.text?.split(' ')[0];
        const chatId = msg.chat.id
        const text = msg.text;

        const flag = recognizedCommands.includes(command!);

        if (text?.toUpperCase( ).includes("ПИЗДЕЦ")) {
            bot.deleteMessage(chatId, msg.message_id.toString());
        }

        if(flag) {
            msg.text = msg.text?.substring(msg.text.indexOf(" ") + 1);

            const baseCompletion = await openai.createCompletion({
                model: 'text-davinci-003',
                prompt: `${msg.text}.\n`,
                temperature: 0.8,
                max_tokens: 4000,
            })

            console.log(baseCompletion.data.usage?.prompt_tokens)
            const basePromptOuput = baseCompletion.data.choices.pop()

            invariant(basePromptOuput?.text, "Не удалось получить ответ от open ai")
            bot.sendMessage(chatId, basePromptOuput?.text)
        } else {
            switch (command) {
                case '/id': {
                    let message  = 'Ваш ChatId: ' + chatId;
                    bot.sendMessage(chatId, message.toString())
                }
            }
        }
    } catch (error) {
        bot.sendMessage(chatId, answers[Math.floor((Math.random() * answers.length))])
        console.error(error);
    }
})