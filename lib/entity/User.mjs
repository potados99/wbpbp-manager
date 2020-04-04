class User {
    constructor({id, name, displayName, isBot, mentionString}) {
        this.id = id;
        this.name = name;
        this.displayName = displayName;
        this.isBot = isBot;
        this.mentionString = mentionString;
    }
}

export default User;
