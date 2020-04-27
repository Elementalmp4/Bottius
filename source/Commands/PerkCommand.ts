import { AbstractCommand } from "./AbstractCommand";
import { AbstractCommandHelpContent } from "../Material/AbstractCommandHelpContent";
import { Client, Message, Role, MessageEmbed } from "discord.js";
import { Perk } from "../Material/Perk";
import { PerkService } from "../Service/PerkService";

export class PerkCommand extends AbstractCommand
{
    public helpEmbedContent: AbstractCommandHelpContent = new PerkCommandHelp();
    private perkService: PerkService = PerkService.getInstance();

    public async run(bot: Client, message: Message, messageArray: string[]) 
    {
        if(message.member.hasPermission("ADMINISTRATOR"))
        {
            if(messageArray[0] == "add")
            {
                messageArray = messageArray.slice(1);
                if(!messageArray[0]) return super.sendHelp(message);

                let level: number = Number.parseInt(messageArray[0]);
                let role: Role = message.mentions.roles.first();

                if(isNaN(level) || !role) return super.sendHelp(message);
                if(await this.perkService.isPerkDuplicate(role.id)) return message.channel.send(new MessageEmbed().setAuthor("Perk duplicate").setColor("ff0000").setDescription("There is already a perk with the given role"));
                
                this.perkService.addPerk(level, role.id);

                let embed: MessageEmbed = new MessageEmbed()
                                            .setAuthor("Perk added")
                                            .setTimestamp(new Date())
                                            .setDescription(`A perk has been added`)
                                            .addField("Level", `${level}`, true)
                                            .addField("Role", `${role}`, true)
                                            .setColor(role.color);
                message.channel.send(embed);
            }
            else if(messageArray[0] == "remove")
            {
                let role: Role = message.mentions.roles.first();
                if(!role) return super.sendHelp(message);
                if(! await this.perkService.isPerkDuplicate(role.id)) return message.channel.send(new MessageEmbed().setAuthor("Perk not existent").setColor("ff0000").setDescription("There is no perk with this role"));
                
                this.perkService.removePerk(role.id);

                let embed: MessageEmbed = new MessageEmbed()
                                            .setAuthor("Perk removed")
                                            .setTimestamp(new Date())
                                            .setDescription(`A perk has been removed`)
                                            .addField("Role", `${role}`, true)
                                            .setColor("00ff00");
                message.channel.send(embed);
            }
            else if(messageArray[0] == "list")
            {
                let perks: Array<Perk> = await this.perkService.getAllPerks();

                let embed: MessageEmbed = new MessageEmbed()
                                            .setAuthor("Perks of " + message.guild.name)
                                            .setColor("00ff00")
                                            .setTimestamp(new Date());
                for(const perk of perks)
                {
                    let role: Role = await message.guild.roles.fetch(perk.role);
                    embed.addField(`Level: ${perk.reqLevel}`, `${role}`)
                }
                
                message.channel.send(embed);
            }
            else
            {
                super.sendHelp(message);
            }
        }
        else
        {
            super.sendPermissionDenied(message);
        }
    }

}

class PerkCommandHelp extends AbstractCommandHelpContent
{
    public commandName: string;
    public description: string;
    public usage: string;

    constructor()
    {
        super();
        this.commandName = "perk";
        this.description = "adds, removes or lists leveling rewards";
        this.usage = `${AbstractCommandHelpContent.prefix}perk add {lvl} {role}\n${AbstractCommandHelpContent.prefix}perk remove {role}\n${AbstractCommandHelpContent.prefix}perk list`;
    }
}