import "reflect-metadata"
import { Client } from "discordx"
import { CommandInteraction, Intents, Interaction } from "discord.js"
import { importx } from "@discordx/importer"
import { Logger } from "./logger"

export class Discord {
	private static _client: Client

	static get Client(): Client {
		return this._client
	}

	static async start(): Promise<void> {
		this._client = new Client({
			intents: [
				Intents.FLAGS.GUILDS,
				Intents.FLAGS.GUILD_MESSAGES,
				Intents.FLAGS.GUILD_MEMBERS,
			],
			// classes: [
			//     path.join(__dirname, "commands", "**/*.{ts,js}"),
			//     path.join(__dirname, "events", "**/*.{ts,js}"),
			// ],
			botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],
			// botGuilds: [
			//     process.env.GUILD_ID as string
			// ],
			silent: false,
		})

		this._client.once("ready", async () => {
			await this._client.initApplicationCommands()
			try {
				await this._client.initApplicationPermissions()
			} catch (e) {
				console.log("Could not init application permissions", e)
			}

			console.log("Bot started")
		})
		this._client.on("guildCreate", async (guild) => {
			await this._client.initApplicationCommands()
			try {
				await this._client.initApplicationPermissions()
			} catch (e) {
				console.log("Could not init application permissions", e)
			}
		})

		this._client.on("interactionCreate", async (interaction) => {
			try {
				await this._client.executeInteraction(interaction)
			} catch (e) {
				if (interaction.isCommand()) {
					console.log(e)
					Logger.logInteraction(interaction as CommandInteraction)
					await (interaction as CommandInteraction).editReply(
						`Could not execute this command, please try again later`,
					)
				}
			}
		})

		await importx(__dirname + "/commands/**/*.{js,ts}")
		await this._client.login(process.env.BOT_TOKEN ?? "")
	}
}
