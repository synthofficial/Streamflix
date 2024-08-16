import { Client, Presence } from 'discord-rpc';

class DiscordRPCManager {
    clientId: string;
    rpc: Client;
    constructor() {
        this.clientId = '1207773303981342743'; // Replace with your Discord Client ID
        this.rpc = new Client({ transport: 'ipc' });

        // Connect to Discord when the manager is initialized
        this.rpc.login({ clientId: this.clientId }).catch(console.error);
    }

    // Function to set the Rich Presence
    setPresence(presence: Presence) {
        this.rpc.setActivity(presence).catch(console.error);
    }

    // Function to disconnect from Discord (if needed)
    disconnect() {
        this.rpc.destroy();
    }
}

// Export a singleton instance
const discordRPCManager = new DiscordRPCManager();
export default discordRPCManager;
