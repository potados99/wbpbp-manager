import webApi from '../single/webApi';
import User from '../entity/User';
import userRepo from '../single/userRepo';

class UserRepository {
    constructor() {
        this.cache = {users: []};
    }

    async getUsers() {
        if (this._isCacheEmpty()) {
            await this._fetchUsers();
        }

        return this.cache.users;
    }

    _isCacheEmpty() {
        return this.cache.users.length === 0;
    }

    async _fetchUsers() {
        const result = await webApi.users.list();
        if (!result.ok) {
            console.warn('Slack API fail');
            return;
        }

        this.cache.users = result.members.map((member) => new User({
            id: member.id,
            name: member.name,
            displayName: member.profile.display_name,
            isBot: member.is_bot || member.id === 'USLACKBOT',
            mentionString: `<@${member.name}>`
        }));
    }

    async getRealUsers() {
        return (await this.getUsers()).filter((user) => user.isBot === false);
    }

    async getUserById(id) {
        return (await this.getUsers()).find((user) => user.id === id);
    }
}

export default UserRepository;
