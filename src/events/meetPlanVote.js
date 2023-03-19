const { StringSelectMenuBuilder } = require('@discordjs/builders');
const { Events, ActionRowBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'interactionCreate',

    async execute(interaction) {
        
        if (!interaction.isButton() ) if (!interaction?.values) return;

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

            plan.users_declined = plan.users_declined.filter((user) => user !== interaction.user.id);
            plan.users_someone = plan.users_someone.filter((user) => user !== interaction.user.id);
            plan.users_later = plan.users_later.filter((user) => user !== interaction.user.id);
            
            plan.users_accepted.push(interaction.user.id);

            const message = await interaction.channel.messages.fetch(plan.message_id);
            message.thread.send(`🟩 <@${interaction.user.id}> сможет прийти вовремя на встречу.`);

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
                return
            }

            plan.users_declined = plan.users_declined.filter((user) => user !== interaction.user.id);
            plan.users_accepted = plan.users_accepted.filter((user) => user !== interaction.user.id);
            plan.users_later = plan.users_later.filter((user) => user !== interaction.user.id);

            plan.users_someone.push(interaction.user.id);

            const message = await interaction.channel.messages.fetch(plan.message_id);
            message.thread.send(`🟧 <@${interaction.user.id}> возможно будет на встрече.`);

            interaction.reply({ content: `Вы возможно будите на встрече.`, ephemeral: true });

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

            if (plan.users_later.includes(interaction.user.id)) {
                interaction.reply({ content: `Вы уже говорили что возможно будите на встрече.`, ephemeral: true });
                return
            }

            // if not have options send message
            if (!interaction.values) {
                const row = new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId(`later_invite☼${plan_id}`)
                            .setPlaceholder('На сколько вы задержитесь?')
                            .addOptions([
                                {
                                    label: `❓ Точно не знаю`,
                                    description: `Я не знаю сколько времени я буду задерживаться.`,
                                    value: `он не знает через сколько он сможет прийти, но придет`,
                                },
                                {
                                    label: `5 минут`,
                                    description: `Я прийду через 5 минут, после начала встречи.`,
                                    value: `он будет примерно через \`5 минут\` после начала встречи`,
                                },
                                {
                                    label: `10 минут`,
                                    description: `Я прийду через 10 минут, после начала встречи.`,
                                    value: `он будет примерно через \`10 минут\` после начала встречи`,
                                },
                                {
                                    label: `15 минут`,
                                    description: `Я прийду через 15 минут, после начала встречи.`,
                                    value: `он будет примерно через \`15 минут\` после начала встречи`,
                                },
                                {
                                    label: `20 минут`,
                                    description: `Я прийду через 20 минут, после начала встречи.`,
                                    value: `он будет примерно через \`20 минут\` после начала встречи`,
                                },
                                {
                                    label: `25 минут`,
                                    description: `Я прийду через 25 минут, после начала встречи.`,
                                    value: `он будет примерно через \`25 минут\` после начала встречи`,
                                },
                                {
                                    label: `30 минут`,
                                    description: `Я прийду через 30 минут, после начала встречи.`,
                                    value: `он будет примерно через \`30 минут\` после начала встречи`,
                                },
                                {
                                    label: `45 минут`,
                                    description: `Я прийду через 45 минут, после начала встречи.`,
                                    value: `он будет примерно через \`45 минут\` после начала встречи`,
                                },
                                {
                                    label: `1 час`,
                                    description: `Я прийду через 1 час, после начала встречи.`,
                                    value: `он будет примерно через \`1 час\` после начала встречи`,
                                },
                                {
                                    label: `1 час 30 минут`,
                                    description: `Я прийду через 1 час 30 минут, после начала встречи.`,
                                    value: `он будет примерно через \`1 час 30 минут\` после начала встречи`,
                                },
                                {
                                    label: `2 часа`,
                                    description: `Я прийду через 2 часа, после начала встречи.`,
                                    value: `он будет примерно через \`2 часа\` после начала встречи`,
                                },
                            ])
            
                    );
                interaction.reply({ content: `Выбирете на сколько вы задержитесь на встречу?`, ephemeral: true, components: [row] });
            } else {
                plan.users_declined = plan.users_declined.filter((user) => user !== interaction.user.id);
                plan.users_accepted = plan.users_accepted.filter((user) => user !== interaction.user.id);
                plan.users_someone = plan.users_someone.filter((user) => user !== interaction.user.id);

                plan.users_later.push(interaction.user.id);
                
                const message = await interaction.channel.messages.fetch(plan.message_id);
                message.thread.send(`🟨 <@${interaction.user.id}> задержиться на встречу, ${interaction.values[0]}.`);

                interaction.reply({ content: `Вы успешно выбрали через сколько прийдёте*(повторно выбирать нету смысла, можете удалить эти сообщения)*`, ephemeral: true });

                fs.writeFileSync(`./src/dataBase/planMeets/${plan_id}.json`, JSON.stringify(plan));
            }

        } else if (interaction.customId?.includes('not_invite')) {
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

            if (plan.users_declined.includes(interaction.user.id)) {
                interaction.reply({ content: `Вы уже отказались от встречи.`, ephemeral: true });
                return
            }

            if (!interaction.values) {
                const row = new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId(`not_invite☼${plan_id}`)
                            .setPlaceholder(`Причина отказа`)
                            .addOptions([
                                {
                                    label: `🐸 Я иду играть с другими`,
                                    description: `Я не смогу прийти, так как иду играть с другими.`,
                                    value: `\`Я не смогу прийти, так как иду играть с другими.\``,
                                },
                                {
                                    label: `📅 Я не смогу прийти в это время`,
                                    description: `Я не смогу прийти в это время.`,
                                    value: `\`Я не смогу прийти в это время.\``,
                                },
                                {
                                    label: `💥 Я не смогу прийти из-за того что мой дом разбомбили`,
                                    description: `Я не смогу прийти, так как мой дом разбомбили.`,
                                    value: `\`Я не смогу прийти, так как мой дом разбомбили.\``,
                                },
                                {
                                    label: `🫡 В другой раз`,
                                    description: `Я не смогу прийти, так как у меня есть другие дела.`,
                                    value: `\`Я не смогу прийти, так как у меня есть другие дела.\``,
                                },
                                {
                                    label: `🫥 Сделай встречу позже`,
                                    description: `Можете сделать встречу позже. Тогда я смогу прийти.`,
                                    value: `\`Можете сделать встречу позже. Тогда я смогу прийти.\``,
                                },
                                {
                                    label: `🫥 Сделайте встречу раньше`,
                                    description: `Можете сделать встречу раньше. Тогда я смогу прийти.`,
                                    value: `\`Можете сделать встречу раньше. Тогда я смогу прийти.\``,
                                },
                                {
                                    label: `🤐 Я не смогу прийти, так как не могу говорить`,
                                    description: `Я не смогу прийти, так как не могу говорить.`,
                                    value: `\`Я не смогу прийти, так как не могу говорить.\``,
                                },
                                {
                                    label: `❓ Я не знаю`,
                                    description: `Я не знаю, почему я не смогу прийти.`,
                                    value: `\`Я не знаю, почему я не смогу прийти.\``,
                                },
                            ])
                    );

                    interaction.reply({ content: `Причина отказа?`, ephemeral: true, components: [row] });
            } else {
                plan.users_later = plan.users_later.filter((user) => user !== interaction.user.id);
                plan.users_someone = plan.users_someone.filter((user) => user !== interaction.user.id);
                plan.users_accepted = plan.users_accepted.filter((user) => user !== interaction.user.id);

                plan.users_declined.push(interaction.user.id);

                const message = await interaction.channel.messages.fetch(plan.message_id);
                message.thread.send(`🟥 <@${interaction.user.id}> не сможет прийти по причине ${interaction.values[0]}.`);

                interaction.reply({ content: `Вы успешно отказались от встречи.`, ephemeral: true });

                fs.writeFileSync(`./src/dataBase/planMeets/${plan_id}.json`, JSON.stringify(plan));
            }
        }
    }
}