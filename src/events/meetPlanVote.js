const { Events } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'interactionCreate',

    async execute(interaction) {
        if (!interaction.isButton()) return;

        if (interaction.customId?.includes('accept_invite')) {
            const plan_id = interaction.customId.split('☼')[1];

            if (!fs.existsSync(`./src/dataBase/planMeets/${plan_id}.json`)) {
                interaction.reply({ content: `План пользователя <@${plan_id}> уже не актуален.`, ephemeral: true });
                return;
            }

            let plan = JSON.parse(fs.readFileSync(`./src/dataBase/planMeets/${plan_id}.json`));

            if (!plan.users_invited.includes(interaction.user.id)) {
                interaction.reply({ content: `Вы уже приняли приглашение на встречу или вас не пригласиси.`, ephemeral: true });
                return;
            }

            plan.users_declined.splice(plan.users_invited.indexOf(interaction.user.id), 1);
            plan.users_someone.splice(plan.users_invited.indexOf(interaction.user.id), 1);

            plan.users_accepted.push(interaction.user.id);

            const message = await interaction.channel.messages.fetch(plan.message_id);
            message.thread.send(`<@${interaction.user.id}> сможет прийти вовремя на встречу.`);

            interaction.reply({ content: `Вы приняли приглашение на встречу.`, ephemeral: true });

            fs.writeFileSync(`./src/dataBase/planMeets/${plan_id}.json`, JSON.stringify(plan));
        } else if (interaction.customId?.includes('maybe_invite')) {
            const plan_id = interaction.customId.split('☼')[1];

            if (!fs.existsSync(`./src/dataBase/planMeets/${plan_id}.json`)) {
                interaction.reply({ content: `План пользователя <@${plan_id}> уже не актуален.`, ephemeral: true });
                return;
            }

            let plan = JSON.parse(fs.readFileSync(`./src/dataBase/planMeets/${plan_id}.json`));

            if (!plan.users_invited.includes(interaction.user.id)) {
                interaction.reply({ content: `Вас не пригласиси на встречу.`, ephemeral: true });
                return;
            }

            if (plan.users_someone.includes(interaction.user.id)) {
                interaction.reply({ content: `Вы уже говорили что возможно будите на встрече.`, ephemeral: true });
            }

            plan.users_declined.splice(plan.users_invited.indexOf(interaction.user.id), 1);
            plan.users_accepted.splice(plan.users_invited.indexOf(interaction.user.id), 1);

            plan.users_someone.push(interaction.user.id);

            const message = await interaction.channel.messages.fetch(plan.message_id);
            message.thread.send(`<@${interaction.user.id}> возможно будет на встрече.`);

            interaction.reply({ content: `Вы возмоно будите на встрече.`, ephemeral: true });

            fs.writeFileSync(`./src/dataBase/planMeets/${plan_id}.json`, JSON.stringify(plan));
        } else if (interaction.customId?.includes('later_invite')) {
            const plan_id = interaction.customId.split('☼')[1];

            if (!fs.existsSync(`./src/dataBase/planMeets/${plan_id}.json`)) {
                interaction.reply({ content: `План пользователя <@${plan_id}> уже не актуален.`, ephemeral: true });
                return;
            }

            let plan = JSON.parse(fs.readFileSync(`./src/dataBase/planMeets/${plan_id}.json`));

            if (!plan.users_invited.includes(interaction.user.id)) {
                interaction.reply({ content: `Вас не пригласиси на встречу.`, ephemeral: true });
                return;
            }

            if (plan.users_someone.includes(interaction.user.id)) {
                interaction.reply({ content: `Вы уже говорили что возможно будите на встрече.`, ephemeral: true });
            }
        }
    }
}