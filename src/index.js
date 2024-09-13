import express from 'express'
import cors from 'cors'
import dotenv from "dotenv"
import TelegramBot from 'node-telegram-bot-api'
import axios from 'axios'
import QRCode from 'qrcode'

dotenv.config()
const app = express()

app.use(cors())

async function run() {
    try {
        const PORT = process.env.PORT || 7000
        app.listen(PORT, () => console.log(`App is running at http://localhost:${PORT}`))

        const TELEGRAM_BOT_API_KEY = process.env.TELEGRAM_BOT_API_KEY || null
        try {
            const telegramBot = new TelegramBot(TELEGRAM_BOT_API_KEY, { polling: true })

            telegramBot.onText(/\/start/, (msg) => {
                console.log(msg)
                const chatId = msg.chat.id
                const message = `👋 Hello, ${msg.from.first_name}! Welcome to the QR Code Generator Bot. 🎉
                    \nI can help you generate QR codes quickly and easily!
                    \nAvailable comands:
                    \n/generate - Generate a QR code for it.
                    \n/start - Get this message again.
                    \n/getCode - Get the source code of this bot.\n
                    \nLet’s get started by sending the text or link you want to convert into a QR code!`

                telegramBot.sendMessage(chatId, message)
            })

            telegramBot.onText(/\/generate/, (msg) => {
                const chatId = msg.chat.id;
                const generateMessage = `🔗 Please enter the URL you want to convert into a QR code:`;

                telegramBot.sendMessage(chatId, generateMessage);
            });

            telegramBot.onText(/\/getCode/, (msg) => {
                const chatId = msg.chat.id;
                const message = `🌟 Check it out! This bot is 100% open source! 🌐

                        You can explore and contribute to the code in our https://github.com/Shibin-Abraham/telegram-bot.

                        👍 Enjoying the bot: Consider giving it a ⭐️ on GitHub to show your support!

                        💡 Want to improve the bot: Feel free to contribute new features or report any issues you find.

                        Let's build something awesome together! 💻✨`

                telegramBot.sendMessage(chatId, message, {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: 'Open link',
                                    url: 'https://github.com/Shibin-Abraham/telegram-bot'
                                }
                            ]
                        ]
                    }
                });
            });

            telegramBot.on('message', (msg) => {
                const chatId = msg.chat.id;
                // Check if the message is not a command (starts with /)
                if (!msg.text.startsWith('/')) {
                    if (isValidUrl(msg.text)) {
                        // Handle the URL input and generate the QR code here
                        generateQRCode(msg.text, chatId);
                    } else {
                        // Send a warning message if the input is invalid
                        telegramBot.sendMessage(chatId, "⚠️ Warning: That doesn't look like a valid URL. Please enter a proper URL to generate a QR code.");
                        setTimeout(() => {
                            const message = `
                                    \nI can help you generate QR codes quickly and easily!
                                    \nAvailable comands:
                                    \n/generate - Generate a QR code for it.
                                    \n/start - Get this message again.
                                    \n/getCode - Get the source code of this bot.\n
                                    \nLet’s get started by sending the text or link you want to convert into a QR code!`

                            telegramBot.sendMessage(chatId, message)
                        }, 3000)
                    }
                }

                function isValidUrl(url) {
                    const urlRegex = /(https?:\/\/[^\s]+)/g;
                    return urlRegex.test(url);
                }
                async function generateQRCode(url, chatId) {
                    // QR code generation logic
                    QRCode.toFile('qr-code.png', url, { type: 'png', scale: 15, margin: 2 }, (err) => {
                        if (!err) {
                            telegramBot.sendMessage(chatId, "✅ Generating QR code for your URL...");
                            setTimeout(() => {
                                telegramBot.sendPhoto(chatId, 'qr-code.png')
                                setTimeout(() => {
                                    const generateMessage = `🔗 Enter the URL you want to convert into a QR code:`;
                                    telegramBot.sendMessage(chatId, generateMessage);
                                }, 2000)
                            }, 2000)

                        } else {
                            telegramBot.sendMessage(chatId, "☢️ Error occured while generating the QR code")
                            setTimeout(() => {
                                const message = `
                                        \nI can help you generate QR codes quickly and easily!
                                        \nAvailable comands:
                                        \n/generate - Generate a QR code for it.
                                        \n/start - Get this message again.
                                        \n/getCode - Get the source code of this bot.\n
                                        \nLet’s get started by sending the text or link you want to convert into a QR code!`

                                telegramBot.sendMessage(chatId, message)
                            }, 3000)
                        }

                    })
                }
            });

        } catch (error) {
            console.log("telegram bot error: ", error)
        }

    } catch (error) {
        console.log("server error: ", error)
    }
}

void run()