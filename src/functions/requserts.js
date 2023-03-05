const { EmbedBuilder, ButtonBuilder } = require('@discordjs/builders');
const { ButtonStyle } = require('discord.js');
const fs = require('fs');
const { fileLog } = require('./logs');

async function acceptReuqest(interaction, userId) {
    console.log(interaction);
    const request = await JSON.parse(fs.readFileSync(`./src/dataBase/requests/${userId}.json`));
    let user = await interaction.guild.members.cache.get(userId);
    let role = await interaction.guild.roles.cache.get('1061899659565596742');

    console.log(user);

    await user.roles.add(role);

    // give role to user
    await user.roles

    interaction.reply({ content: `<@${userId}> твоя зааявка в ХАЖАБУ принята!\b\`\`\`js\nУ тебя больше нету попыток на вступление в ХАЖАБУ!\nЕсли ты выйдешь или тебя выгонят из ХАЖАБЫ то повторно подать заявку у тебя не получиться не при каних условиях!\`\`\``});

    const embed = new EmbedBuilder()
    .setTitle(`Заявка от ${requist.userName}`)
    .setDescription(`
    Заявка была принята, ты норм чел
    \`\`\`js\n0 Имя:    ${requist.userName}\n1 О себе: ${requist.data.discription}\n2 Др:     ${requist.data.happyDate}\n3 Игры которые может играть:
    \n${requist.data.games}\`\`\`
    `)
    .setColor(Colors.Green)

    await interaction.message.edit({ content: `Заявка от ${requist.userName} была принята!`, embeds: [embed], components: [
        new ButtonBuilder()
            .setCustomId('declineRequest')
            .setLabel('🤬 Отклонить')
            .setStyle(ButtonStyle.Danger)
            .setDisabled(true),
        new ButtonBuilder()
            .setCustomId('acceptRequest')
            .setLabel('🐸 Принять')
            .setStyle(ButtonStyle.Success)
            .setDisabled(true)
    ] });

    fs.writeFileSync(`./src/dataBase/users/${userId}.json`, JSON.stringify(request));
    fs.unlinkSync(`./src/dataBase/requests/${userId}.json`);

    fileLog(`[REQUESTS] Заявка ${request.userName} была принята!`)
}

async function declineRequest(interaction, userId) {
    const request = await JSON.parse(fs.readFileSync(`./src/dataBase/requests/${userId}.json`));
    const user = await interaction.guild.members.cache.get(userId);

    await user.send({ content: `Твоя заявка в ХАЖАБУ была отклонена!\b\`\`\`js\nУ тебя больше нету попыток вступить в ХАЖАБУ, если ты допустил ошибку то напиши админу\`\`\``});

    const embed = new EmbedBuilder()
            .setTitle(`Заявка от ${requist.userName}!`)
            .setDescription(`
            Заявка была отклонена, ты не норм чел. У тебя рак мозга или ты просто тупой?
            \`\`\`js\n0 Имя:    ${requist.userName}\n1 О себе: ${requist.data.discription}\n2 Др:     ${requist.data.happyDate}\n3 Игры которые может играть:
            \n${requist.data.games}\`\`\`
            `)
            .setColor(Colors.Red)

    await interaction.message.edit({ content: `Заявка от ${requist.userName} была отклонена!`, embeds: [embed], components: [
        new ButtonBuilder()
            .setCustomId('declineRequest')
            .setLabel('🤬 Отклонить')
            .setStyle(ButtonStyle.Danger)
            .setDisabled(true),
        new ButtonBuilder()
            .setCustomId('acceptRequest')
            .setLabel('🐸 Принять')
            .setStyle(ButtonStyle.Success)
            .setDisabled(true)
    ] });

    fileLog(`[REQUESTS] Заявка ${request.userName} была отклонена!`)
}

module.exports = { acceptReuqest, declineRequest };