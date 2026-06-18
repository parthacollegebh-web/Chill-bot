require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
  REST,
  Routes,
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction]
});

// TASK STORAGE
let tasks = [];

// REGISTER SLASH COMMANDS
const commands = [
  new SlashCommandBuilder().setName("addtask").setDescription("Add tasks"),
  new SlashCommandBuilder().setName("post").setDescription("Post claim button")
].map(c => c.toJSON());

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// SLASH COMMAND HANDLER
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // ADD TASK
  if (interaction.commandName === "addtask") {
    const input = interaction.options.getString("text");
    if (!input) {
      return interaction.reply("Provide tasks separated by |");
    }

    const list = input.split("|").map(t => t.trim());
    tasks.push(...list);

    return interaction.reply(`Added ${list.length} tasks`);
  }

  // POST BUTTON
  if (interaction.commandName === "post") {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("claim")
        .setLabel("Claim Task")
        .setStyle(ButtonStyle.Success)
    );

    return interaction.reply({
      content: "React below to claim a task",
      components: [row]
    });
  }
});

// BUTTON CLAIM
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== "claim") return;

  if (tasks.length === 0) {
    return interaction.reply({ content: "No tasks left", ephemeral: true });
  }

  const task = tasks.shift();

  const channel = interaction.guild.channels.cache.find(ch =>
    ch.name?.includes(interaction.user.username.toLowerCase()) &&
    ch.parent?.name?.toLowerCase() === "tickets"
  );

  if (!channel) {
    return interaction.reply({ content: "No ticket found", ephemeral: true });
  }

  channel.send(`🎯 Task:\n${task}\nUser: <@${interaction.user.id}>`);

  interaction.reply({ content: "Sent to your ticket", ephemeral: true });
});

client.login(process.env.DISCORD_BOT_TOKEN);
