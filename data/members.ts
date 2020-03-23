import { GuildMember } from "discord.js";
import { MemberDocument, SavedMember } from "../models/member";

export default class Members {
    async get(member: GuildMember) {
        return this.getOrCreate(member);
    }

    private async getOrCreate(member: GuildMember) {
        if (member.user.bot)
            throw new Error(`Bots don't have accounts`);

        const user = await SavedMember.findById(member.id);
        return user ?? this.create(member);
    }

    private async create(member: GuildMember) {
        const user = new SavedMember();
        user._id = member.id;
        user.guildId = member.guild.id;
        return user.save();
    }

    save(member: MemberDocument) {
        return member.save();
    }
}